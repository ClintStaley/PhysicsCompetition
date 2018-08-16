package com.softwareinventions.cmp.evaluator.bounce;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedList;

import org.apache.commons.math3.analysis.UnivariateFunction;
import org.apache.commons.math3.analysis.polynomials.PolynomialFunction;
import org.apache.commons.math3.analysis.solvers.LaguerreSolver;
import org.apache.commons.math3.complex.Complex;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;

public class BounceEvaluator extends Evaluator {
   // constants
   public static final double STARTINGHEIGHT = 100.0;
   public static final double GRAVITY = -9.80665;
   public static final double RADIUS = 1;
   public static final double ZERO = 0.00000001;

   // CAS FIX: Suggested scoring
   // 1. Compute total time, which is time of final collision, plus 10s per ball as a penalty
   // 2. Problem config includes a target time.  Score is 100*targetTime/totalTime.
   
   //class variables
   private BounceParameters cmpDetails;
   private ObjectMapper mapper = new ObjectMapper();

   public BounceEvaluator(String prms) {
      super(prms);

      try {
         cmpDetails = mapper.readValue(prms, BounceParameters.class);
      } catch (Exception e) {
         e.printStackTrace();
      }
   }

   // Constructor only for testing this class.
   private BounceEvaluator() {
      super("");
   }

   // Only function that should be called from outsider.
   @Override
   public EvlPut[] evaluateSbms(Submit[] sbms) {
      EvlPut[] evaluations = new EvlPut[sbms.length];

      try {
         for (int i = 0; i < sbms.length; i++)
            evaluations[i] = evaluate(sbms[i]);
      } catch (Exception e) {
         e.printStackTrace();
         return new EvlPut[0];
      }

      return evaluations;
   }

   // Evaluate a list of differing speeds comprising a single sbm
   private EvlPut evaluate(Submit sbm)
         throws JsonParseException, JsonMappingException, IOException {
      LaunchSpec[] sbmData = mapper.readValue(sbm.content,
            LaunchSpec[].class);

      int numBalls = sbmData.length;
      int obstacleCount = cmpDetails.obstacles.length;

      // assign all obstacles ID numbers based on their index
      for (int idx = 0; idx < obstacleCount; idx++)
         cmpDetails.obstacles[idx].obstacleId = idx;

      // Linked list so that we can delete obstacles as they are hit
      LinkedList<BounceObstacle> obstacles = new LinkedList<BounceObstacle>(
            Arrays.asList(cmpDetails.obstacles));

      // start a BounceEvl to turn into a JSON string
      BounceEvl rspB = new BounceEvl();
      //double array of events every ball has an array of events
      rspB.events = new BounceEvent[numBalls][];

      EvlPut eval = new EvlPut();
      eval.eval = new Evl();
      eval.cmpId = sbm.cmpId;
      eval.teamId = sbm.teamId;
      eval.sbmId = sbm.id;
      
      double totalTime = 0.0;
      
      // loop through all balls 
      for (int i = 0; i < numBalls; i++) {
         //set up starting ball event
         BounceEvent startEvent = new BounceEvent(STARTINGHEIGHT, sbmData[i].speed);
         startEvent.time = 0.0; //all balls start at time zero 

         // gets all other events for a given ball and return an array starting with event given 
         rspB.events[i] = calculateOneBall(obstacles, startEvent);
         totalTime += rspB.events[i][rspB.events[i].length - 1].time;
      }

      rspB.obstaclesHit = obstacleCount - obstacles.size(); 

      // fill in score and array of arrays in response
      if (obstacles.size() == 0)
         eval.eval.score = Math.round((double)cmpDetails.targetTime * 10000.0 /
               (totalTime + 10.0 * ((double)numBalls - 1.0))) / 100.0;
      else
         eval.eval.score = 0;
      
      eval.eval.testResult = mapper.writeValueAsString(rspB);

      System.out.println("Graded Bounce Sbm# " + eval.sbmId);
      
      return eval;
   }

