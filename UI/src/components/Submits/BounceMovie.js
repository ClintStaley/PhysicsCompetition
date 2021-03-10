export class BounceMovie {
   const cBallPosition = 0;
   const cMakeBarrier = 1;
   const cMakeTarget = 2;
   const cHitTarget = 3;
   const cHitbarrier = 4;
   const cBallLaunch = 5;
   const cBallExit = 6;
   
   // Construct with background as indicated, and events drawn from prms and sbm
   constructor(frameRate, height, width, prms, sbm) {
      const cG = 9.80665;                  // Gravity in m/s^2
      let tracks = sbm.testResult.events;  // Should be named tracks...

      this.background = {};
      this.background.frameRate = frameRate;
      this.background.height = height;
      this.background.width = width;
      this.evts = [];

      // Targets numbered from 0
      prms.targets.forEach((trg, idx) => 
       this.addMakeTargetEvt(-1, idx, trg.loX, trg.hiX, trg.loY, trg.hiY));

      // Barriers numbered from targets.length
      prms.barriers.forEach((brr, idx) => 
       this.addMakeTargetEvt(-1, prm.targets.length+idx, brr.loX, brr.hiX,
       brr.loY, brr.hiY));

      let time = 0;
      tracks.forEach((trk, ballId) => {             // One track per ball
         trk.forEach((arc, arcId) => {              // Several arcs per track
            if (arcId == 0)                         // Launching arc
               this.addBallLaunchEvt(time, ballId);
            else if (arc.obstacleIdx >= 0) {        // If bouncing off something
               if (arc.obstacleIdx < prms.targets.length)
                  this.addHitTargetEvt(time, arc.posX, arc.posY, ballId,
                   arc.obstacleIdx)
               else
                  this.addHitBarrierEvt(time, arc.posX, arc.posY, ballId,
                   arc.obstacleIdx)
            }
            else                                       // Exit "arc"
               this.addBallExitEvt(time, arc.posX, arc.posY, ballId);
            
            // Create a sequence of ball positions, except for exit "arc"
            if (arcId < trk.length - 1) { 
               let arcDuration = trk[arcId + 1].time - time; 
               for (let arcTime = 0; arcTime < arcDuration;
                arcTime += 1.0/frameRate) {
                  let x = arc.posX + arcTime * arc.velocityX;
                  let y = arc.posY + arcTime * arc.velocityY
                   - cG*arcTime*arcTime/2;
                  this.addBallPositionEvt(time, x, y, ballId);
               }
               time += arcDuration;
            }
         });
      });
   }

   addBallPositionEvt(time, x, y, ballNumber) {
      this.evts.push({type: cBallPosition, time, x, y, ballNumber});
   }

   addMakeBarrierEvt(time, id, loX, loY, hiX, hiY) {
      this.evts.push({type: cMakeBarrier, id, loX, loY, hiX, hiY});
   }

   addMakeTargetEvt(time, id, loX, loY, hiX, hiY) {
      this.evts.push({type: cMakeTarget, time, id, loX, loY, hiX, hiY});
   }

   addHitBarrierEvt(time, x, y, ballNumber, barrierId) {
      this.evts.push({type: cHitBarrier, time, x, y, ballNumber, barrierId});
   }

   addHitTargetEvt(time, x, y, ballNumber, targetId) {
      this.evts.push({type: cHitTarget, time, x, y, ballNumber, targetId});
   }

   addBallLaunchEvt(time, ballNumber) {
      this.evts.push({type: cBallLaunch, time, ballNumber});
   }

   addBallExitEvt(time, x, y, ballNumber) {
      this.evts.push({type: cBallExit, time, x, y, ballNumber});
   }
}