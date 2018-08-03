To install Physics Competition 

0. Sudo
Ask the system administrator to give you sudo privlige so that you can complete the instalation.

1. Repo
a. Get access to repo at bitbucket.org/ClintStaley/PhysicsCompetition
	b. git clone the repo

2. Node and Npm Setup
a. Install nodejs 8.11+ and npm 5.6+ if needed.  There is a complexity here, in that newer versions of Ubuntu tend to fall back to old versions of node/npm apparently due to procrastination on testing later versions against the new Ubuntus....  Instead, get node and npm from a recent repo, e.g.:
<pre>
	sudo apt-get install curl python-software-properties
	curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
	sudo apt-get install nodejs
</pre>
b. In RESTServer and UI run npm install to download all missing modules

3. MySQL setup
a. Log in to SQL server via mysql as SQL root user create a new user for yourself.
	1. to log in as root user, first use sudo -i to become root uset, then mysql -uroot to log in
	2. command to make new user: CREATE USER 'newUser'@'localhost' IDENTIFIED BY 'userPassword';
	3. grant your new user permission on sql with: GRANT ALL PRIVILEGES ON * . * TO 'newUser'@'localhost';
	4. guide here: https://www.digitalocean.com/community/tutorials/how-to-create-a-new-user-and-grant-permissions-in-mysql
b. For that new SQL user, create a SQL database from V1.sql in RESTServer/DB
c. In RESTServer/routes create a connection.json file, using exampleConnection.json as a reference.
d. Possible problems, if npm start is throwing a watch error enospc, then this command may fix the problem:
	echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

4. Evaluation Client (evc)
a. install java if you dont have it
b. install Maven
c. Install Eclipse.
d. Install Eclipse plugin Maven2Eclipse. Open eclipse and under the help menu click install new software, and click add site, you can use http://www.eclipse.org/m2e/m2e-downloads.html to find the address for the version you want.  If you are using an older version of eclipse then you must use an older version of M2E I had to use version 1.3.1 of M2e to go with my version 3.8 eclipse.
10. to create an uber jar file then just type mvn package in terminal and a uber jar file will appear in the target directory in Evaluation Client.

5. use sudo apt-get install ssh to install ssh
