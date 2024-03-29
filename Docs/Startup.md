# Installing for Physics Competition Development
This document describes developer setup for Physics Competition development,
including Git repo setup and individual setup for the four components of the
site:

* Mysql and the site database
* The site REST server
* The Evaluation Client (EVC) program that fetches and evaluates student submissions.
* The web UI that students see on their browser.

## Basic Preparation

### Prereq Knowledge
You should already know the following.  Consult the team for references if you
need them.

1. Basic commandline Git, including cloning, push/pull, commit, etc.
1. JS coding if you're working on UI or REST Server
1. Java if you're working on the EVC, including use of Eclipse
1. Basics of HTTP and REST.
1. Basic SQL if you're working on the REST server.

### Getting the Repo
1. You will probably need sudo/admin privilege for the installation.
1. Sign the CLA to gain read/write share status on the Git repo
at github.com/ClintStaley/PhysicsCompetition.
1. Pick a local directory in which you want to do your dev work and use 
the git clone command to pull the repo into that directory.

### Install Node and Npm
1. Install nodejs 12+ and npm 6+.  Note that newer versions of Ubuntu tend
to fall back to old versions of node/npm apparently due to procrastination on 
testing later versions against the new Ubuntus.  Instead, get node and 
npm from a recent repo, e.g.:<pre>
sudo apt-get install curl python-software-properties
curl -sL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt-get install nodejs
</pre>
1. In source directories RESTServer and in UI run npm install to download 
all missing modules.  Note these are two separate node_modules for two JS apps.

## MySQL setup
1. Install MySQL community edition commandline client and server 
from www.mysql.com.  
2. Log in to SQL server via mysql as SQL root user.  There are various ways to 
do this, the simplest being to run `mysql -uroot -p` and supply the root 
password you configured on install.  
3. Create a nonroot user for yourself: 
`create user 'newuser'@'localhost' identified with mysql_native_password by `
`'newpassword';` 
This will let you point the RESTServer to a database under that user, rather 
than using root privilege.
4. Grant your new user general permissions for the CmpDB database you will
shortly create with: 
`GRANT ALL PRIVILEGES ON CmpDB.* TO 'newUser'@'localhost';` 
You may also find this guide useful: 
https://www.digitalocean.com/community/tutorials/how-to-create-a-new-user-and-grant-permissions-in-mysql
5. For Windows users it may be necessary to change more settings to include
mySQL in the System Variables path in order to run the mysql command from
the Command Prompt terminal. For instructions see https://phoenixnap.com/kb/mysql-command-not-found-error#:~:text=MySQL%20is%20an%20open%2Dsource,to%20find%20the%20executable%20file. 
The other option to sign in as the new
user for Windows is to make a copy of the MySQL Command Line Client and edit
its properties. Under the Shortcut section, edit the target line and replace 
"-uroot" with "-ucmp", assuming that your nonroot username is cmp.
6. For your new SQL user, create a CmpDB database by running the 
RESTServer/DB/All.sql file from the MySQL command client.  The MySQL command
`source All.sql;` will do this if you start the mysql client in the DB 
directory.  Or in Windows, where you can't control the home directory of 
your MySQL client, you may need 
`source <full path to All.sql starting from c:>;`


## RESTServer setup
1. In RESTServer/Routes create a connection.json file, using 
exampleConnection.json as a reference.  This connection.json file specifies,
for the REST server, how to log in to the database, and what database to use.
Fill in the relevant fields with the CmpDB database, non-root user id, and
password.
1. Run the server from RESTServer via `node main.js -h -test -p <port>`, using 
a port number of your choice.  This should be equal to the api port [line 2 of
UI/src/api.js] for compatibility with the clientside UI, and should match
whatever port your Postman test suite addresses (preferably the same) for
testing with Postman (see below)
2. The `-test` commandline option enables the testing REST routes, particularly
the DB Delete route.  Use this flag only in testing with Postman.
3. The `-h` commandline option turns off https setup if that setup is a
nuisance during testing.  Again, use the flag only during testing.

