package com.softwareinventions.cmp.driver;

import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.conn.BasicHttpClientConnectionManager;

import java.net.URISyntaxException;
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
import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.glassfish.jersey.apache.connector.ApacheConnectorProvider;
import org.glassfish.jersey.client.ClientConfig;
import org.glassfish.jersey.client.ClientProperties;
import org.glassfish.jersey.client.JerseyClientBuilder;
import org.glassfish.jersey.client.proxy.WebResourceFactory;

import com.softwareinventions.cmp.dto.Competition;
import com.softwareinventions.cmp.dto.CompetitionType;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.evaluator.bounce.BounceEvaluator;
import com.softwareinventions.cmp.evaluator.landgrab.LandGrabEvaluator;
import com.softwareinventions.cmp.util.EVCException;

import RESTProxy.SessionResource;

public class EVCThread extends Thread  {
   
   private static final int kNoWorkWait = 6000;
   private static final int kErrorWait = 10000;
   private static final int kMaxAttTries = 3;

   private static Logger lgr = Logger.getLogger(EVCThread.class);
   
   private static ReadWriteLock cacheLock = new ReentrantReadWriteLock();
   
   private boolean proceed = true;
   private Date lastRan;
   
   public final SessionManager ssnMgr;
   private SessionResource ssnsProxy;
   
   final static String url = "http://localhost:3000";
   static Map<Integer, CompetitionType> compTypes;
   
   public EVCThread(Client client, String evcPath, String evcUser,
         String evcPass, String name) {
      if (client == null)
         client = ClientBuilder.newClient();
      
      System.out.println(evcPath);
      WebTarget target = client.target(evcPath);
      
      //WebResource
      ssnsProxy = 
       WebResourceFactory.newResource(SessionResource.class, target);

      ssnMgr = new SessionManager(evcUser, evcPass, name);
  }

   public void shutdown() {
      proceed = false;
   }
   
   //For debugging and watchdog purposes
   public Date getLastRan() {return lastRan;}
   
   //Session Manager
   public class SessionManager {
      // Information necessary to register with IHS.
      private final String evcUser;
      private final String evcPass;
      private final String name;

      // State for current session and registration with IHS.
      private int gdcId;

      public SessionManager(String evcUser, String evcPass, String name) {
         this.evcUser = evcUser;
         this.evcPass = evcPass;
         this.name = name;
      }

      /**
       * Log in to the IHS server.
       */
      public void login() throws URISyntaxException, EVCException {
         check(ssnsProxy.login(new SessionResource.SsnPost(evcUser, evcPass)));
         lgr.info("Logged in as " + evcUser);
      }

      public void logout() throws EVCException {
         check(ssnsProxy.logoutUser(new SessionResource.SsnPost(evcUser, "")));
         lgr.info("Logged out");
      }

      public int getGdcId() {
         return gdcId;
      }
   }
   //Session Manager
   
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
         return ClientBuilder.newClient(clientConfig);
   }



   
   /**
    * Check the status code, then close the response.
    */
   private static Response check(Response response) {
      checkStatus(response);
      response.close();
      return response;
   }
   
   private static Response checkStatus(Response response) {
      String errMsgs = null;
      
      switch (Response.Status.fromStatusCode(response.getStatus())) {
         case OK:
            return response;
         case UNAUTHORIZED:
            response.close();
            throw new NotAuthorizedException("");
         case BAD_REQUEST:
            if (response.getEntity() != null)
               errMsgs = response.readEntity(String.class);
            lgr.error(errMsgs);
            
            response.close();
            throw new BadRequestException();
         default:
            response.close();
            throw new WebApplicationException(response);
      }
   }
   
   @Override
   public void run() {

      while (proceed) {
         try {
            lastRan = new Date();
            
            ssnMgr.login();
            
            test();
         }
         catch (NotAuthorizedException e) {
            lgr.error("Not Authorized Error\n", e);
         }
         catch (Exception e) {
            lgr.error("General error\n", e);
         }
      }
   }
   
   public void test() {
      String arg = "-";
      
      if (arg.equals("-s"))
         LogManager.resetConfiguration();
      
      try {
         //just uses old client handler
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