package com.softwareinventions.cmp.evc;

import java.util.ArrayList;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientRequest;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.client.filter.ClientFilter;
import com.sun.jersey.api.json.JSONConfiguration;

/**
 * Hello world!
 *
 */
public class App {

	public static void main(String[] args) {
		try {

			ClientConfig clientConfig = new DefaultClientConfig();
			clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE);
			Client client = Client.create(clientConfig);
			
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
			            // simple addAll just for illustration (should probably check for duplicates and expired cookies)
			            cookies.addAll(response.getCookies());
			        }
			        return response;
			    }
			});

			ClientResponse response = post(client);
			
			
			if (response.getStatus() != 200) {
				throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
			}

			String output = get(client);
			
			System.out.println("Output from Server .... \n");
			System.out.println(output);

		} catch (Exception e) {

			System.out.println(e.getMessage());
			e.printStackTrace();

		}

	}

	public static ClientResponse post(Client client) {
		
		String input = "{\"email\":\"adm@11.com\",\"password\":\"password\"}";

		 return client.resource("http://localhost:3000/Ssns").type("application/json").post(ClientResponse.class, input);
	}

	public static String get(Client client) {
		
		ClientResponse response = client.resource("http://localhost:3000/Ssns").accept("application/json").get(ClientResponse.class);

		if (response.getStatus() != 200) {
			return "Failed : HTTP error code : " + response.getStatus();
		}
		
		return response.getEntity(String.class);

	}
}