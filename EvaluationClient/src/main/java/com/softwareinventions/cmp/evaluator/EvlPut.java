package com.softwareinventions.cmp.evaluator;

// Recorded information for a PUT to Evl, providing an evaluation
public class EvlPut {
   public int teamId;  // Relevant team, submit, and competition IDs
   public int sbmId;
   public int cmpId;
   public Evl eval;    // Evaluation
   
   public EvlPut(int cmpId, int teamId, int sbmId, Evl eval) {
	  this.cmpId = cmpId;
	  this.teamId = teamId;
	  this.sbmId = sbmId;
	  this.eval = eval;
   }
}
