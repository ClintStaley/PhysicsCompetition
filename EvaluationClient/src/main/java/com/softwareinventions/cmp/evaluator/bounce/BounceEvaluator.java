package com.softwareinventions.cmp.evaluator.bounce;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.apache.log4j.Logger;
import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.BallArc;
import com.softwareinventions.cmp.util.GenUtil;

public class BounceEvaluator implements Evaluator {
   // Constants
   public static final double cWorldLength = 10.0;
   public static final double cStartingHeight = 10.0;
   public static final double cGravity = -9.81;
   public static final double cRadius = .1;
   public static final double cEps = 0.00000001;
   public static final double cErrFactor = 0.01;
   public static final int cSbmLimit = 5;  
   public static final double cSbmPenalty = .9;

   // One rectangular obstacle, either barrier or target
   private static class Obstacle {
      public int id;
      public double loX;
      public double hiX;
      public double hiY;
      public double loY;
      public boolean barrier = false;  // Is this a barrier?
   }

   // Competition parameters
   private static class Parameters {
      public double targetTime;      // Total time (in s) that earns 100% credit
      public Obstacle[] targets;     // Obstacles to hit
      public Obstacle[] barriers;    // Obstacles to avoid
   }
   
   public static class LaunchSpec {
      public double speed;
      public double finalX;
      public double finalY;
      public double finalTime;
   }

   /* BounceBallArc describes the initial launch of a ball, or the ball's bounce
    * off of an obstacle, or the ball going out of bounds. 
    * 
    * For a bounce, velocityX and velocityY are the ball velocities after the
    * bounce, and obstacleIdx describes the obstacle that was hit.  For a
    * starting point or out-of-bounds event, obstacleNdx is -1.
    */
   public static class BounceBallArc {
      public double time;
      public double velocityX;
      public double velocityY;
      public double posX;
      public double posY;
      public int obstacleIdx;
      public boolean corner;

      //create conversion from BallArc to BounEvt
      public BounceBallArc(BallArc bA) {
         time = bA.baseTime;
         velocityX = bA.xVlc;
         velocityY = bA.yVlc;
         posX = bA.xPos;
         posY = bA.yPos;
         obstacleIdx = bA.colliderId;
         corner = bA.corner;
      }
      
      public static BounceBallArc[] convert(BallArc[] ballArcs) {
         BounceBallArc[] BounceArcs = new BounceBallArc[ballArcs.length];
         for (int i = 0; i < ballArcs.length; i++) {
            BounceArcs [i] = new BounceBallArc(ballArcs[i]);
         }
         return BounceArcs;
      }
   }

   public class BounceResults {
      public boolean valid;
      public Double sbmPenalty;
      public BounceEvaluator.BounceBallArc[][] events;
   }

   static Logger lgr = Logger.getLogger(BounceEvaluator.class);
   private Parameters prms;

   @Override
   public void setPrms(String prms) {
      try {
         this.prms = mapper.readValue(prms, Parameters.class);
      } catch (Exception e) {
         e.printStackTrace(); // CAS FIX: Better error handling. Let's talk.
      }
   }

   // Evaluate a list of ball speeds comprising a single sbm.
   @Override
   public EvlPut evaluate(Submit sbm) throws Exception {
      LaunchSpec[] sbmData = mapper.readValue(sbm.content, LaunchSpec[].class);
      int numBalls = sbmData.length;
      int targetCount = prms.targets.length;
      int barrierCount = prms.barriers.length;
      Double score = null;
      int idx;
      BallArc.setGlobals(cRadius, cEps);

      // Assign all targets ID numbers based on their index.
      for (idx = 0; idx < targetCount; idx++)
         prms.targets[idx].id = idx;
      
      // Assign all barriers ID numbers based on their index.
      for (idx = 0; idx < barrierCount; idx++) {
         prms.barriers[idx].id = idx + targetCount;
         prms.barriers[idx].barrier = true;
      }
      
      // LinkedList so that we can delete obstacles as they are hit.
      LinkedList<Obstacle> obstacles = new LinkedList<Obstacle>
            (Arrays.asList(prms.targets));
      obstacles.addAll(Arrays.asList(prms.barriers));

      BounceResults rspB = new BounceResults();

      // Double array of events, one array per ball
      rspB.events = new BounceBallArc[numBalls][];

      double totalTime = 0.0;

      for (int i = 0; i < numBalls; i++) {
         BallArc initialArc = new BallArc(0, 0, cStartingHeight, sbmData[i].speed,
          0, cGravity, 0, false);
         // Gets all other events for a given ball and return an array starting
         // with event given.
         rspB.events[i] = calculateOneBall(obstacles, initialArc);
         totalTime += rspB.events[i][rspB.events[i].length - 1].time;
      }

      rspB.valid = isGoodAnswer(obstacles, prms, rspB.events, sbmData);

      
      //Calculating Score
      if (rspB.valid) {
         score = (double) Math.round(100.0 * prms.targetTime 
               / (totalTime + (numBalls - 1.0)));
         if (sbm.numSubmits > cSbmLimit) {
            rspB.sbmPenalty = score
                  * (1.0 - Math.pow(cSbmPenalty, sbm.numSubmits - cSbmLimit));
            score -= rspB.sbmPenalty;
         }
      }
      
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id, new Evl(
            mapper.writeValueAsString(rspB), score));

