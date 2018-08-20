package com.softwareinventions.cmp.evaluator.bounce;

import java.util.Arrays;
import java.util.LinkedList;

import org.apache.commons.math3.analysis.UnivariateFunction;
import org.apache.commons.math3.analysis.polynomials.PolynomialFunction;
import org.apache.commons.math3.analysis.solvers.LaguerreSolver;
import org.apache.commons.math3.complex.Complex;
import org.codehaus.jackson.map.ObjectMapper;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;

public class BounceEvaluator implements Evaluator {
   // Constants
   public static final double STARTING_HEIGHT = 100.0;
   public static final double GRAVITY = -9.80665;
   public static final double RADIUS = 1;
   public static final double EPS = 0.00000001;

   // Represent one Collision, including its type, its time, the location of
   // circle center as of the collision, and the index of the struck obstacle.
   private static class Collision {
      public enum HitType {
         CORNER, HORIZONTAL, VERTICAL
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

   // Represent one rectangular obstacle.
   private static class Obstacle {
      public double loX;
      public double hiX;
      public double hiY;
      public double loY;
      public int obstacleId;
   }

   // Competition parameters
   private static class Parameters {
      public double targetTime; // 100% credit for this total time in s.
      public Obstacle[] obstacles; // Obstacles to hit
   }

   public static class LaunchSpec {
      public double speed;
   }

   /*
    * BounceEvent describes a bounce off of a platform, the starting point of
    * the ball, or the ball going out of bounds. in the case of a bounce, the
    * velocityX and velocityY of the ball are the velocities after the bounce,
    * the obstacleIdx describes the obstacle that was hit, or -1 if the event is
    * a starting event or an out of bounds event.
    */
   public static class BounceEvent {
      public double time;
      public double velocityX;
      public double velocityY;
      public double posX;
      public double posY;
      public int obstacleIdx;

      // Creates an starting bounce event.
      public BounceEvent(double startingHeight, double speed) {
         obstacleIdx = -1;
         posX = 0;
         posY = startingHeight;
         velocityX = speed;
         velocityY = 0.0;
         time = 0.0;
      }

      // Creates a copy of the bounce event sent in with updated position and
      // velocity.
      public BounceEvent(BounceEvent current, double time) {
         // Get all equations.
         UnivariateFunction[] ballFunctions = BounceEvaluator
               .getAllFunctions(current);

         obstacleIdx = -1;
         posX = ballFunctions[0].value(time);
         velocityX = ballFunctions[1].value(time);
         posY = ballFunctions[2].value(time);
         velocityY = ballFunctions[3].value(time);
         this.time = time + current.time;
      }
   }

   public class BounceTR {
      public int obstaclesHit;
      public BounceEvaluator.BounceEvent[][] events;
   }

   private Parameters prms;

   public BounceEvaluator(String prms) {
      try {
         this.prms = mapper.readValue(prms, Parameters.class);
      } catch (Exception e) {
         e.printStackTrace(); // CAS FIX: Better error handling. Let's talk.
      }
   }

   // Constructor only for testing this class.
   private BounceEvaluator() {}

   // Evaluate a list of ball speeds comprising a single sbm.
   @Override
   public EvlPut evaluate(Submit sbm) throws Exception {
      LaunchSpec[] sbmData = mapper.readValue(sbm.content, LaunchSpec[].class);
      int numBalls = sbmData.length;
      int obstacleCount = prms.obstacles.length;
      double score;

      // Assign all obstacles ID numbers based on their index.
      for (int idx = 0; idx < obstacleCount; idx++)
         prms.obstacles[idx].obstacleId = idx;

      // Linked list so that we can delete obstacles as they are hit.
      LinkedList<Obstacle> obstacles = new LinkedList<Obstacle>(
            Arrays.asList(prms.obstacles));

      BounceTR rspB = new BounceTR();

      // Double array of events, one array per ball
      rspB.events = new BounceEvent[numBalls][];


      double totalTime = 0.0;

      for (int i = 0; i < numBalls; i++) {
         // Set up starting ball event.
         BounceEvent startEvent = new BounceEvent(STARTING_HEIGHT,
               sbmData[i].speed);

         // Gets all other events for a given ball and return an array starting
         // with event given.
         rspB.events[i] = calculateOneBall(obstacles, startEvent);
         totalTime += rspB.events[i][rspB.events[i].length - 1].time;
      }

      rspB.obstaclesHit = obstacleCount - obstacles.size();

      if (obstacles.size() == 0)
         score = Math.round(prms.targetTime * 10000.0
               / (totalTime + 10.0 * (numBalls - 1.0))) / 100.0;
      else
         score = 0.0;
      
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id, new Evl(
            mapper.writeValueAsString(rspB), score));

