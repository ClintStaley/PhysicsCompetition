Select * from person;
Select * from competitiontype;
Select * from Competition;
Select * from Teams;
Select * from Submits;

select * from Teams where cmpId = 1;

select * from Competition where title = "changed" and ownerId = 1;
select * from Person where email = "adm@11.com";

show tables;
show columns from person;

select * from Competition where ownerId = 1;



select Competition.id,ownerId,ctpId,prms from Competition,Person where email = 'adm@11.com' && Competition.ownerId = Person.id;

SET SQL_SAFE_UPDATES = 1;

delete from competitiontype where id != 1;

drop table if exists competitiontype;
drop table if exists Teams;
drop table if exists Submits;
drop table if exists competition;

drop database if exists VCSdb;
create database VCSdb;
use VCSdb;

create table Person (
   id int auto_increment primary key,
   firstName varchar(30),
   lastName varchar(30) not null,
   email varchar(30) not null,
   password varchar(50),
   whenRegistered datetime not null,
   termsAccepted datetime,
   role int unsigned not null,  # 0 normal, 1 admin
   unique key(email)
);

create table CompetitionType (
   id int auto_increment primary key,
   title varchar(80) not null,
   description varchar(100) not null,
   prmSchema varchar(10000)
);

create table Competition (
   id int auto_increment primary key,
   ownerId int not null,
   ctpId int not null,
   title varchar(80) not null,
   prms varchar(20000)
);

create table Teams (
   id int auto_increment primary key,
   bestScore int not null default 0,
   teamName varchar(80) not null,
   cmpId int not null,
   ownerId int not null,
   lastSubmit datetime
);

create table Submits (
   id int auto_increment primary key,
   cmpId int not null,
   content varchar(20000) Not Null,
   teamId int not null,
   score int,
   subTime datetime
);

insert into Submits (content , teamId, cmpId)
            VALUES ("Team1",1,1);


insert into Teams (teamName , cmpId, OwnerId)
            VALUES ("Team1",1,1);

insert into Competition (title, ownerid, ctpId)
            VALUES ("Bridge",  1,1  );

insert into competitiontype (title, description)
            VALUES ("Bridge Builder",     "Build Bridges");

insert into Person (firstName, lastName, email,       password,   whenRegistered, role)
            VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1);
            
            
            
		
            
            
 