// LandGrabMovie provides background information on framerate and size of the
// overall background, plus a series of events describing growth of each circle,
// when each collision may occur measured by its radius, and whether the circle is 
// valid or invalid. Events are each time stamped with a number of second since the start of the movie.
// a number of seconds since the start of the movie.

export class LandGrabMovie {
   static cCircleGrowth = 0;
   static cInvalidCircleGrowth = 1
   static cMakeObstacle = 2;
   static cValidCircle = 3;
   static cInvalidCircle = 4;
   static cEmptyEvt = 5; // required in the case movie has no other events

   // Constructor with background as indicated, and events drawn from prms and
   // optional sbm. (Generate only obstacle creation events w/o sbm)
   constructor(frameRate, prms, sbm) {
      // declare constants  CAS FIX: Obvious comment...
      const bkgSize = 100.0;
      const validationPause = .25;
      // Contains results of circle collisions and radii of collisions
      // has content only if EVC has returned result
      let circlesResults = sbm && sbm.testResult ? 
       sbm.testResult.circleData : [];
      // contains location and order of circles
      let circleContent =  sbm && sbm.content ? sbm.content : [];

      this.background = {};
      this.background.frameRate = frameRate;
      this.background.height = bkgSize;
      this.background.width = bkgSize;
      this.evts = [];
      this.id = 1;

      // obstacles numbered from 0
      prms.obstacles.forEach((brr, idx) => {
         this.addMakeObstacleEvt(
          -1, this.id++, brr.loX, brr.loY, brr.hiX, brr.hiY)
      });
      
       // Evts must always have at least 1 evt for MovieController to work,
       // so if there are no obstacles or circleResults, put empty evt
      if(prms.obstacles.length < 1 && circlesResults.length < 1)
         this.evts.push(
            {type: LandGrabMovie.cEmptyEvt, time: -1}
         )

      let time = 0;
      circlesResults.forEach((circleResult, circleId) => {
         let circle = circleContent[circleId];
         let growthTime = 2 // each circle will take 2 seconds to grow
         /* CAS FIX: Block comments in header with footnotes.  And please
         make this one clearer.. 
         Valid growth time is "shortened" when the badAngle exists 
         (which means it is invalid) and validGrowthTime is the proportional
         to badAngle / 2 Pi (as any radius length before badAngle is valid)
         */
         let validGrowthTime = growthTime;
         if (circleResult.badAngle)
            validGrowthTime = growthTime
             * (circleResult.badAngle/ (2 * Math.PI)); 

         // Grow steadily from terminal angle as valid circle.
         for (let t = 0; t < validGrowthTime; t += 1.0/frameRate)
            this.addCircleGrowthEvt(time + t, this.id++, circle.centerX,
             circle.centerY, circle.radius, (t / growthTime) * 2 * Math.PI);

         time += validGrowthTime;

         this.addMakeCircleEvt(time, this.id++, circle.centerX,
          circle.centerY, circle.radius, circleResult.badAngle);

         time += validationPause;
      });
   }

   addCircleGrowthEvt(time, id, x, y, r, angle){
      this.evts.push(
       {type: LandGrabMovie.cCircleGrowth, time, id, x, y, r, angle});
   }

   addMakeObstacleEvt(time, id, loX, loY, hiX, hiY) {
      this.evts.push(
       {type: LandGrabMovie.cMakeObstacle, time, id, loX, loY, hiX, hiY});
   }

   addMakeCircleEvt(time, id, x, y, r, badAngle) {
      if (badAngle) 
         this.evts.push(
          {type: LandGrabMovie.cInvalidCircle, time, id, x, y, r,
          angle:badAngle});
      else
         this.evts.push({type: LandGrabMovie.cValidCircle, time, id, x, y, r});
   }
}