package com.softwareinventions.cmp.evaluator.landgrab;

import com.softwareinventions.cmp.driver.App;
import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;

import java.util.LinkedList;

import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;

import java.awt.geom.Point2D;

public class LandGrabEvaluator implements Evaluator {

   static final double cGridSize = 100.0;
   
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

   static class LandGrabTR {
      public boolean[] circleStatus;
      public double areaCovered;
   }

   Parameters prms;
   int score;
   static Logger lgr = Logger.getLogger(LandGrabEvaluator.class);

   public LandGrabEvaluator(String prms) {
      try {
         this.prms = mapper.readValue(prms, Parameters.class);
      } catch (Exception e) {
         e.printStackTrace();
      }
   }

   // Evaluate a single submission
   @Override
   public EvlPut evaluate(Submit sbm) throws Exception {
      LandGrabTR rspLG = new LandGrabTR();
      LinkedList<SbmCircle> validCircles = new LinkedList<SbmCircle>();
      SbmCircle[] sbmCircles = mapper.readValue(sbm.content, SbmCircle[].class);
      
      rspLG.circleStatus = new boolean[Math.min(sbmCircles.length,
            prms.numCircles)];
      
      for (int i = 0; i < rspLG.circleStatus.length; i++) {
         rspLG.circleStatus[i] = circleIsValid(sbmCircles[i], validCircles);
         if (rspLG.circleStatus[i]) {
            validCircles.add(sbmCircles[i]);
            rspLG.areaCovered += GenUtil.sqr(sbmCircles[i].radius) * Math.PI;
         }
      }
      
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id,
            new Evl(mapper.writeValueAsString(rspLG),
            (double) Math.round(rspLG.areaCovered * 100.0 / prms.goalArea)));
      
      lgr.info("Graded Land Grab Submission# " + eval.sbmId);
      
      return eval;
   }

   // need the full array to check for circle collision
   private boolean circleIsValid(SbmCircle circle,
         LinkedList<SbmCircle> validCircles) {
      
      // Check for bounds collision
      if (!circleInBounds(circle))
         return false;
      
      // Check for noncorner obstacle collision
      for (BlockedRectangle obs : prms.obstacles) {
         // Overlap with horizontal sides
         if (GenUtil.inBounds(obs.loX, circle.centerX, obs.hiX)
               && GenUtil.inBounds(obs.loY - circle.radius, circle.centerY,
               obs.hiY + circle.radius))
            return false;
         
         // Overlap with vertical sides
         if (GenUtil.inBounds(obs.loY, circle.centerY, obs.hiY)
               && GenUtil.inBounds(obs.loX - circle.radius, circle.centerX,
               obs.hiX + circle.radius))
            return false;
         
         if (cornerHit(circle, obs.hiX, obs.hiY)
               || cornerHit(circle, obs.hiX, obs.loY)
               || cornerHit(circle, obs.loX, obs.hiY)
               || cornerHit(circle, obs.loX, obs.loY))
            return false;
      }
      
      // Check for circle collision
      for (SbmCircle temp : validCircles)
         if (Point2D.distance(circle.centerX, circle.centerY,
               temp.centerX, temp.centerY) < circle.radius + temp.radius)
            return false;
      
      return true;
   }

   private boolean circleInBounds(SbmCircle crc) {
      return GenUtil.inBounds(crc.radius, crc.centerX, cGridSize - crc.radius)
            && GenUtil.inBounds(crc.radius, crc.centerY,
                  cGridSize - crc.radius);
   }

   // Return true iff circle overlaps {x,y}
   private boolean cornerHit(SbmCircle circle, double x, double y) {
      return Point2D.distance(circle.centerX, circle.centerY, x, y)
            < circle.radius;
   }
}