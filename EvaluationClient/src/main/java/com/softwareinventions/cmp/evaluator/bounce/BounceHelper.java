package com.softwareinventions.cmp.evaluator.bounce;

import org.apache.commons.math3.analysis.UnivariateFunction;

public class BounceHelper {
   public static final double GRAVITY = -9.80665;

   // returns an array wiht [xPosFunction, xVelocityFunction, yPositionFunction,
   // and yVelocityFunction]
   public static UnivariateFunction[] getAllFunctions(BounceBallEvent current) {
      UnivariateFunction[] ballFunctions = new UnivariateFunction[4];

      // xposition function
      ballFunctions[0] = t -> t * current.velocityX + current.posX;
      // xvelocity function, could be useful later
      ballFunctions[1] = t -> current.velocityX;
      // ypos function
      ballFunctions[2] = t -> GRAVITY * Math.pow(t, 2) + current.velocityY * t
            + current.posY;
      // y velociyty function
      ballFunctions[3] = t -> 2 * GRAVITY * t + current.velocityY;

      return ballFunctions;
   }

   public static BounceBallEvent createNewEvent(BounceBallEvent current,
         double time) {
      // get all equations
      UnivariateFunction[] ballFunctions = BounceHelper
            .getAllFunctions(current);

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
}
