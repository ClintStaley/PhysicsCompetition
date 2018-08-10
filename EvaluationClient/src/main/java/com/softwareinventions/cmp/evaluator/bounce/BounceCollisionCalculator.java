package com.softwareinventions.cmp.evaluator.bounce;

import java.util.LinkedList;

import org.apache.commons.math3.analysis.UnivariateFunction;

public class BounceCollisionCalculator {
   // will return the next collision that occurs, will also delete the platform
   public static BounceCollision getNextCollision(LinkedList<BouncePlatform> Platforms,
         BounceBallEvent current) {

      BounceCollision[] collisions = new BounceCollision[Platforms.size()];

      for (int i = 0; i < collisions.length; i++) {
         collisions[i] = getPlatformCollision(Platforms.get(i), current);
      }

      return getFirstCollision(collisions);
   }

   // calculates if the ball will hit any edge of the platform
   private static BounceCollision getPlatformCollision(BouncePlatform platform,
         BounceBallEvent current) {

      // 8 for all 4 edeges and 4 corners
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

      // testValues

      // returns the correct collision
      return getFirstCollision(collisions);
   }

   // calculates if the ball will hit any edge of the platform
   private static BounceCollision getHorizontalEdgeCollision(double loX, double hiX,
         double y, BounceBallEvent current) {

      // TODO

      return null;
   }

   // calculates if the ball will hit any edge of the platform
   private static BounceCollision getVerticalEdgeCollision(double loY, double hiY,
         double x, BounceBallEvent current) {

      // TODO

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
