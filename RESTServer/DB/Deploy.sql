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
   tutorial varchar(8192),
   description varchar(500) not null,
   prmSchema varchar(8192) not null
);

create table Competition (
   id int auto_increment primary key,
   ownerId int not null,
   ctpId int not null,
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
            VALUES ("Jake", "Williams", "admin@softwareinventions.com", "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8", NOW(), 1);


insert into CompetitionType (title, codeName, description, prmSchema)
            VALUES ("Land Grab", "LandGrab", "Claim territory by placing circles in a field of obstacles", '{\
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

insert into CompetitionType (title, codeName, description, prmSchema)
            VALUES ("Bounce", "Bounce","Bounce balls through an obstacle field", '
{
      "$schema": "http://json-schema.org/draft-07/schema#",

      "title": "Bounce",
      "type": "object",

      "properties": {
          "targetTime": {
            "title": "Expected time to hit all targets for 100 score",
            "type": "number"
          },
          "targets": {
            "title": "Obstacles to hit",
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
          "title": "Obstacles to avoid",
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

insert into CompetitionType (title, codeName, description, prmSchema)
  VALUES ("Ricochet", "Ricochet", "Arrange ball collisions for max speed", '
  {
      "$schema": "http://json-schema.org/draft-07/schema#",

      "title": "Ricochet",
      "type": "object",
      "properties": {
          "targetTime": {
            "title": "Time resulting in 100% credit",
            "type": "number"
          },
          "maxBalls": {
            "title": "Maximum number of balls allowed in design",
            "type": "integer",
            "minimum": 2,
            "maximum": 4
          },
          "balls": {
            "title": "Balls from which to choose",
            "type": "array",
            "items": {
                "title": "Ball weight",
                "type": "number",
                "minimum": 1.0,
                "maximum": 100.0
            }
         }
      },
      "minProperties": 3 
  }');
  
DELETE FROM Competition;

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Land Grab Test 1', 1, 1, 'This competition is a simple warmup', '{ "numCircles": 3, "goalArea": 5000.0, "obstacles": [ { "loX": 0, "hiX": 40.2, "loY": 0, "hiY": 28.7 }, { "loX": 0, "hiX": 50, "loY": 85, "hiY": 100 }, { "loX": 80, "hiX": 100, "loY": 0, "hiY": 12 } ] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 1', 2, 1, 'A good warmup Bounce competition, this one requires a couple of balls.', '{"targetTime": 5.1505, "targets": [ { "loX": 1.4, "hiX": 2.4, "hiY": 7.4, "loY": 7.1 }, { "loX": 4.0, "hiX": 5.5, "hiY": 3.9, "loY": 3.6 }, { "loX": 7.6, "hiX": 9.0, "hiY": 5.5, "loY": 5.2 }], "barriers": [ { "loX": 6.4, "hiX": 7, "hiY": 9, "loY": 3 }] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 2', 2, 1, 'A more challenging Bounce competition, though still doable with two balls', '{"targetTime": 21.0382237, "targets": [ { "loX": 1.0, "hiX": 2.0, "hiY": 7.9, "loY": 7.6 }, { "loX": 4.8, "hiX": 5.3, "hiY": 9.0, "loY": 8.7 }, { "loX": 6.3, "hiX": 8.0, "hiY": 7.9, "loY": 7.6 },{ "loX": 1.9, "hiX": 2.9, "hiY": 4.9, "loY": 4.6 },{ "loX": 1.1, "hiX": 2.2, "hiY": 0.9, "loY": 0.6 }], "barriers": [{ "loX": 4.8, "hiX": 5.4, "hiY": 8.3, "loY": 8 }] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 3', 2, 1, 'This competition requires ping-ponging back and forth between two columns of obstacles', '{"targetTime": 12.87, "targets": [ { "loX": 0.8, "hiX": 0.9, "hiY": 8.5, "loY": 8.0 }, { "loX": 0.8, "hiX": 0.9, "hiY": 4.3, "loY": 4.2 }, { "loX": 0.8, "hiX": 0.9, "hiY": 3.2, "loY": 3.0 },{ "loX": 4.1, "hiX": 4.2, "hiY": 9.5, "loY": 8.4 },{ "loX": 4.1, "hiX": 4.2, "hiY": 8.0, "loY": 7.5 },{ "loX": 4.1, "hiX": 4.2, "hiY": 6.8, "loY": 6.5 }], "barriers": [] }');
            
insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Ricochet 1', 3, 1, 'Basic two-ball recoil', 
            '{
               "targetTime" : 4,
               "maxBalls": 2,
               "balls": [9.0, 1.0]
            }');
            
