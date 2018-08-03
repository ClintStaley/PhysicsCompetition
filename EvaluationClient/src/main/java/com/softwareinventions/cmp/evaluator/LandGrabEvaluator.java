package com.softwareinventions.cmp.evaluator;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.dto.ResponseWrapper;
import com.softwareinventions.cmp.dto.Response;

public class LandGrabEvaluator {
	
	public LandGrabEvaluator() {
		
	}
	
	public ResponseWrapper[] evaluateSubmissions(Submit[] submissions) {
		ResponseWrapper[] evaluations = new ResponseWrapper[submissions.length];
		
		for (int i = 0; i < submissions.length; i++)
			evaluations[i] = evaluate(submissions[i]);
		
		return evaluations;
	}
	
	private ResponseWrapper evaluate(Submit submission) {
		ResponseWrapper eval = new ResponseWrapper();
		eval.eval = new Response();
		eval.eval.response = "Land Grab Responce";
		eval.cmpId = submission.cmpId;
		eval.teamId = submission.teamId;
		eval.sbmId = submission.id;
		
		System.out.println("\n");
        System.out.println(submission.id);
        System.out.println(submission.content);
        System.out.println(submission.sbmTime);
        System.out.println(submission.teamId);
		
		return eval;
	}
}
