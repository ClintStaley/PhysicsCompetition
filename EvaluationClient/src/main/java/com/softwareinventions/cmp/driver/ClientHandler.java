package com.softwareinventions.cmp.driver;

import com.softwareinventions.cmp.dto.CompetitionType;
import com.softwareinventions.cmp.dto.Person;
import com.softwareinventions.cmp.dto.Response;
import com.softwareinventions.cmp.dto.Submissions;
import com.softwareinventions.cmp.util.EVCException;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientRequest;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.client.filter.ClientFilter;
import com.sun.jersey.api.json.JSONConfiguration;

import java.util.ArrayList;

import org.apache.log4j.Logger;

public class ClientHandler {
   private Client client;
   private String url;
   static Logger Lgr = Logger.getLogger(ClientHandler.class);

   public ClientHandler(String url) {
      this.url = url;

      ClientConfig clientConfig = new DefaultClientConfig();
      clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING,
            Boolean.TRUE);

      client = Client.create(clientConfig);

      // Sets up filter so that cookies will be saved after running
      client.addFilter(new ClientFilter() {
         private ArrayList<Object> cookies;

         @Override
         public ClientResponse handle(ClientRequest request)
               throws ClientHandlerException {
            if (cookies != null) {
               request.getHeaders().put("Cookie", cookies);
            }
            ClientResponse response = getNext().handle(request);
            if (response.getCookies() != null) {
               if (cookies == null) {
                  cookies = new ArrayList<Object>();
               }
               // no need to clean cookies out, because cookies are
               // automatically disposed of after 2 hours
               cookies.addAll(response.getCookies());
            }
            return response;
         }
      });
      
      loginAdmin();
   }

   private void loginAdmin() {
      // Admin login info, Temp
      Person Prs = new Person();
      Prs.email = "adm@11.com";
      Prs.password = "password";

      Lgr.info("Logging in " + Prs.email);
      ClientResponse response = client.resource(url + "/Ssns")
            .type("application/json").post(ClientResponse.class, Prs);

      // will throw exception if login failed
      if (response.getStatus() != 200) {
         throw new RuntimeException(
               "Failed : HTTP error code : " + response.getStatus());

      }
      response.close();
   }

   public CompetitionType[] getAllCompetitionTypes() throws EVCException {
      // Perform the get operation, and returns a ClientResponse object
      ClientResponse response = client.resource(url + "/Ctps")
            .accept("application/json").get(ClientResponse.class);

      // returns the data from the response
      return checkAndRead(response, CompetitionType[].class);
   }

   public void checkAndClose(ClientResponse response) throws EVCException {
      checkAndRead(response, null);
   }

   // checkAndRead, will take in a Client response object and a type, and return
   // either the type passed in with data filled out from the ClientResponse, or
   // it will throw an EVCException, either way it will close ClientResponse
   public <T> T checkAndRead(ClientResponse response, Class<T> type)
         throws EVCException {
      T result = null;

      try {
         if (response.getStatus() == 200)
            result = type == null ? null : response.getEntity(type);
         else {
            Lgr.info(response.getEntity(String.class));

            throw new EVCException(String.format("Error code %d on resource %s",
                  response.getStatus(), response.getLocation()));
         }
      } finally {
         response.close();
      }

      return result;
   }

   public Submissions[] GetWaitingSubmissions(int CmpId) throws EVCException {
      ClientResponse response = client
            .resource(url + "/Cmps/" + CmpId + "/WaitingSbms")
            .accept("application/json").get(ClientResponse.class);

      if (response.getStatus() != 200) {
         throw new RuntimeException(
               "Failed : HTTP error code : " + response.getStatus());
      }
      // returns the data from the response
      return checkAndRead(response, Submissions[].class);
   }

   public void Response(int CmpId, Submissions submission, String res)
         throws EVCException {

      Response tempRes = new Response();
      tempRes.response = res;

      ClientResponse response = client
            .resource(String.format("%s/Cmps/%d/Teams/%d/Sbms/%d", url, CmpId,
                  submission.teamId, submission.id))
            .type("application/json").put(ClientResponse.class, tempRes);

      checkAndClose(response);
   }
}
