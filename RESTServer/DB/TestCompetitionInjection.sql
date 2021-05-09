
use CmpDB;


insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Land Grab Test 1', 1, 1, 'make the circles as big as possible, without colliding', '{ "numCircles": 3, "goalArea": 5000.0, "obstacles": [ { "loX": 0, "hiX": 40.2, "loY": 0, "hiY": 28.7 }, { "loX": 0, "hiX": 50, "loY": 85, "hiY": 100 }, { "loX": 80, "hiX": 100, "loY": 0, "hiY": 12 } ] }');

insert into Competition (title, ctpId, ownerId, description, prms)
            VALUES ('Bounce Test 1', 2, 1, 'Bounce A ball on platforms to see if you can hit them all', '{"targetTime": 10.0, "obstacles": [ { "loX": 0, "hiX": 40.2, "hiY": 40, "loY": 30 }, { "loX": 0, "hiX": 50, "hiY": 7, "loY": 5 }, { "loX": 60, "hiX": 100, "hiY": 70, "loY": 40 }, { "loX": 5, "hiX": 6, "hiY": 100, "loY": 0 },"blockedRectangles": [] ] }');

"prms":  "{\"targetTime\": 11.5, \"targets\": [ { \"loX\": 1, \"hiX\": 2, \"loY\": 7, \"hiY\": 7.9 }, { \"loX\": 2.8, \"hiX\": 3.8, \"loY\": 4, \"hiY\": 4.9 }, { \"loX\": 2, \"hiX\": 4.1, \"loY\": .5, \"hiY\": .9 }, { \"loX\": 4.0, \"hiX\": 4.9, \"loY\": 8.9, \"hiY\": 9.4 }, { \"loX\": 6.9, \"hiX\": 8.0, \"loY\": 7.2, \"hiY\": 7.9 } ], \"barriers\": [{ \"loX\": 3.6, \"hiX\": 4.0, \"loY\": 6.0, \"hiY\": 6.5 }] }",




