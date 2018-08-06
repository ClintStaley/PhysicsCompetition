package com.softwareinventions.cmp.evaluator.landgrab;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;

import java.io.IOException;
import java.util.LinkedList;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;

import java.awt.geom.Point2D;

public class LandGrabEvaluator extends Evaluator {

   LandGrabParamaters cmpDetails;
   int score;

   ObjectMapper mapper = new ObjectMapper();

   public LandGrabEvaluator(String prms) {
      super(prms);

      try {
         cmpDetails = mapper.readValue(prms, LandGrabParamaters.class);
      } catch (Exception e) {
         e.printStackTrace();
      }
   }

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

   private EvlPut evaluate(Submit submission)
         throws JsonParseException, JsonMappingException, IOException {
      LandGrabEvl rspLG = new LandGrabEvl();

      LinkedList<LandGrabSubmissionCircle> validCircles = new LinkedList<LandGrabSubmissionCircle>();

      EvlPut eval = new EvlPut();
      eval.eval = new Evl();

      eval.cmpId = submission.cmpId;
      eval.teamId = submission.teamId;
      eval.sbmId = submission.id;

      LandGrabSubmissionCircle[] data = mapper.readValue(submission.content,
            LandGrabSubmissionCircle[].class);

      rspLG.areaCovered = 0;
      rspLG.circleStatus = new boolean[data.length];

      for (int i = 0; i < data.length; i++) {
         rspLG.circleStatus[i] = circleIsValid(data[i], validCircles);
         if (rspLG.circleStatus[i]) {
            validCircles.add(data[i]);
            rspLG.areaCovered += area(data[i].radius);
         }
      }

      eval.eval.testResult = mapper.writeValueAsString(rspLG);

      eval.eval.score = (double) Math
            .round((rspLG.areaCovered * 100 / cmpDetails.goalArea));

      return eval;
   }

   // need the full array to check for circle collision
   private boolean circleIsValid(LandGrabSubmissionCircle circle,
         LinkedList<LandGrabSubmissionCircle> validCircles) {

      // check for bounds collision
      if (!circleInBounds(circle))
         return false;

      // check for obstacle collision
      for (int i = 0; i < cmpDetails.obstacles.length; i++) {
         if (cmpDetails.obstacles[i].hiX > circle.centerX
               && circle.centerX > cmpDetails.obstacles[i].loX)
            if (!(circle.centerY > (cmpDetails.obstacles[i].hiY + circle.radius)
                  || circle.centerY < (cmpDetails.obstacles[i].loY
                        + circle.radius)))
               return false;

         if (cmpDetails.obstacles[i].hiY > circle.centerY
               && circle.centerY > cmpDetails.obstacles[i].loY)
            if (!(circle.centerX > (cmpDetails.obstacles[i].hiX + circle.radius)
                  || circle.centerX < (cmpDetails.obstacles[i].loX
                        + circle.radius)))
               return false;

         if ((!cornerValid(circle, cmpDetails.obstacles[i].hiX,
               cmpDetails.obstacles[i].hiY))
               || (!cornerValid(circle, cmpDetails.obstacles[i].hiX,
                     cmpDetails.obstacles[i].loY))
               || (!cornerValid(circle, cmpDetails.obstacles[i].loX,
                     cmpDetails.obstacles[i].hiY))
               || (!cornerValid(circle, cmpDetails.obstacles[i].loX,
                     cmpDetails.obstacles[i].loY)))
            return false;
      }

      // check for circle collision
      for (LandGrabSubmissionCircle temp : validCircles)
         if (circleCollision(circle, temp))
            return false;

      System.out.printf("(%f, %f) is good\n", circle.centerX, circle.centerY);
      return true;
   }

   // returns true if circles have collision otherwise false
   private boolean circleCollision(LandGrabSubmissionCircle circle1,
         LandGrabSubmissionCircle circle2) {
      return (Point2D.distance(circle1.centerX, circle1.centerY,
            circle2.centerX,
            circle2.centerY) < circle1.radius + circle2.radius);
   }

   // assumes a grid size of 100 X 100
   private boolean circleInBounds(LandGrabSubmissionCircle circle) {
      return (circle.centerX + circle.radius <= 100
            && circle.centerX - circle.radius >= 0
            && circle.centerY + circle.radius <= 100
            && circle.centerY - circle.radius >= 0);
   }

   // return true if corner is ok false otherwise
   private boolean cornerValid(LandGrabSubmissionCircle circle, double x,
         double y) {
      return circle.radius <= Point2D.distance(circle.centerX, circle.centerY,
            x, y);
   }

   private double area(double radius) {
      return Math.pow(radius, 2) * Math.PI;
   }
}
