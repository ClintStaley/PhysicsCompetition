package com.softwareinventions.cmp.evc;

import java.util.ArrayList;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientRequest;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.filter.ClientFilter;

public class App {
	final static String url = "http://localhost:3000";
	String[] CompetitionTypes = { "Territory Grab", "Rocket Solem" };

	public static void main(String[] args) {
		try {
			// creates a client
			Client client = Client.create();

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

			// Log in to admin account
			login(client);

			// gets the CompetitionTypes from the server
			String output = getAllSubmissions(client);

			System.out.println("Output from Server .... \n");
			System.out.println(output);

		} catch (Exception e) {

			System.out.println(e.getMessage());
			e.printStackTrace();

		}

	}

	public static void login(Client client) {
		// login info in json form
		String input = "{\"email\":\"adm@11.com\",\"password\":\"password\"}";

		ClientResponse response = client.resource(url +  "/Ssns").type("application/json")
				.post(ClientResponse.class, input);

		// will throw exception if login failed
		if (response.getStatus() != 200) {
			throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
		}
	}

	public static String getAllSubmissions(Client client) {
		// does the actual get
		ClientResponse response = client.resource(url +  "/Ctps").accept("application/json")
				.get(ClientResponse.class);

		// returns error message if error
		if (response.getStatus() != 200) {
			return "Failed : HTTP error code : " + response.getStatus();
		}

		// returns the data from the response
		return response.getEntity(String.class);

	}
}