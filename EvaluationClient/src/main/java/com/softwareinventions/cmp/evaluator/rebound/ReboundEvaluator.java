package com.softwareinventions.cmp.evaluator.rebound;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.evaluator.bounce.BounceEvaluator.BounceEvent;
import com.softwareinventions.cmp.util.GenUtil;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.OptionalDouble;
import java.util.function.UnaryOperator;

import org.apache.commons.math3.analysis.polynomials.PolynomialFunction;
import org.apache.commons.math3.analysis.solvers.LaguerreSolver;
import org.apache.commons.math3.complex.Complex;
import org.apache.log4j.Logger;

public class ReboundEvaluator implements Evaluator {
   public static final double cStartingHeight = 1.0;
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
   
   private static class BallSpec {
      public int id;
      public double pos;
      public double speed;
   }
   
   private static class RbnSpec {
      public double gateTime; // Time in s at which gate opens
      public double jumpLength;
      public BallSpec[] ballStarts;
   }
   
   private static class Rebound {
      int idLeft;         // Id of left ball or -1 (right is one greater)
      double time;        // Time in sec of rebound
      double speedLeft;   // New speed of left ball
      double speedRight;  // New speed of right ball

      public Rebound(int idLeft, double time, double speedLeft,
       double speedRight) {

         this.idLeft = idLeft;
         this.time = time;
         this.speedLeft = speedLeft;
         this.speedRight = speedRight;
      }
   }
   
   public static class RbnResults {
      public boolean valid;
      public Double sbmPenalty;
      public Rebound[] rebounds;
      public double launchTime;
      public BallArc[] launchArcs;
   }

   static Logger lgr = Logger.getLogger(ReboundEvaluator.class);
   
   Parameters prms;
   int score;

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
      public double xPos;      // Starting position
      public double yPos;
      public double xVlc;      // Starting velocity
      public double yVlc;
      
      public double xPosFn(double time) {return xPos + time * xVlc;}
      public double yPosFn(double time) {return yPos + time * yVlc;}
      public double xVlcFn(double time) {return xVlc;}
      public double yVlcFn(double time) {return yPos + time * yVlc
       + time*time*cGravity/2.0;}
      
      public BallArc(double xPos, double yPos, double xVlc, double yVlc) {
         this.xPos = xPos;
         this.yPos = yPos;
         this.xVlc = xVlc;
         this.yVlc = yVlc;
      }

      // Return new BallArc based on position and velocity at |time|
      public BallArc atTime(double time) {
         return new BallArc(xPosFn(time), yPosFn(time), xVlcFn(time),
          yVlcFn(time));
      }
      
      // Return new BallArc based on hit against a vertical wall at |x| with
      // y-range [loY, hiY], or return null if no such hit will occur.
      public BallArc fromVerticalHit(double loY, double hiY, double x) {
         // Get time when x value will be lined up with edge.
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
      
      /* Create a PolynomialFunction whose real roots give the times at which the
       * distance between a moving circle center and a point (e.g. an obstacle
       * corner) is exactly equal to the radius of the circle.  Such times
       * correspond to circle/point collisions.
       * 
       * Given:
       * r = Radius of the circle
       * Px, Py = Position of circle center at time 0
       * Vx, Vy = Velocity of circle center at time 0
       * 
       * Cx, Cy = location of target point (obstacle corner)
       * Dx, Dy = (Px - Cx), (Py - Cy) the vector from target point to 
       * circle center at time 0, 
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
         
         firstHit = Arrays.stream(solutions).filter
          (s -> Math.abs(s.getImaginary()) < cEps && s.getReal() > 0)
          .mapToDouble(s -> s.getReal()).min();

         // We hit a corner.  Subtract 2x our velocity component toward corner
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
      
   // Evaluate a single submission
   @Override
   public EvlPut evaluate(Submit sbm) throws Exception {
      RbnSpec spec = mapper.readValue(sbm.content, RbnSpec.class);
      BallSpec[] balls = spec.ballStarts;
      List<Rebound> rebounds = new LinkedList<Rebound>();
      RbnResults rtn = new RbnResults();
      int minHit = -1, hit, leftId, rightId;
      double minTime, closingTime, elapsedTime = 0.0;
      double finalTime = Double.MAX_VALUE;
      double closingSpeed, leftSpeed, rightSpeed;
      double leftMass, rightMass, totalMass;
      
      while (elapsedTime < finalTime) {
         minTime = balls[0].speed >= 0 ? Double.MAX_VALUE // Left ball vs border
          : -balls[0].pos / balls[0].speed;
         
         for (hit = 0; hit < balls.length; hit++) {
            if (hit < balls.length-1)                    // Ball vs next ball
               closingTime = (balls[hit+1].pos - balls[hit].pos) / 
                (balls[hit].speed - balls[hit+1].speed);
            else                                         // Right ball vs border
               closingTime = (cChuteLength - balls[hit].pos) / balls[hit].speed;
            
            if (closingTime > 0.0 && closingTime < minTime) {
               minTime = closingTime;
               minHit = hit;
            }
         }
   
         elapsedTime += minTime;
         for (BallSpec ball: balls)
            ball.pos += minTime * ball.speed;
               
         if (minHit == balls.length-1 && spec.gateTime <= elapsedTime &&
          rtn.launchArcs == null) { // Launch
            rtn.launchTime = elapsedTime + cRadius / balls[minHit].speed;
            rtn.launchArcs = new BallArc[3];
            
            // Stopped here Add launch arcs.
            
            balls = Arrays.copyOf(balls, balls.length-1); // Lose right ball
         } 
         else if (minHit < 0) // Left bounce
            rebounds.add(new Rebound(minHit, elapsedTime, 0.0,
             -balls[minHit+1].speed));
         else if (minHit == balls.length-1) // Right bounce
            rebounds.add(new Rebound(minHit, elapsedTime, -balls[minHit].speed,
             0.0));
         else {
            leftSpeed = balls[minHit].speed;
            rightSpeed = balls[minHit+1].speed;
            leftMass = prms.balls[balls[minHit].id];
            rightMass = prms.balls[balls[minHit+1].id];
            totalMass = leftMass + rightMass;
            rebounds.add(new Rebound(minHit, elapsedTime,
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