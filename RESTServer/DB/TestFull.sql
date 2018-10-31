
use CmpDB;

DELETE FROM Competition;

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Land Grab Test 1', 1, 1, 'make the circles as big as possible, without colliding', '{ "numCircles": 3, "goalArea": 5000.0, "obstacles": [ { "loX": 0, "hiX": 40.2, "loY": 0, "hiY": 28.7 }, { "loX": 0, "hiX": 50, "loY": 85, "hiY": 100 }, { "loX": 80, "hiX": 100, "loY": 0, "hiY": 12 } ] }');


insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 1', 2, 1, 'Bounce A ball on platforms to see if you can hit them all', '{"targetTime": 10.0, "obstacles": [ { "loX": 1.4, "hiX": 2.4, "hiY": 7.4, "loY": 7.1 }, { "loX": 4.0, "hiX": 6.0, "hiY": 3.9, "loY": 3.6 }, { "loX": 7.6, "hiX": 9.0, "hiY": 5.5, "loY": 5.2 }] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 2', 2, 1, 'Bounce A ball on platforms to see if you can hit them all', '{"targetTime": 30.0, "obstacles": [ { "loX": 1.0, "hiX": 2.5, "hiY": 6.5, "loY": 6.0 }, { "loX": 3.5, "hiX": 5.0, "hiY": 7.5, "loY": 7.0 }, { "loX": 6.5, "hiX": 8.0, "hiY": 8.5, "loY": 8.0 },{ "loX": 2.0, "hiX": 3.5, "hiY": 5.5, "loY": 5.0 },{ "loX": 5.5, "hiX": 7.0, "hiY": 4.5, "loY": 4.0 }] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 3', 2, 1, 'Bounce A ball on platforms to see if you can hit them all', '{"targetTime": 10.0, "obstacles": [ { "loX": 1.0, "hiX": 2.5, "hiY": 8.0, "loY": 7.5 }, { "loX": 3.5, "hiX": 4.0, "hiY": 9.8, "loY": 7.0 }, { "loX": 1.0, "hiX": 2.5, "hiY": 5.5, "loY": 5.0 }] }');





