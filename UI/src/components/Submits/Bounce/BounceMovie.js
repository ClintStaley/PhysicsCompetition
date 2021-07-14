// BounceMovie provides background information on framerate and size of the
// overall background, plus a series of events describing changes to the scene
// such as ball movements, collisions, etc.  Events are each time stamped with
// a number of seconds since the start of the movie.
export class BounceMovie {
   static cBallPosition = 0;
   static cMakeBarrier = 1;
   static cMakeTarget = 2;
   static cHitTarget = 3;
   static cHitBarrier = 4;
   static cBallLaunch = 5;
   static cBallExit = 6;

   // Construct with background as indicated, and events drawn from prms and 
   // optional sbm.  (Generate only barrier/target creation events w/o sbm)
   constructor(frameRate, prms, sbm) {
      const cG = 9.81;               // Gravity in m/s^2
      const bkgSize = 10.0;          // Standard field size
      let tracks = sbm && sbm.testResult ? sbm.testResult.events : [];  
      
      console.log("Make Bounce Movie");
      this.background = {};
      this.background.frameRate = frameRate;
      this.background.height = bkgSize;
      this.background.width = bkgSize;
      this.evts = [];

      // Targets numbered from 0
      prms.targets.forEach((trg, idx) => 
      this.addMakeTargetEvt(-1, idx, trg.loX, trg.loY, trg.hiX, trg.hiY));

      // Barriers numbered from targets.length
      prms.barriers.forEach((brr, idx) => {
         this.addMakeBarrierEvt(-1, prms.targets.length+idx,
          brr.loX, brr.loY, brr.hiX, brr.hiY);
      });

      let time = 0;
      tracks.forEach((trk, ballId) => {          // One track per ball
         trk.forEach((arc, arcId) => {           // Several arcs per track
            if (arcId == 0)                      // Launching arc
               this.addBallLaunchEvt(time, ballId);
            else if (arc.obstacleIdx >= 0) {      // If bouncing off something
               if (arc.obstacleIdx < prms.targets.length)
                  this.addHitTargetEvt(time, arc.posX, arc.posY, ballId,
                   arc.obstacleIdx, arc.corner)
               else
                  this.addHitBarrierEvt(time, arc.posX, arc.posY, ballId,
                   arc.obstacleIdx, arc.corner)
            }
            else                                  // Exit "arc"
               this.addBallExitEvt(time, arc.posX, arc.posY, ballId);
            
            // Create a sequence of ball positions, except for exit "arc"
            if (arcId < trk.length - 1) { 
               let arcDuration = trk[arcId + 1].time - arc.time; 
               for (let arcTime = 0; arcTime < arcDuration;
                arcTime += 1.0/frameRate) {
                  let x = arc.posX + arcTime * arc.velocityX;
                  let y = arc.posY + arcTime * arc.velocityY
                   - cG*arcTime*arcTime/2;
                  this.addBallPositionEvt(time + arcTime, x, y, ballId);
               }
               time += arcDuration;
            }
         });
      });
   }

   addBallPositionEvt(time, x, y, ballNumber) 
      {this.evts.push(
       {type: BounceMovie.cBallPosition, time:time, x, y, ballNumber});
   }

   addMakeBarrierEvt(time, id, loX, loY, hiX, hiY) {
      this.evts.push(
       {type: BounceMovie.cMakeBarrier, time, id, loX, loY, hiX, hiY});
   }

   addMakeTargetEvt(time, id, loX, loY, hiX, hiY) {
      this.evts.push(
       {type: BounceMovie.cMakeTarget, time, id, loX, loY, hiX, hiY});
   }

   addHitBarrierEvt(time, x, y, ballNumber, barrierId, corner) {
      this.evts.push({type: BounceMovie.cHitBarrier, time, x, y,
       ballNumber, barrierId, corner});
   }

   addHitTargetEvt(time, x, y, ballNumber, targetId, corner) {
      this.evts.push({type: BounceMovie.cHitTarget, time, x, y,
       ballNumber, targetId, corner});
   }

   addBallLaunchEvt(time, ballNumber) {
      this.evts.push(
       {type: BounceMovie.cBallLaunch, time, ballNumber});
   }

   addBallExitEvt(time, x, y, ballNumber) {
      this.evts.push({type: BounceMovie.cBallExit, time, x, y, ballNumber});
   }
}