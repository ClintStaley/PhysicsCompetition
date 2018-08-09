package com.softwareinventions.cmp.driver;

import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;

import com.softwareinventions.cmp.dto.Competition;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.evaluator.bounce.BounceEvaluator;
import com.softwareinventions.cmp.evaluator.landgrab.LandGrabEvaluator;

public class App {
   final static String url = "http://localhost:3000";
   String[] CompetitionTypes = { "Territory Grab", "Rocket Slalom" };
   static Logger Lgr = Logger.getLogger(App.class);

   public static void main(String[] args) {
      try {

         ClientHandler handler = new ClientHandler(url);
         EvlPut[] evaluations;

         while (true) {
            Competition[] cmps = handler.getCmps();

            for (int i = 0; i < cmps.length; i++) {
               Evaluator LandGrabEval = cmpEvaluator(cmps[i]);

               // gets the CompetitionTypes from the server
               evaluations = LandGrabEval.evaluateSubmissions(
                     handler.getWaitingSubmissions(cmps[i].id));

               for (int c = 0; c < evaluations.length; c++)
                  handler.response(evaluations[c]);
               
               TimeUnit.SECONDS.sleep(1);
            }
         }
      } catch (Exception e) {
         System.out.println(e.getMessage());
         e.printStackTrace();
      }

   }

   private static Evaluator cmpEvaluator(Competition cmp) {
      switch (cmp.ctpId) {
      case 1:
         return new LandGrabEvaluator(cmp.prms);
      case 2:
         return new BounceEvaluator(cmp.prms);
      default:
         return new LandGrabEvaluator(cmp.prms);
      }
   }

}