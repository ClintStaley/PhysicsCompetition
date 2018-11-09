package com.softwareinventions.cmp.driver;

import javax.ws.rs.client.Client;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.security.GeneralSecurityException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Properties;

// EVC main class for configuration and then monitoring of threads
public class EVCMain extends Thread {
   private static final long myWait = 10000;
   private static Logger lgr; // ONLY GET THE LOGGER AFTER LOADING THE PROPERTIES
   
   // Wait one hour (in mSecs) before killing an EVC thread. 
   private static final long evcTimeout = 3600000;
   private static final DateFormat dateFormat =
    new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z");

   private final String basename;
   private final String cmpPath, cmpUser, cmpPass;
   private final boolean relaxedHTTPS;

   private EVCThread[] evcThreads;

   public EVCMain(Properties properties) {
      int numThreads = Integer.parseInt(properties.getProperty("threads"));

      evcThreads = new EVCThread[numThreads];
      cmpPath = properties.getProperty("EVC.path");
      cmpUser = properties.getProperty("EVC.user");
      cmpPass = properties.getProperty("EVC.pass");
      basename = properties.getProperty("name");
      relaxedHTTPS =
       Boolean.parseBoolean(properties.getProperty("EVC.relaxedHTTPS"));

      for (int i = 0; i < numThreads; i++) {
         evcThreads[i] = createEVCThread(i);
      }
   }

   private EVCThread createEVCThread(int ndx) {
      String name = String.format("%s (%s #%d)", basename,
       dateFormat.format(new Date()), ndx);
      File tempDir = new File(System.getProperty("java.io.tmpdir")
       + "/EVC/WorkingDir" + ndx);
      Client client = null;
      
      lgr.info("Working dir is: " + tempDir.getAbsolutePath());
      
      if (relaxedHTTPS) {
         try {
            client = EVCThread.createAllTrustingClient();
         } catch (GeneralSecurityException e) {
            e.printStackTrace();
         }
      }
      return new EVCThread(client, cmpPath, cmpUser, cmpPass, name);
   }
   
   private void stopEVCThreads() {
      // TODO panic stop?
      for (EVCThread thread : evcThreads) {
         thread.shutdown();
         thread.interrupt();
      }
      for (EVCThread thread : evcThreads) {
         try {thread.join();} catch (InterruptedException e) {}
      }
   }

   private void clearBlockedEVCThreads(boolean b) {
      
      long now = new Date().getTime();
      
      for (int i = 0; i < evcThreads.length; i++) {
         if (evcThreads[i].getState() == State.TERMINATED) {
            evcThreads[i] = createEVCThread(i);
            evcThreads[i].start();
         }

         /* This branch handles the severe error of a stalled EVC thread.
          * This is usually due to an infinitely looping evaluation,
          * and indicates a major issue in the code that should be
          * addressed immediately. Stalled threads are detected
          * based on the difference between the last time the EVC driver
          * entered the main loop in its run() function and now. */
         else if (evcThreads[i].getLastRan() == null || 
          now - evcThreads[i].getLastRan().getTime() > evcTimeout) {
            //Fetch the thread's current stack trace, do some light formatting.
            lgr.error(String.format("Killing EVC thread %d w/ stack trace:%s\n",
              i, StringUtils.join(evcThreads[i].getStackTrace(), "\n   ")));
            
            // TODO: find a replacement for this? May not be possible, but
            // this method is overdue to be removed from Thread, and may go in
            // Java 9
            evcThreads[i].stop();
            evcThreads[i] = createEVCThread(i);
            evcThreads[i].start();
            
            lgr.error("Restarted EVC thread " + i);
         }
      }
   }

   @Override
   public void run() {
      // Attempt to cleanly shutdown and unregister the EVCs when stopping
      // the JVM. This seems to work in response to SIGTERM on Linux,
      // though Commons Daemon might offer a better solution.
      Runtime.getRuntime().addShutdownHook(new Thread() {
         @Override
         public void run() {
            stopEVCThreads();
         }
      });

      for (EVCThread thread : evcThreads) {
         thread.start();
      }

      while (true) {
         try {Thread.sleep(myWait);} catch (InterruptedException err) {}
         clearBlockedEVCThreads(true);
      }
   }

   public static void main(String[] args) {
      Properties properties = new Properties();

      if (args.length < 1) {
         System.err.println("Usage: EvaluationClient <config.properties>");
         System.exit(1);
      }
      if (System.getProperty("EVC.log") == null) {
         System.setProperty("EVC.log", "EVC.log");
      }
      
      try {
         // Initialize logger config and **then** get our first logger
         System.setProperty("log4j.configuration",
          EVCMain.class.getResource("log4j.properties").toString());
         lgr = Logger.getLogger(EVCMain.class);
         
         // Load EVC properties and start the EVC main to set up threads
         properties.load(new FileInputStream(args[0]));
         new EVCMain(properties).start();
         lgr.info("EVC started");
      }
      catch (FileNotFoundException e) {
         System.out.printf("EVC startup error: %s\n", e.getMessage());
      }
      catch (Exception e) {
         if (lgr == null)
            System.out.println("EVC startup error during log4j setup");
         else
            lgr.error("General EVC startup error: " + e.getStackTrace());
      }
   }
}
