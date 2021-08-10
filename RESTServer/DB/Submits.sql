# Sample answers to use for testing EVC headlessly

insert into Team (teamName, cmpId, leaderId) values 
 ('Rebound Team 1', 6, 1);

insert into Membership (prsId, teamId) values (1, 1);

insert into Submit (cmpId, teamId, sbmTime, content) values
 (6, 1, NOW(), '{
    "gateTime": 0.14,
    "jumpLength": 2.85,
    "ballStarts" : [
       {"id": 0, "pos": 0.6, "speed": 1.0}, 
       {"id": 1, "pos": 0.9, "speed": -1.0}
    ]
 }');

 insert into Submit (cmpId, teamId, sbmTime, content) values
 (6, 1, NOW(), '{
    "gateTime": 0.14,
    "jumpLength": 2.8,
    "ballStarts" : [
       {"id": 0, "pos": 0.6, "speed": 1.0}, 
       {"id": 1, "pos": 0.9, "speed": -1.0}
    ]
 }');

 insert into Submit (cmpId, teamId, sbmTime, content) values
 (6, 1, NOW(), '{
    "gateTime": 0.1,
    "jumpLength": 2.85,
    "ballStarts" : [
       {"id": 0, "pos": 0.6, "speed": 1.1}, 
       {"id": 1, "pos": 0.9, "speed": -1.0}
    ]
 }');

  insert into Submit (cmpId, teamId, sbmTime, content) values
 (6, 1, NOW(), '{
    "gateTime": 0.1,
    "jumpLength": 2.8,
    "ballStarts" : [
       {"id": 0, "pos": 0.88, "speed": 1.0}, 
       {"id": 1, "pos": 0.9, "speed": -1.0}
    ]
 }');

