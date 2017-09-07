package com.softwareinventions.cmp.driver;

import com.softwareinventions.cmp.dto.Competition;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;



public class App {
	final static String url = "http://localhost:3000";
	String[] CompetitionTypes = { "Territory Grab", "Rocket Solem" };

	public static void main(String[] args) {
		try {
			ClientHandler handler = new ClientHandler(url);

			// gets the CompetitionTypes from the server
			Competition[] output = getAllCompetitionTypes(handler.getClient());

			System.out.println("Output from Server .... \n");
			System.out.println(output[0].getTitle());
			System.out.println(output[0].getId());
			System.out.println(output[0].getPrms());
			System.out.println(output[0].getOwnerId());
			//System.out.println(output[1].getTitle());


		} catch (Exception e) {

			System.out.println(e.getMessage());
			e.printStackTrace();

		}

	}

	public static Competition[] getAllCompetitionTypes(Client client) {
		// does the actual get
		ClientResponse response = client.resource(url +  "/Cmps/1").accept("application/json")
				.get(ClientResponse.class);
		
		if (response.getStatus() != 200) {
			throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
		}
		// returns the data from the response
		return new Competition[]{checkAndRead(response,Competition.class)};
	}
	
	 public static <T> T checkAndRead(ClientResponse response, Class<T> type) {
	      T result = null;

	      if (response.getStatus() == 200)
	         result =  response.getEntity(type);
	      response.close();

	      return result;
	   }
}