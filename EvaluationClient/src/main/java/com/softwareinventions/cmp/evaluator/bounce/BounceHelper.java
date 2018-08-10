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
      newEvent.time = time;

      return newEvent;
   }
}
