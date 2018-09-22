package com.softwareinventions.cmp.driver;

import java.util.concurrent.TimeUnit;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.softwareinventions.cmp.dto.Competition;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.evaluator.bounce.BounceEvaluator;
import com.softwareinventions.cmp.evaluator.landgrab.LandGrabEvaluator;

public class App {
   final static String url = "http://localhost:3000";
   String[] competitionTypes = { "Territory Grab", "Rocket Slalom" };
   static Logger lgr = Logger.getLogger(App.class);

   public static void main(String[] args) {
      String arg = "-";
      
      if (arg.equals("-s"))
         LogManager.resetConfiguration();
      
      try {

         ClientHandler handler = new ClientHandler(url);
         EvlPut[] evaluations;

         while (true) {
            Competition[] cmps = handler.getCmps();
            lgr.info("Getting all compeitions");

            for (int i = 0; i < cmps.length; i++) {
               Evaluator evaluator = cmpEvaluator(cmps[i]);

               // gets the CompetitionTypes from the server
               evaluations = evaluator.evaluateSbms(
                     handler.getWaitingSubmissions(cmps[i].id));

               for (int c = 0; c < evaluations.length; c++) 
                  handler.response(evaluations[c]);
               
            }
            TimeUnit.SECONDS.sleep(1);
         }
      } catch (Exception e) {
         System.out.println(e.getMessage());
         e.printStackTrace();
      }

   }

   private static Evaluator cmpEvaluator(Competition cmp) {
      Evaluator evl = null;
      switch (cmp.ctpId) {
      case 1:
         evl = new LandGrabEvaluator();
         evl.setPrms(cmp.prms);
         break;
      case 2:
         evl = new BounceEvaluator();
         evl.setPrms(cmp.prms);
         return evl;
      default:
         evl = new LandGrabEvaluator();
         evl.setPrms(cmp.prms);
      }
      return evl;
   }

}