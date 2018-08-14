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

public class BounceEvaluator extends Evaluator {
   // constants
   public static final double STARTINGHEIGHT = 100.0;
   public static final double GRAVITY = -9.80665;
   public static final double VELOCITY = GRAVITY/2;
   public static final double RADIUS = 1;
   public static final double ZERO = 0.00000001;

   BounceParameters cmpDetails;
   ObjectMapper mapper = new ObjectMapper();

   public BounceEvaluator(String prms) {
      super(prms);

      try {
         cmpDetails = mapper.readValue(prms, BounceParameters.class);
      } catch (Exception e) {
         e.printStackTrace();
      }
   }

   public BounceEvaluator() {
      super();
      // TODO Auto-generated constructor stub
   }

   @Override
   public EvlPut[] evaluateSubmissions(Submit[] submissions) {
      EvlPut[] evaluations = new EvlPut[submissions.length];

      try {
         for (int i = 0; i < submissions.length; i++)
            evaluations[i] = evaluate(submissions[i]);
      } catch (Exception e) {
         e.printStackTrace();
         return new EvlPut[0];
      }

      return evaluations;
   }

   // evaluate a list of differing speeds
   private EvlPut evaluate(Submit submission)
         throws JsonParseException, JsonMappingException, IOException {
      BounceSubmission[] sbmData = mapper.readValue(submission.content,
            BounceSubmission[].class);

      // keep track of the number of platforms for later
      int numberOfPlatforms = cmpDetails.platforms.length;

      // assign all platforms ID numbers based on their index
      for (int i = 0; i < cmpDetails.platforms.length; i++)
         cmpDetails.platforms[i].platformId = i;

      // Linked list so that I can delete them later on
      LinkedList<BouncePlatform> platforms = new LinkedList<BouncePlatform>(
            Arrays.asList(cmpDetails.platforms));

      // start a BounceEvl to turn into a json string
      BounceEvl rspB = new BounceEvl();
      rspB.events = new BounceBallEvent[sbmData.length][];

      // start an evaluation so that i can return it later
      EvlPut eval = new EvlPut();
      eval.eval = new Evl();
      eval.cmpId = submission.cmpId;
      eval.teamId = submission.teamId;
      eval.sbmId = submission.id;
      eval.eval = new Evl();

      // loop through all speeds
      for (int i = 0; i < sbmData.length; i++) {
         BounceBallEvent startEvent = new BounceBallEvent();
         startEvent.obstacleHit = -1;
         startEvent.posX = 0;
         startEvent.posY = STARTINGHEIGHT;
         startEvent.velocityX = sbmData[i].speed;
         startEvent.velocityY = 0.0;
         startEvent.time = 0.0; // all can start at time zero?

         rspB.events[i] = calculateOneBall(platforms, startEvent);
      }

      rspB.platformsHit = numberOfPlatforms - platforms.size();

      // fill in score and array of arrays in response
      eval.eval.score = Math.round(
            (double) rspB.platformsHit / (double) numberOfPlatforms * 10000.0)
            / 100;
      eval.eval.testResult = mapper.writeValueAsString(rspB);

      System.out.println("Graded Bounce Submission# " + eval.sbmId);
      
      return eval;
   }

   // 100 - 9.8t^2 = 0
   private BounceBallEvent[] calculateOneBall(
         LinkedList<BouncePlatform> Platforms, BounceBallEvent StartingPoint) {

      LinkedList<BounceBallEvent> ballEvents = new LinkedList<BounceBallEvent>();
      ballEvents.add(StartingPoint);

      BounceCollision nextCollision = getNextCollision(Platforms, StartingPoint);

      while (nextCollision != null) {
         ballEvents
               .add(calculateBallColision(ballEvents.getLast(), nextCollision));

         nextCollision = getNextCollision(Platforms,
               StartingPoint);
      }

      ballEvents.add(calculateBorderEvent(StartingPoint));

      return ballEvents.toArray(new BounceBallEvent[ballEvents.size()]);
   }

   // returns the new ball event after calculating all values,
   // may return null, if no collisions occur
   private BounceBallEvent calculateBallColision(BounceBallEvent current,
         BounceCollision collision) {
      BounceBallEvent newBallEvent = createNewEvent(current,
            collision.time);

      switch (collision.hit) {
      case VERTICAL:
         newBallEvent.velocityX = -newBallEvent.velocityX;
         break;
      case HORIZONTAL:
         newBallEvent.velocityY = -newBallEvent.velocityY;
         break;
      case CORNER:
         System.out.println("--Corner Collision--");

         double Vx = (collision.xHit - newBallEvent.posX) / RADIUS;
         double Vy = (collision.yHit - newBallEvent.posY) / RADIUS;

         double magnitude = Vx * newBallEvent.velocityX
               + Vy * newBallEvent.velocityY;

         double newVelocityX = -2 * magnitude * current.velocityX;
         double newVelocityY = -2 * magnitude * current.velocityY;

         newBallEvent.velocityX = newVelocityX;
         newBallEvent.velocityY = newVelocityY;

         break;
      default:
         // should never happen
         System.out.println("Invalid Collision Detected");
         return null;

      }

      return newBallEvent;
   }

