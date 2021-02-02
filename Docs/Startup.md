To install Physics Competition 

1. Permissions and Prep

  1. Ask the system administrator to give you sudo privilege so that you can complete the installation.
  2. Get access to repo at bitbucket.org/ClintStaley/PhysicsCompetition

1. git clone the repo

1. Install Node and Npm
  1. Install nodejs 9+ and npm 6+.  Note that newer versions of Ubuntu tend to fall back to old versions of node/npm apparently due to procrastination on testing later versions against the new Ubuntus....  Instead, get node and npm from a recent repo, e.g.:<pre>
	sudo apt-get install curl python-software-properties
	curl -sL https://deb.nodesource.com/setup_current.x | sudo -E bash -
	sudo apt-get install nodejs</pre>
1. In RESTServer and in UI run npm install to download all missing modules
1. MySQL setup
  1. Log in to SQL server via mysql as SQL root user.  First use sudo -i to become root user, then mysql -uroot to log in
	2. Create a nonroot user for yourself: CREATE USER 'newUser'@'localhost' IDENTIFIED BY 'userPassword';
	3. Grant your new user general permissions for the CmpDB database with: GRANT ALL PRIVILEGES ON CmpDB.* TO 'newUser'@'localhost'; You may also find this gude useful: https://www.digitalocean.com/community/tutorials/how-to-create-a-new-user-and-grant-permissions-in-mysql
  1. For your new SQL user, create a CmpDB database by running V1.sql from RESTServer/DB.  MySQL command `source V1.sql` will do this if you log in to mysql from the DB directory.
  1. In RESTServer/routes create a connection.json file, using exampleConnection.json as a reference.
1. Test Run
  1. Run `node main.js` in RESTServer directory.  This should start correctly, accessing your new database.
  2. Start the clientside app via `npm start` in UI directory.  This should bring up a browser with the app.  If npm start throws a watch error enospc, then this command may fix the problem:
	echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

1. Configure Evaluation Client (evc)
  1. install the latest JDK if you dont have it.  Sudo apt-get install openjdk-11
  1. install Maven
  1. Install Eclipse.
  1. Install Eclipse plugin Maven2Eclipse. Open eclipse and under the help menu click install new software, and click add site, you can use http://www.eclipse.org/m2e/m2e-downloads.html to find the address for the version you want.  If you are using an older version of eclipse then you must use an older version of M2E I had to use version 1.3.1 of M2e to go with my version 3.8 eclipse.
1. Create an "uber" jar file.  Type mvn package in terminal and a uber jar file will appear in the target directory in Evaluation Client.

1. use sudo apt-get install ssh to install ssh
