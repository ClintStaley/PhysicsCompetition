package com.softwareinventions.cmp.evaluator.ricochet;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import org.apache.log4j.Logger;

public class RicochetEvaluator implements Evaluator {
   static class Parameters {
      public double targetTime;
      public int maxBalls;
      public double[] balls;
   }

   Parameters prms;
   int score;
   static Logger lgr = Logger.getLogger(RicochetEvaluator.class);

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
      /* 
      EvlPut eval = new EvlPut(sbm.cmpId, sbm.teamId, sbm.id,
            new Evl(mapper.writeValueAsString(rspLG),
            Math.round(rspLG.areaCovered * 100.0 / prms.goalArea)));
      
      lgr.info("Graded Land Grab Submission# " + eval.sbmId);
      
      return eval;
      */
      
      return null;
   }
}