package com.softwareinventions.cmp.driver;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.softwareinventions.cmp.dto.Competition;
import com.softwareinventions.cmp.dto.CompetitionType;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.evaluator.bounce.BounceEvaluator;
import com.softwareinventions.cmp.evaluator.landgrab.LandGrabEvaluator;

public class EVCThread {
   final static String url = "http://localhost:3000";
   static Map<Integer, CompetitionType> compTypes;
   static Logger lgr = Logger.getLogger(EVCThread.class);

   public static void main(String[] args) {
      String arg = "-";
      
      if (arg.equals("-s"))
         LogManager.resetConfiguration();
      
      try {
         ClientHandler handler = new ClientHandler(url);
         EvlPut[] evaluations;

         CompetitionType[] competitionTypes = handler.getAllCompetitionTypes();
         compTypes = 
               new HashMap<Integer, CompetitionType>(competitionTypes.length);
         
         for (int i = 0; i < competitionTypes.length; i++)
            compTypes.put(competitionTypes[i].id, competitionTypes[i]);
         
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

   private static Evaluator cmpEvaluator(Competition cmp) throws Exception {
      Evaluator evl = null;
      String ctpName = compTypes.get(cmp.ctpId).codeName;
      
      if (ctpName.equals("LandGrab"))
         evl = new LandGrabEvaluator();
      else if (ctpName.equals("Bounce"))
         evl = new BounceEvaluator();
      else
         throw new
               Exception("Competition Type: " + ctpName + " does not exist");

      evl.setPrms(cmp.prms);
      return evl;
   }

}