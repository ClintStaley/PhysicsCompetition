package com.softwareinventions.cmp.driver;

import org.apache.log4j.Logger;

import com.softwareinventions.cmp.dto.Submit;

public class App {
   final static String url = "http://localhost:3000";
   String[] CompetitionTypes = { "Territory Grab", "Rocket Slalom" };
   static Logger Lgr = Logger.getLogger(App.class);
   
   
   public static void main(String[] args) {
      try {
         ClientHandler handler = new ClientHandler(url);

         // gets the CompetitionTypes from the server
         Submit[] output = handler.GetWaitingSubmissions(1);

         System.out.println("\n");
         System.out.println(output[0].id);
         System.out.println(output[0].content);
         System.out.println(output[0].subTime);
         System.out.println(output[0].teamId);
         
         handler.Response(1,output[0],"Responce Eclipse");
         

         
         output = handler.GetWaitingSubmissions(1);

         System.out.println("\n");
         System.out.println(output[0].id);
         System.out.println(output[0].content);
         System.out.println(output[0].subTime);
         System.out.println(output[0].teamId);

      } catch (Exception e) {
         System.out.println(e.getMessage());
         e.printStackTrace();
      }

   }
}