package com.softwareinventions.cmp.evaluator;

public class EvlPut {
   public int teamId;
   public int sbmId;
   public int cmpId;
   public Evl eval;
   
   public EvlPut(int cmpId, int teamId, int sbmId, Evl eval) {
	  this.cmpId = cmpId;
	  this.teamId = teamId;
	  this.sbmId = sbmId;
	  this.eval = eval;
   }
}
