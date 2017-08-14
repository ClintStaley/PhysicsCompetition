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
   title varchar(30) not null,
   description varchar(30) not null,
   prmSchema varchar(50)
);

insert into Person (firstName, lastName, email,       password,   whenRegistered, role)
            VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1);
