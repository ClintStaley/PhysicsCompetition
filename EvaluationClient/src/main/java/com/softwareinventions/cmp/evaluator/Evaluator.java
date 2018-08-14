package com.softwareinventions.cmp.evaluator;

import com.softwareinventions.cmp.dto.Submit;

public abstract class Evaluator {
   protected Evaluator() {
      
   }
   
   public Evaluator(String prms) {
   }
   
   public abstract EvlPut[] evaluateSubmissions(Submit[] submissions);
}