      System.out.println("Graded Bounce Sbm# " + eval.sbmId);

      return eval;
   }

   private BounceEvent[] calculateOneBall(LinkedList<Obstacle> obstacles,
         BounceEvent StartingPoint) {
      // Linked list used for undefined size.
      LinkedList<BounceEvent> ballEvents = new LinkedList<BounceEvent>();
      ballEvents.add(StartingPoint);

      Collision nextCollision = getNextCollision(obstacles, StartingPoint);

      // Loops until there are no more collisions calculated.
      while (nextCollision != null) {
         ballEvents
               .add(calculateBallColision(ballEvents.getLast(), nextCollision));

         nextCollision = getNextCollision(obstacles, ballEvents.getLast());
      }

      // Calculate where the ball will go out of bounds.
      ballEvents.add(calculateBorderEvent(StartingPoint));

      // Return events as array, so that I can send the correct format as
      // response.
      return ballEvents.toArray(new BounceEvent[ballEvents.size()]);
   }

   // Returns the new ball event after calculating all values,
   // may return null, if no collisions occur.
   private BounceEvent calculateBallColision(BounceEvent current,
         Collision collision) {
      BounceEvent newBallEvent = new BounceEvent(current, collision.time);

      // Horizontal or vertical hits, mean just flip velocity.
      // Corner hit means calculate new x velocity and y velocity.
      switch (collision.hType) {
      case VERTICAL:
         newBallEvent.velocityX = -newBallEvent.velocityX;
         newBallEvent.obstacleIdx = collision.obstacleIdx;
         break;
      case HORIZONTAL:
         newBallEvent.velocityY = -newBallEvent.velocityY;
         newBallEvent.obstacleIdx = collision.obstacleIdx;
         break;
      case CORNER:
         double dx = (collision.xHit - newBallEvent.posX) / RADIUS;
         double dy = (collision.yHit - newBallEvent.posY) / RADIUS;

         // Magnitude of velocity component in collision direction.
         double magnitude = dx * newBallEvent.velocityX
               + dy * newBallEvent.velocityY;

         newBallEvent.velocityX = current.velocityX + (-2.0 * magnitude * dx);
         newBallEvent.velocityY = current.velocityY + (-2.0 * magnitude * dy);

         newBallEvent.obstacleIdx = collision.obstacleIdx;
         break;
      default:
         // should never happen
         return null;

      }

      System.out.println("Obstacle Hit is: " + newBallEvent.obstacleIdx);
      // CAS FIX: This might be a good time to start working with a logger. I've
      // had
      // good luck
      // with Apache Commons logger. Let's put that into our Maven .pom and use
      // it.
      return newBallEvent;
   }

   // Calculate where and when the ball will hit the border, resulting in
   // the last event.
   private BounceEvent calculateBorderEvent(BounceEvent current) {

      double xOutOfBounds;

      // Solve for y, as the ball goes one radius below the lower bound.
      double yOutOfBounds = quadraticSolution(GRAVITY / 2.0, current.velocityY,
            current.posY + RADIUS);

      // Solve for x + radius out of bounds.
      if (current.velocityX < 0.0)
         xOutOfBounds = (-RADIUS - current.posX) / current.velocityX;
      else if (current.velocityX > 0.0)
         xOutOfBounds = (100.0 + RADIUS - current.posX) / current.velocityX;
      else
         xOutOfBounds = Double.MAX_VALUE;

      double boundsTime = Math.min(xOutOfBounds, yOutOfBounds);

      return new BounceEvent(current, boundsTime);
   }

   // Return the next collision that occurs, and delete the obstacle.
   public Collision getNextCollision(LinkedList<Obstacle> obstacles,
         BounceEvent current) {

      // Create an array of collisions, so we can check all obstacles.
      Collision[] collisions = new Collision[obstacles.size()];

      // Check all obstacles for a collision.
      for (int i = 0; i < collisions.length; i++) {
         collisions[i] = getobstacleCollision(obstacles.get(i), current);
      }

      Collision firstCollision = getFirstCollision(collisions);

      if (firstCollision != null) {
         for (Obstacle obstacle : obstacles) {
            if (obstacle.obstacleId == firstCollision.obstacleIdx) {
               obstacles.remove(obstacle);
               break;
            }
         }
      }

      return firstCollision;
   }

