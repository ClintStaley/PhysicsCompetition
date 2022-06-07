import {BounceMovie} from './BounceMovie';
import * as THREE from 'three';
import {concreteMat, flatSteelMat, steelMat} from '../../Util/Materials.js';
import {brickMat} from '../../Util/AsyncMaterials';

// Create a Group with the following elements:
//
// A room with a coarse oak floor, brick walls, plaster ceiling, of dimensions
// adequate to accommodate a 10m x 10m rig with reasonable margins (see
// constants)
//
// A rig at back of room, a little in from from back wall.  This includes a
// wide slot in the 
// floor and up both walls of the room, centered on the rig, into which 
// mis-fired balls may fall.  The sides of slot are of the same brick as the
// wals, with the wood floor perhaps 10cm thick.  The rig also has brass
// targets, extended from the back wall by steel rods, with a "collar" at 
// attachment to target, and a ring at wall in which rod "slides". Targets 
// extend from back wall to the center of the rig, and retract back to wall 
// when hit. The rig has black enamel obstacles, extended on steel rods like 
// targets, but not retracting.  Finally, the rig includes a meter long brass 
// cannon that fires balls; its muzzle is centered at top left of rig,
// 10m above floor
//
// Center of the top-level group is at lower-left corner of rig, at depth
// centered on the rig's "gutter".  This is the (0,0) location of the Bounce 
// problem itself.
// 
// Center of the room is at the bottom left corner

export class BouncePunkSceneGroup {
   // Room and gutter dimensions
   static roomHeight = 12;     // 12m tall, rig reaches up to 10m
   static roomWidth = 14;      // 2m extra on either side of rig
   static roomDepth = 5;       // Don't need a lot of depth
   static floorHeight = .05;   // 5cm thick wood on floor
   static gutterWidth = .75;   // Rig gutter is 75cm wide
   static gutterDepth = 2;     // 2m is enough so you can't see the bottom

   // Rig dimensions
   static cannonLength = 1.5;  // 1.5m fits in left margin
   static cannonDiameter = .2; // Outside muzzle diameter at right end.
   static ballRadius = .1;     // Ball has 10cm radius, as does inner muzzle
   static rodDiameter = .08;   // Steel rods and any struts supporting cannon
   static trgDepth = .1;       // Just as wide as the ball to emphasize accuracy
   static trgRing = .01;       // Ring and rod must be <= 10cm, min block height
   static wallRing = .04;      // Width of ring surrounding rods at wall
   static rigDepth = 1;        // Rig is 1m from back wall
   static rigSize = 10;        // Rig is 10 x 10 meters

   constructor(movie) {
      this.movie = movie;
      this.topGroup = new THREE.Group();
      this.room = this.makeRoom();       // Room and gutter
      // this.rig = this.makeRig();
      this.targets = [];                 // Targets already hit
      this.evtIdx = -1;                  // Event index currently displayed

      this.topGroup.add(this.room);
      // this.topGroup.add(this.rig);
      // this.setOffset(0);

   }

