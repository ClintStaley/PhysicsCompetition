
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
   bestScore double not null default -1,
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
   testResult varchar(2000),
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

insert into Person (firstName, lastName, email,       password,   whenRegistered, role)
            VALUES ("Jake", "Williams", "admin@softwareinventions.com", "5562ab22969938d20d529b7220da15af", NOW(), 1);


insert into CompetitionType (title, codeName, description, tutorial, prmSchema)
            VALUES ("Land Grab", "LandGrab", "Claim territory by placing circles in a field of obstacles", "Claim territory by placing circles in a field of obstacles...", '{\
     "$schema": "http://json-schema.org/draft-07/schema#",\
     \
     "title": "Land Grab",\
     "type": "object", \
       \
     "properties": {\
        "numCircles": {\
           "title": "Number of circles allowed per team",\
           "type": "integer",\
           "minimum": 1\
        },\
        "goalArea": {\
           "title": "Area of coverage that gets 100%",\
           "type": "number",\
           "minimum": 0.0,\
           "maximum": 10000.0\
        },\
        "obstacles": {\
           "title": "Blocked areas in 100x100 square",\
           "type": "array",\
           "items": {\
              "title": "Blocked rectangle",\
              "type": "object",\
              "properties": {\
                 "loX": {\
                    "title": "Left edge",\
                    "type": "number",\
                    "minimum": 0.0,\
                    "maximum": 100.0\
                 },\
                 "hiX": {\
                    "title": "Right edge",\
                    "type": "number",\
                    "minimum": 0.0,\
                    "maximum": 100.0\
                 },\
                 "loY": {\
                    "title": "Bottom edge",\
                    "type": "number",\
                    "minimum": 0.0,\
                    "maximum": 100.0\
                 }, \
                 "hiY": {\
                    "title": "Top edge",\
                    "type": "number",\
                    "minimum": 0.0,\
                    "maximum": 100.0\
                 }\
              },\
              "additionalProperties": false,\
    		  "minProperties": 4   \
           }\
        }\
    },\
    "additionalProperties": false,\
    "minProperties": 3   \
 }');

insert into CompetitionType (title, codeName, description, tutorial, prmSchema)
            VALUES ("Bounce", "Bounce","Bounce a ball across platforms", "Bounce a ball across platforms by inputing a speed", '
{
      "$schema": "http://json-schema.org/draft-07/schema#",

      "title": "Bounce",
      "type": "object",

      "properties": {
          "targetTime": {
            "title": "time to get all platforms that will get 100",
            "type": "number"
          },
          "targets": {
            "title": "platforms to bounce off of",
            "type": "array",
            "items": {
                "title": "Goal rectangle",
                "type": "object",
                "properties": {
                  "loX": {
                      "title": "Left edge",
                      "type": "number",
                      "minimum": 0.0,
                      "maximum": 100.0
                  },
                  "hiX": {
                      "title": "Right edge",
                      "type": "number",
                      "minimum": 0.0,
                      "maximum": 100.0
                  },
                  "loY": {
                      "title": "top edge",
                      "type": "number",
                      "minimum": 0.0,
                      "maximum": 100.0
                  },
                  "hiY": {
                      "title": "bottom edge",
                      "type": "number",
                      "minimum": 0.0,
                      "maximum": 100.0
                  }
                },
            
          "additionalProperties": false,
        "minProperties": 4

            }
         },
          
          "barriers": {
          "title": "platforms to avoid",
          "type": "array",
          "items": {
             "title": "Blocked rectangle",
             "type": "object",
             "properties": {
                "loX": {
                    "title": "Left edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                },
                "hiX": {
                    "title": "Right edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                },
                "loY": {
                    "title": "top edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                },
                "hiY": {
                    "title": "bottom edge",
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0
                }
             },
                "additionalProperties": false,
                "minProperties": 4
             }
          }
      },
      "additionalProperties": false,
      "minProperties": 3
  }');

select * from Person;
select * from CompetitionType;
select * from Competition;
select * from Team;
select * from Membership;
select * from Submit;
