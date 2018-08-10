package com.softwareinventions.cmp.evaluator.bounce;

import java.util.LinkedList;

import org.apache.commons.math3.analysis.UnivariateFunction;

public class BounceCollisionCalculator {
   // will return the next collision that occurs, will also delete the platform
   public static BounceCollision getNextCollision(LinkedList<BouncePlatform> Platforms,
         BounceBallEvent current) {

      BounceCollision[] collisions = new BounceCollision[Platforms.size()];
      int platformIdx = -1;

      //check all platforms for a collision 
      for (int i = 0; i < collisions.length; i++) {
         collisions[i] = getPlatformCollision(Platforms.get(i), current);
         if (collisions[i] != null) {
            platformIdx = i;
            collisions[i].obstacleIdx = Platforms.get(i).platformId;
         }
      }
      
      if (platformIdx > -1) {
         System.out.println("Collision detected at: " + Platforms.get(platformIdx).platformId);
         Platforms.remove(platformIdx);
      }
      
      return getFirstCollision(collisions);
   }

   // calculates if the ball will hit any edge of the platform
   private static BounceCollision getPlatformCollision(BouncePlatform platform,
         BounceBallEvent current) {

      // 8 for all 4 edges and 4 corners
      BounceCollision[] collisions = new BounceCollision[8];

      // get horizontal edges and checking if they hit, or whose first
      collisions[0] = getHorizontalEdgeCollision(platform.loX, platform.hiX,
            platform.hiY, current);
      collisions[1] = getHorizontalEdgeCollision(platform.loX, platform.hiX,
            platform.loY, current);

      collisions[2] = getVerticalEdgeCollision(platform.loY, platform.hiY,
            platform.hiX, current);
      collisions[3] = getVerticalEdgeCollision(platform.loY, platform.hiY,
            platform.loX, current);

      collisions[4] = getCornerCollision(platform.hiX, platform.hiY, current);
      collisions[5] = getCornerCollision(platform.hiX, platform.loY, current);
      collisions[6] = getCornerCollision(platform.loX, platform.hiY, current);
      collisions[7] = getCornerCollision(platform.loX, platform.loY, current);


      // returns the correct collision
      return getFirstCollision(collisions);
   }

   // calculates if the ball will hit horizontal any edge of the platform
   private static BounceCollision getHorizontalEdgeCollision(double loX, double hiX,
         double y, BounceBallEvent current) {
      //get equations for event
      UnivariateFunction[] equations = BounceHelper.getAllFunctions(current);
      
      // solve for y
      double yHitTime = BounceHelper.quadraticSolution(BounceHelper.GRAVITY,
            current.velocityY, current.posY - y);
      
      //throw out negative times
      if (yHitTime < 0)
         return null;

      double xValue = equations[0].value(yHitTime);
      
      if (xValue > loX && xValue < hiX) {
         BounceCollision collision = new BounceCollision();
         
         collision.time = yHitTime;
         collision.hit = BounceCollision.hitType.VERTICAL;
         
         //not necessary for edge hit
         collision.xHit = -1;
         collision.yHit = -1;
         
         return collision;
      }
      
      return null;
   }

   // calculates if the ball will hit any vertical edge of the platform
   private static BounceCollision getVerticalEdgeCollision(double loY, double hiY,
         double x, BounceBallEvent current) {
      //get equations for event
      UnivariateFunction[] equations = BounceHelper.getAllFunctions(current);
      
      // solve for x
      double xHitTime = (x - current.posX) / current.velocityX;
      
      //throw out negative times
      if (xHitTime < 0)
         return null;

      double yValue = equations[2].value(xHitTime);
      
      if (yValue > loY && yValue < hiY) {
         BounceCollision collision = new BounceCollision();
         
         collision.time = xHitTime;
         collision.hit = BounceCollision.hitType.HORIZONTAL;
         
         //not necessary for edge hit
         collision.xHit = -1;
         collision.yHit = -1;
         
         return collision;
      }
      
      return null;
   }

   // calculates if the ball will hit any edge of the platform
   private static BounceCollision getCornerCollision(double x, double y,
         BounceBallEvent current) {

      // TODO

      return null;
   }

   // function takes an array of collisions, and returns the first,
   // any can be null
   private static BounceCollision getFirstCollision(BounceCollision[] collisions) {
      BounceCollision firstCollision = null;

      for (int i = 0; i < collisions.length; i++)
         if (collisions[i] != null)
            if (firstCollision == null
                  || firstCollision.time > collisions[i].time)
               firstCollision = collisions[i];

      return firstCollision;
   }
}
