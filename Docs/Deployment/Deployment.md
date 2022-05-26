#Physics Competition Deployment Checklist

1. Pull a repo copy of PhysicsCompetition to the server in question.  (You should be reading this and its companion docs from that copy on the server.)

1. Obtain and configure SSH key and certificate per SSH config instructions from IHS repository, copied here.  (Tomcat instructions from that document are not relevant, but Node instructions are).  Run sshTest.js from the RESTServer main directory to ensure correct key/cert configuration.

2. Configure MySQL.
	1. Install if needed
	2. Log in as root; create cmp user/pass
	   create database CmpDB;
      grant all on CmpDB.* to 'CmpRESTServer'@'localhost' identified by '-pw4CmpDB.';
	3. Run Deploy.sql to inject initial DB contents (or load backup of other site DB)
	4. Helpful commands: `set password for 'cmp'@'localhost' = 'clearpass'`
   
3. Configure RESTServer
	1. Use exampleConnection.json in Routes to create connection.json

3. Create an executable jar file for the EVC.  To do this using Eclipse with maven installed run as a maven build, and under goals input assembly:single.

	1. update the EVC.properties with the correct values
	2. The jar will automatically be named evc-0.0.1-SNAPSHOT-jar-with-dependencies.jar

use: java -cp evc-0.0.1-SNAPSHOT-jar-with-dependencies.jar com.softwareinventions.cmp.driver.EVCMain EVC.properties 
to run the jar	

## Emergency info for resetting root password on MySQL
https://stackoverflow.com/questions/41984956/cant-reset-root-password-with-skip-grant-tables-on-ubuntu-16
