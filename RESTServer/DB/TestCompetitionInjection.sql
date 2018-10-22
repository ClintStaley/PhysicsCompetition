
use CmpDB;


insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Land Grab Test 1', 1, 1, 'make the circles as big as possible, without colliding', '{ "numCircles": 3, "goalArea": 5000.0, "obstacles": [ { "loX": 0, "hiX": 40.2, "loY": 0, "hiY": 28.7 }, { "loX": 0, "hiX": 50, "loY": 85, "hiY": 100 }, { "loX": 80, "hiX": 100, "loY": 0, "hiY": 12 } ] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Test 1', 2, 1, 'Bounce A ball on platforms to see if you can hit them all', '{"targetTime": 10.0, "obstacles": [ { "loX": 0, "hiX": 40.2, "hiY": 40, "loY": 30 }, { "loX": 0, "hiX": 50, "hiY": 7, "loY": 5 }, { "loX": 60, "hiX": 100, "hiY": 70, "loY": 40 }, { "loX": 5, "hiX": 6, "hiY": 100, "loY": 0 } ] }');




