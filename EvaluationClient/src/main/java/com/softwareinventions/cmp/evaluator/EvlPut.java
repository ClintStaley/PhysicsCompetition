package com.softwareinventions.cmp.evaluator;

public class EvlPut {
   public Evl eval;
   public int teamId;
   public int sbmId;
   public int cmpId;
   
   public EvlPut(Evl eval, int teamId, int sbmId, int cmpId) {
	  this.eval = eval;
	  this.teamId = teamId;
	  this.sbmId = sbmId;
	  this.cmpId = cmpId;
   }
}
