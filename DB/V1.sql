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
   prms varchar(20000),
   
   constraint FKCompetition_ownerId foreign key (ownerId) references
    Person(id) on delete cascade on update cascade
);

create table Teams (
   id int auto_increment primary key,
   bestScore int not null default 0,
   teamName varchar(80) not null,
   cmpId int not null,
   ownerId int not null,
   lastSubmit datetime,
   
   constraint FKCompetition_ownerId foreign key (ownerId) references
    Person(id) on delete cascade on update cascade

);

create table Submits (
   id int auto_increment primary key,
   cmpId int not null,
   content varchar(20000) Not Null,
   teamId int not null,
   score int,
   subTime datetime
);


insert into Person (firstName, lastName, email,       password,   whenRegistered, role)
            VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1);
