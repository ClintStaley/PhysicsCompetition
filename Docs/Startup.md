#To install Physics Competition Development#

## Permissions and Prep

  1. You will probably need sudo/admin privilege for the installation.
  2. Get access to repo at bitbucket.org/ClintStaley/PhysicsCompetition, signing the CLA if needed.

## git clone the repo

## Install Node and Npm
  1. Install nodejs 9+ and npm 6+ if needed.  Note that newer versions of Ubuntu tend to fall back to old versions of node/npm apparently due to procrastination on testing later versions against the new Ubuntus....  Instead, get node and npm from a recent repo, e.g.:<pre>
sudo apt-get install curl python-software-properties
curl -sL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt-get install nodejs
</pre>
  1. In RESTServer and in UI run npm install to download all missing modules

## MySQL setup
  1. Log in to SQL server via mysql as SQL root user.  There are various ways to do this, the simplest being to run mysql -uroot -p and supply the root password you configured on install.  
	2. Create a nonroot user for yourself: create user 'newuser'@'localhost' identified with mysql_native_password by 'newpassword';  This will let you point the RESTServer to a database under that user, rather than using root privilege.
	3. Grant your new user general permissions for the CmpDB database with: GRANT ALL PRIVILEGES ON CmpDB.* TO 'newUser'@'localhost'; You may also find this guide useful: https://www.digitalocean.com/community/tutorials/how-to-create-a-new-user-and-grant-permissions-in-mysql
  1. For your new SQL user, create a CmpDB database by running Deploy.sql from RESTServer/DB.  MySQL command `source Deploy.sql` will do this if you log in to mysql from the DB directory.
  1. In RESTServer/Routes create a connection.json file, using exampleConnection.json as a reference.

## Running RESTServer
  1. Run the server from RESTServer via `node main.js -p <port>`, using a port number of your choice.  This should be equal to the api port [line 2 of UI/api.js] for compatibility with the clientside UI, and should match whatever port your Postman test suite addresses (preferably the same) for testing with Postman.
  2. Set the CORS port [line 20 pf RESTServer/main.js]
  equal to the React Client Server port [probably 3000 or 3001 but check your browser]
  3. The `-test` commandline option enables the testing routes, particularly the DB Delete route.  Use this flag only in testing.
  4. The `-h` commandline option turns off https setup if that setup is a nuisance during testing.  Again, use the flag only during testing.
  
## Test Run with Postman
  1. Set up Postman with the collection specified under Tests/PostmanTest1.json.
  1. Set up a Postman environment to point to the right port on your local machine.
  1. Run the RESTServer as specified above.
  1. Run the collection.  You should get all-green.  Fix any bugs that arise.

## Configure Evaluation Client (EVC)
  1. install the latest JDK if you dont have it.  Sudo apt-get install openjdk-11
  1. install Maven
  1. Install Eclipse.
  1. Install Eclipse plugin Maven2Eclipse. Open eclipse and under the help menu click install new software, and click add site, you can use http://www.eclipse.org/m2e/m2e-downloads.html to find the address for the version you want.  If you are using an older version of eclipse then you must use an older version of M2E I had to use version 1.3.1 of M2e to go with my version 3.8 eclipse.
  1. <To be filled in>

## Test Run with UI and EVC
1. Run the RESTServer with port matching the UI, as described above.
2. Start the clientside app via `npm start` in UI directory.  This should bring up a browser with the app.  If npm start throws a watch error enospc, then this command may fix the problem:`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
  
## Create an "uber" jar file.  Type mvn package in terminal and a uber jar file will appear in the target directory in Evaluation Client.

## use sudo apt-get install ssh to installl
