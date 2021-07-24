package com.softwareinventions.cmp.evaluator.rebound;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;

import org.apache.commons.math3.analysis.solvers.LaguerreSolver;
import org.apache.commons.math3.complex.Complex;
import org.apache.log4j.Logger;

public class ReboundEvaluator implements Evaluator {
   public static final double cChuteHeight = 1.0;  // Height of chute floors
   public static final double cFullHeight = 1.5;   // Height of full area
   public static final double cChuteLength = 1.0;
   public static final double cGravity = -9.81;
   public static final double cRadius = .05;       // 10cm diameter
   public static final double cEps = 0.0000001;
   public static final double cErrMargin = 0.01;
   public static final int    cSbmLimit = 5;  
   public static final double cSbmPenalty = .9;
   
   private static class Parameters {
      public double targetGap;
      public int maxBalls;
      public double[] balls;
   }
   
   // Ball position and speed in the chute.
   private static class BallSpec {
      public int id;
      public double pos;
      public double speed;
   }
   
   private static class RbnSpec {
      public double gateTime;       // Time in s at which gate opens
      public double jumpLength;     // Predicted length of jump
      public BallSpec[] ballStarts; // Initial ball pos and speed.
   }
   
   // One in-chute collision between two balls or a ball and a chute side
   private static class Rebound {
      int idLeft;         // Id of left ball or -1 for left chute side
      double time;        // Time in sec of rebound
      double speedLeft;   // New speed of left ball or 0.0 for chute side
      double speedRight;  // New speed of right ball or 0.0 for chute side

      public Rebound(int idLeft, double time, double speedLeft,
       double speedRight) {

         this.idLeft = idLeft;
         this.time = time;
         this.speedLeft = speedLeft;
         this.speedRight = speedRight;
      }
   }
   
   public static class RbnResults {
      public boolean valid;        // Good init config and correct jumpLength
      public Double sbmPenalty;    // Score penalty for excess submits or null
      public Rebound[] rebounds;   // Rebounds in time order
      public BallArc[] launchArcs; // Arcs taken by right ball
   }

   static Logger lgr = Logger.getLogger(ReboundEvaluator.class);
   
   Parameters prms;

   @Override
   public void setPrms(String prms) {
      try {
         this.prms = mapper.readValue(prms, Parameters.class);
      } catch (Exception e) {
         e.printStackTrace();
      }
   }

   // Represent one arc of a gravitationally freefalling ball, starting with
   // given position and velocity
   public static class BallArc {
      public double baseTime;  // Starting time
      public double xPos;      // Starting position
      public double yPos;
      public double xVlc;      // Starting velocity
      public double yVlc;
      
      // Positions at relative time from baseTime
      public double xPosFn(double relTime) {return xPos + relTime * xVlc;}
      public double yPosFn(double relTime) {return yPos + relTime * yVlc;}
      public double xVlcFn(double relTime) {return xVlc;}
      public double yVlcFn(double relTime) {return yPos + relTime * yVlc
       + relTime*relTime*cGravity/2.0;}
      
      public BallArc(double baseTime, double xPos, double yPos, double xVlc,
       double yVlc) {
         this.baseTime = baseTime;
         this.xPos = xPos;
         this.yPos = yPos;
         this.xVlc = xVlc;
         this.yVlc = yVlc;
      }

      // Return new BallArc based on position and velocity at |relTime|
      public BallArc atTime(double relTime) {
         return new BallArc(baseTime + relTime, xPosFn(relTime),
          yPosFn(relTime), xVlcFn(relTime), yVlcFn(relTime));
      }
      
      // Return new BallArc based on hit against a vertical wall at |x| with
      // y-range [loY, hiY], or return null if no such hit will occur.
      public BallArc fromVerticalHit(double loY, double hiY, double x) {
         double xHitTime = (x - xPos) / xVlc;
         double yValue = yPosFn(xHitTime);
         BallArc rtn = null;
         
         // Throw out negative times.
         if (xHitTime > 0 && GenUtil.inBounds(loY, yValue, hiY)) {
            rtn = atTime(xHitTime);
            rtn.xVlc = -rtn.xVlc;
         }

         return rtn;
      }
      
      private BallArc fromHorizontalHit(double loX, double hiX, double y) {
         BallArc rtn = null;
         double[] yHitTimes = GenUtil.quadraticSolution(cGravity/2.0, yVlc,
          yPos - y);
         double yHitTime, xHit;

         if (yHitTimes != null && yHitTimes[1] >= 0) {
            yHitTime = yHitTimes[0] >= 0 ? yHitTimes[0] : yHitTimes[1];
            xHit = xPosFn(yHitTime);
            if (GenUtil.inBounds(loX, xHit, hiX)) {
               rtn = atTime(yHitTime);
               rtn.yVlc = -rtn.yVlc;
            }
         }
         return rtn;
      }
      
