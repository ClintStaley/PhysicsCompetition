package com.softwareinventions.cmp.evaluator.bounce;

import org.apache.commons.math3.analysis.UnivariateFunction;

/*
 *   BounceEvent, describes a bounce off of a platform, the starting point of 
 *   the ball, or the ball going out of bounds. in the case of a bounce, the
 *   velocityX and velocityY of the ball are the velocities after the bounce, 
 *   the obstacleIdx describes the obstacle that was hit, or -1 if the event is 
 *   a starting event or an out of bounds event. 
 * 
 * */
public class BounceEvent {
   public double time;
   public double velocityX;
   public double velocityY;
   public double posX;
   public double posY;
   public int obstacleIdx;
   
   //creates an starting bounce event
   public BounceEvent(double startingHeight, double speed) {
      obstacleIdx = -1;
      posX = 0;
      posY = startingHeight;
      velocityX = speed;
      velocityY = 0.0;
      time = 0.0;
   }
   
   //creates a copy of the bounce event sent in with updated position and velocity
   public BounceEvent(BounceEvent current, double time) {
      // get all equations
      UnivariateFunction[] ballFunctions = BounceEvaluator.getAllFunctions(current);

      // calculate the out of bounds event
      // CAS FIX: Use a constructor.
      BounceEvent newEvent = new BounceEvent();
      newEvent.obstacleIdx = -1;
      newEvent.posX = ballFunctions[0].value(time);
      newEvent.velocityX = ballFunctions[1].value(time);
      newEvent.posY = ballFunctions[2].value(time);
      newEvent.velocityY = ballFunctions[3].value(time);
      newEvent.time = time + current.time;
   }

   private BounceEvent() {
   }
}
