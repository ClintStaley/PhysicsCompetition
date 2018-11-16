package com.softwareinventions.cmp.evaluator;

public class Evl {
	public String testResult;
	public double score;
	public int canSubmit;

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
