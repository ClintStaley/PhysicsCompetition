package com.softwareinventions.cmp.evaluator;

import org.codehaus.jackson.map.ObjectMapper;

import com.softwareinventions.cmp.dto.Submit;

public abstract class Evaluator {
   // json to string and string to json converter
   ObjectMapper mapper = new ObjectMapper();
   
   public Evaluator(String prms) {
      
   }
   
   public abstract EvlPut[] evaluateSubmissions(Submit[] submissions);
}
