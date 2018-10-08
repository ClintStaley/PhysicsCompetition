package com.softwareinventions.cmp.evaluator;

import org.codehaus.jackson.map.ObjectMapper;

import com.softwareinventions.cmp.dto.Submit;

public interface Evaluator {
   
   static public ObjectMapper mapper = new ObjectMapper();

   default public EvlPut[] evaluateSbms(Submit[] sbms) {
      EvlPut[] evaluations = new EvlPut[sbms.length];

      try {
         for (int i = 0; i < sbms.length; i++)
            evaluations[i] = evaluate(sbms[i]);
      } catch (Exception e) {
         e.printStackTrace();
         return new EvlPut[0];
      }

      return evaluations;
   }
   
   public void setPrms(String prms);
   
   public EvlPut evaluate(Submit sbm) throws Exception;
}