   makeRoom() {
      const roomWidth = BouncePunkSceneGroup.roomWidth;
      const roomHeight = BouncePunkSceneGroup.roomHeight;
      const roomDepth = BouncePunkSceneGroup.roomDepth;
      const floorHeight = BouncePunkSceneGroup.floorHeight;
      const gutterWidth = BouncePunkSceneGroup.gutterWidth;
      const gutterDepth = BouncePunkSceneGroup.gutterDepth;
      const rigDepth = BouncePunkSceneGroup.rigDepth;

      // // Create standard room with center of far wall at origin
      // let roomDim = 3 * rigSize + 2;  // big boundaries around rig
      // this.room = new THREE.Mesh(
      //    new THREE.BoxGeometry(roomDim, roomDim, roomDim), [concreteMat,
      //    concreteMat, concreteMat, flatSteelMat, concreteMat, concreteMat]);
      // this.room.position.set(0, 0, 9);
      // this.room.name = 'room';
      // this.topGroup.add(this.room);

      // Create group to house room components
      const roomGroup = new THREE.Group();
      roomGroup.name = 'roomGroup';

      // Create back wall
      const backWall = new THREE.Mesh(
       new THREE.PlaneGeometry(roomWidth, roomHeight), concreteMat);
      backWall.name = 'backWall';
      backWall.position.set(roomWidth / 2, roomHeight / 2);
      roomGroup.add(backWall);
      
      // Create roof
      const roof = new THREE.Mesh(
       new THREE.PlaneGeometry(roomWidth, roomDepth), concreteMat);
      roof.name = 'roof';
      roof.rotateX(Math.PI / 2);
      roof.position.set(roomWidth / 2, roomHeight, roomDepth / 2);
      roomGroup.add(roof);
      
      // Create floor group
      const floorGroup = new THREE.Group();

      // Create back floor group
      const backFloorGroup = new THREE.Group();

      const backFloorTop = new THREE.Mesh(
       new THREE.PlaneGeometry(roomWidth, rigDepth), flatSteelMat);
      backFloorTop.name = 'backFloorTop';
      backFloorTop.rotateX(-Math.PI / 2);
      backFloorTop.position.set(roomWidth / 2, 0, rigDepth / 2);
      backFloorGroup.add(backFloorTop);

      const backFloorSideTop = new THREE.Mesh(
       new THREE.PlaneGeometry(roomWidth, floorHeight), flatSteelMat);
      backFloorSideTop.name = 'backFloorSideTop';
      backFloorSideTop.position.set(roomWidth / 2, -floorHeight / 2, rigDepth);
      backFloorGroup.add(backFloorSideTop);

      const backFloorSideSide = new THREE.Mesh(
       new THREE.PlaneGeometry(roomWidth, gutterDepth), concreteMat);
      backFloorSideSide.name = 'backFloorSideSide';
      backFloorSideSide.position.set(roomWidth / 2, -gutterDepth / 2 - floorHeight, rigDepth);
      backFloorGroup.add(backFloorSideSide);

      // Create front floor group
      const frontFloorGroup = new THREE.Group();

      const frontFloorTop = new THREE.Mesh(
       new THREE.PlaneGeometry(roomWidth, roomDepth - (rigDepth + gutterWidth)), flatSteelMat);
      frontFloorTop.name = 'frontFloorTop';
      frontFloorTop.rotateX(-Math.PI / 2);
      frontFloorTop.position.set(roomWidth / 2, 0, (roomDepth + rigDepth + gutterWidth) / 2);
      frontFloorGroup.add(frontFloorTop);

      const frontFloorSideTop = new THREE.Mesh(
       new THREE.PlaneGeometry(roomWidth, floorHeight), flatSteelMat);
      frontFloorSideTop.name = 'frontFloorSideTop';
      frontFloorSideTop.position.set(roomWidth / 2, -floorHeight / 2, rigDepth + gutterWidth);
      frontFloorGroup.add(frontFloorSideTop);
      
      const frontFloorSideSide = new THREE.Mesh(
       new THREE.PlaneGeometry(roomWidth, gutterDepth), concreteMat);
      frontFloorSideSide.name = 'frontFloorSideSide';
      frontFloorSideSide.position.set(roomWidth / 2, -gutterDepth / 2 - floorHeight, rigDepth + gutterWidth);
      frontFloorGroup.add(frontFloorSideSide);

      // // Add floor sections to floor group
      floorGroup.add(backFloorGroup);
      floorGroup.add(frontFloorGroup);

      roomGroup.add(floorGroup);

      return roomGroup;
   }

