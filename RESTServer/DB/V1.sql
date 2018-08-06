
drop database if exists CmpDB;
create database CmpDB;
use CmpDB;

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
   title varchar(80) not null unique,
   description varchar(500) not null,
   tutorial varchar(10000) not null,
   prmSchema varchar(20000) not null
);

create table Competition (
   id int auto_increment primary key,
   ownerId int not null,
   ctpId int not null,
   title varchar(80) not null,
   prms varchar(20000) not null,
   description varchar(500) not null,
   rules int default 0,
   curTeamId int,

   constraint FKCompetition_ctpId foreign key (ctpId) references
    CompetitionType(id) on delete cascade on update cascade,

   constraint FKCompetition_ownerId foreign key (ownerId) references
    Person(id) on delete cascade on update cascade
);

create table Team (
   id int auto_increment primary key,
   bestScore int not null default -1,
   teamName varchar(80) not null,
   cmpId int not null,
   leaderId int not null,
   lastSubmit datetime default null,
   canSubmit boolean default true,
   nextTeam int,

   constraint FKTeam_cmpId foreign key (cmpId) references
    Competition(id) on delete cascade on update cascade,

   constraint FKTeam_ownerId foreign key (leaderId) references
    Person(id) on delete cascade on update cascade

);

create table Submit
(
   id int auto_increment primary key,
   cmpId int not null,
   content varchar(2000) Not Null,
   response varchar(2000),
   teamId int not null,
   practiceRun boolean default false,

   score int,
   sbmTime datetime,

     constraint FKSubmit_cmpId foreign key (cmpId) references
    Competition(id) on delete cascade on update cascade,

      constraint FKSubmit_teamId foreign key (teamId) references
    Team(id) on delete cascade on update cascade
);


create table Membership (
   prsId int not null,
   teamId int not null,

   constraint FKTMembership_personId foreign key (prsId) references
    Person(id) on delete cascade on update cascade,

   constraint FKMembership_teamId foreign key (teamId) references
    Team(id) on delete cascade on update cascade

);

insert into Person (firstName, lastName, email,       password,   whenRegistered, role)
            VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1);


insert into CompetitionType (title, description, tutorial, prmSchema)
            VALUES ("Bridge Builder", "What yo do: Build Bridges", "How to build Bridges: Build Bridges", "{}");


insert into Competition (ownerId, ctpId, title, prms, description)
            VALUES (1,     1, "bridge building", "{}", "description goes here");

insert into Team (teamName, cmpId, leaderId)
            VALUES ("Team1", 1, 1);

insert into Membership (prsId, teamId)
            VALUES (1,     1);

select * from Person;
select * from CompetitionType;
select * from Competition;
select * from Team;
select * from Membership;
select * from Submit;
