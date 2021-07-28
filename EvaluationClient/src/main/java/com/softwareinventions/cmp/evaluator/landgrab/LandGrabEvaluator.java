package com.softwareinventions.cmp.evaluator.landgrab;
import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;
import java.util.LinkedList;
import org.apache.log4j.Logger;
import java.awt.geom.Point2D;
import java.lang.Math;

public class LandGrabEvaluator implements Evaluator {
   
   static final double cGridSize = 100.0;
   public static final double EPS = 0.00000001;
   
   static class BlockedRectangle {
      public double loX;
      public double hiX;
      public double loY;
      public double hiY;
   }
   
   static class Parameters {
      public int numCircles;
      public int goalArea;
      public BlockedRectangle[] obstacles;
   }
   
   static class SbmCircle {
      public double centerX;
      public double centerY;
      public double radius;
   }
   
   static class Collision {
      public Collision(int i, double r) {
         this.cId = i;
         this.angle = r;
      }
      
      public int cId; // circle id
      public double angle; // Angle at collision
   }
   
   // contains collisions of a given circle
   static class Collisions {
      public Collision[] barriers; // Barriers collided with in order
      public Double boundary;      // Angle of boundary collision || null
      public Collision[] pastCircles; // Collisions with past circles 
   }
  
   // data to be returned in response for each circle
   static class Circle {
      public double area;
      public Double badAngle; // Angle of earliest collision || null
      public Collisions collisions;
      
      public Circle(SbmCircle c) {
         this.area = GenUtil.sqr(c.radius) * Math.PI;
         this.collisions = new Collisions();
      }
   }
   
   static class Response { // This is the object returned
      public Circle[] circleData;
      public double areaCovered; // sum of valid circles' areas
   }
   
   Parameters prms; // This will be a limiting factor for multithreaded
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
      Response rsp = new Response();
      double score;
      SbmCircle[] sbmCircles = mapper.readValue(sbm.content, SbmCircle[].class);

      rsp.circleData = new Circle[Math.min(sbmCircles.length, prms.numCircles)];
      
      
      for (int i = 0; i < rsp.circleData.length; i++) {
         rsp.circleData[i] = evaluateCircle(sbmCircles, i, rsp.circleData);
         // add circle area to total area if it is valid
         if (rsp.circleData[i].badAngle == null)
            rsp.areaCovered += rsp.circleData[i].area;
         
      }
      
