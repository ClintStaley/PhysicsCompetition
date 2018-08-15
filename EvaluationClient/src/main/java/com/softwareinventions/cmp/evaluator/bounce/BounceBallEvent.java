package com.softwareinventions.cmp.evaluator.bounce;

// CAS FIX: Comments where needed.  Is velocity pre or post bounce, for instance?
// Naming consistency:  It was obstacleIdx elsewhere.  Why change it here?    McDonalds..... 
// And why Bounce"Ball"Event?  BounceEvent instead?  We know what's bouncing, and we might want this to accommodate other
// things in the future.  It's not really ball-specific is it?
public class BounceBallEvent {
   public double time;
   public double velocityX;
   public double velocityY;
   public double posX;
   public double posY;
   public int obstacleHit;
}
