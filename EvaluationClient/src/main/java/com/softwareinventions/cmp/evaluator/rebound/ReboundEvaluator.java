package com.softwareinventions.cmp.evaluator.rebound;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.evaluator.bounce.BounceEvaluator;

import org.apache.log4j.Logger;

public class ReboundEvaluator implements Evaluator {
   private static class Parameters {
      public double targetGap;
      public int maxBalls;
      public double[] balls;
   }
   
   private static class BallSpec {
      public int id;
      public double pos;
      public double speed;
   }
   
   private static class RbnSpec {
      public double gateTime; // Time in s at which gate opens
      public double jumpLength;
      public BallSpec[] ballStarts;
   }
   
   private static class Rebound {
      int idLeft;         // Id of left ball or -1 (right is one greater)
      double time;        // Time in sec of rebound
      double speedLeft;   // New speed of left ball
      double speedRight;  // New speed of right ball
   }
   
   public static class RbnResults {
      public boolean valid;
      public Double sbmPenalty;
      public Rebound[] rebounds;
      public double launchTime;   // Time at which right ball leaves
   }

   static Logger lgr = Logger.getLogger(ReboundEvaluator.class);
   
   Parameters prms;
   int score;

   @Override
   public void setPrms(String prms) {
      try {
         this.prms = mapper.readValue(prms, Parameters.class);
      } catch (Exception e) {
         e.printStackTrace();
      }
   }

   // Evaluate a single submission
   @Override
   public EvlPut evaluate(Submit sbm) throws Exception {
      RbnSpec spec = mapper.readValue(sbm.content, RbnSpec.class);
      BallSpec[] balls = spec.ballStarts;
      
      /*
      1. Scan balls for next collision time.
      2. Scan for launch
      3. Generate next rebound or launch
      4. 
      
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id,
            new Evl(mapper.writeValueAsString(rspLG),
            Math.round(rspLG.areaCovered * 100.0 / prms.goalArea)));
      
      lgr.info("Graded Land Grab Submission# " + eval.sbmId);
      
      return eval;
      */
      
      return null;
   }
}