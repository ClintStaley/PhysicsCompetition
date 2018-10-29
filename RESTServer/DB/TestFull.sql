
use CmpDB;


insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Land Grab Test 1', 1, 1, 'make the circles as big as possible, without colliding', '{ "numCircles": 3, "goalArea": 5000.0, "obstacles": [ { "loX": 0, "hiX": 40.2, "loY": 0, "hiY": 28.7 }, { "loX": 0, "hiX": 50, "loY": 85, "hiY": 100 }, { "loX": 80, "hiX": 100, "loY": 0, "hiY": 12 } ] }');


insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 1', 2, 1, 'Bounce A ball on platforms to see if you can hit them all', '{"targetTime": 10.0, "obstacles": [ { "loX": 10, "hiX": 25, "hiY": 85, "loY": 80 }, { "loX": 45, "hiX": 60, "hiY": 70, "loY": 65 }, { "loX": 85, "hiX": 100, "hiY": 85, "loY": 80 }] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 2', 2, 1, 'Bounce A ball on platforms to see if you can hit them all', '{"targetTime": 30.0, "obstacles": [ { "loX": 10, "hiX": 25, "hiY": 65, "loY": 60 }, { "loX": 35, "hiX": 50, "hiY": 75, "loY": 70 }, { "loX": 65, "hiX": 80, "hiY": 85, "loY": 80 },{ "loX": 20, "hiX": 35, "hiY": 55, "loY": 50 },{ "loX": 55, "hiX": 70, "hiY": 45, "loY": 40 }] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Challenge 3', 2, 1, 'Bounce A ball on platforms to see if you can hit them all', '{"targetTime": 10.0, "obstacles": [ { "loX": 10, "hiX": 25, "hiY": 80, "loY": 75 }, { "loX": 35, "hiX": 40, "hiY": 98, "loY": 70 }, { "loX": 10, "hiX": 25, "hiY": 55, "loY": 50 }] }');





