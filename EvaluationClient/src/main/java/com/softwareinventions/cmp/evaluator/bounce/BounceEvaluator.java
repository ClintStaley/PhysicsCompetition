package com.softwareinventions.cmp.evaluator.bounce;

import java.util.Arrays;
import java.util.LinkedList;

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

   private EvlPut evaluate(Submit submission) {
      int numberOfPlatforms = cmpDetails.platforms.length;
      
      EvlPut eval = new EvlPut();
      eval.eval = new Evl();

      eval.cmpId = submission.cmpId;
      eval.teamId = submission.teamId;
      eval.sbmId = submission.id;
      eval.eval = new Evl();

      BounceBallEvent startEvent = new BounceBallEvent();
      startEvent.obstacleHit = -1;
      startEvent.posX = 0;
      startEvent.posY = startingHeight;

      LinkedList<BouncePlatform> Platforms = new LinkedList<BouncePlatform>(
            Arrays.asList(cmpDetails.platforms));

      LinkedList<BounceBallEvent> Events = new LinkedList<BounceBallEvent>();

      Events.add(new BounceBallEvent());

      eval.eval.score = 0;
      eval.eval.testResult = "temp";

      System.out.println("Bounce Eval");
      return eval;
   }

   private BounceBallEvent[] calculateOneBall(
         LinkedList<BouncePlatform> Platforms, BounceBallEvent StartingPoint) {

      return null;
   }

}