      score = Math.round(rsp.areaCovered * 100.0 / prms.goalArea);
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id,
       new Evl(mapper.writeValueAsString(rsp), score));
      
      lgr.info("Graded Land Grab Submission# " + eval.sbmId);
      return eval;
   }
   
   // Evaluate a given circle
   private Circle evaluateCircle(SbmCircle[] circles, int i,
    Circle[] circleData) {
      SbmCircle circle = circles[i]; 
      Circle ctr = new Circle(circle); // create circle to return in circleData
      
      // evaluate for 3 types of collisions
      ctr.collisions.boundary = distanceToBounds(circle);
      ctr.collisions.barriers = getBarrierCollisions(circles, i);
      ctr.collisions.pastCircles = getCircleCollisions(circles, i);
      
      // find Angle of circle's first collision (or set to null)
      ctr.badAngle = findBadAngle(ctr);
      return ctr;
   }
   
   // returns Angle of first collision for a given circle
   private Double findBadAngle(Circle ctr) {
      Double badAngle = ctr.collisions.boundary;
      double impossibleAngle = 361; // assumes background size = 100
      double temp = impossibleAngle;
      
      for (int i = 0; i < ctr.collisions.barriers.length; i++) {
         temp = temp < ctr.collisions.barriers[i].angle ? temp
          : ctr.collisions.barriers[i].angle;
      }
      for (int i = 0; i < ctr.collisions.pastCircles.length; i++) {
         temp = temp < ctr.collisions.pastCircles[i].angle ? temp
          : ctr.collisions.pastCircles[i].angle;
      }
      
      if (temp == impossibleAngle)
         return badAngle;
      
      if (badAngle == null)
         return (Double) temp;
      
      badAngle = badAngle < temp ? badAngle : temp;
      
      return badAngle;
      
   }
   
   /* Possible simplified barrier collision checker:
    * check all horizontal edges, and get use lowest angle, then with vertical
    * y, loX, loY
    * 
    * angle1 = arcsin((y - centerY) / radius);
    * angle2 = pi - angle1;   // complementary angle has same sine
    * Trade angle1 and angle2 to be in increasing order
    * x = cos(angle) * radius
    * if (inBounds(loX, cos(angle1)*radius, hiX))
    *    return angle1;
    * else if (inBounds(loX, cos(angle1)*radius, hiX)
    *    return angle2;
    * else
    *    return null;
    */
   
   private Collision[] getBarrierCollisions(SbmCircle[] circles, int i) {
      SbmCircle circle = circles[i];
      LinkedList<Collision> tempCollisions = new LinkedList<Collision>();
      final double cImpossibleAngle = 7;
      
      // Add one possible collision per obstacle
      for (int idx = 0; idx < prms.obstacles.length; idx++) {
         BlockedRectangle obs = prms.obstacles[idx];
         double edgeIntersection;
         double badAngle = cImpossibleAngle;
         // Check if the "terminal edge" of circle starts in a rect
         if (GenUtil.inBounds(obs.loY + EPS, circle.centerY, obs.hiY - EPS) &&
          (obs.loX < circle.centerX + circle.radius && circle.centerX < obs.hiX)
          ) {
            // badAngle is nearly zero so it still appears as a shape and 
            // evaluates to true in JS
            badAngle = EPS;
         }
         /* 
          * For each graphical quadrant, check for possible collisions.
          * As a radius turns about a quadrant, it will always collide with
          * a certain edge. In quadrant 1, this edge is the bottom edge, in 
          * quadrant 2 the right edge, in quadrant 3 the top edge, and in
          * quadrant 4 the left edge. This decides which coordinates we use
          * for our if statements. The first part of the if else statements
          * checks if this specific edge for a rectangle is in the given
          * quadrant. The second part of the if statement checks if 
          * the rectangle is in range of the circle, so the distance from the
          * center of the circle to the nearest corner must be less than the 
          * radius. If these two conditions are met, there would be a collision
          * with the circle. Only the first quadrant is heavily commented
          * because the process is nearly the same in each quadrant, with the
          * only changes being swapped coordinates or appropriate trig functions
          */
         // Quadrant 1
         else if (obs.loY > circle.centerY && obs.hiX > circle.centerX && 
          Point2D.distance(circle.centerX, circle.centerY, obs.loX, obs.loY) 
          < circle.radius) {
            /*
             * There is guaranteed to be an intersection along the edge
             * (obs.loX, obs.loY) -> (obs.hiX, obs.loY).
             * The intersection will occur at the farthest point on that edge
             * that is also inside the circle.
             * Temporarily assume the edge extends outside the circle
             */
            /* Use the pythagorean theorem to find the missing leg of the
             * triangle defined by the circle center, the radius, and the one
             * known coordinate of the collision. (For Quadrant 1 this is loY).
             * Then use this leg length and the circle center to get the
             * correct coordinate of the collision.
             */
            edgeIntersection = Math.sqrt( GenUtil.sqr(circle.radius) - 
             GenUtil.sqr(obs.loY - circle.centerY)) + circle.centerX;
            /* edge intersection is only correct if the rectangle extends 
             * outside the circle, so if its far coordinate is closer to the 
             * center than edgeIntersection, then collision occurred at the 
             * point of the rectangle, inside the circle, so change 
             * edgeIntersection to the value of the rectangle corner.
            */
            edgeIntersection = edgeIntersection < obs.hiX ? edgeIntersection:
             obs.hiX;
            // Use edgeIntersection to find the angle of the intersection.
            badAngle = Math.atan((obs.loY-circle.centerY)
             /(edgeIntersection - circle.centerX));
         }
         // Quadrant 2
         else if (obs.hiX < circle.centerX && obs.hiY > circle.centerY && 
          Point2D.distance(circle.centerX, circle.centerY, obs.hiX, obs.loY)
          < circle.radius) {
            edgeIntersection = Math.sqrt( GenUtil.sqr(circle.radius) - 
             GenUtil.sqr(obs.hiX - circle.centerX)) + circle.centerY;
            edgeIntersection = edgeIntersection < obs.hiY ? edgeIntersection:
             obs.hiY;
            badAngle = Math.atan((edgeIntersection-circle.centerY)
             /(obs.hiX-circle.centerX)) + Math.PI; 
         }
         // Quadrant 3
         else if (obs.hiY < circle.centerY && obs.loX < circle.centerX &&
          Point2D.distance(circle.centerX, circle.centerY, obs.hiX, obs.hiY)
          < circle.radius) {
            edgeIntersection = -Math.sqrt( GenUtil.sqr(circle.radius) - 
             GenUtil.sqr(obs.hiY - circle.centerY)) + circle.centerX;
            edgeIntersection = edgeIntersection > obs.loX ? edgeIntersection:
             obs.loX;
            badAngle = Math.atan((obs.hiX-circle.centerX)
             /(edgeIntersection-circle.centerX)) + Math.PI;  
         }
         // Quadrant 4
         else if (obs.loX > circle.centerX && Point2D.distance
          (circle.centerX, circle.centerY, obs.loX, obs.hiY) < circle.radius) {
            edgeIntersection = -Math.sqrt( GenUtil.sqr(circle.radius) - 
             GenUtil.sqr(obs.loX - circle.centerX)) + circle.centerY;
            edgeIntersection = edgeIntersection > obs.loY ? edgeIntersection:
             obs.loY;
            badAngle = Math.atan((edgeIntersection-circle.centerY)
             /(obs.loX-circle.centerX)) + 2 * Math.PI;
         }
         if (badAngle != cImpossibleAngle) {
            tempCollisions.add(new Collision(idx, badAngle));
         }
      }
      //Copies collisions into regular array
      Collision[] c = new Collision[tempCollisions.size()];
      for (int x = 0; x < tempCollisions.size(); x++) {
         c[x] = tempCollisions.get(x);
      }
      return c;
   }
   
   private Collision[] getCircleCollisions(SbmCircle[] circles, int i) {
      //SbmCircle circle = circles[i];
      // Check for circle collision
      LinkedList<Collision> tempCollisions = new LinkedList<Collision>();
      for (int idx = 0; idx < i; idx++) {
         Double angle = circleIntersection(circles[i], circles[idx]);
         if (angle != null)
            tempCollisions.add(new Collision(idx, (double)angle));
      }
      Collision[] c = {}; // CAS: Style says all locals at top of function.
      
      c = tempCollisions.toArray(c);
      return c;
   }
   
   // source: http://paulbourke.net/geometry/circlesphere/
   //  go to intersection of two circles section
   // CAS: Comments need work. It's obviously pure math.  More important is how
   // a double represents an intersection, for instance.  And frankly Wolfram
   // is always accurate, and occasionally clear.  I think this needs more help.
   // At least my math degree didn't make this code obvious to me even with 
   // Wolfram's reference.
   private Double circleIntersection(SbmCircle c1, SbmCircle c2) {
      Double d = Point2D.distance(c1.centerX, c2.centerY,
            c1.centerX, c2.centerY);
      // Any intersections?
      if (d < c1.radius + c2.radius - EPS) {
         if (d < c1.radius || d < c2.radius) {
            // One circle's center is inside another, so return EPS
            // so it resolves to true in JS
            return (Double)EPS;
         }
         else {
            /*
             * a is the distance from the line that connects the points at which
             * the circles intersect. 
             */
            double a = (d * d - c2.radius * c2.radius + 
             c1.radius * c1.radius) / (2 * d);
            
            // coords for "point 2" used by source. Point 2 is the intersection
            // of the line that connects circle centers and the line that
            // connects circle intersections.
            /*
             * If d is the distance from circle centers, and a is the
             * distance from circle center 1 to the line that connects circle
             * intersections, then a/d is the proportion of these lengths.
             * Point 2's coords will be circle1's center shifted by the
             * difference of circle centers  * proportion for needed shift.
             * NOTE: the proportions used here and later in the code can be
             * derived by making diagrams and finding similar triangles with 
             * properties of parallel lines (similar triangles have proportional
             * edge lengths). 
             */
            double p2X = c1.centerX + a / d * (c2.centerX - c1.centerX);
            double p2Y = c1.centerY + a / d * (c2.centerY - c1.centerY);
            
            // h is the distance from the line connecting the circle centers
            // to the intersection points
            // Use of pythagorean theorem to find the second leg
            double h = Math.sqrt(c1.radius * c1.radius - a * a);
            
            /*
             * Coords for one of the two intersections of the circles.
             * 
             * The Math: Use similar triangles to get the proportion from
             * center x and y offsets, height, and center distances to find
             * offset from p2 to intersection points, then use offsets.
             */
            double intersectionX = p2X + h  * (c2.centerY - c1.centerY) / d;
            double intersectionY = p2Y - h * (c2.centerX - c1.centerX) / d;
            System.out.println(intersectionX + ", " + intersectionY);
            //use arctan2 to find angle of intersection 
            double badAngle = Math.atan2(c1.centerY-intersectionY,
             c1.centerX-intersectionX);
            
            // Check second intersection. reverse offset to find other
            // intersection
            intersectionX = p2X - h  * (c2.centerY - c1.centerY) / d;
            intersectionY = p2Y + h * (c2.centerX - c1.centerX) / d;
            System.out.println(intersectionX + ", " + intersectionY);
            // use arctan2 to find second angle
            double tempAngle = Math.atan2(c1.centerY-intersectionY,
             c1.centerX-intersectionX);
            //User lesser angle and set it as the bad angle
            badAngle = badAngle < tempAngle ? badAngle : tempAngle;
            
            // Check if "terminal edge" starts in other circle. If it does,
            // we want the bad angle to be zero, but evaluate to true in JS,
            // so use EPS
            badAngle = badAngle < EPS ? EPS : badAngle;
            return badAngle;
         }
      }
      // Circles do not intersect
      else { 
         return null;
      }
   }
   
   // Return distance to boundary if within radius, otherwise return null
   private Double distanceToBounds(SbmCircle crc) {
      // CAS: Use Math.min for clarity.
      double dist = crc.centerX;
      dist = dist < cGridSize - crc.centerX ? dist : cGridSize - crc.centerX;
      dist = dist < crc.centerY ? dist : crc.centerY;
      dist = dist < cGridSize - crc.centerY ? dist : cGridSize - crc.centerY;
      
      // CAS: return dist + EPS < crc.radius ? dist : null;
      if (dist + EPS < crc.radius)
         return (Double) dist;
      return (Double) null;
   }  
}