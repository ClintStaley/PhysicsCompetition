package com.softwareinventions.cmp.driver;

import com.softwareinventions.cmp.dto.CompetitionType;
import com.softwareinventions.cmp.dto.Person;
import com.softwareinventions.cmp.dto.Submissions;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientRequest;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.client.filter.ClientFilter;
import com.sun.jersey.api.json.JSONConfiguration;

import java.util.ArrayList;

public class ClientHandler {
   private Client client;
   private String url;

   public ClientHandler(String url) {
      this.url = url;

      ClientConfig clientConfig = new DefaultClientConfig();
      clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE);
      // creates a client
      // CAS FIX: Comment when it's not obvious what's going on to someone like
      // you or me, but not otherwise.
      client = Client.create(clientConfig);

      // Sets up filter so that cookies will be saved after running
      client.addFilter(new ClientFilter() {
         private ArrayList<Object> cookies;

         @Override
         public ClientResponse handle(ClientRequest request) throws ClientHandlerException {
            if (cookies != null) {
               request.getHeaders().put("Cookie", cookies);
            }
            ClientResponse response = getNext().handle(request);
            if (response.getCookies() != null) {
               if (cookies == null) {
                  cookies = new ArrayList<Object>();
               }
               // simple addAll just for illustration (should probably
               // check for duplicates and expired cookies)
               cookies.addAll(response.getCookies());
            }
            return response;
         }
      });

      loginAdmin();
   }

   private void loginAdmin() {
      // login info
      Person Prs = new Person();
      Prs.email = "adm@11.com";
      Prs.password = "password";

      ClientResponse response = client.resource(url + "/Ssns").type("application/json").post(ClientResponse.class, Prs);

      // will throw exception if login failed
      if (response.getStatus() != 200) {
         throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());

      }
      response.close();
   }

   public CompetitionType[] getAllCompetitionTypes() {
      // does the actual get
      // CAS FIX: Comments should be imperative tense, and be sentences:
      //
      // Perform the get operation.
      //
      // Or, below "Return response body, parsed as a Competition object"
      ClientResponse response = client.resource(url + "/Ctps").accept("application/json").get(ClientResponse.class);

      if (response.getStatus() != 200) {
         throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
      }
      // returns the data from the response
      // CAS FIX: Horizontal whitespace violation
      return checkAndRead(response, CompetitionType[].class);
   }

   // CAS FIX: comment would be useful here. Imperative tense, full sentence
   public <T> T checkAndRead(ClientResponse response, Class<T> type) {
      T result = null;

      if (response.getStatus() == 200)
         result = response.getEntity(type);
      response.close();

      return result;
   }

   public Submissions[] GetWaitingSubmissions(int CmpId) {
      ClientResponse response = client.resource(url + "/Cmps/" + CmpId + "/WaitingSbms").accept("application/json")
            .get(ClientResponse.class);

      if (response.getStatus() != 200) {
         throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
      }
      // returns the data from the response
      // CAS FIX: Horizontal whitespace violation
      return checkAndRead(response, Submissions[].class);
   }
}