   private BounceEvent[] calculateOneBall(
         LinkedList<BounceObstacle> obstacles, BounceEvent StartingPoint) {
      //linked list used for undefined size
      LinkedList<BounceEvent> ballEvents = new LinkedList<BounceEvent>();
      ballEvents.add(StartingPoint);

      BounceCollision nextCollision = getNextCollision(obstacles, StartingPoint);

      //loops until there are no more collisions calculated
      while (nextCollision != null) {
         ballEvents
               .add(calculateBallColision(ballEvents.getLast(), nextCollision));

         nextCollision = getNextCollision(obstacles, ballEvents.getLast());
      }

      //calculate where the ball will go out of bounds
      ballEvents.add(calculateBorderEvent(StartingPoint));

      //return events as array, so that I can send the correct format as response
      return ballEvents.toArray(new BounceEvent[ballEvents.size()]);
   }

   // returns the new ball event after calculating all values,
   // may return null, if no collisions occur
   private BounceEvent calculateBallColision(BounceEvent current,
         BounceCollision collision) {
      BounceEvent newBallEvent = new BounceEvent(current,
            collision.time);

      //horizontal or vertical hits, mean just flip velocity
      //corner hit means calculate new x velocity and y velocity
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

         // Magnitude of velocity component in collision direction
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

      System.out.println("Obstacle Hit is: " +  newBallEvent.obstacleIdx);
      // CAS FIX: This might be a good time to start working with a logger.  I've had good luck
      // with Apache Commons logger.  Let's put that into our Maven .pom and use it.
      return newBallEvent;
   }

   // Calculate where and when the ball will hit the border, last event
   private BounceEvent calculateBorderEvent(BounceEvent current) {
      
      double xOutOfBounds;
      
      // solve for y, as the ball goes one radius below the lower bound
      double yOutOfBounds = quadraticSolution(
            GRAVITY/2.0, current.velocityY, current.posY + RADIUS);

      // solve for x + radius out of bounds
      if (current.velocityX < 0.0)
         xOutOfBounds = (-RADIUS - current.posX) / current.velocityX;
      else if (current.velocityX > 0.0)
         xOutOfBounds = (100.0 + RADIUS - current.posX) / current.velocityX;
      else
    	 xOutOfBounds = Double.MAX_VALUE;

      double boundsTime = Math.min(xOutOfBounds, yOutOfBounds);

      return new BounceEvent(current, boundsTime);
   }
   
   // return the next collision that occurs, also delete the obstacle
   public BounceCollision getNextCollision(
         LinkedList<BounceObstacle> obstacles, BounceEvent current) {

      // create an array of collisions, so we can check all obstacles
      BounceCollision[] collisions = new BounceCollision[obstacles.size()];

      // check all obstacles for a collision
      for (int i = 0; i < collisions.length; i++) {
         collisions[i] = getobstacleCollision(obstacles.get(i), current);
      }

      BounceCollision firstCollision = getFirstCollision(collisions);
      
      if (firstCollision != null) {
         for (BounceObstacle obstacle : obstacles) {
            if (obstacle.obstacleId == firstCollision.obstacleIdx) {
               obstacles.remove(obstacle);
               break;
            }
         }
      }

      return firstCollision;
   }

   //checks all edges, does not optimize by excluding edges
   // calculates if the ball will hit the obstacle
   private BounceCollision getobstacleCollision(BounceObstacle obstacle,
         BounceEvent current) {

      // 8 for all 4 edges and 4 corners
      BounceCollision[] collisions = new BounceCollision[8];
         
      // get horizontal edges and checking if they hit, or whose first
      collisions[0] = getHorizontalEdgeCollision(obstacle.loX, obstacle.hiX,
            obstacle.hiY + RADIUS, current);
      collisions[1] = getHorizontalEdgeCollision(obstacle.loX, obstacle.hiX,
            obstacle.loY - RADIUS, current);

      //check vertical edge collisions
      collisions[2] = getVerticalEdgeCollision(obstacle.loY, obstacle.hiY,
            obstacle.hiX + RADIUS, current);
      collisions[3] = getVerticalEdgeCollision(obstacle.loY, obstacle.hiY,
            obstacle.loX - RADIUS, current);

      //check all corners for collisions
      collisions[4] = getCornerCollision(obstacle.hiX, obstacle.hiY, current);
      collisions[5] = getCornerCollision(obstacle.hiX, obstacle.loY, current);
      collisions[6] = getCornerCollision(obstacle.loX, obstacle.hiY, current);
      collisions[7] = getCornerCollision(obstacle.loX, obstacle.loY, current);

      BounceCollision firsCollision = getFirstCollision(collisions);
      if (firsCollision != null)
         firsCollision.obstacleIdx = obstacle.obstacleId;
      
      return firsCollision;
   }