      /* Generate a new BallArc representing the result of the current BallArc
       * colliding with a corner at (x,y), or null if no collision would occur.
       * Do this by solving a polynomial whose real roots give the times at
       * which the the ball position and point (x,y) equals the ball radius.  
       * 
       * Given:
       * r = Radius of the ball
       * Px, Py = Position of ball center at time 0
       * Vx, Vy = Velocity of ball center at time 0
       * 
       * Cx, Cy = location of target point (obstacle corner)
       * Dx, Dy = (Px - Cx), (Py - Cy) the vector from target point to 
       * ball center at time 0, 
       * G = gravitational acceleration (as a negative, downward value)
       * 
       * The equation for squared circle center to point distance is:
       * 
       * (Dx + tVx)^2 + (Dy + tVy + (G/2)t^2)^2
       * 
       *  Setting this to r^2...
       * 
       * (Dx + tVx)^2 + (Dy + tVy + (G/2)t^2)^2 = r^2
       * 
       * ... and simplifying, we arrive at:
       * 
       * ((G/2)^2)t^4 + (G Vy)t^3 + (Vx^2 + Vy^2 + G Dy)t^2 + 2(DxVx + DyVy)t +
       * (Dx^2 + Dy^2 - r^2) = 0
       */
      private BallArc fromCornerHit(double x, double y) {
         double[] coef = new double[5];
         double magnitude, dX = (xPos - x), dY = (yPos - y);
         OptionalDouble firstHit;
         BallArc rtn = null;

         // Coefficients from right to left (t^0 to t^4)
         coef[0] = dX*dX + dY*dY - cRadius*cRadius;
         coef[1] = 2 * (dX * xVlc + dY * yVlc);
         coef[2] = xVlc*xVlc + yVlc*yVlc + cGravity * dY;
         coef[3] = cGravity * yVlc;
         coef[4] = cGravity*cGravity / 4.0;

         Complex[] solutions = new LaguerreSolver().solveAllComplex(coef, 0);
         
         // Find earliest nonnegative real solution
         firstHit = Arrays.stream(solutions).filter
          (s -> Math.abs(s.getImaginary()) < cEps && s.getReal() > 0)
          .mapToDouble(s -> s.getReal()).min();

         // We hit the point.  Subtract 2x our velocity component toward corner
         if (firstHit.isPresent()) {
            rtn = atTime(firstHit.getAsDouble());        
            
            dX = (x - rtn.xPos) / cRadius;
            dY = (y - rtn.yPos) / cRadius;

            // Magnitude of velocity component in collision direction.
            magnitude = dX * rtn.xVlc + dY * rtn.yVlc;
            
            rtn.xVlc -= 2.0 * magnitude * dX;
            rtn.yVlc -= 2.8 * magnitude * dY;
         }

         return rtn;
      }
   }
   
   // Starting with |arc|, assumed to not hit the target chute, compute the
   // next arc based on rebounds within the flight area
   //
   // #1 Add possibly null arcs resulting from |arc| collisions with, in order:
   // left side, bottom, right side below exit chute, lower chute corner, upper
   // chute corner, right side above chute, top.  At least one should not be
   // null due to assumption of not hitting target
   BallArc getNextArc(BallArc arc, double rightX) {
      BallArc cndArc, rtn = null;
      List<BallArc> cndArcs = new LinkedList<BallArc>();
      Optional<BallArc> minArc;
      
      cndArcs.add(arc.fromVerticalHit(0, cFullHeight, cChuteLength)); // #1
      cndArcs.add(arc.fromHorizontalHit(cChuteLength, rightX, 0.0));
      cndArcs.add(arc.fromVerticalHit(0, cChuteHeight, rightX));
      cndArcs.add(arc.fromCornerHit(rightX, cChuteHeight));
      cndArcs.add(arc.fromCornerHit(rightX, cChuteHeight + 2*cRadius));
      cndArcs.add(arc.fromVerticalHit(cChuteHeight + 2*cRadius, cFullHeight,
       rightX));
      
      return cndArcs.stream().filter(a -> a != null)
       .min((x, y) -> x.baseTime < y.baseTime ? -1 : 1).get();
   }
      
