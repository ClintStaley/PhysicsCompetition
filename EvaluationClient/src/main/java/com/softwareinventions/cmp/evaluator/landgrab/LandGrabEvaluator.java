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
   
   // CAS: Declare classes in dependent order (this goes before Parameters)
   // And, why are these ints?
   static class BlockedRectangle {
      public int loX;
      public int hiX;
      public int loY;
      public int hiY;
   }
   
   static class Response {
      public Circle[] circleData;
      public double areaCovered; // sum of valid circles' areas
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
   
   // contains collisions of a given circle
   static class Collisions {
      public Collision[] barriers; // Barriers collided with in order
      public Double boundary;      // Angle of boundary collision || null
      public Collision[] pastCircles; // CAS: This is???
   }
   
   static class Collision {
      public Collision(int i, double r) {
         this.cId = i;
         this.angle = r;
      }
      
      public int cId; // circle id
      public double angle; // Angle at collision
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
      Response rsp = new Response();
      double score;
      SbmCircle[] sbmCircles = mapper.readValue(sbm.content, SbmCircle[].class);

      rsp.circleData = new Circle[Math.min(sbmCircles.length, prms.numCircles)];
      
      //evaluate each circle 
      // CAS: Make only nonobvious comments.  It's pretty clear this evaluates
      // each circle.
      for (int i = 0; i < rsp.circleData.length; i++) {
         rsp.circleData[i] = evaluateCircle(sbmCircles, i, rsp.circleData);
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
      SbmCircle circle = circles[i];   // setting CircleTR props CAS: Obvious?
      Circle ctr = new Circle(circle); // create circle to return in circleData
      
      // evaluate for boundary, barrier collisions
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
   
   /*
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
         // Check for "terminal edge" in circle
         if (GenUtil.inBounds(obs.loY + EPS, circle.centerY, obs.hiY - EPS) &&
          (obs.loX < circle.centerX + circle.radius && circle.centerX < obs.hiX)
          ) {
            // badAngle nearly zero so it still appears as a shape
            badAngle = EPS;
         }
         // possible collisions by Quadrants first checking that at least 
         // the nearest corner is within range of the circle. The process is 
         // nearly the same for each quadrant so only quadrant 1 has comments.
         // The angle is also shifted depending on quadrant because arctan range
         // Quadrant 1
         else if (obs.loY > circle.centerY && obs.hiX > circle.centerX && 
          Point2D.distance(circle.centerX, circle.centerY, obs.loX, obs.loY) 
          < circle.radius) {    
            // Use Pythagorean Theorem to find x coordinate where the radius
            // would intersect with the edge if the edge were infinitely long
            edgeIntersection = Math.sqrt( GenUtil.sqr(circle.radius) - 
             GenUtil.sqr(obs.loY - circle.centerY)) + circle.centerX;
            // If edgeIntersection is in range of where the edge actually is,
            // it remains the same. If it would intersect past the rectangle,
            // the point of intersection will be the far corner instead.
            edgeIntersection = edgeIntersection < obs.hiX ? edgeIntersection:
             obs.hiX;
            // Get angle of intersection using trig
            badAngle = Math.atan((obs.loY-circle.centerY)
             /(edgeIntersection-circle.centerX));
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
   
   // Pure Math Function: Use the following for more info on some of the math
   // returns null if no Circle intersection, returns double value of earliest
   // intersection otherwise.
   // https://mathworld.wolfram.com/Circle-CircleIntersection.html
   // 
   // CAS: Comments need work. It's obviously pure math.  More important is how
   // a double represents an intersection, for instance.  And frankly Wolfram
   // is always accurate, and occasionally clear.  I think this needs more help.
   // At least my math degree didn't make this code obvious to me even with 
   // Wolfram's reference.
   private Double circleIntersection(SbmCircle a, SbmCircle b) {
      
      Double d = Point2D.distance(a.centerX, a.centerY,
            b.centerX, b.centerY);
      // Circles do intersect
      if (d < a.radius + b.radius - EPS) {
         if (d < a.radius || d < b.radius) {
            //Overlap at centers
            // CAS: Again clarity:  "At least one center is inside other circle"
            return (Double)EPS;
         }
         else {
            // the following expression is from the website sited above
            // CAS: I actually find "sqr" is less clear than e.g. d*d for small
            // expressions.
            double adjacentLeg = (GenUtil.sqr(d) - GenUtil.sqr(b.radius) + 
             GenUtil.sqr(a.radius)) / (2 * d);
            // Relative angle of intersection to circles' angle to each other
            // Additionally we take the opposite of the arc cos value because we
            // want the angle of the first intersection not the second
            double relativeAngle = -Math.acos(adjacentLeg/a.radius);
            double circlesAngle = Math.atan((b.centerY - a.centerY)/
             (b.centerX - a.centerX));
            // Shift to correct quadrant based on arctan domain and range
            if (circlesAngle < 0) {
               circlesAngle = a.centerX < b.centerX ? circlesAngle + 2*Math.PI :
                circlesAngle + Math.PI;
            }
            else {
               circlesAngle = a.centerY <= b.centerY ? circlesAngle : 
                circlesAngle + Math.PI;
            }
            Double actualAngle = circlesAngle + relativeAngle;
            // Check if "terminal edge" starts in other circle
            actualAngle = actualAngle < EPS ? EPS : actualAngle;
            return actualAngle;
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