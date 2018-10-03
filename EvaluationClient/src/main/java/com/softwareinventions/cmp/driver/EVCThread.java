package com.softwareinventions.cmp.driver;

import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.conn.BasicHttpClientConnectionManager;

import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.glassfish.jersey.client.ClientConfig;
import org.glassfish.jersey.client.ClientProperties;
import org.glassfish.jersey.client.JerseyClientBuilder;

import com.softwareinventions.cmp.dto.Competition;
import com.softwareinventions.cmp.dto.CompetitionType;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.evaluator.bounce.BounceEvaluator;
import com.softwareinventions.cmp.evaluator.landgrab.LandGrabEvaluator;

public class EVCThread extends Thread  {
   
   private static final int kNoWorkWait = 6000;
   private static final int kErrorWait = 10000;
   private static final int kMaxAttTries = 3;

   private static Logger lgr = Logger.getLogger(EVCThread.class);
   
   private static ReadWriteLock cacheLock = new ReentrantReadWriteLock();
   
   private boolean proceed = true;
   private Date lastRan;
   
   
   final static String url = "http://localhost:3000";
   static Map<Integer, CompetitionType> compTypes;
   
   public EVCThread(Client client, String ihsPath, String ihsUser,
         String ihsPass, String name, String[] ptps) {
     if (client == null)
        client = ClientBuilder.newClient();
     
     WebTarget target = client.target(ihsPath);
  }

   public void shutdown() {
      proceed = false;
   }
   
   //For debugging and watchdog purposes
   public Date getLastRan() {return lastRan;}
   
   public static Client createAllTrustingClient()
         throws GeneralSecurityException {
      TrustStrategy trustStrategy = new TrustStrategy() {
         @Override
         public boolean isTrusted(X509Certificate[] x509Certificates, String s)
          throws CertificateException {
            return true;
         }
      };
        
        
      // Create a trust manager that does not validate certificate chains
      TrustManager[] trustAllCerts = new TrustManager[]{new X509TrustManager(){
          @Override
         public X509Certificate[] getAcceptedIssuers(){return null;}
          @Override
         public void checkClientTrusted(X509Certificate[] certs, String authType){}
          @Override
         public void checkServerTrusted(X509Certificate[] certs, String authType){}
      }};
    
      // Install the all-trusting trust manager
      
      SSLContext sc = SSLContext.getInstance("TLSv1.2");
      sc.init(null, trustAllCerts, new SecureRandom());
      
      SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory
       (sc, new HostnameVerifier() {
          @Override
          public boolean verify(String arg0, SSLSession arg1) {return true;}
       });
    
      // Make a Registry<ConnectionSocketFactory> that uses our CSF for https
      // communications.
      Registry<ConnectionSocketFactory> registry
       = RegistryBuilder.<ConnectionSocketFactory>create()
       .register("https", csf).build();
    
      BasicHttpClientConnectionManager tmp;
      // Set up an HTTP client configuration that uses the JAX-RS 
      // ApacheConnectorProvider, tweaked with a property that makes it get its
      // HttpClient from a BasicHttpClientConnectionManager using our registry.
      // Turn off HTTP compliance checks so we can put entities on DELETE calls.
      ClientConfig clientConfig = new ClientConfig()
       .connectorProvider(new ApacheConnectorProvider())
       .property("jersey.config.apache.client.connectionManager",
        tmp = new BasicHttpClientConnectionManager(registry))
       .property(ClientProperties.SUPPRESS_HTTP_COMPLIANCE_VALIDATION, true);
    
      // Use the damn clientConfig to (gasp, finally) return a trusting Client
         return JerseyClientBuilder.newClient(clientConfig);
   }


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