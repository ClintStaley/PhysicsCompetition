package com.softwareinventions.cmp.evaluator;

// The results of one Evaluation.
public class Evl {
	public String testResult;  // String description of the result of the test
	public double score;       // Score 
	public int canSubmit;      // Can the team do a submission?

	public Evl(String testResult, double score, int canSubmit) {
		this.testResult = testResult;
		this.score = score;
		this.canSubmit = canSubmit;
	}
	
   public Evl(String testResult, double score) {
      this.testResult = testResult;
      this.score = score;
      this.canSubmit = 1;
   }
}
