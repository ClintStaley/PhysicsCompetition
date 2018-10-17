package com.softwareinventions.cmp.driver;

import javax.ws.rs.client.Client;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import java.io.File;
import java.io.FileInputStream;
import java.security.GeneralSecurityException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Properties;

public class EVCMain extends Thread {
   private static final long myWait = 10000;
   private static Logger lgr; //ONLY GET THE LOGGER AFTER LOADING THE PROPERTIES
   
   // Wait one hour (in mSecs) before killing a GDC.  This is 6x the timeout
   // for stalled Attempts, and so might permit one bad Attempt to kill 6
   // threads before a restart.  TODO: Use Problem.gdcTimeout instead, pulling
   // that info when checking a stalled thread.
   private static final long gdcTimeout = 3600000;
   private static final DateFormat dateFormat =
    new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z");

   private final String basename;
   private final String ihsPath, ihsUser, ihsPass;
   private final boolean relaxedHTTPS;

   private EVCThread[] evcThreads;

   public EVCMain(Properties properties) {
      int numThreads = Integer.parseInt(properties.getProperty("threads"));

      evcThreads = new EVCThread[numThreads];
      ihsPath = properties.getProperty("EVC.path");
      ihsUser = properties.getProperty("EVC.user");
      ihsPass = properties.getProperty("EVC.pass");
      basename = properties.getProperty("name");
      relaxedHTTPS =
       Boolean.parseBoolean(properties.getProperty("EVC.relaxedHTTPS"));

      for (int i = 0; i < numThreads; i++) {
         evcThreads[i] = createGdc(i);
      }
   }

   private EVCThread createGdc(int ndx) {
      String name = String.format("%s (%s #%d)", basename,
       dateFormat.format(new Date()), ndx);
      File tempDir = new File(System.getProperty("java.io.tmpdir")
       + "/GDC/WorkingDir" + ndx);
      Client client = null;
      
      lgr.info("Working dir is: " + tempDir.getAbsolutePath());
      
      if (relaxedHTTPS) {
         try {
            client = EVCThread.createAllTrustingClient();
         } catch (GeneralSecurityException e) {
            e.printStackTrace();
         }
      }
      return new EVCThread(client, ihsPath, ihsUser, ihsPass, name);
   }
   
   private void stopGdcs() {
      // TODO panic stop?
      for (EVCThread thread : evcThreads) {
         thread.shutdown();
         thread.interrupt();
      }
      for (EVCThread thread : evcThreads) {
         try {thread.join();} catch (InterruptedException e) {}
      }
   }

   private void clearBlockedGdcs(boolean b) {
      
      long now = new Date().getTime();
      
      for (int i = 0; i < evcThreads.length; i++) {
         if (evcThreads[i].getState() == State.TERMINATED) {
            evcThreads[i] = createGdc(i);
            evcThreads[i].start();
         }

         /* This branch handles the severe error of a stalled GDC thread.
          * This is usually due to an infinitely looping grader,
          * and indicates a major issue in the code that should be
          * addressed immediately. Stalled threads are detected
          * based on the difference between the last time the GDCDriver
          * entered the main loop in its run() function and now. */
         else if (evcThreads[i].getLastRan() == null || 
          now - evcThreads[i].getLastRan().getTime() > gdcTimeout) {
            //Fetch the thread's current stack trace, do some light formatting.
            lgr.error(String.format("Killing GDC thread %d w/ stack trace:%s\n",
              i, StringUtils.join(evcThreads[i].getStackTrace(), "\n   ")));
            
            // TODO: find a replacement for this? May not be possible, but
            // this method is overdue to be removed from Thread, and may go in
            // Java 9
            evcThreads[i].stop();
            evcThreads[i] = createGdc(i);
            evcThreads[i].start();
            
            lgr.error("Restarted GDC Driver on thread " + i);
         }
      }
   }

   // For use of GraderClientManager via subthread instead of full application
   @Override
   public void run() {
      // Attempt to cleanly shutdown and unregister the GDCs when stopping
      // the JVM. This seems to work in response to SIGTERM on Linux,
      // though Commons Daemon might offer a better solution.
      Runtime.getRuntime().addShutdownHook(new Thread() {
         @Override
         public void run() {
            stopGdcs();
         }
      });

      for (EVCThread thread : evcThreads) {
         thread.start();
      }

      while (true) {
         try {Thread.sleep(myWait);} catch (InterruptedException err) {}
         clearBlockedGdcs(true);
      }
   }

   public static void main(String[] args) {
      Properties properties = new Properties();


      if (args.length < 1) {
         System.err.println("Usage: GraderClientManager config.properties");
         System.exit(1);
      }
      if (System.getProperty("EVC.log") == null) {
         System.setProperty("EVC.log", "GraderClient.log");
      }
      
      try {
         System.setProperty("log4j.configuration",
         EVCMain.class.getResource("log4j.properties").toString());
         
         //This HAS to happen after loading log4j config for the logger to work
         lgr = Logger.getLogger(EVCMain.class);
         properties.load(new FileInputStream(args[0]));
         
         new EVCMain(properties).start();
         lgr.info("GraderClientManager started");
      }
      catch (Exception e) {
         if (lgr == null)
            System.out.println("Error during GraderClientManager log4j setup");
         else
            //changed from ExceptionUtils.getStackTrace(e)
            lgr.error("Error in starting GraderClientManager: "
             + e.getStackTrace());
         
         e.printStackTrace();
      }
   }
}
