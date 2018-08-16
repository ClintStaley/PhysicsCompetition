package com.softwareinventions.cmp.evaluator.landgrab;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;

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
   static final double cGridSize = 100.0;

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

      // Check for bounds collision
      if (!circleInBounds(circle))
         return false;

      // Check for noncorner obstacle collision
      for (BlockedRectangle obs: prms.obstacles) {
    	 // Overlap with horizontal sides
    	 if (GenUtil.inBounds(obs.loX, circle.centerX, obs.hiX)
    	       && GenUtil.inBounds(obs.loY-circle.radius, 
    	       circle.centerY, obs.hiY+circle.radius))
            return false;
    	 
    	 // Overlap with vertical sides
    	 if (GenUtil.inBounds(obs.loY, circle.centerY, obs.hiY)
      	       && GenUtil.inBounds(obs.loX-circle.radius, 
      	       circle.centerX, obs.hiX+circle.radius))
            return false;

         if (cornerHit(circle, obs.hiX, obs.hiY)
               || cornerHit(circle, obs.hiX, obs.loY)
               || cornerHit(circle, obs.loX, obs.hiY)
               || cornerHit(circle, obs.loX, obs.loY))
            return false;
      }

      // Check for circle collision
      for (SbmCircle temp : validCircles)
         if (circleCollision(circle, temp))
            return false;

      return true;
   }

   // Return true iff circles have collision.
   private boolean circleCollision(SbmCircle crc1, SbmCircle crc2) {
      return (Point2D.distance(crc1.centerX, crc1.centerY,
            crc2.centerX, crc2.centerY) < crc1.radius + crc2.radius);
   }

   private boolean circleInBounds(SbmCircle crc) {
      return GenUtil.inBounds(crc.radius, crc.centerX, cGridSize-crc.radius) &&
            GenUtil.inBounds(crc.radius,  crc.centerY, cGridSize - crc.radius);
   }

   // Return true iff circle overlaps {x,y}
   private boolean cornerHit(SbmCircle circle, double x, double y) {
      return Point2D.distance(circle.centerX, circle.centerY, x, y)
    		  < circle.radius;
   }

   private double area(double radius) {
      return Math.pow(radius, 2) * Math.PI;
   }
}
