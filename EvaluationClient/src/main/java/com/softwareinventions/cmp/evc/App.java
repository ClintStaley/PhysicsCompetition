package com.softwareinventions.cmp.evc;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;

/**
 * Hello world!
 *
 */
public class App {

	  public static void main(String[] args) {
		try {

			Client client = Client.create();

			WebResource webResource = client
			   .resource("http://localhost:3000/Ssns");

			String input = "{\"email\":\"adm@11.com\",\"password\":\"password\"}";

			ClientResponse response = webResource.type("application/json")
			   .post(ClientResponse.class, input);
			
			if (response.getStatus() != 200) {
			   throw new RuntimeException("Failed : HTTP error code : "
				+ response.getStatus());
			}

			String output = response.getEntity(String.class);

			System.out.println("Output from Server .... \n");
			System.out.println(output);

		  } catch (Exception e) {

			  System.out.println(e.getMessage());
			  e.printStackTrace();

		  }

		}
	}