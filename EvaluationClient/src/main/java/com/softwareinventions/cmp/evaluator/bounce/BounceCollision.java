package com.softwareinventions.cmp.evaluator.bounce;

// Class representing a collision 
// CAS FIX: I fixed a number of names (caps for types!).
// CAS FIX: Classes used only by one other class should be static nested.
public class BounceCollision {
   public double time;
   
   public enum HitType {
      CORNER, HORIZONTAL, VERTICAL
   };
   public HitType hType;
   
   public double xHit;
   public double yHit;
   
   public int obstacleIdx;
}
