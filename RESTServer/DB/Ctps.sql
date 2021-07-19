use CmpDB;

insert into CompetitionType (title, codeName, description, prmSchema)
   VALUES ("Land Grab", "LandGrab", "Claim territory by placing circles",  '{
      "$schema": "http://json-schema.org/draft-07/schema#",
     
      "title": "Land Grab",
      "type": "object", 
       
      "properties": {
         "numCircles": {
            "title": "Number of circles allowed per team",
            "type": "integer",
            "minimum": 1
         },
         "goalArea": {
            "title": "Area of coverage that gets 100%",
            "type": "number",
            "minimum": 0.0,
            "maximum": 10000.0
         },
         "obstacles": {
            "title": "Blocked areas in 100x100 square",
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
                     "title": "Bottom edge",
                     "type": "number",
                     "minimum": 0.0,
                     "maximum": 100.0
                  }, 
                  "hiY": {
                     "title": "Top edge",
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
   VALUES ("Bounce", "Bounce","Bounce balls through an obstacle field", '{
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Bounce",
      "type": "object",
      "properties": {
         "targetTime": {
            "title": "Time to get all platforms that will get 100",
            "type": "number"
         },
         "targets": {
            "title": "Targets to hit",
            "type": "array",
            "items": {
               "title": "Target rectangle",
               "type": "object",
               "properties": {
                  "loX": {
                     "title": "Left edge",
                     "type": "number",
                     "minimum": 0.0,
                     "maximum": 10.0
                  },
                  "hiX": {
                     "title": "Right edge",
                     "type": "number",
                     "minimum": 0.0,
                     "maximum": 10.0
                  },
                  "loY": {
                     "title": "Top edge",
                     "type": "number",
                     "minimum": 0.0,
                     "maximum": 10.0
                  },
                  "hiY": {
                     "title": "Bottom edge",
                     "type": "number",
                     "minimum": 0.0,
                     "maximum": 10.0
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
                     "maximum": 10.0
                  },
                  "hiX": {
                     "title": "Right edge",
                     "type": "number",
                     "minimum": 0.0,
                     "maximum": 10.0
                  },
                  "loY": {
                     "title": "Top edge",
                     "type": "number",
                     "minimum": 0.0,
                     "maximum": 10.0
                  },
                  "hiY": {
                     "title": "Bottom edge",
                     "type": "number",
                     "minimum": 0.0,
                     "maximum": 10.0
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
   VALUES ("Rebound", "Rebound", "Arrange ball collisions for max speed", '{
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Ricochet",
      "type": "object",
      "properties": {
         "targetGap": {
            "title": "Rebound distance resulting in 100% credit",
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
