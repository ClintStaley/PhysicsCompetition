package com.softwareinventions.cmp.driver;

import org.apache.log4j.Logger;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.dto.Response;
import com.softwareinventions.cmp.dto.ResponseWrapper;
import com.softwareinventions.cmp.evaluator.LandGrabEvaluator;

public class App {
   final static String url = "http://localhost:3000";
   String[] CompetitionTypes = { "Territory Grab", "Rocket Slalom" };
   static Logger Lgr = Logger.getLogger(App.class);
   
   
   public static void main(String[] args) {
      try {
    	 LandGrabEvaluator LandGrabEval = new LandGrabEvaluator();
         ClientHandler handler = new ClientHandler(url);
         ResponseWrapper[] evaluations;

         // gets the CompetitionTypes from the server
         evaluations = LandGrabEval.evaluateSubmissions(handler.getWaitingSubmissions(1));


         for (int i = 0; i < evaluations.length; i++)
        	 handler.response(evaluations[i]);
         
         evaluations = LandGrabEval.evaluateSubmissions(handler.getWaitingSubmissions(1));
         
         if (evaluations.length == 0)
        	 System.out.println("Finished all Submissions");
         

      } catch (Exception e) {
         System.out.println(e.getMessage());
         e.printStackTrace();
      }

   }
}