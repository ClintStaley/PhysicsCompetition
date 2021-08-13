use CmpDB;  

   insert into Competition (title, ctpId, ownerId, description, hints, prms)
   VALUES ('Land Grab Tutorial', 1, 1, 'Tutorial Land Grab', 'Bronze', '{
      "numCircles": 3,
      "goalArea": 5000.0,
      "obstacles": [
         { "loX": 50, "hiX": 100, "loY": 0, "hiY": 50 }
      ] 
   }');

   insert into Competition (title, ctpId, ownerId, description, hints, prms)
   VALUES ('Land Grab 1', 1, 1, 'Empty Field', 'Bronze',  '{
      "numCircles": 3,
      "goalArea": 5000.0,
      "obstacles": [] 
   }');

   insert into Competition (title, ctpId, ownerId, description, hints, prms)
   VALUES ('Land Grab  2', 1, 1, '1 Barrier but not square', 'Silver', '{
      "numCircles": 3,
      "goalArea": 5000.0,
      "obstacles": [
         { "loX": 70, "hiX": 100, "loY": 0, "hiY": 20 } 
      ] 
   }');

   insert into Competition (title, ctpId, ownerId, description, hints, prms)
   VALUES ('Land Grab Test 3', 1, 1, '3 Barriers', 'Gold', '{
      "numCircles": 3,
      "goalArea": 5000.0,
      "obstacles": [
         { "loX": 0, "hiX": 40.2, "loY": 0, "hiY": 28.7 },
         { "loX": 0, "hiX": 50, "loY": 85, "hiY": 100 },
         { "loX": 80, "hiX": 100, "loY": 0, "hiY": 12 } 
      ] 
   }');

# 6.674 m/s 1.078s 7.195 4.3
insert into Competition (title, ctpId, ownerId, description, hints, prms)
   VALUES ('Bounce Competition 1', 2, 1, 'Simple one-target', 'Basic', '{
      "targetTime": 1.514,
      "targets": [ 
         {"loX": 7.0, "hiX": 7.2, "hiY": 4.2, "loY": 4.0 }
      ],
      "barriers": [ 
      ]
   }');

# 1.961 m/s 4.59s  9.0 5.6
insert into Competition (title, ctpId, ownerId, description, hints, prms)
   VALUES ('Bounce Challenge 2', 2, 1, 'Doable with one ball', 'Bronze', '{
      "targetTime": 5.15,
      "targets": [ 
         { "loX": 1.4, "hiX": 2.4, "hiY": 7.4, "loY": 7.1 },
         { "loX": 4.0, "hiX": 5.5, "hiY": 3.9, "loY": 3.6 },
         { "loX": 8.0, "hiX": 9.5, "hiY": 5.5, "loY": 5.2 }
      ],
      "barriers": [ 
         { "loX": 6.4, "hiX": 7, "hiY": 9, "loY": 3 }
      ]
   }');

# 5.9 m/s 1.186s 1.0 3.1
# 12 m/s 1.08s 1.0 4.24 
insert into Competition (title, ctpId, ownerId, description, hints, prms)
   VALUES ('Bounce Challenge 3', 2, 1,
    'This competition requires 2 balls ping-ponging between
     two columns of targets', 'Silver',
    '{
       "targetTime": 3.87, 
       "targets": [ 
          { "loX": 0.8, "hiX": 0.9, "hiY": 8.5, "loY": 8.0 }, 
          { "loX": 0.8, "hiX": 0.9, "hiY": 4.3, "loY": 4.2 }, 
          { "loX": 0.8, "hiX": 0.9, "hiY": 3.2, "loY": 3.0 },
          { "loX": 4.1, "hiX": 4.2, "hiY": 9.5, "loY": 8.4 },
          { "loX": 4.1, "hiX": 4.2, "hiY": 8.0, "loY": 7.5 },
          { "loX": 4.1, "hiX": 4.2, "hiY": 6.8, "loY": 6.5 }],
       "barriers": [] 
      }');

# 2.88 m/s 2.77s 7.98 8.0
# 1.62 m/s 1.645s 2.67 4.5
insert into Competition (title, ctpId, ownerId, description, hints, prms)
   VALUES ('Bounce Challenge 4', 2, 1, 
    'A challenging Bounce competition, though still doable with two balls',
    'Gold', '{
        "targetTime": 6.53, 
        "targets": [
           {"loX": 1.0, "hiX": 2.0, "hiY": 7.9, "loY": 7.6},
           {"loX": 4.8, "hiX": 5.3, "hiY": 9.0, "loY": 8.7},
           {"loX": 6.3, "hiX": 8.0, "hiY": 7.9, "loY": 7.6},
           {"loX": 1.9, "hiX": 2.9, "hiY": 4.9, "loY": 4.6},
           {"loX": 1.1, "hiX": 2.2, "hiY": 0.9, "loY": 0.6}], 
        "barriers": [
           {"loX": 2.5, "hiX": 7.5, "hiY": 8.3, "loY": 8}
        ]
     }');
            
# jumpLength 2.85m gateTime .14s Starts: 9kg @.6m 1 m/s, 1kg .9m -1 m/s, 
insert into Competition (title, ctpId, ownerId, description, prms)
   VALUES ('Rebound 1', 3, 1, 'Basic two-ball problem', 
    '{
       "targetLength" : 2.85,
       "maxBalls": 2,
       "balls": [1.0, 5.0, 9.0]
     }');

# jumpLength 3.86m gateTime .05s 
# Starts: 19kg @.5m 1m/s, 5kg .7m -1m/s 1kg .9m -1m/s, 
insert into Competition (title, ctpId, ownerId, description, prms)
   VALUES ('Rebound 2', 3, 1, 'Three ball problem', 
    '{
       "targetLength" : 3.86,
       "maxBalls": 3,
       "balls": [19.0, 9.0, 6.0, 5.0, 4.0, 1.0]
     }');