### Test Run with Postman
1. Install Postman on your machine (www.postman.com) and read up a bit on its
purpose and function.
1. Import into Postman the collection in RESTServer/Tests/PostmanTest1.json.
1. Set up a Postman environment to point to the port on your local machine on 
which you are running the RESTServer (the -port option above)
1. Run the RESTServer as specified above.
1. Run the collection.  You should get all-green.  Fix any bugs that arise.

## Evaluation Client (EVC) Setup
1. Install the latest Open JDK if you dont have it.  Sudo apt-get install 
openjdk-12 on Ubuntu. 
1. Install Maven.
1. Install either Eclipse or VSCode. 

### Eclipse
1. Install Eclipse plugin Maven2Eclipse. Open eclipse and under the help 
menu click install new software, and click add site, you can use 
http://www.eclipse.org/m2e/m2e-downloads.html to find the address for the 
version you want.  If you are using an older version of eclipse then you must 
use an older version of M2E I had to use version 1.3.1 of M2e to go with my 
version 3.8 eclipse.
1. Go to "File > Open Projects from File System..." and open EvaluationClient
1. Right click on pom.xml, and go to "Maven > Update Project...", which will
build the correct dependencies, which should appear under Maven Dependencies
in your project. NOTE: This may remove any Additional Libraries 
as well.
1. Create a run configuration for EVCMain.java. This is done by 
navigating to "EvaluationClient/src/main/java/com.softwareinventions.cmp.driver"
in the Package Explorer pane, right clicking on EVCMain.java, and choosing 
"Run As > Run Configurations...". Choose EVCMain, and under the Arguments 
tab, add EVC.properties as a Program argument. 

### VSCode 
1. Install Extension Pack for Java in VSCode. This includes Maven for Java, 
which will add an extra sidebar pane called "MAVEN", in which all of the maven 
generated Dependencies can be manged. 
1. Create a launch configuration for EVCMain.java. This is done by navigating 
to EvaluationClient/src/main/java/com/softwareinventions/cmp/drive, and opening 
EVCMain.java. Then, in the Activity Bar, select Run and Debug, and select 
"create a launch.json file". This will genereate a .vscode folder, with 
launch.json inside. In launch.json, find the configuration named "Launch 
EVCMain", and add an argument `"args": "EvaluationClient/EVC.properties"`.

### Troubleshooting EVC
1. If running EVCMain results in an error mentioning log4j you may need to 
regenerate the Maven Dependencies. In a Windows Command Line, running in the 
EVC source directory, enter `mvn eclipse:clean` to erase all maven dependencies 
(If the mvn command is not found you must add the maven/bin directory to the 
executable path in Windows Settings).  After cleaning, right click the pom.xml 
select maven -> Update Project to build the correct dependencies. NOTE: This 
may remove any Additional Libraries as well.
2. If there is no maven project to update, right click the main project file 
in Eclipse and select Configure -> Convert -> Maven Project. Then complete 
the update mentioned above and the Maven Dependencies should populate in the 
workspace.
3. For any other errors, ensure that the build path inside of Eclipse for the 
project is correct. Right click the project select Build Path -> 
Configure Build Path. Under the Source tab in the Java Build Path section 
there should be 2 folders, EvaluationClient/src/main/java and 
EvaluationClient/src/test/java. If either folder is not present select 
Add Folder and select the appropriate folders. Eclipse may need to restart 
after this step.

## Running the UI
   1. Run the RESTServer with port matching the UI, as described above.
   2. Start the clientside app via `npm start` in UI directory.  This should bring 
   up a browser with the app. 
   3. Run EVC by running the com.softwareinventions.cmp.driver.EVCMain class as
   an app. This class expects a commandline argument providing the name of an 
   EVC.properties file, which tells EVC where the RESTServer is, and provides 
   credentials to log in. This file must reside at the root of the 
   EvaluationClient directory, which is the default working dir when you run a 
   main. The file EVC.example.properties is a good basis from which to create 
   your EVC.properties file. 
      * In Eclipse, running this file is done by right clicking on EVCMain.java, and choosing 
      "Run As -> Java Application". 
      * In VSCode, this is done by right clicking on EVCMain.java, and choosing 
      "Run Java". 



### Troubleshooting Notes
 1. If npm start throws a watch error enospc, then this command may fix the 
 problem:`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`



