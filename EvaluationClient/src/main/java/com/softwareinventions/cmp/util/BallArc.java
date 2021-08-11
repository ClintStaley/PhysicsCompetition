package com.softwareinventions.cmp.util;

import java.util.Arrays;
import java.util.OptionalDouble;

import org.apache.commons.math3.analysis.solvers.LaguerreSolver;
import org.apache.commons.math3.complex.Complex;

//import com.softwareinventions.cmp.evaluator.bounce.BounceEvaluator.Collision.HitType;



//Represent one arc of a gravitationally free-falling ball, starting with
// given position and velocity. Also provides methods for finding collisions
// off vertical and horizontal edges as well as corners.
public class BallArc {
   public double baseTime;  // Starting time
   public double xPos;      // Starting position
   public double yPos;
   public double xVlc;      // Starting velocity
   public double yVlc;
   public double g;         // Gravity (or zero)
   public int colliderId; // Id of object collided with, may be zero if unused
   public boolean corner;  // is corner Collision?
   
   private static double radius, eps;
   
   // Positions and velocities at relative time from baseTime
   public double xPosFn(double relTime) {return xPos + relTime * xVlc;}
   public double yPosFn(double relTime) {return yPos + relTime * yVlc
    + relTime*relTime*g/2.0;}
   public double xVlcFn(double relTime) {return xVlc;}
   public double yVlcFn(double relTime) {return yVlc + relTime * g;}
   
   public BallArc(double baseTime, double xPos, double yPos, double xVlc,
    double yVlc, double g, int cId, boolean c) {
      this.baseTime = baseTime;
      this.xPos = xPos;
      this.yPos = yPos;
      this.xVlc = xVlc;
      this.yVlc = yVlc;
      this.g = g;
      this.colliderId = cId;
      this.corner = c;
      
System.out.printf("BallArc: %f (%f, %f) going (%f, %f)\n", baseTime,
xPos, yPos, xVlc, yVlc);
   }
   
   //If ballArc was an inner class instead of an import these would be constants
   public static void setGlobals(double r, double epsilon) {
      radius = r;
      eps = epsilon;
   }

   // Return new BallArc based on position and velocity at |relTime|
   public BallArc atTime(double relTime, int cId, boolean c) {
      return new BallArc(baseTime + relTime, xPosFn(relTime), yPosFn(relTime), 
       xVlcFn(relTime), yVlcFn(relTime), g, cId, c);
   }
   
   // Return new BallArc based on hit against a vertical wall at |x| with
   // y-range [loY, hiY], or return null if no such hit will occur.
   public BallArc fromVerticalHit(double loY, double hiY, double x, int cId) {
      double yValue, xHitTime;
      BallArc rtn = null;
      
      // No intersection if we already straddle the line
      if (GenUtil.inBounds(x - radius - eps, xPos, x + radius + eps))
         return null;
      
      x = x > xPos ? x - radius : x + radius;
      xHitTime = (x - xPos) / xVlc;
      yValue = yPosFn(xHitTime);
      
      // Throw out negative times.
      if (xHitTime > 0 && GenUtil.inBounds(loY, yValue, hiY)) {
         rtn = atTime(xHitTime, cId, false);
         rtn.xVlc = -rtn.xVlc;
      }

      return rtn;
   }
   
