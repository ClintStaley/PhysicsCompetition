package RESTProxy;

import java.util.Date;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import java.net.URISyntaxException;

import com.softwareinventions.cmp.util.EVCException;

@Path("/Ssns")
@Produces("application/json")
public interface SessionResource {

   public static class SsnGet {
      public int personId;
      public String cookie;
      public String uri;
      public String email;
      public Date loginTime;
      public Date lastUse;
   }
   
   static public class SsnPost {
      public String email;
      public String password;
      
      //temporary constructor to appease the client class
      public SsnPost() {}
      
      public SsnPost(String email, String password) {
         this.email = email;
         this.password = password;
      }
   }

   @GET
   Response getSessions() throws EVCException;

   @POST
   @Consumes("application/json")
   Response login(SsnPost post) throws EVCException, URISyntaxException;

   @DELETE
   @Consumes("application/json")
   Response logoutUser(SessionResource.SsnPost post) throws EVCException;
}
