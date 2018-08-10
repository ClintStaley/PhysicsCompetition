package com.softwareinventions.cmp.evaluator.bounce;

public class BounceCollision {
   public double time;
   
   public enum hitType{
      CORNER, HORIZONTAL, VERTICAL
   };
   public hitType hit;
   
   public double xHit;
   public double yHit;
   
   public int obstacleIdx;
}
