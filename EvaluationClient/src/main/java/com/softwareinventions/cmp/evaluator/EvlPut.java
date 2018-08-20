package com.softwareinventions.cmp.evaluator;

public class EvlPut {
   public Evl eval;
   public int teamId;
   public int sbmId;
   public int cmpId;
   
   //public EvlPut() {}
   
   public EvlPut(int cmpId, int teamId, int sbmId, Evl eval) {
	  this.cmpId = cmpId;
	  this.teamId = teamId;
	  this.sbmId = sbmId;
	  this.eval = eval;
   }
}