   // Calculates and return the first Collision of the ball with |obstacle|,
   // or null if there is no collision. 
   private Collision getobstacleCollision(Obstacle obstacle,
         BounceEvent current) {
      Collision[] collisions = new Collision[8];

      // Check horizontal edge collisions.
      collisions[0] = getHorizontalEdgeCollision(obstacle.loX, obstacle.hiX,
            obstacle.hiY + RADIUS, current);
      collisions[1] = getHorizontalEdgeCollision(obstacle.loX, obstacle.hiX,
            obstacle.loY - RADIUS, current);

      // Check vertical edge collisions.
      collisions[2] = getVerticalEdgeCollision(obstacle.loY, obstacle.hiY,
            obstacle.hiX + RADIUS, current);
      collisions[3] = getVerticalEdgeCollision(obstacle.loY, obstacle.hiY,
            obstacle.loX - RADIUS, current);

      // Check all corners for collisions.
      collisions[4] = getCornerCollision(obstacle.hiX, obstacle.hiY, current);
      collisions[5] = getCornerCollision(obstacle.hiX, obstacle.loY, current);
      collisions[6] = getCornerCollision(obstacle.loX, obstacle.hiY, current);
      collisions[7] = getCornerCollision(obstacle.loX, obstacle.loY, current);

      Collision firsCollision = getFirstCollision(collisions);
      if (firsCollision != null)
         firsCollision.obstacleIdx = obstacle.obstacleId;

      return firsCollision;
   }

   // Calculate and return the Collision between the ball and the horizontal
   // edge of an obstacle at x, bounded by loY and hiY.  Return null if there
   // is no such collision.
   private Collision getHorizontalEdgeCollision(double loX, double hiX,
         double y, BounceEvent current) {
      // Get equations for event.
      UnivariateFunction[] equations = getAllFunctions(current);

      // Get time when y value will be lined up with edge.
      double yHitTime = quadraticSolution(GRAVITY / 2.0, current.velocityY,
            current.posY - y);

      // Throw out negative times.
      if (yHitTime == Double.MAX_VALUE)
         return null;

      // Calculate x value at time of collision.
      double xValue = equations[0].value(yHitTime);

      if (GenUtil.inBounds(loX, xValue, hiX)) {
         // We have a hit on the horizontal edge.
         Collision collision = new Collision(yHitTime,
               Collision.HitType.HORIZONTAL, -1, -1);

         return collision;
      }

      return null;
   }

   // Calculate and return the Collision between the ball and the vertical
   // edge of an obstacle at x, bounded by loY and hiY.  Return null if there
   // is no such collision.
   private Collision getVerticalEdgeCollision(double loY, double hiY, double x,
         BounceEvent current) {
      // Get equations for event.
      UnivariateFunction[] equations = getAllFunctions(current);

      // Get time when x value will be lined up with edge.
      double xHitTime = (x - current.posX) / current.velocityX;

      // Throw out negative times.
      if (xHitTime < 0)
         return null;

      // Get y value at possible collision time.
      double yValue = equations[2].value(xHitTime);

      if (GenUtil.inBounds(loY, yValue, hiY)) {
         Collision collision = new Collision(xHitTime,
               Collision.HitType.VERTICAL, -1, -1);

         return collision;
      }

      return null;
   }

   // Return a Collision representing the ball's collision with the obstacle
   // corner at (x,y), or null if it doesn't collide.
   private Collision getCornerCollision(double x, double y,
         BounceEvent current) {

      PolynomialFunction cornerEquation = getPolynomial(current, x, y);

      Complex[] solutions = new LaguerreSolver().solveAllComplex
        (cornerEquation.getCoefficients(), 0);

      Double timeOfImpact = findUsefulSolution(current.time, solutions);

      // We hit a corner
      if (timeOfImpact != null) {
         Collision collision = new Collision(timeOfImpact,
               Collision.HitType.CORNER, x, y);

         return collision;
      }

      return null;
   }

   // Return the first collision in |collisions|, ignoring nulls.
   private Collision getFirstCollision(Collision[] collisions) {
      Collision firstCollision = null;

      for (int i = 0; i < collisions.length; i++)
         if (collisions[i] != null)
            if (firstCollision == null
                  || firstCollision.time > collisions[i].time)
               firstCollision = collisions[i];

      return firstCollision;
   }

   // Helper for the LaguerreSolver, returns the lowest time in |solutions|
   // that is greater than currentTime and not a complex number, or return NULL
   // if none is found.
   public Double findUsefulSolution(double currentTime, Complex[] solutions) {
      Double lowestTime = null;

      for (int i = 0; i < solutions.length; i++)
         if (Math.abs(solutions[i].getImaginary()) < EPS)
            if ((solutions[i].getReal() > currentTime
                  && (lowestTime == null
                        || lowestTime.doubleValue() > solutions[i].getReal())))
               lowestTime = solutions[i].getReal();

      return lowestTime;
   }

