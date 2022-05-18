// ReboundMovie provides background information on framerate and size of the
// overall background, plus a series of events describing changes to the scene
// such as ball movements, collisions, etc.  Events are each time stamped with
// a number of seconds since the start of the movie.

export class ReboundMovie {
   // Event types
   static cBallPosition = 0; // Change position of all balls
   static cCollision = 1;    // Noise of collision
   static cBounce = 2;       // Noise (different) of a bounce, possible marker
   static cGateOpen = 3;     // Show gate as open
   static cGateClose = 4;    // Close gate

   // Graphical standard dimensions
   static cRadius = .08;     // Ball radius
   static cChuteWidth = 1.0; // Width of left and right chutes.

   // Construct with background as indicated, and events drawn from prms and 
   // optional sbm.  (Generate only barrier/target creation events w/o sbm)
   constructor(frameRate, prms, sbm) {
      let rbns = sbm && sbm.testResult && sbm.testResult.rebounds || [];
      let arcs = sbm && sbm.testResult && sbm.testResult.launchArcs || [];
      let cnt = sbm && sbm.content;
      let balls, labels, starts = cnt && cnt.ballStarts || [];
      let rbnIdx = 0, arcIdx = 0, now = 0, currentArc = null; // State for loop
      let nextFrame = 1/frameRate, nextRbn = rbns[0], nextArc = arcs[0];
      let lastEvt, rightBall;
      let gateClose = nextArc 
       && nextArc.baseTime + ReboundMovie.cRadius / nextArc.xVlc;
      let ballChoices = prms.balls.map(w => ({weight: w, used: false}));

      starts.forEach(b => ballChoices[b.id].used = true);
      ballChoices.maxBalls = prms.maxBalls;
      balls = starts.map(b => ({speed: b.speed, x: b.pos}));
      labels = starts.map(b => ballChoices[b.id].weight);
      console.log(labels);

      this.background = {
         ballChoices,
         labels,
         frameRate,
         height: 1.5,
         chuteHeight: 1.0,
         chuteWidth: ReboundMovie.cChuteWidth,
         width: 2*ReboundMovie.cChuteWidth + (cnt && cnt.jumpLength || 2.0)
      };

      this.evts = [{time: -0.01, type: ReboundMovie.cGateClose}];
      this.addBallPositionEvt(-0.01, balls);  // Initial ball-drawing

      while (nextArc) {  // While stll more movement to show post launch
         if ((!nextRbn || nextFrame < nextRbn.time) &&  
          (!nextArc || nextFrame < nextArc.baseTime)) {
            this.adjustBalls(balls, nextFrame - now);
            now = nextFrame;
            this.addBallPositionEvt(now, balls, currentArc);
            nextFrame = now + 1/frameRate;
         }
         else if (nextRbn && nextRbn.time < nextArc.baseTime) {
            this.adjustBalls(balls, nextRbn.time - now);
            now = nextRbn.time;
            this.addBallPositionEvt(now, balls, currentArc);

            if (nextRbn.idLeft >= 0)
               balls[nextRbn.idLeft].speed = nextRbn.speedLeft;
            if (nextRbn.idLeft < balls.length-1)
               balls[nextRbn.idLeft + 1].speed = nextRbn.speedRight;
            this.addCollisionEvt(now, nextRbn.idLeft);
            
            nextRbn = rbns[++rbnIdx];
         }
         else {
            if (arcIdx === 0)              // First arc, thus launch
               balls = balls.slice(0, -1); //  so dump right ball.
            currentArc = nextArc;          //  and replace it with first arc
            
            this.adjustBalls(balls, nextArc.baseTime - now);
            now = nextArc.baseTime;
            this.addBallPositionEvt(now, balls, currentArc);

            lastEvt = this.evts[this.evts.length-1]
            rightBall = lastEvt.pos[lastEvt.pos.length-1];
            this.addBounceEvt(now, rightBall.x, rightBall.y);

            nextArc = arcs[++arcIdx];
         }
      }

      if (cnt) {
         // Add in gate opening time
         this.evts.splice(this.evts.findIndex(v => v.time >= cnt.gateTime), 0,
          {type: ReboundMovie.cGateOpen, time: cnt.gateTime});
         
         // And gate closing time
         this.evts.splice(this.evts.findIndex(v => v.time >= gateClose), 0,
          {type: ReboundMovie.cGateClose, time: gateClose});
      }
   }

   adjustBalls(balls, time) {
      balls.forEach(b => b.x += time * b.speed);
   }

   // Change position of all balls
   addBallPositionEvt(time, balls, arc) {
      let pos = balls.map(b => ({x: b.x, y: ReboundMovie.cRadius + 1.0}));

      if (arc) {
         let arcTime = time - arc.baseTime;
         pos.push({
            x: arc.xPos + arcTime * arc.xVlc,
            y: arc.yPos + arcTime * arc.yVlc + arc.g*arcTime*arcTime/2
         })
      }
      this.evts.push({type: ReboundMovie.cBallPosition, time, pos});
   }

   // Noise of collision and perhaps ball color flash for colliders.  Idx is
   // index of left collider (-1 for left wall)
   addCollisionEvt(time, idx) {
      this.evts.push({type: ReboundMovie.cCollision, time, idx});
   }

   // Noise of bounce and perhaps ball outline to show bounce location.  No
   // idx needed as only rightmost ball bounces.
   addBounceEvt(time, x, y) {
      this.evts.push({type: ReboundMovie.cBounce, time, x, y});
   }
}