      lgr.info("Graded Bounce Sbm# " + eval.sbmId);

      return eval;
   }
   
   // Check that all remaining obstacles are barriers and that all barriers
   // remain in the list.
   private boolean isGoodAnswer(LinkedList<Obstacle> obs, Parameters prm,
         BounceBallArc[][] res, LaunchSpec[] sbm) {
      BounceBallArc testEvent;
      LaunchSpec testSpec;
      BounceBallArc[] ball;
      
      //checks all balls for the correct predictions
      for (int i = 0; i < res.length; i++) {
         ball = res[i];
         
         if (ball.length < 2)  // One collision plus an exit event
            return false;
         
         testEvent = ball[ball.length - 2];  // Collision prior to exit event
         testSpec = sbm[i];
         
         if (
            !(GenUtil.looseEqual(testEvent.time, testSpec.finalTime, cErrFactor) 
            && GenUtil.looseEqual(testEvent.posX, testSpec.finalX, cErrFactor)
            && GenUtil.looseEqual(testEvent.posY, testSpec.finalY, cErrFactor)))
            
            return false;
      }
      
      for (Obstacle temp : obs) 
         if (!temp.barrier)
            return false;

      return obs.size() == prm.barriers.length;
   }
   
   //Returns the ball Events for 
   private BounceBallArc[] calculateOneBall(LinkedList<Obstacle> obstacles,
         BallArc arc) {
      LinkedList<BallArc> ballEvents = new LinkedList<BallArc>();
      //Check for collision obs
      ballEvents.add(arc);

      Optional<BallArc> nextCollision = 
            getNextCollision(obstacles, arc);

      // Loops until there are no more collisions calculated.
      while (nextCollision.isPresent()) {
         ballEvents.add(nextCollision.get());
         nextCollision = getNextCollision(obstacles, ballEvents.getLast());
      }

      // Calculate where the ball will go out of bounds.
      ballEvents.add(calculateBorderEvent(ballEvents.getLast()));

      // Return events as array, so that I can send the correct format as
      // response.
       
       
      BallArc[] rtn = ballEvents.toArray(new BallArc[ballEvents.size()]);
      return BounceBallArc.convert(rtn); // returns converted array
   }


   // Calculate where and when the ball will hit the border, resulting in
   // the last event.
   private BallArc calculateBorderEvent(BallArc current) {
      double xOutOfBounds;

      // Solve for y, as the ball goes one radius below the lower bound.
      double[] possibleYOutOfBounds = GenUtil.quadraticSolution
            (cGravity / 2.0, current.yVlc, current.yPos + cRadius);
      
      double yOutOfBounds = possibleYOutOfBounds[0] >= 0.0 ? 
            possibleYOutOfBounds[0] : possibleYOutOfBounds[1];
      
      // Solve for x + radius out of bounds.
      if (current.xVlc < 0.0)
         xOutOfBounds = (-cRadius - current.xPos) / current.xVlc;
      else if (current.xVlc > 0.0)
         xOutOfBounds = (cWorldLength + cRadius - current.xPos)
          / current.xVlc;
      else
         xOutOfBounds = Double.MAX_VALUE;

      double boundsTime = Math.min(xOutOfBounds, yOutOfBounds);

      return current.atTime(boundsTime, -1, false);
   }

   //calculates next collision that occurs
   public Optional<BallArc> getNextCollision(List<Obstacle> obstacles,
         BallArc arc) {
      Optional<BallArc> rtn =
            obstacles.stream().map(o -> getObstacleCollision(o, arc))
            .filter(c -> c != null)
            .min((c2, c1) -> Double.compare(c2.baseTime, c1.baseTime));
      
      if (rtn.isPresent()) 
         obstacles.removeIf(o -> o.id == rtn.get().colliderId);
      
      return rtn;
   }
   
   // Calculates and return the first Collision of the ball with |obstacle|,
   // or null if there is no collision.
   private BallArc getObstacleCollision(Obstacle obs, BallArc arc) {
      Optional<BallArc> rtn = Stream.of(
         arc.fromHorizontalHit(obs.loX, obs.hiX, obs.hiY, obs.id),
         arc.fromHorizontalHit(obs.loX, obs.hiX, obs.loY, obs.id),
         arc.fromVerticalHit(obs.loY, obs.hiY, obs.hiX, obs.id),
         arc.fromVerticalHit(obs.loY, obs.hiY, obs.loX, obs.id),
         arc.fromCornerHit(obs.hiX, obs.hiY, obs.id),
         arc.fromCornerHit(obs.hiX, obs.loY, obs.id),
         arc.fromCornerHit(obs.loX, obs.hiY, obs.id),
         arc.fromCornerHit(obs.loX, obs.loY, obs.id))
      .filter(c -> c != null)
      .min((c1, c2) -> Double.compare(c1.baseTime, c2.baseTime));
      
      if (rtn.isPresent()) {
         lgr.info("Best Time is: " + rtn.get().baseTime);
         return rtn.get();
      }
      
      return null;
   }

}
