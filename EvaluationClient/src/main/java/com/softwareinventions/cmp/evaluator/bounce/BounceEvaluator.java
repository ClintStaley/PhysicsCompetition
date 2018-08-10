package com.softwareinventions.cmp.evaluator.bounce;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedList;

import org.apache.commons.math3.analysis.UnivariateFunction;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;

public class BounceEvaluator extends Evaluator {
   // constants
   public static final double STARTINGHEIGHT = 100.0;

   BounceParameters cmpDetails;
   ObjectMapper mapper = new ObjectMapper();

   public BounceEvaluator(String prms) {
      super(prms);

      try {
         cmpDetails = mapper.readValue(prms, BounceParameters.class);
      } catch (Exception e) {
         e.printStackTrace();
      }
   }

   @Override
   public EvlPut[] evaluateSubmissions(Submit[] submissions) {
      EvlPut[] evaluations = new EvlPut[submissions.length];

      try {
         for (int i = 0; i < submissions.length; i++)
            evaluations[i] = evaluate(submissions[i]);
      } catch (Exception e) {
         e.printStackTrace();
         return new EvlPut[0];
      }

      return evaluations;
   }

   // evaluate a list of differing speeds
   private EvlPut evaluate(Submit submission)
         throws JsonParseException, JsonMappingException, IOException {
      BounceSubmission[] sbmData = mapper.readValue(submission.content,
            BounceSubmission[].class);

      // keep track of the number of platforms for later
      int numberOfPlatforms = cmpDetails.platforms.length;
      // Linked list so that i can delete
      LinkedList<BouncePlatform> platforms = new LinkedList<BouncePlatform>(
            Arrays.asList(cmpDetails.platforms));

      // start a BounceEvl to turn into a json string
      BounceEvl rspB = new BounceEvl();
      rspB.events = new BounceBallEvent[sbmData.length][];

      // start an evaluation so that i can return it later
      EvlPut eval = new EvlPut();
      eval.eval = new Evl();
      eval.cmpId = submission.cmpId;
      eval.teamId = submission.teamId;
      eval.sbmId = submission.id;
      eval.eval = new Evl();

      // loop through all speeds
      for (int i = 0; i < sbmData.length; i++) {
         BounceBallEvent startEvent = new BounceBallEvent();
         startEvent.obstacleHit = -1;
         startEvent.posX = 0;
         startEvent.posY = STARTINGHEIGHT;
         startEvent.velocityX = sbmData[i].speed;
         startEvent.velocityY = 0.0;
         startEvent.time = 0.0; // all can start at time zero?

         rspB.events[i] = calculateOneBall(platforms, startEvent);
      }

      rspB.platformsHit = numberOfPlatforms - platforms.size();

      // fill in score and array of arrays in response
      eval.eval.score = Math.round(
            (double) rspB.platformsHit / (double) numberOfPlatforms * 10000.0)
            / 100;
      eval.eval.testResult = mapper.writeValueAsString(rspB);

      System.out.println("Bounce Eval");
      return eval;
   }

   // 100 - 9.8t^2 = 0
   private BounceBallEvent[] calculateOneBall(
         LinkedList<BouncePlatform> Platforms, BounceBallEvent StartingPoint) {

      LinkedList<BounceBallEvent> ballEvents = new LinkedList<BounceBallEvent>();
      ballEvents.add(StartingPoint);

      BounceCollision nextCollision = BounceCollisionCalculator
            .getNextCollision(Platforms, StartingPoint);

      while (nextCollision != null) {

         ballEvents
               .add(calculateBallColision(ballEvents.getLast(), nextCollision));

         nextCollision = BounceCollisionCalculator.getNextCollision(Platforms,
               StartingPoint);
      }

      ballEvents.add(calculateBorderEvent(StartingPoint));

      return ballEvents.toArray(new BounceBallEvent[ballEvents.size()]);
   }

   // returns the new ball event after calculating all values,
   // may return null, if no collisions occur
   private BounceBallEvent calculateBallColision(BounceBallEvent current,
         BounceCollision collision) {
      BounceBallEvent newBallEvent = BounceHelper.createNewEvent(current,
            collision.time);

      switch (collision.hit) {
      case VERTICAL:
         newBallEvent.velocityX = -newBallEvent.velocityX;
         break;
      case HORIZONTAL:
         newBallEvent.velocityY = -newBallEvent.velocityY;
         break;
      case CORNER:
         //TODO
         System.out.println("Corner Collision");
         break;
      default:
         //should never happen
         System.out.println("Invalid Collision Detected");
         return null;

      }
      // TODO

      return newBallEvent;
   }

   private BounceBallEvent calculateBorderEvent(BounceBallEvent current) {
      // get all equations
      UnivariateFunction[] ballFunctions = BounceHelper
            .getAllFunctions(current);

      // solve for y
      double yOutOfBounds = quadraticSolution(BounceHelper.GRAVITY,
            current.velocityY, current.posY);

      // solve for x
      double xOutOfBounds = (100.0 - current.posX) / current.velocityX;

      System.out.println(xOutOfBounds);
      System.out.println(yOutOfBounds);
      // gets the lower time
      double boundsTime = (xOutOfBounds > yOutOfBounds) ? yOutOfBounds
            : xOutOfBounds;

      // calculate the out of bounds event
      BounceBallEvent outOfBounds = new BounceBallEvent();
      outOfBounds.obstacleHit = -1;
      outOfBounds.posX = ballFunctions[0].value(boundsTime);
      outOfBounds.velocityX = ballFunctions[1].value(boundsTime);
      outOfBounds.posY = ballFunctions[2].value(boundsTime);
      outOfBounds.velocityY = ballFunctions[3].value(boundsTime);
      outOfBounds.time = boundsTime;

      return outOfBounds;
   }

   // quadratic solution returns time when zero
   // if no valid solution returns 10000
   private double quadraticSolution(double a, double b, double c) {
      double d = b * b - 4 * a * c;
      double root1;
      double root2;

      System.out.println("d is: " + d);

      if (d > 0) {
         root1 = (-b + Math.sqrt(d)) / (2 * a);
         root2 = (-b - Math.sqrt(d)) / (2 * a);
         System.out.println("root1 is: " + root1 + ", root2 is: " + root2);
         if (root1 >= 0 || root2 >= 0)
            if (root2 < 0)
               return root1;
            else if (root1 < 0)
               return root2;
            else
               return (root1 > root2) ? root2 : root1;

      }
      if (d == 0) {
         root1 = (-b + Math.sqrt(d)) / (2 * a);
         if (root1 >= 0)
            return root1;
      }

      // imaginary solution should never occur
      return 100000;
   }

}
