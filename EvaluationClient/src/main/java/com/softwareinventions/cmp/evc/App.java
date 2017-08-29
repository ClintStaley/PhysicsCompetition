package com.softwareinventions.cmp.evc;

import javax.ws.rs.core.Cookie;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
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
			Client client = Client.create();
			WebResource webResource;
			webResource = client.resource("http://localhost:3000/Ssns");

			ClientResponse response = post(client,webResource);
			
			System.out.println(response.getCookies().get(0).getValue());
			
			if (response.getStatus() != 200) {
				throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
			}

			String output = get(client,webResource);
			
			System.out.println("Output from Server .... \n");
			System.out.println(output);

		} catch (Exception e) {

			System.out.println(e.getMessage());
			e.printStackTrace();

		}

	}

	public static ClientResponse post(Client client, WebResource webResource) {
		
		String input = "{\"email\":\"adm@11.com\",\"password\":\"password\"}";

		 return webResource.type("application/json").post(ClientResponse.class, input);
	}

	public static String get(Client client,WebResource webResource) {
		
		ClientResponse response = webResource.accept("application/json").get(ClientResponse.class);

		if (response.getStatus() != 200) {
			return "Failed : HTTP error code : " + response.getStatus();
		}
		
		return response.getEntity(String.class);

	}
}