   public BallArc fromHorizontalHit(double loX, double hiX, double y, int cId) {
      BallArc rtn = null;
      double[] yHitTimes; 
      double yHitTime, xHit;
      
      // No intersection if we already straddle the line
      if (GenUtil.inBounds(y - radius - eps, yPos, y + radius + eps))
         return null;

      y = y > yPos ? y - radius : y + radius;
      yHitTimes = GenUtil.quadraticSolution(g/2.0, yVlc, yPos - y);
      if (yHitTimes != null && yHitTimes[1] >= 0) {
         yHitTime = yHitTimes[0] >= 0 ? yHitTimes[0] : yHitTimes[1];
         xHit = xPosFn(yHitTime);
         if (GenUtil.inBounds(loX, xHit, hiX)) {
            rtn = atTime(yHitTime, cId, false);
            rtn.yVlc = -rtn.yVlc;
         }
      }
      return rtn;
   }
   
   
   /* Generate a new BallArc representing the result of the current BallArc
    * colliding with a corner at (x,y), or null if no collision would occur.
    * Do this by solving a polynomial whose real roots give the times at
    * which the difference between the ball position and point (x,y) equals
    * the ball radius. cId is for CollisionId, and it is an optional field,
    * so if it is an unused variable, it may be null. 
    * 
    * Given:
    * r = Radius of the ball
    * Px, Py = Position of ball center at time 0
    * Vx, Vy = Velocity of ball center at time 0
    * 
    * Cx, Cy = location of target point (obstacle corner)
    * Dx, Dy = (Px - Cx), (Py - Cy) the vector from target point to 
    * ball center at time 0, 
    * G = gravitational acceleration (as a negative, downward value)
    * 
    * The equation for squared circle center to point distance is:
    * 
    * (Dx + tVx)^2 + (Dy + tVy + (G/2)t^2)^2
    * 
    *  Setting this to r^2...
    * 
    * (Dx + tVx)^2 + (Dy + tVy + (G/2)t^2)^2 = r^2
    * 
    * ... and simplifying, we arrive at:
    * 
    * ((G/2)^2)t^4 + (G Vy)t^3 + (Vx^2 + Vy^2 + G Dy)t^2 + 2(DxVx + DyVy)t +
    * (Dx^2 + Dy^2 - r^2) = 0
    */
   public BallArc fromCornerHit(double x, double y, int cId) {
      double[] coef = new double[5];
      double magnitude, dX = (xPos - x), dY = (yPos - y), proximity;
      OptionalDouble firstHit;
      BallArc rtn = null;
      
      proximity = dX*dX + dY*dY - radius*radius;
      if (proximity <= 0.0)  // If the corner is already inside the ball
         return null;
      
      // Coefficients from right to left (t^0 to t^4)
      coef[0] = proximity;
      coef[1] = 2 * (dX * xVlc + dY * yVlc);
      coef[2] = xVlc*xVlc + yVlc*yVlc + g * dY;
      coef[3] = g * yVlc;
      coef[4] = g * g / 4.0;

      
      Complex[] solutions = new LaguerreSolver().solveAllComplex(coef, 0);
      
      // Find earliest nonnegative real solution
      firstHit = Arrays.stream(solutions).filter
       (s -> Math.abs(s.getImaginary()) < eps && s.getReal() > 0)
       .mapToDouble(s -> s.getReal()).min();

      // We hit the point.  Subtract 2x our velocity component toward corner
      if (firstHit.isPresent()) {
         rtn = atTime(firstHit.getAsDouble(), cId, true);        
         
         // Unit vector from ball center to corner
         dX = (x - rtn.xPos) / radius;
         dY = (y - rtn.yPos) / radius;

         // Magnitude of velocity component in collision direction.
         magnitude = dX * rtn.xVlc + dY * rtn.yVlc;
         
         rtn.xVlc -= 2.0 * magnitude * dX;
         rtn.yVlc -= 2.8 * magnitude * dY;
      }

      return rtn;
   }
   /*
   
   // Represent one Collision, including its type, its time, the location of
   // circle center as of the collision, and the index of the struck obstacle.
   public static class Collision {
      public enum HitType {
         CORNER, HORIZONTAL, VERTICAL // Hit corner, top/bottom, or left/right
      };

      public HitType hType;

      public double time;
      public double xHit;
      public double yHit;

      public int obstacleIdx = -1;

      public Collision(double time, HitType hType, double xHit, double yHit) {
         this.time = time;
         this.hType = hType;
         this.xHit = xHit;
         this.yHit = yHit;
      }
   }
   */
}