   private BounceBallEvent calculateBorderEvent(BounceBallEvent current) {
      
      double xOutOfBounds;
      
      System.out.println("Ball Out Of Bounds");
      // solve for y
      double yOutOfBounds = quadraticSolution(
            VELOCITY, current.velocityY, current.posY);

      // solve for x
      double xOutOfBoundsLeft = (-RADIUS - current.posX) / current.velocityX;
      double xOutOfBoundsRight = (100.0 + RADIUS - current.posX) / current.velocityX;
      
      if (xOutOfBoundsLeft < 0)
         xOutOfBounds = xOutOfBoundsRight;
      else
         xOutOfBounds = xOutOfBoundsLeft;

      // gets the lower time
      double boundsTime = (xOutOfBounds > yOutOfBounds) ? yOutOfBounds
            : xOutOfBounds;

      // calculate the out of bounds event
      BounceBallEvent outOfBounds = createNewEvent(current,
            boundsTime);

      return outOfBounds;
   }
   
   // will return the next collision that occurs, will also delete the platform
   public BounceCollision getNextCollision(
         LinkedList<BouncePlatform> Platforms, BounceBallEvent current) {

      BounceCollision[] collisions = new BounceCollision[Platforms.size()];
      int platformIdx = -1;

      // check all platforms for a collision
      for (int i = 0; i < collisions.length; i++) {
         collisions[i] = getPlatformCollision(Platforms.get(i), current);
         if (collisions[i] != null) {
            platformIdx = i;
            collisions[i].obstacleIdx = Platforms.get(i).platformId;
         }
      }

      if (platformIdx > -1) {
         System.out.println("Collision detected at: "
               + Platforms.get(platformIdx).platformId);
         Platforms.remove(platformIdx);
      }

      return getFirstCollision(collisions);
   }

   // calculates if the ball will hit any edge of the platform
   private BounceCollision getPlatformCollision(BouncePlatform platform,
         BounceBallEvent current) {

      // 8 for all 4 edges and 4 corners
      BounceCollision[] collisions = new BounceCollision[8];

      // get horizontal edges and checking if they hit, or whose first
      collisions[0] = getVerticalEdgeCollision(platform.loX, platform.hiX,
            platform.hiY + RADIUS, current);
      collisions[1] = getVerticalEdgeCollision(platform.loX, platform.hiX,
            platform.loY - RADIUS, current);

      collisions[2] = getHorizontalEdgeCollision(platform.loY, platform.hiY,
            platform.hiX + RADIUS, current);
      collisions[3] = getHorizontalEdgeCollision(platform.loY, platform.hiY,
            platform.loX - RADIUS, current);

      collisions[4] = getCornerCollision(platform.hiX, platform.hiY, current);
      collisions[5] = getCornerCollision(platform.hiX, platform.loY, current);
      collisions[6] = getCornerCollision(platform.loX, platform.hiY, current);
      collisions[7] = getCornerCollision(platform.loX, platform.loY, current);

      // returns the correct collision
      return getFirstCollision(collisions);
   }

   // calculates if the ball will hit horizontal any edge of the platform
   private BounceCollision getVerticalEdgeCollision(double loX,
         double hiX, double y, BounceBallEvent current) {
      // get equations for event
      UnivariateFunction[] equations = getAllFunctions(current);

      // solve for y
      double yHitTime = quadraticSolution(VELOCITY,
            current.velocityY, current.posY - y);

      // throw out negative times
      if (yHitTime < 0)
         return null;

      double xValue = equations[0].value(yHitTime);

      if (xValue > loX && xValue < hiX) {
         BounceCollision collision = new BounceCollision();

         collision.time = yHitTime;
         collision.hit = BounceCollision.hitType.VERTICAL;

         // not necessary for edge hit
         collision.xHit = -1;
         collision.yHit = -1;

         return collision;
      }

      return null;
   }

   // calculates if the ball will hit any vertical edge of the platform
   private BounceCollision getHorizontalEdgeCollision(double loY,
         double hiY, double x, BounceBallEvent current) {
      // get equations for event
      UnivariateFunction[] equations = getAllFunctions(current);

      // solve for x
      double xHitTime = (x - current.posX) / current.velocityX;

      // throw out negative times
      if (xHitTime < 0)
         return null;

      double yValue = equations[2].value(xHitTime);

      if (yValue > loY && yValue < hiY) {
         BounceCollision collision = new BounceCollision();

         collision.time = xHitTime;
         collision.hit = BounceCollision.hitType.HORIZONTAL;

         // not necessary for edge hit
         collision.xHit = -1;
         collision.yHit = -1;

         return collision;
      }

      return null;
   }

