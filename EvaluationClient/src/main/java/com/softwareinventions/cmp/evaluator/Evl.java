package com.softwareinventions.cmp.evaluator;

// The results of one Evaluation.
public class Evl {
	public String testResult;  // String description of the result of the test
	public Double score;       // Nullable score 
	public Integer canSubmit;  // Can the team do another submit now?

	public Evl(String testResult, Double score, int canSubmit) {
		this.testResult = testResult;
		this.score = score;
		this.canSubmit = canSubmit;
	}
	
   public Evl(String testResult, Double score) {
      this.testResult = testResult;
      this.score = score;
      this.canSubmit = 1;
   }
}
