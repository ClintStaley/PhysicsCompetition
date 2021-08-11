package com.softwareinventions.cmp.evaluator.rebound;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;
import com.softwareinventions.cmp.util.BallArc;

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
   public static final double cRadius = .08, cDiameter = .16; // 16cm diameter
   public static final double cEps = 0.000001;
   public static final double cMargin = 0.001;
   public static final int    cSbmLimit = 5;  
   public static final double cSbmPenalty = .9;
   public static final double cMinJumpLength = .9031; // Length for 1m/s lanuch
   public static final double cBallGap = .01;         // Min initial ball gap
   
   
   
   private static class Parameters {
      public double targetLength; // Ideal jump length
      public int maxBalls;        // Maximum number of balls in chute
      public double[] balls;      // Masses of each ball
   }
   
   // Ball id, x-position and speed in the chute.
   private static class BallSpec {
      public int id;
      public double pos;
      public double speed;
   }
   
   // Rebound design specification
   private static class RbnSpec {
      public double gateTime;       // Time in s at which gate opens
      public double jumpLength;     // Predicted length of jump
      public BallSpec[] ballStarts; // Initial ball pos and speed.
   }
   
   // One in-chute collision between two balls or a ball and a chute side
   private static class Rebound {
      public int idLeft;        // Id of left ball or -1 for left chute side
      public double time;       // Time in sec of rebound
      public double speedLeft;  // New speed of left ball or 0.0 for chute side
      public double speedRight; // New speed of right ball or 0.0 for chute side

      public Rebound(int idLeft, double time, double speedLeft,
       double speedRight) {

         this.idLeft = idLeft;
         this.time = time;
         this.speedLeft = speedLeft;
         this.speedRight = speedRight;
      }
   }
   
   // Results of rebound design spec
   public static class RbnResults {
      public boolean valid;        // Good init config and correct jumpLength
      public Double sbmPenalty;    // Score penalty for excess submits or null
      public Rebound[] rebounds;   // Rebounds in time order
      public BallArc[] launchArcs; // Arcs taken by launched ball
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

   
   
   // Starting with |arc|, compute the next arc based on rebounds within the
   // launch area, from cChuteLength on the left to rightX on the right, and
   // from 0.0 to cFullHeight.
   //
   // #1 Add possibly null arcs resulting from |arc| collisions with, in order:
   // left side, bottom, right side below exit chute, lower exit chute corner, 
   // wall one radius into exit chute, upper exit chute corner, right side 
   // above exit chute, top.  At least one should be nonnull due to full 
   // enclosure and elastic bounces.
   BallArc getNextArc(BallArc arc, double rightX) {
      BallArc rtn = null;
      List<BallArc> cndArcs = new LinkedList<BallArc>();
      
System.out.printf("Next arc for: %f %f %f %f %f %f\n",
 arc.baseTime, arc.g, arc.xPos, arc.yPos, arc.xVlc, arc.yVlc);
      cndArcs.add(arc.fromVerticalHit(0, cFullHeight, cChuteLength)); // #1
      cndArcs.add(arc.fromHorizontalHit(cChuteLength, rightX, 0.0));
      cndArcs.add(arc.fromVerticalHit(0, cChuteHeight - cMargin, rightX));
      cndArcs.add(arc.fromCornerHit(rightX, cChuteHeight - cMargin));
      cndArcs.add(arc.fromVerticalHit(cChuteHeight - cMargin,
       cChuteHeight + cDiameter + cMargin, rightX + cRadius));
      cndArcs.add(arc.fromCornerHit(rightX, cChuteHeight + cDiameter
       + cMargin));
      cndArcs.add(arc.fromVerticalHit(cChuteHeight + cDiameter + cMargin,
       cFullHeight, rightX));
      cndArcs.add(arc.fromHorizontalHit(cChuteLength, rightX, cFullHeight));
System.out.printf("Done\n");

      return cndArcs.stream().filter(a -> a != null)
       .min((x, y) -> x.baseTime < y.baseTime ? -1 : 1).get();
   }
   
   // Return nonnegative time for |gap| to be closed by |speed|, or MAX_VALUE
   // if time would be negative or infinite.  |gap| must be nonnegative, though
   // epsilon-negative is OK and interpreted as 0.0.  
   double hitTime(double gap, double speed) {
      return speed < cEps ? Double.MAX_VALUE : Math.max(gap, 0.0) / speed;
   }
   
   // Is |spec| valid with respect to |this.prms| and general RbnSpec rules?
   boolean validSpec(RbnSpec spec) {
      BallSpec[] starts = spec.ballStarts;
      
      // General rules
      if (!GenUtil.inBounds(1, starts.length, prms.maxBalls)
       || spec.jumpLength < cMinJumpLength)
         return false;
      
      // End gaps in chute
      if (starts[0].pos < cRadius + cBallGap
       || starts[starts.length-1].pos > cChuteLength - cRadius - cBallGap)
         return false;
      
      // Ball speeds and intergaps in chute
      for (int idx = 0; idx < starts.length; idx++)
         if (!GenUtil.inBounds(-1.0, starts[idx].speed, 1.0)
          || idx < starts.length - 1
          && starts[idx+1].pos - starts[idx].pos < cDiameter + cBallGap)
            return false;

      return true;
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
      BallArc.setGlobals(cRadius, cEps);
      List<Rebound> rebounds = new LinkedList<Rebound>();
      List<BallArc> launchArcs = new LinkedList<BallArc>();
      RbnResults rtn = new RbnResults();
      Double score = null;
      int minIdx, ballIdx;
      double minTime, hitTime, elapsedTime = 0.0;
      double finalTime = Double.MAX_VALUE;         // Reduce once we do launch
      double leftSpeed, rightSpeed;
      double leftMass, rightMass, totalMass;
      double rightWall = spec.jumpLength + cChuteLength;
      BallArc lastArc;
      
      // Invalid spec results in empty, invalid, no-score reply
      if (!validSpec(spec)) {
         rtn.rebounds = new Rebound[0];
         rtn.launchArcs = new BallArc[0];

         return new EvlPut(sbm.cmpId, sbm.teamId, sbm.id,
          new Evl(mapper.writeValueAsString(rtn), score));
      }
      
      while (elapsedTime < finalTime) {
         
System.out.printf("Time: %.5f/%.5f\n", elapsedTime, finalTime);
for (BallSpec b: balls)
   System.out.printf("p: %f s: %f\n", b.pos, b.speed);

         // Find next collision, described by minIdx (ball index) and minTime.
         minIdx = -1;                                     // Left ball vs side
         minTime = hitTime(balls[0].pos - cRadius, -balls[0].speed);
         
         for (ballIdx = 0; ballIdx < balls.length; ballIdx++) {
            if (ballIdx < balls.length-1)                 // Ball vs next ball
               hitTime = hitTime(
                balls[ballIdx+1].pos - balls[ballIdx].pos - cDiameter, 
                balls[ballIdx].speed - balls[ballIdx+1].speed);
            else                                          // Right ball vs side
               hitTime = hitTime(cChuteLength - balls[ballIdx].pos - cRadius,
                balls[ballIdx].speed);
            
            if (hitTime < minTime) {
               minTime = hitTime;
               minIdx = ballIdx;
            }
         }
         
         // Adjust elapsed time and ball chute positions to time of next hit.
         elapsedTime += minTime;
         
         for (BallSpec ball: balls)
            ball.pos += minTime * ball.speed;
               
         // If right ball hits right side at or after gateTime, launch it.
         if (minIdx == balls.length-1 && spec.gateTime-cEps <= elapsedTime &&
          rtn.launchArcs == null) {
            // Launch from chute
            launchArcs.add(lastArc = new BallArc(
               elapsedTime + cRadius / balls[minIdx].speed,
               cChuteLength, cChuteHeight + cRadius,
               balls[minIdx].speed, 0.0, cGravity));
            
            // Bounce off floor or right side
            launchArcs.add(lastArc = getNextArc(lastArc, rightWall));
            
            // Bounce possibly off of start of exit chute, or elsewhere
            lastArc = getNextArc(lastArc, rightWall);

            // If in the entrance notch to the exit chute...
            if (GenUtil.looseEqual(lastArc.xPos, rightWall, cEps)) {
               rtn.valid = true;
               lastArc.xVlc = -lastArc.xVlc; // Switch to right direction
               lastArc.yVlc = 0;
               lastArc.g = 0;
               launchArcs.add(lastArc);
               
               // Add final arc coming off right end of exit chute
               launchArcs.add(lastArc.atTime(cChuteLength / lastArc.xVlc));
            }
            else {
               int limit = 4;
               // Loop till ball hits top or left of area
               while (limit-- > 0
                && lastArc.yPos < cFullHeight - cRadius - cMargin
                && lastArc.xPos > cChuteLength + cMargin) {
                  launchArcs.add(lastArc);
                  lastArc = getNextArc(lastArc, rightWall);
               }
            }
            
            rtn.launchArcs = launchArcs.toArray(new BallArc[0]);
            finalTime = rtn.launchArcs[rtn.launchArcs.length - 1].baseTime;
            balls = Arrays.copyOf(balls, balls.length-1); // Lose right ball
         } 
         else if (minIdx < 0) { // Left wall bounce
            rebounds.add(new Rebound(minIdx, elapsedTime, 0.0,
             -balls[minIdx+1].speed));
            balls[minIdx+1].speed = -balls[minIdx+1].speed;
         }
         else if (minIdx == balls.length-1) { // Right wall/gate bounce
            rebounds.add(new Rebound(minIdx, elapsedTime, -balls[minIdx].speed,
             0.0));
            balls[minIdx].speed = -balls[minIdx].speed;
         }
         else {
            leftSpeed = balls[minIdx].speed;
            rightSpeed = balls[minIdx+1].speed;
            leftMass = prms.balls[balls[minIdx].id];
            rightMass = prms.balls[balls[minIdx+1].id];
            totalMass = leftMass + rightMass;
            
            balls[minIdx].speed = (leftMass-rightMass)/totalMass * leftSpeed
             + 2*rightMass/totalMass * rightSpeed;
            
            balls[minIdx+1].speed = (rightMass-leftMass)/totalMass * rightSpeed
             + 2*leftMass/totalMass * leftSpeed;
            
            rebounds.add(new Rebound(minIdx, elapsedTime, 
             balls[minIdx].speed, balls[minIdx+1].speed));
         }
      }
      
      rtn.rebounds = rebounds.toArray(new Rebound[rebounds.size()]);
      if (rtn.valid) {
         score = 100.0 * spec.jumpLength / prms.targetLength;
         if (sbm.numSubmits > cSbmLimit) {
            rtn.sbmPenalty = score
             * (1.0 - Math.pow(cSbmPenalty, sbm.numSubmits - cSbmLimit));
            score -= rtn.sbmPenalty;
         }
      }
      
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id,
            new Evl(mapper.writeValueAsString(rtn), score));
      
      lgr.info("Graded Rebound Submission# " + eval.sbmId);
      
      return eval;
   }
}