   // Evaluate a single submission
   //
   // #1 We hit exactly the spot on the floor needed to jump into the exit
   // chute.  Imagine a small gate 1/2 radius in on that chute and create a new
   // BallArch by hitting it.  This gets the right time and starting location,
   // but the x velocity needs reversal to remain forward.
   @Override
   public EvlPut evaluate(Submit sbm) throws Exception {
      RbnSpec spec = mapper.readValue(sbm.content, RbnSpec.class);
      BallSpec[] balls = spec.ballStarts;
      List<Rebound> rebounds = new LinkedList<Rebound>();
      List<BallArc> launchArcs = new LinkedList<BallArc>();
      RbnResults rtn = new RbnResults();
      int minIdx, ballIdx, leftId, rightId;
      double minTime, closingTime, elapsedTime = 0.0;
      double finalTime = Double.MAX_VALUE;
      double closingSpeed, leftSpeed, rightSpeed;
      double leftMass, rightMass, totalMass;
      BallArc lastArc, rightArc;
      
      while (elapsedTime < finalTime) {
         // Find next collision, described by minIdx (ball index) and minTime.
         minIdx = -1;
         minTime = balls[0].speed >= 0 ? Double.MAX_VALUE  // Left ball vs side
          : -balls[0].pos / balls[0].speed;
         
         for (ballIdx = 0; ballIdx < balls.length; ballIdx++) {
            if (ballIdx < balls.length-1)                  // Ball vs next ball
               closingTime = (balls[ballIdx+1].pos - balls[ballIdx].pos) / 
                (balls[ballIdx].speed - balls[ballIdx+1].speed);
            else                                           // Right ball vs side
               closingTime = (cChuteLength - balls[ballIdx].pos) / balls[ballIdx].speed;
            
            if (closingTime > 0.0 && closingTime < minTime) {
               minTime = closingTime;
               minIdx = ballIdx;
            }
         }
   
         // Adjust elapsed time and ball positions to time of next hit.
         elapsedTime += minTime;
         for (BallSpec ball: balls)
            ball.pos += minTime * ball.speed;
               
         // If right ball hits right side at or after gateTime, launch it.
         if (minIdx == balls.length-1 && spec.gateTime-cEps <= elapsedTime &&
          rtn.launchArcs == null) { // Launch
            launchArcs.add(lastArc = new BallArc(
               elapsedTime + cRadius / balls[minIdx].speed,
               cChuteLength, cChuteHeight,
               balls[minIdx].speed, 0.0));
            
            rightArc = lastArc.fromHorizontalHit(
               cChuteLength + spec.jumpLength/2.0 - cErrMargin,
               cChuteLength + spec.jumpLength/2.0 + cErrMargin, 0.0);
            
            if (rightArc != null) { // Bullseye! #1
               rtn.valid = true;
               lastArc = rightArc.fromVerticalHit(cChuteHeight,
                  cChuteHeight + 2*cRadius,
                  cChuteLength + spec.jumpLength + cRadius/2.0);
               assert(lastArc != null);
               lastArc.xVlc = -lastArc.xVlc;
               launchArcs.add(lastArc);
            }
            else { // Not bullseye
               launchArcs.add(getNextArc(lastArc, )) // Stopped here.
            }
            
            launchArcs.add(lastArc = getNextArc(lastArc,
              cChuteLength + spec.jumpLength));
             
            spec.jumpLength + cRadius, 0.0);
            
            if (nextArc != null && nextArc.yPos == cChuteHeight) { // Bullseye!
               launchArcs.add(nextArc);
               launchArcs.add(newBallArc())
            }
               
            // Stopped here.  Decide on exact structure of area.  Write
            // general collider.  Run three times.  Finaltime is when fourth
            // BallArc would start.
            rtn.launchArcs = launchArcs.toArray(new BallArc[0]);
            balls = Arrays.copyOf(balls, balls.length-1); // Lose right ball
         } 
         else if (minIdx < 0) // Left bounce
            rebounds.add(new Rebound(minIdx, elapsedTime, 0.0,
             -balls[minIdx+1].speed));
         else if (minIdx == balls.length-1) // Right bounce
            rebounds.add(new Rebound(minIdx, elapsedTime, -balls[minIdx].speed,
             0.0));
         else {
            leftSpeed = balls[minIdx].speed;
            rightSpeed = balls[minIdx+1].speed;
            leftMass = prms.balls[balls[minIdx].id];
            rightMass = prms.balls[balls[minIdx+1].id];
            totalMass = leftMass + rightMass;
            rebounds.add(new Rebound(minIdx, elapsedTime,
               (leftMass - rightMass)/totalMass * leftSpeed
                + 2*rightMass/totalMass * rightSpeed,
               
               (rightMass-leftMass/totalMass * rightSpeed
                * 2*leftMass/totalMass * leftSpeed)
            ));
         }
      }
      
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id,
            new Evl(mapper.writeValueAsString(rtn), 0.0));
      // Add scoring.
      
      lgr.info("Graded Rebound Submission# " + eval.sbmId);
      
      return eval;
   }
}