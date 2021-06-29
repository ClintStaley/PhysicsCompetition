package com.softwareinventions.cmp.evaluator.landgrab;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;

import java.util.LinkedList;
import java.util.Arrays;

import org.apache.log4j.Logger;
import java.awt.geom.Point2D;

public class LandGrabEvaluator implements Evaluator {

   static final double cGridSize = 100.0;
   public static final double EPS = 0.00000001;
   
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
      public CircleTR[] circleData;
      public double areaCovered;
   }

   static class CircleTR {
      public Double badRadius;
      public double area;
      public Collisions collisions;
   }

   static class Collisions {
      public int[] AllCircles;
      public Collision[] barriers;
      public Double boundary; //null for no boundary collision, thus needs to be wrapper class
      public Collision[] pastCircles;
     
   }

   static class Collision {
      public Collision(int i, double r){
         this.cId = i;
         this.radius = r;
      }
      public int cId;
      public double radius;
   }

   Parameters prms;
   int score;
   static Logger lgr = Logger.getLogger(LandGrabEvaluator.class);

   @Override
   public void setPrms(String prms) {
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
      SbmCircle[] sbmCircles = mapper.readValue(sbm.content, SbmCircle[].class);
      
      rspLG.circleData = new CircleTR[Math.min(sbmCircles.length,
            prms.numCircles)];
      
      for (int i = 0; i < rspLG.circleData.length; i++) {
         rspLG.circleData[i] = evaluateCircle(sbmCircles, i, rspLG.circleData); //return new circleTR for each sbmCircle
      }
      
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id,
            new Evl(mapper.writeValueAsString(rspLG),
            Math.round(rspLG.areaCovered * 100.0 / prms.goalArea)));
      
      lgr.info("Graded Land Grab Submission# " + eval.sbmId);
      return eval;
   }


   private CircleTR evaluateCircle(SbmCircle[] circles, int i, CircleTR[] circleData) {
      SbmCircle circle = circles[i]; 
      //setting CircleTR props
      CircleTR ctr = new CircleTR();
      ctr.area = areaOf(circle);
      ctr.collisions = new Collisions();
      ctr.collisions.boundary = distanceToBounds(circle);
      ctr.collisions.barriers = getBarrierCollisions(circles, i);
      ctr.collisions.pastCircles = getCircleCollisions(circles, i);
      
      ctr.badRadius = findBadRadius(ctr);
      
      setPastCirclesAllCircles(circleData, i, ctr);
      return ctr;
   }

   private Double findBadRadius(CircleTR ctr) {
      Double badRadius = ctr.collisions.boundary;
      double temp = 51;
      for(int i = 0; i < ctr.collisions.barriers.length; i++) {
         temp = temp < ctr.collisions.barriers[i].radius ? temp : ctr.collisions.barriers[i].radius;
      }
      for(int i = 0; i < ctr.collisions.pastCircles.length; i++) {
         temp = temp < ctr.collisions.pastCircles[i].radius ? temp : ctr.collisions.pastCircles[i].radius;
      }
      
      if(temp == 51)
         return badRadius; 
      
      if(badRadius == null)
         return (Double)temp;
      
      badRadius = badRadius < temp ? badRadius : temp;
      
      return badRadius;
     
   }

   private Collision[] getBarrierCollisions(SbmCircle[] circles, int i){
      SbmCircle circle = circles[i];   
      LinkedList<Collision> tempCollisions = new LinkedList<Collision>();

   
      // Check for noncorner obstacle collision
      for (int idx = 0; idx < prms.obstacles.length; idx++) {
         BlockedRectangle obs = prms.obstacles[idx];
         double d = Double.POSITIVE_INFINITY;
         double tempDist;
         
         //Check for start in obstacle
         if(GenUtil.inBounds(obs.loX + EPS, circle.centerX, obs.hiX - EPS) 
         && GenUtil.inBounds(obs.loY + EPS, circle.centerY, obs.hiY - EPS)){
            d = 1;
         }
         
         // Overlap with horizontal sides
         else if (GenUtil.inBounds(obs.loX + EPS, circle.centerX, obs.hiX - EPS) 
           && GenUtil.inBounds(obs.loY - circle.radius - EPS, circle.centerY,
           obs.hiY + circle.radius + EPS)){
            tempDist = Point2D.distance(circle.centerX, circle.centerY, obs.loX, circle.centerY);
            d = d < tempDist ? d : tempDist;
            tempDist = Point2D.distance(circle.centerX, circle.centerY, obs.hiX, circle.centerY);
            d = d < tempDist ? d : tempDist;
               }
         
         // Overlap with vertical sides
         else if (GenUtil.inBounds(obs.loY + EPS, circle.centerY, obs.hiY - EPS)
               && GenUtil.inBounds(obs.loX - circle.radius - EPS, circle.centerX,
               obs.hiX + circle.radius - EPS)){
            tempDist = Point2D.distance(circle.centerX, circle.centerY, circle.centerX, obs.loY);
            d = d < tempDist ? d : tempDist;
            tempDist = Point2D.distance(circle.centerX, circle.centerY, circle.centerX, obs.hiY );
            d = d < tempDist ? d : tempDist;
               }   
         
         //overlap with corners
         tempDist = cornerHit(circle, obs.hiX, obs.hiY);
         d = d < tempDist ? d : tempDist;
         
         tempDist = cornerHit(circle, obs.hiX, obs.loY);
         d = d < tempDist ? d : tempDist;
         
         tempDist = cornerHit(circle, obs.loX, obs.hiY);
         d = d < tempDist ? d : tempDist;
         
         tempDist = cornerHit(circle, obs.loX, obs.loY);
         d = d < tempDist ? d : tempDist;
         
         if ( d != Double.POSITIVE_INFINITY){
            tempCollisions.add(new Collision(idx, d));
         }
      }
   
      
      Collision[] c = new Collision[tempCollisions.size()];
      for(int x = 0; x < tempCollisions.size(); x++){
         c[x] = tempCollisions.get(x);
      }
      return c;
   }

   private Collision[] getCircleCollisions(SbmCircle[] circles, int i){
      SbmCircle circle = circles[i];
      // Check for circle collision
      LinkedList<Collision> tempCollisions = new LinkedList<Collision>();
      for (int idx = 0; idx < i; idx++){
         SbmCircle temp = circles[idx];
         double d = Point2D.distance(circle.centerX, circle.centerY,
           temp.centerX, temp.centerY) - temp.radius;
         if (d < circle.radius - EPS)
            tempCollisions.add(new Collision(idx, d));
      }
      Collision[] c = {};
      c = tempCollisions.toArray(c);
      return c;
      
   }

   // Return distance to boundary if within radius, otherwise return null
   private Double distanceToBounds(SbmCircle crc) {
      double dist = crc.centerX;
      dist = dist < cGridSize - crc.centerX ? dist : cGridSize - crc.centerX;
      dist = dist < crc.centerY ? dist : crc.centerY;
      dist = dist < cGridSize - crc.centerY ? dist : cGridSize - crc.centerY;
      
      if(dist + EPS < crc.radius)
         return (Double)dist;
      return (Double) null;
   }

   // Return non infinity iff circle overlaps {x,y}, then returns distance to it
   private double cornerHit(SbmCircle circle, double x, double y) {
      double d = Point2D.distance(circle.centerX, circle.centerY, x, y);
      return d < circle.radius - EPS ? d : Double.POSITIVE_INFINITY;
   }

   private double areaOf(SbmCircle c){
      return GenUtil.sqr(c.radius) * Math.PI;
   }

   private void setPastCirclesAllCircles(CircleTR[] circleData, int i, CircleTR ctr){
      Collision[] collisions = ctr.collisions.pastCircles;
      for(int j = 0; j < collisions.length; j++){
         int setting = collisions[j].cId;
         int[] pAllCircles = circleData[setting].collisions.AllCircles;
         if (pAllCircles == null){
            circleData[setting].collisions.AllCircles = new int[1];
            circleData[setting].collisions.AllCircles[0] = i;
         }
         else{
            circleData[setting].collisions.AllCircles = Arrays.copyOf(pAllCircles, pAllCircles.length+1);
            circleData[setting].collisions.AllCircles[pAllCircles.length] = i;
         }
      }  
   }

   
}