   makeRig() {
      this.rig = new THREE.Group();
      let base = new THREE.Mesh(new THREE.BoxGeometry(rigSize, rigSize,
         2 * ballRadius), steelMat)
      base.position.set(rigSize / 2, rigSize / 2, -ballRadius);
      this.rig.add(base);
      let platform = new THREE.Mesh(new THREE.BoxGeometry(1, .25, 1),
         flatSteelMat);
      this.ball = new THREE.Mesh(new THREE.SphereGeometry
         (ballRadius, ballSteps, ballSteps), flatSteelMat);

      // Put ball at upper left corner of rig, just touching the base.
      this.ball.position.set(0, rigSize, 2 * ballRadius);
      this.ball.castShadow = true;
      this.rig.add(this.ball);

      // Put platform at upper left corner of rig, just below the ball
      platform.position.set(-.5, rigSize - .25, 0);
      platform.castshadow = true;
      this.rig.add(platform);

      // Put rig at back of room.  Assume room origin at center of back wall
      this.rig.position.set(-rigSize / 2, -rigSize / 2, 2 * ballRadius);
   }

   // Adjust the scenegraph to reflect time.  This may require either forward
   // or backward movement in time.
   setOffset(timeStamp) {
      const ballRadius = BounceSceneGroup.ballRadius;
      const rigSize = BounceSceneGroup.rigSize;
      let evts = this.movie.evts;
      let evt;
      let pCyl = this.topGroup.getObjectByName('pCyl', true);

      // While the event after evtIdx exists and needs adding to 3DElms
      while (this.evtIdx + 1 < evts.length
         && evts[this.evtIdx + 1].time <= timeStamp) {
         evt = evts[++this.evtIdx];
         if (evt.type === BounceMovie.cMakeBarrier
            || evt.type === BounceMovie.cMakeTarget) {
            // Add the indicated barrier to the scene
            let width = evt.hiX - evt.loX;
            let height = evt.hiY - evt.loY;
            let obj = new THREE.Mesh(new THREE.BoxGeometry(width, height,
               6 * ballRadius), flatSteelMat);

            obj.position.set(evt.loX + width / 2, evt.loY + height / 2,
               3 * ballRadius);
            this.rig.add(obj);
            if (evt.type === BounceMovie.cMakeTarget) {
               this.targets[evt.id] = obj;
            }
         }
         else if (evt.type === BounceMovie.cBallPosition
            || evt.type === BounceMovie.cHitBarrier
            || evt.type === BounceMovie.cHitTarget) {
            this.ball.position.set(evt.x, evt.y, ballRadius);
         }
         if (evt.type === BounceMovie.cTargetFade) {
            this.targets[evt.targetId].position.z
               = 3 * ballRadius * (1 - evt.fadeLevel);
         }
         else if (evt.type === BounceMovie.cBallExit) {
            this.ball.position.set(0, rigSize, ballRadius);
         }
         else if (evt.type === BounceMovie.cBallLaunch) {
            // Make launcher fire by moving piston
            pCyl.position.set(.4, 0, 0);
            // Delayed animation to retract piston.
            setTimeout(() => {
               pCyl.position.set(0, 0, 0);
            }, 300);
         }
      }

      // Undo events to move backward in time. (Note that this and the prior
      // while condition are mutually exclusive.) Assume that barrier and
      // target creation occur at negative time and thus will not be "backed
      // over"
      while (this.evtIdx > 0 && timeStamp < evts[this.evtIdx].time) {
         evt = evts[this.evtIdx--];

         if (evt.type === BounceMovie.cBallPosition
            || evt.type === BounceMovie.cHitBarrier
            || evt.type === BounceMovie.cHitTarget) {
            this.ball.position.set(evt.x, evt.y, ballRadius);
         }
         if (evt.type === BounceMovie.cTargetFade) {
            this.targets[evt.targetId].position.z     // Move target to current
               = 3 * ballRadius * (1 - evt.fadeLevel);  // fade position
         }
         if (evt.type === BounceMovie.cBallLaunch)
            this.ball.position.set(0, rigSize, ballRadius);
      }
   }

   // Return root group of scenegraph represented by this class
   getSceneGroup() {
      return this.topGroup;
   }
}