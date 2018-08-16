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

   static class SbmCircle {
      public double centerX;
      public double centerY;
      public double radius;
   }
   
   static class Parameters {
      public int numCircles;
      public int goalArea;
      public BlockedRectangle[] obstacles;
   }

   static class BlockedRectangle {
      public int loX;
      public int hiX;
      public int loY;
      public int hiY;
   }
   
   static class LandGrabEvl {
	   public boolean[] circleStatus;
	   public double areaCovered;
	}
   
   Parameters prms;
   int score;
   static final int cGridSize = 100;

   ObjectMapper mapper = new ObjectMapper();

   public LandGrabEvaluator(String prms) {
      super(prms);

      try {
         this.prms = mapper.readValue(prms, Parameters.class);
      } 
      catch (Exception e) {
         e.printStackTrace();
      }
   }

   @Override
   public EvlPut[] evaluateSbms(Submit[] submissions) {
      EvlPut[] evaluations = new EvlPut[submissions.length];

      try {
         for (int i = 0; i < submissions.length; i++)
            evaluations[i] = evaluate(submissions[i]);
      } 
      catch (Exception e) {
         e.printStackTrace();
         return new EvlPut[0];
      }
      
      return evaluations;
   }

   // Evaluate a single submission
   private EvlPut evaluate(Submit sbm) throws Exception {
      LandGrabEvl rspLG = new LandGrabEvl();

      LinkedList<SbmCircle> validCircles = new LinkedList<SbmCircle>();

      EvlPut eval = new EvlPut();
      eval.eval = new Evl();

      eval.cmpId = sbm.cmpId;
      eval.teamId = sbm.teamId;
      eval.sbmId = sbm.id;

      SbmCircle[] sbmCircles = mapper.readValue(sbm.content, SbmCircle[].class);

      rspLG.circleStatus
       = new boolean[Math.min(sbmCircles.length, prms.numCircles)];

      for (int i = 0; i < rspLG.circleStatus.length; i++) {
         rspLG.circleStatus[i] = circleIsValid(sbmCircles[i], validCircles);
         if (rspLG.circleStatus[i]) {
            validCircles.add(sbmCircles[i]);
            rspLG.areaCovered += area(sbmCircles[i].radius);
         }
      }

      eval.eval.testResult = mapper.writeValueAsString(rspLG);

      eval.eval.score = (double) Math
            .round((rspLG.areaCovered * 100 / prms.goalArea));

      System.out.println("Graded Land Grab Submission# " + eval.sbmId);
      
      return eval;
   }

   // need the full array to check for circle collision
   private boolean circleIsValid(SbmCircle circle,
         LinkedList<SbmCircle> validCircles) {

      // check for bounds collision
      if (!circleInBounds(circle))
         return false;

      // check for obstacle collision
      for (int i = 0; i < prms.obstacles.length; i++) {
         if (prms.obstacles[i].hiX > circle.centerX
               && circle.centerX > prms.obstacles[i].loX)
            if (!(circle.centerY > (prms.obstacles[i].hiY + circle.radius)
                  || circle.centerY < (prms.obstacles[i].loY
                        + circle.radius)))
               return false;

         if (prms.obstacles[i].hiY > circle.centerY
               && circle.centerY > prms.obstacles[i].loY)
            if (!(circle.centerX > (prms.obstacles[i].hiX + circle.radius)
                  || circle.centerX < (prms.obstacles[i].loX
                        + circle.radius)))
               return false;

         if ((!cornerValid(circle, prms.obstacles[i].hiX,
               prms.obstacles[i].hiY))
               || (!cornerValid(circle, prms.obstacles[i].hiX,
                     prms.obstacles[i].loY))
               || (!cornerValid(circle, prms.obstacles[i].loX,
                     prms.obstacles[i].hiY))
               || (!cornerValid(circle, prms.obstacles[i].loX,
                     prms.obstacles[i].loY)))
            return false;
      }

      // check for circle collision
      for (SbmCircle temp : validCircles)
         if (circleCollision(circle, temp))
            return false;

      return true;
   }

   // returns true if circles have collision otherwise false
   private boolean circleCollision(SbmCircle crc1, SbmCircle crc2) {
      return (Point2D.distance(crc1.centerX, crc1.centerY,
            crc2.centerX, crc2.centerY) < crc1.radius + crc2.radius);
   }

   // assumes a grid size of 100 X 100
   private boolean circleInBounds(SbmCircle circle) {
      return (circle.centerX + circle.radius <= cGridSize
            && circle.centerX - circle.radius >= 0
            && circle.centerY + circle.radius <= cGridSize
            && circle.centerY - circle.radius >= 0);
   }

   // return true if corner is ok false otherwise
   private boolean cornerValid(SbmCircle circle, double x, double y) {
      return circle.radius <= Point2D.distance(circle.centerX, circle.centerY,
            x, y);
   }

   private double area(double radius) {
      return Math.pow(radius, 2) * Math.PI;
   }
}