   // calculates if the ball will hit horizontal any edge of the obstacle
   private BounceCollision getHorizontalEdgeCollision(double loX,
         double hiX, double y, BounceEvent current) {
      // get equations for event
      UnivariateFunction[] equations = getAllFunctions(current);

      // get time when y value will be lined up with edge
      double yHitTime = quadraticSolution(GRAVITY/2.0,
            current.velocityY, current.posY - y);

      // throw out negative times
      if (yHitTime == Double.MAX_VALUE)
         return null;
      
      //calculate x value at time of collision
      double xValue = equations[0].value(yHitTime);

      if (xValue > loX && xValue < hiX) {
         //we have a hit on the vertical edge
         BounceCollision collision = new BounceCollision();
         collision.time = yHitTime;
         collision.hType = BounceCollision.HitType.VERTICAL;
         
         return collision;
      }

      return null;
   }

   // calculates if the ball will hit any vertical edge of the obstacle at x,
   // bounded by loY and hiY
   private BounceCollision getVerticalEdgeCollision(double loY,
         double hiY, double x, BounceEvent current) {
      // get equations for event
      UnivariateFunction[] equations = getAllFunctions(current);

      //  get time when x value will be lined up with edge
      double xHitTime = (x - current.posX) / current.velocityX;

      // throw out negative times
      if (xHitTime < 0)
         return null;

      //get y value at possible collision time
      double yValue = equations[2].value(xHitTime);

      if (yValue > loY && yValue < hiY) {
         BounceCollision collision = new BounceCollision();
         collision.time = xHitTime;
         collision.hType = BounceCollision.HitType.HORIZONTAL;
         
         return collision;
      }

      return null;
   }

   // calculates if the ball will hit any edge of the obstacle
   private BounceCollision getCornerCollision(double x, double y,
         BounceEvent current) {

      PolynomialFunction cornerEquation = getPolynomial(current, x, y);
      
      LaguerreSolver solver = new LaguerreSolver();

      Complex[] solutions = solver.solveAllComplex(cornerEquation.getCoefficients(), 0);
      
      Double timeOfImpact = simplifyComplex(current.time, solutions);
 
      //we hit a corner
      if (timeOfImpact != null) {
         BounceCollision collision = new BounceCollision();

         collision.time = timeOfImpact;
         collision.hType = BounceCollision.HitType.CORNER;

         collision.xHit = x;
         collision.yHit = y;

         return collision;
      }

      return null;
   }

   // function takes an array of collisions, and returns the first,
   // any can be null
   private BounceCollision getFirstCollision(
         BounceCollision[] collisions) {
      BounceCollision firstCollision = null;

      for (int i = 0; i < collisions.length; i++)
         if (collisions[i] != null)
            if (firstCollision == null
                  || firstCollision.time > collisions[i].time)
               firstCollision = collisions[i];

      return firstCollision;
   }

   // helper for the LaguerreSolver
   public Double simplifyComplex(double currentTime,
         Complex[] solutions) {
      Double lowestTime = null;

      for (int i = 0; i < solutions.length; i++)
         if (Math.abs(solutions[i].getImaginary()) < ZERO)
            if ((solutions[i].getReal() > currentTime && (lowestTime == null
                  || lowestTime.doubleValue() > solutions[i].getReal())))
               lowestTime = solutions[i].getReal();

      return lowestTime;
   }

