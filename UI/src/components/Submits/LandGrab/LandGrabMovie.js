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
   static cCircleFade = 5;
   static cEmptyEvt = 6;     // Required in the case movie has no other events

   static cFadeTime = 1.5;   // Seconds across which a target fades away

   // Constructor with background as indicated, and events drawn from prms and
   // optional sbm. (Generate only obstacle creation events w/o sbm)
   constructor(frameRate, prms, sbm) {
      const bkgSize = 100.0;
      const validationPause = .25;
      // Contains results of circle collisions and radii of collisions
      let circlesResults = sbm && sbm.testResult
       ? sbm.testResult.circleData : [];
      // contains location and order of circles
      let circleContent = sbm && sbm.content ? sbm.content : [];

      // Number of frames across which to fade
      const fadeFrames = Math.round(LandGrabMovie.cFadeTime * frameRate);

      this.background = {};
      this.background.frameRate = frameRate;
      this.background.height = bkgSize;
      this.background.width = bkgSize;
      this.evts = [];
      this.id = 1;

      this.lastCircleEvtTime = 0;

      // obstacles numbered from 0
      prms.obstacles.forEach((brr, idx) => {
         this.addMakeObstacleEvt(
          -1, this.id++, idx, brr.loX, brr.loY, brr.hiX, brr.hiY)
      });
      
       // Evts must always have at least 1 evt for MovieController to work,
       // so if there are no obstacles or circleResults, put empty evt
      if(prms.obstacles.length < 1 && circlesResults.length < 1)
         this.evts.push({type: LandGrabMovie.cEmptyEvt, time: -1});

      let time = 0;
      circlesResults.forEach((circleResult, circleId) => {
         let circle = circleContent[circleId];
         let growthTime = 2; // each circle will take 2 seconds to grow
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
            this.addCircleGrowthEvt(time + t, this.id++, circleId, circle.centerX,
             circle.centerY, circle.radius, (t / growthTime) * 2 * Math.PI);

         time += validGrowthTime;

         this.addMakeCircleEvt(time, this.id++, circleId, circle.centerX,
          circle.centerY, circle.radius, circleResult.badAngle);
         this.lastCircleEvtTime = time;

         // for (let fadeFrame = 0; fadeFrame <= fadeFrames; fadeFrame++)
         //    this.addCircleFadeEvt(time + fadeFrame / frameRate,
         //     this.id++, circleId, fadeFrame / fadeFrames);

         for (let t = 0; t <= LandGrabMovie.cFadeTime; t += 1.0/frameRate)
            this.addCircleFadeEvt(time + t, this.id++, circleId, t);

         time += validationPause;
      });

      // Placement of fade events out of time sequence necessitates final sort
      this.evts.sort((e1, e2) => e1.time - e2.time);
   }

   addCircleGrowthEvt(time, id, circleId, x, y, r, angle) {
      this.evts.push(
       {type: LandGrabMovie.cCircleGrowth, time, id, circleId, x, y, r, angle});
   }

   addMakeObstacleEvt(time, id, obstacleId, loX, loY, hiX, hiY) {
      this.evts.push({type: LandGrabMovie.cMakeObstacle,
       time, id, obstacleId, loX, loY, hiX, hiY});
   }

   addMakeCircleEvt(time, id, circleId, x, y, r, badAngle) {
      if (badAngle) 
         this.evts.push(
          {type: LandGrabMovie.cInvalidCircle, time, id, circleId, x, y, r,
          angle:badAngle});
      else
         this.evts.push(
          {type: LandGrabMovie.cValidCircle, time, id, circleId, x, y, r});
   }

   addCircleFadeEvt(time, id, circleId, fadeTime) {
      this.evts.push(
       {type: LandGrabMovie.cCircleFade, time, id, circleId, fadeTime});
   }

   getLastTime() {
      return this.evts[this.evts.length - 1].time;
   }

   getLastCircleEvtTime() {
      return this.lastCircleEvtTime;
   }
}