   /* Return a PolynomialFunction whose real roots give the times at which the
    * distance between a moving circle center and a point (e.g. an obstacle
    * corner) is exactly equal to the radius of the circle.  Such times
    * correspond to circle/point collisions.
    * 
    * Given:
    * r = Radius of the circle
    * Px, Py = Position of circle center at time 0
    * Vx, Vy = Velocity of circle center at time 0
    * 
    * Cx, Cy = location of target point (obstacle corner)
    * Dx, Dy = (Px - Cx), (Py - Cy) the vector from target point circle center
    * to target point at time 0, 
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
    * ((G/2)^2)t^4 + (G Vy)t^3 + (Vy^2 + Vx^2 + G Dy)t^2 + 2(DyVy + DxVx)t +
    * (Dy^2 + Dx^2 - r^2) = 0
    */
   public PolynomialFunction getPolynomial(BounceEvent event, double cX,
         double cY) {
      double[] coef = new double[5];

      double dY = (event.posY - cY);
      double dX = (event.posX - cX);

      // Coefficient of t^0
      coef[0] = GenUtil.sqr(dX) + GenUtil.sqr(dY) - GenUtil.sqr(RADIUS);

      // Coefficient of t^1
      coef[1] = 2 * (dY * event.velocityY + dX * event.velocityX);

      // Coefficient of t^2
      coef[2] = GenUtil.sqr(event.velocityY) + GenUtil.sqr(event.velocityX)
            + GRAVITY * dY;

      // Coefficient of t^3
      coef[3] = (GRAVITY * event.velocityY);

      // Coefficient of t^4
      coef[4] = GenUtil.sqr(GRAVITY / 2.0);

      return new PolynomialFunction(coef);
   }

   // Return an array with [xPosFunction, xVelocityFunction, yPositionFunction,
   // and yVelocityFunction].
   //
   // CAS FIX: This is a clever use of lambdas, and I'm good with it after
   // seeing what you need to do. But, how about returning a class with named
   // fields instead of an array with blind meanings for 0, 1, 2, and 3.
   public static UnivariateFunction[] getAllFunctions(BounceEvent current) {
      UnivariateFunction[] ballFunctions = new UnivariateFunction[4];

      // X position function
      ballFunctions[0] = t -> t * current.velocityX + current.posX;
      // X velocity function
      ballFunctions[1] = t -> current.velocityX;
      // Y position function
      ballFunctions[2] = t -> GRAVITY / 2.0 * GenUtil.sqr(t)
            + current.velocityY * t + current.posY;
      // Y velocity function
      ballFunctions[3] = t -> 2 * GRAVITY / 2.0 * t + current.velocityY;

      return ballFunctions;
   }

   // Return lowest positive real root, or Double.MAX_VALUE if no root
   // qualifies.
   public static double quadraticSolution(double a, double b, double c) {
      double d = b * b - 4 * a * c;
      double root1;
      double root2;

      if (d >= 0) {
         root1 = (-b + Math.sqrt(d)) / (2 * a);
         root2 = (-b - Math.sqrt(d)) / (2 * a);
         if (root1 >= 0 || root2 >= 0)
            if (root2 < 0)
               return root1;
            else if (root1 < 0)
               return root2;
            else
               return Math.min(root1, root2);
      }

      return Double.MAX_VALUE;
   }

   // Tester main, used only to test functions
   public static void main(String[] args) {
      // Test obstacles to use
      LinkedList<Obstacle> obstacles = new LinkedList<Obstacle>();
      Obstacle plat = new Obstacle();

      plat.hiX = 60;
      plat.loX = 50;
      plat.hiY = 10;
      plat.loY = 0;
      plat.obstacleId = 0;

      obstacles.add(plat);

      BounceEvent start = new BounceEvent(STARTING_HEIGHT, 10);
      start.posX = 10;
      start.posY = 10;
      start.velocityX = 5;
      start.velocityY = 50;

      BounceEvaluator eval = new BounceEvaluator();

      Collision testCollision = eval.getobstacleCollision(plat, start);

      if (testCollision != null) {
         System.out.println(testCollision.hType);
         System.out.println(testCollision.xHit);
         System.out.println(testCollision.yHit);
      } else {
         System.out.println("miss");
      }

      double x = 10;
      double y = 15;

      Collision cornerTest = eval.getCornerCollision(x, y, start);

      System.out.println("");
      if (cornerTest != null) {
         System.out.println(cornerTest.hType);
         System.out.println(cornerTest.xHit);
         System.out.println(cornerTest.yHit);
      } else {
         System.out.println("miss Corner");
      }
   }

}