   // calculates if the ball will hit any edge of the platform
   private BounceCollision getCornerCollision(double x, double y,
         BounceBallEvent current) {

      PolynomialFunction cornerEquation = getPolynomial(current, x, y);
      
      LaguerreSolver solver = new LaguerreSolver();

      Complex[] solutions = solver.solveAllComplex(cornerEquation.getCoefficients(), 0);
      
      Double timeOfImpact = simplifyComplex(current.time, solutions);
 
      //we hit a corner
      if (timeOfImpact != null) {
         BounceCollision collision = new BounceCollision();

         collision.time = timeOfImpact;
         collision.hit = BounceCollision.hitType.CORNER;

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
   public PolynomialFunction getPolynomial(BounceBallEvent event,
         double cX, double cY) {
      double[] coef = new double[5];
      
      double dY = (event.posY - cY);
      double dX = (event.posX - cX);
      
      //coefficient of t^0
      coef[0] = Math.pow(dX, 2) + Math.pow(dY, 2) - Math.pow(RADIUS, 2);
      
      //coefficient of t^1
      coef[1] = 2 * (dY * event.velocityY + dX * event.velocityX);
            
      //coefficient of t^2
      coef[2] = Math.pow(event.velocityY, 2) + Math.pow(event.velocityX, 2) + GRAVITY * dY;
      
      //coefficient of t^3
      coef[3] = (GRAVITY * event.velocityY);
      
      //coefficient of t^4
      coef[4] = Math.pow(VELOCITY, 2);
      
      return new PolynomialFunction(coef);
   }

   // returns an array wiht [xPosFunction, xVelocityFunction, yPositionFunction,
   // and yVelocityFunction]
   public static UnivariateFunction[] getAllFunctions(BounceBallEvent current) {
      UnivariateFunction[] ballFunctions = new UnivariateFunction[4];

      // xposition function
      ballFunctions[0] = t -> t * current.velocityX + current.posX;
      // xvelocity function, could be useful later
      ballFunctions[1] = t -> current.velocityX;
      // ypos function
      ballFunctions[2] = t -> VELOCITY * Math.pow(t, 2) + current.velocityY * t
            + current.posY;
      // y velociyty function
      ballFunctions[3] = t -> 2 * VELOCITY * t + current.velocityY;

      return ballFunctions;
   }

   public static BounceBallEvent createNewEvent(BounceBallEvent current,
         double time) {
      // get all equations
      UnivariateFunction[] ballFunctions = getAllFunctions(current);

      // calculate the out of bounds event
      BounceBallEvent newEvent = new BounceBallEvent();
      newEvent.obstacleHit = -1;
      newEvent.posX = ballFunctions[0].value(time);
      newEvent.velocityX = ballFunctions[1].value(time);
      newEvent.posY = ballFunctions[2].value(time);
      newEvent.velocityY = ballFunctions[3].value(time);
      newEvent.time = time + current.time;

      return newEvent;
   }
   
   // quadratic solution returns time when zero
   // if no valid solution returns 10000
   public static double quadraticSolution(double a, double b, double c) {
      double d = b * b - 4 * a * c;
      double root1;
      double root2;

      if (d > 0) {
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
      if (d == 0) {
         root1 = (-b + Math.sqrt(d)) / (2 * a);
         if (root1 >= 0)
            return root1;
      }

      // imaginary solution should never occur
      return 100000;
   }
   
   /*
   public class BouncePlatform {
   public double loX;
   public double hiX;
   public double hiY;
   public double loY;
   public int platformId;
   }
    * */
   
   //tester main 
   public static void main(String[] args) {
      //test platforms to use
      LinkedList<BouncePlatform> platforms = new LinkedList<BouncePlatform>();
      BouncePlatform plat = new BouncePlatform();
      
      plat.hiX = 60;
      plat.loX = 50;
      plat.hiY = 10;
      plat.loY = 0;
      plat.platformId = 0;
      
      platforms.add(plat);
      
      BounceBallEvent start = new BounceBallEvent();
      start.posX = 10;
      start.posY = 10;
      start.velocityX = 5;
      start.velocityY = 50;
      
      
      BounceEvaluator eval = new BounceEvaluator();
      
      BounceCollision testCollision = eval.getPlatformCollision(plat, start);
      
      if (testCollision != null) {
         System.out.println(testCollision.hit);
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
         System.out.println(cornerTest.hit);
         System.out.println(cornerTest.xHit);
         System.out.println(cornerTest.yHit);
      }
      else {
         System.out.println("miss Corner");
      }
   }

}
