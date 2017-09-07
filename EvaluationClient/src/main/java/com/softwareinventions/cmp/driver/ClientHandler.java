package com.softwareinventions.cmp.driver;

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
	
	public ClientHandler(String url)
	{
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
		
		login();
	}
	
	public void login() {
		// login info in json form
		String input = "{\"email\":\"adm@11.com\",\"password\":\"password\"}";

		ClientResponse response = client.resource(url +  "/Ssns").type("application/json")
				.post(ClientResponse.class, input);

		// will throw exception if login failed
		if (response.getStatus() != 200) {
			throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
		}
	}
	
	public Client getClient(){
		return client;
	}
}