   /*
    * getCoefficients, will return a PolynomialFunction used for the solver the
    * equation represents the distance to a corner represented by a point.
    * 
    * the equation is:
    * 
    * (Dx + tVx)^2 + (Dy + tVy - 4.9t^2)^2 = r^2
    * 
    * where 
    * Dx = (Px - Cx) 
    * Px = current position of ball along x-axis 
    * Cx = thecorner's x value 
    * Vx = the ball's current velocity along the x-axis
    * Dy = (pY - Cy) 
    * Py = current position of ball along y-axis 
    * Cy = the corners y value 
    * Vy = the ball's current velocity along the y-axis 
    * r = radius of the ball
    * 
    * the equation results to:
    * 
    * (4.9)^2t^4 + (-9.8Vy)t^3 + (Vy^2 + Vx^2 - 9.8Dy)t^2 + 2(DyVy + DxVx)t +
    * (Dy^2 + Dx^2 + r^2) = r
    * 
    * the polynomial function will get an array of doubles based on the values
    * in the equation above
    */
   public PolynomialFunction getPolynomial(BounceEvent event,
         double cX, double cY) {
      double[] coef = new double[5];
      
      double dY = (event.posY - cY);
      double dX = (event.posX - cX);
      
      //coefficient of t^0
      coef[0] = GenUtil.square(dX) + GenUtil.square(dY) - GenUtil.square(RADIUS);
      
      //coefficient of t^1
      coef[1] = 2 * (dY * event.velocityY + dX * event.velocityX);
            
      //coefficient of t^2
      coef[2] = GenUtil.square(event.velocityY) + GenUtil.square(event.velocityX)
            + GRAVITY * dY;
      
      //coefficient of t^3
      coef[3] = (GRAVITY * event.velocityY);
      
      //coefficient of t^4
      coef[4] = Math.pow(GRAVITY/2.0, 2);
      
      return new PolynomialFunction(coef);
   }

   // returns an array with [xPosFunction, xVelocityFunction, yPositionFunction,
   // and yVelocityFunction]
   public static UnivariateFunction[] getAllFunctions(BounceEvent current) {
      UnivariateFunction[] ballFunctions = new UnivariateFunction[4];

      // xposition function
      ballFunctions[0] = t -> t * current.velocityX + current.posX;
      // xvelocity function, could be useful later
      ballFunctions[1] = t -> current.velocityX;
      // ypos function
      ballFunctions[2] = t -> GRAVITY/2.0 * Math.pow(t, 2) + current.velocityY * t
            + current.posY;
      // y velociyty function
      ballFunctions[3] = t -> 2 * GRAVITY/2.0 * t + current.velocityY;

      return ballFunctions;
   }
   
   // Return lowest positive real root, or Double.MAX_VALUE if no root qualifies.
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
               return (root1 > root2) ? root2 : root1;
      }

      // imaginary solution should rarely occur
      return Double.MAX_VALUE;
   }
   
   //tester main, used only to test functions
   public static void main(String[] args) {
      //test obstacles to use
      LinkedList<BounceObstacle> obstacles = new LinkedList<BounceObstacle>();
      BounceObstacle plat = new BounceObstacle();
      
      plat.hiX = 60;
      plat.loX = 50;
      plat.hiY = 10;
      plat.loY = 0;
      plat.obstacleId = 0;
      
      obstacles.add(plat);
      
      BounceEvent start = new BounceEvent(STARTINGHEIGHT, 10);
      start.posX = 10;
      start.posY = 10;
      start.velocityX = 5;
      start.velocityY = 50;
      
      
      BounceEvaluator eval = new BounceEvaluator();
      
      BounceCollision testCollision = eval.getobstacleCollision(plat, start);
      
      if (testCollision != null) {
         System.out.println(testCollision.hType);
         System.out.println(testCollision.xHit);
         System.out.println(testCollision.yHit);
      }
      else {
         System.out.println("miss");
      }
      
      double x = 10;
      double y = 15;
      
      BounceCollision cornerTest = eval.getCornerCollision( x, y, start);
      
      System.out.println("");
      if (cornerTest != null) {
         System.out.println(cornerTest.hType);
         System.out.println(cornerTest.xHit);
         System.out.println(cornerTest.yHit);
      }
      else {
         System.out.println("miss Corner");
      }
   }

   //
   private static class BounceCollision {
      public double time;
      
      public enum HitType {
         CORNER, HORIZONTAL, VERTICAL
      };
      public HitType hType;
      
      public double xHit;
      public double yHit;
      
      public int obstacleIdx;
   }
   
   private static class BounceObstacle {
      public double loX;
      public double hiX;
      public double hiY;
      public double loY;
      public int obstacleId;
   }
   
   private static class BounceParameters {
      public double targetTime;
      public BounceObstacle[] obstacles;
   }
   
}
