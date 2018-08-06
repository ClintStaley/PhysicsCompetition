package com.softwareinventions.cmp.evaluator;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.dto.ResponseWrapper;

import java.io.IOException;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;

import com.softwareinventions.cmp.dto.LandGrabParamaters;
import com.softwareinventions.cmp.dto.LandGrabResponse;
import com.softwareinventions.cmp.dto.LandGrabSubmissionCircle;
import com.softwareinventions.cmp.dto.Response;

public class LandGrabEvaluator implements Evaluator{
	
	LandGrabParamaters cmpDetails;
	int score;
	//json to string and string to json converter
	ObjectMapper mapper = new ObjectMapper();
	
	public LandGrabEvaluator(String prms) {
		try {
			cmpDetails = mapper.readValue(prms, LandGrabParamaters.class);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		score = 0;
	}
	
	public ResponseWrapper[] evaluateSubmissions(Submit[] submissions) {
		ResponseWrapper[] evaluations = new ResponseWrapper[submissions.length];
		
		try {
			for (int i = 0; i < submissions.length; i++)
				evaluations[i] = evaluate(submissions[i]);
		}
		catch (Exception e) {
			e.printStackTrace();
			return new ResponseWrapper[0];
		}
		
		return evaluations;
	}
	
	private ResponseWrapper evaluate(Submit submission) throws JsonParseException, JsonMappingException, IOException {
		LandGrabResponse rspLG = new LandGrabResponse();

		
		ResponseWrapper eval = new ResponseWrapper();
		eval.eval = new Response();
		
		eval.eval.score = score++;
		eval.cmpId = submission.cmpId;
		eval.teamId = submission.teamId;
		eval.sbmId = submission.id;
        

		LandGrabSubmissionCircle[] data = mapper.readValue(submission.content,  LandGrabSubmissionCircle[].class);
		
		rspLG.aeraCovered = 0;
		rspLG.circleStatus = new boolean[data.length];
		
		for (int i = 0; i < data.length; i++) {
			
		}
		
		eval.eval.response = mapper.writeValueAsString(rspLG);
		
		return eval;


	}
	//distance function
	//Math.hypot(x1-x2, y1-y2)
	private boolean circleIsValid(LandGrabSubmissionCircle circle) {
		
		for (int i = 0; i < cmpDetails.obstacles.length; i++) {
			if (cmpDetails.obstacles[i].hiX > circle.centerX && circle.centerX > cmpDetails.obstacles[i].loX)
				if (!(circle.centerY > (cmpDetails.obstacles[i].hiY + circle.radius)
						|| circle.centerY < (cmpDetails.obstacles[i].loY + circle.radius)))
					return false;
			
			if (cmpDetails.obstacles[i].hiY > circle.centerY && circle.centerY > cmpDetails.obstacles[i].loY)
				if (!(circle.centerX > (cmpDetails.obstacles[i].hiX + circle.radius)
						|| circle.centerX < (cmpDetails.obstacles[i].loX + circle.radius)))
					return false;
				
				
		}
		
		return true;
	}
	
	private double area(double radius) {
		return Math.pow(radius, 2) * Math.PI;
	}
}
