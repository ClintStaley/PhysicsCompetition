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
   codeName varchar(80) not null, 
   title varchar(80) not null unique,
   description varchar(500) not null,
   prmSchema varchar(4096) not null
);

create table Competition (
   id int auto_increment primary key,
   ownerId int not null,
   ctpId int not null,
   hints varchar(30),
   title varchar(80) not null,
   prms varchar(8192) not null,
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
   bestScore double not null default -1,
   teamName varchar(80) not null,
   cmpId int not null,
   leaderId int not null,
   lastSubmit datetime default null,
   canSubmit boolean default true,
   nextTeam int,
   numSubmits int not null default 0,

   constraint FKTeam_cmpId foreign key (cmpId) references
    Competition(id) on delete cascade on update cascade,

   constraint FKTeam_ownerId foreign key (leaderId) references
    Person(id) on delete cascade on update cascade
);

create table Submit (
   id int auto_increment primary key,
   cmpId int not null,
   content varchar(2000) Not Null,
   testResult varchar(8192),
   teamId int not null,
   practiceRun boolean default false,
   errorResult varchar(1000) default Null,
   score double,
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

insert into Person (firstName, lastName, email, password, whenRegistered, role)
   VALUES ("Clint", "Staley", "admin@softwareinventions.com",
    "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8", NOW(), 1);
