package com.softwareinventions.cmp.evaluator.bounce;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedList;

import org.apache.commons.math3.analysis.UnivariateFunction;
import org.apache.commons.math3.analysis.solvers.BracketingNthOrderBrentSolver;
import org.apache.commons.math3.analysis.solvers.UnivariateSolver;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.evaluator.landgrab.LandGrabEvl;
import com.softwareinventions.cmp.evaluator.landgrab.LandGrabSubmissionCircle;

public class BounceEvaluator extends Evaluator {
   // for now constant, could change later
   public static final double startingHeight = 100.0;
   // final

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
         startEvent.posY = startingHeight;
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

      ballEvents.add(calculateBorderEvent(StartingPoint));
      
      return ballEvents.toArray(new BounceBallEvent[ballEvents.size()]);
   }

   private BounceBallEvent calculateBorderEvent(BounceBallEvent current) {
      // solve for y
      UnivariateFunction yPosFunction = t -> -9.8 * Math.pow(t, 2) + current.posY;
      
      //find out about this
      UnivariateSolver solver = new BracketingNthOrderBrentSolver(1.0e-12,
            1.0e-8, 5);
      double c = solver.solve(100, yPosFunction, -10.0, 10.0, 0);
      //need to find out
      
      double yOutOfBounds = 10000;

      // solve for x
      UnivariateFunction xPosFunction = t -> t * current.velocityX + current.posX;
      // is in form of posX + velocityX * t, so
      // 100 = posX + velocityX * t
      double xOutOfBounds = (100.0 - current.posX) / current.velocityX;

      //gets the lower time
      double boundsTime = (xOutOfBounds > yOutOfBounds) ? yOutOfBounds
            : xOutOfBounds;

      BounceBallEvent outOfBounds = new BounceBallEvent();
      outOfBounds.obstacleHit = -1;
      outOfBounds.velocityX = current.velocityX;
      outOfBounds.time = boundsTime;
      outOfBounds.posY = yPosFunction.value(boundsTime);
      outOfBounds.posX = xPosFunction.value(boundsTime);
      
      
      return outOfBounds;
   }

}
