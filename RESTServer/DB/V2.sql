


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
   prmSchema varchar(20000) not null
);

create table Competition (
   id int auto_increment primary key,
   ownerId int not null,
   ctpId int not null,
   title varchar(80) not null,
   prms varchar(20000) not null,
   rules int default 0,
   curTeam int,
   
   constraint FKCompetition_ctpId foreign key (ctpId) references
    CompetitionType(id) on delete cascade on update cascade,
    
   constraint FKCompetition_ownerId foreign key (ownerId) references
    Person(id) on delete cascade on update cascade
);

create table Teams (
   id int auto_increment primary key,
   bestScore int not null default 0,
   teamName varchar(80) not null,
   cmpId int not null,
   ownerId int not null,
   lastSubmit datetime default null,
   canSubmit boolean default true,
   nextTeam int,
   
   constraint FKTeams_cmpId foreign key (cmpId) references
    Competition(id) on delete cascade on update cascade,
   
   constraint FKTeams_ownerId foreign key (ownerId) references
    Person(id) on delete cascade on update cascade

);

create table Submits (
   id int auto_increment primary key,
   cmpId int not null,
   content varchar(2000) Not Null,
   response varchar(2000),
   teamId int not null,
   score int,
   subTime datetime,
   
     constraint FKSubmits_cmpId foreign key (cmpId) references
    Competition(id) on delete cascade on update cascade,
    
      constraint FKSubmits_teamId foreign key (teamId) references
    Teams(id) on delete cascade on update cascade
);


create table Members (

	personId int not null,
   teamId int not null,
   
   constraint FKTMembers_personId foreign key (personId) references
    Person(id) on delete cascade on update cascade,
   
   constraint FKMembers_teamId foreign key (teamId) references
    Teams(id) on delete cascade on update cascade

);

insert into Person (firstName, lastName, email,       password,   whenRegistered, role)
            VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1);
            
select * from Person;
select * from CompetitionType;
select * from Competition;
select * from Teams;
select * from Members;
select * from Submits;

            
            
            
		
            
            
 