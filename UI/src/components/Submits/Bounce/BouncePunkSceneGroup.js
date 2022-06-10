import {BounceMovie} from './BounceMovie';
import * as THREE from 'three';
import {steelMat, concreteMat, brickMat, flatSteelMat, goldMat,
 verticalLinedMetalMat, brassMat, scuffedMetalMat, checkerboardMat} from
 '../../Util/AsyncMaterials';
import {cloneMatPrms} from '../../Util/ImageUtil';

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
// targets, but not retracting.  Finally, the rig includes a 1.8m long brass 
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
   static gutterDepth = 2.5;     // 2.5m is enough so you can't see the bottom

   // Rig dimensions
   static cannonLength = 1.8;  // 1.5m fits in left margin
   static cannonRadius = .2;   // Outside muzzle radius at right end.
   static ballRadius = .1;     // Ball has 10cm radius, as does inner muzzle
   static rodRadius = .03;     // Steel rods and any struts supporting cannon
   static trgDepth = .1;       // Just as wide as the ball to emphasize accuracy
   static trgRing = .01;       // Ring and rod must be <= 10cm, min block height
   static wallRing = .03;      // Width of ring surrounding rods at wall
   static rigDepth = 1;        // Rig is 1m from back wall
   static rigSize = 10;        // Rig is 10 x 10 meters

   constructor(movie) {
      const rigDepth = BouncePunkSceneGroup.rigDepth;

      this.movie = movie;
      this.topGroup = new THREE.Group(); // Holds pending material promises
      this.pendingPromises = [];
      this.room = this.makeRoom();       // Room and gutter
      this.rig = this.makeRig();
      this.targets = [];                 // Targets already hit
      this.evtIdx = -1;                  // Event index currently displayed

      this.topGroup.add(this.room);
      this.rig.position.set(2, 0, rigDepth);
      this.topGroup.add(this.rig);
      // this.setOffset(0);  // CAS FIX: Delete lines like this unless you're only temporarily commenting them out.

   }

// CAS FIx: This needs to be several smaller functions.  Group the room creation
// in natural ways (e.g. gutter, walls, floor) and make each its own function.
// Function breakup is partly about DRY, but also about "phrasing" or "chapters"
// that permit easier comprehension of the code.
   makeRoom() {
      const roomWidth = BouncePunkSceneGroup.roomWidth;
      const roomHeight = BouncePunkSceneGroup.roomHeight;
      const roomDepth = BouncePunkSceneGroup.roomDepth;
      const floorHeight = BouncePunkSceneGroup.floorHeight;
      const gutterWidth = BouncePunkSceneGroup.gutterWidth;
      const gutterDepth = BouncePunkSceneGroup.gutterDepth;
      const rigDepth = BouncePunkSceneGroup.rigDepth;

      // Create group to house room components
      const roomGroup = new THREE.Group();
      roomGroup.name = 'roomGroup';

      // Create back wall
      const backWall = this.createPlaneElement(
       'backWall', roomGroup, {
          width: roomWidth, 
          height: roomHeight
       }, brickMat);
      backWall.position.set(roomWidth / 2, roomHeight / 2, 0);
      backWall.receiveShadow = true;

      // Create roof
      const roof = this.createPlaneElement(
       'roof', roomGroup, {
          width: roomWidth, 
          height: roomDepth
       }, concreteMat);
      roof.rotateX(Math.PI / 2);
      roof.position.set(roomWidth / 2, roomHeight, roomDepth / 2);
      
      // Floor group
      const floorGroup = new THREE.Group();
      floorGroup.name = 'floorGroup';

      // Wooden floor boards
      const backFloorTop = this.createPlaneElement(
       'backFloorTop', floorGroup, {
          width: roomWidth,
          height: rigDepth - gutterWidth / 2
       }, concreteMat);
      backFloorTop.rotateX(-Math.PI / 2);
      backFloorTop.position.set(
       roomWidth / 2, 0, (rigDepth - gutterWidth / 2) / 2);

      const backFloorSide = this.createPlaneElement(
       'backFloorSide', floorGroup, {
          width: roomWidth,
          height: floorHeight
       }, concreteMat);
      backFloorSide.position.set(
       roomWidth / 2, -floorHeight / 2, rigDepth - gutterWidth / 2);

      const frontFloorTop = this.createPlaneElement(
       'frontFloorTop', floorGroup, {
          width: roomWidth,
          height: roomDepth - (rigDepth + gutterWidth / 2),
       }, concreteMat);
      frontFloorTop.rotateX(-Math.PI / 2);
      frontFloorTop.position.set(
       roomWidth / 2, 0, (roomDepth + rigDepth + gutterWidth / 2) / 2);

      const frontFloorSide = this.createPlaneElement(
       'frontFloorSide', floorGroup, {
          width: roomWidth,
          height: floorHeight
       }, concreteMat);
      frontFloorSide.position.set(
       roomWidth / 2, -floorHeight / 2, rigDepth + gutterWidth / 2);

      // Side walls group
      const sideWallsGroup = new THREE.Group();
      sideWallsGroup.name = 'sideWallsGroup';

      // Back side walls
      const leftBackSideWall = this.createPlaneElement(
       'leftBackSideWall', sideWallsGroup, {
          width: rigDepth - gutterWidth / 2,
          height: roomHeight
       }, brickMat);
      leftBackSideWall.rotateY(Math.PI / 2);
      leftBackSideWall.position.set(
       0, roomHeight / 2, (rigDepth - gutterWidth / 2) / 2);

      const rightBackSideWall = this.createPlaneElement(
       'rightBackSideWall', sideWallsGroup, {
          width: rigDepth - gutterWidth / 2,
          height: roomHeight
       }, brickMat);
      rightBackSideWall.rotateY(-Math.PI / 2);
      rightBackSideWall.position.set(
       roomWidth, roomHeight / 2, (rigDepth - gutterWidth / 2) / 2);

      // Front side walls
      const leftFrontSideWall = this.createPlaneElement(
       'leftFrontSideWall', sideWallsGroup, {
          width: roomDepth - (rigDepth + gutterWidth / 2),
          height: roomHeight
       }, brickMat);
      leftFrontSideWall.rotateY(Math.PI / 2);
      leftFrontSideWall.position.set(
       0, roomHeight / 2, (roomDepth + rigDepth + gutterWidth / 2) / 2);

      const rightFrontSideWall = this.createPlaneElement(
       'rightFrontSideWall', sideWallsGroup, {
          width: roomDepth - (rigDepth + gutterWidth / 2),
          height: roomHeight
       }, brickMat);
      rightFrontSideWall.rotateY(-Math.PI / 2);
      rightFrontSideWall.position.set(
       roomWidth, roomHeight / 2, (roomDepth + rigDepth + gutterWidth / 2) / 2);

      // Gutter group
      const gutterGroup = new THREE.Group();
      gutterGroup.name = 'gutterGroup';

      // Gutter walls
      const bottomGutterBack = this.createPlaneElement(
       'bottomGutterBack', gutterGroup, {
          width: roomWidth, 
          height: gutterDepth - floorHeight
       }, brickMat);
      bottomGutterBack.position.set(
       roomWidth / 2, - (gutterDepth + floorHeight) / 2,
       rigDepth - gutterWidth / 2);

      const bottomGutterFront = this.createPlaneElement(
       'bottomGutterFront', gutterGroup, {
          width: roomWidth,
          height: gutterDepth - floorHeight
       }, brickMat);
      bottomGutterFront.position.set(
       roomWidth / 2, - (gutterDepth + floorHeight) / 2,
       rigDepth + gutterWidth / 2);

      const leftGutterBack = this.createPlaneElement(
       'leftGutterBack', gutterGroup, {
          width: gutterDepth,
          height: roomHeight + gutterDepth
       }, brickMat);
      leftGutterBack.position.set(
       -gutterDepth / 2, (roomHeight - gutterDepth) / 2,
       rigDepth - gutterWidth / 2);

      const rightGutterBack = this.createPlaneElement(
       'rightGutterBack', gutterGroup, {
          width: gutterDepth,
          height: roomHeight + gutterDepth
       }, brickMat);
      rightGutterBack.position.set(
       roomWidth + gutterDepth / 2, (roomHeight - gutterDepth) / 2,
       rigDepth - gutterWidth / 2);

      const leftGutterFront = this.createPlaneElement(
       'leftGutterFront', gutterGroup, {
          width: gutterDepth,
          height: roomHeight + gutterDepth
       }, brickMat);
      leftGutterFront.position.set(
       -gutterDepth / 2, (roomHeight - gutterDepth) / 2, 
       rigDepth + gutterWidth / 2);

      const rightGutterFront = this.createPlaneElement(
       'rightGutterFront', gutterGroup, {
          width: gutterDepth,
          height: roomHeight + gutterDepth
       }, brickMat);
      rightGutterFront.position.set(
       roomWidth + gutterDepth / 2, (roomHeight - gutterDepth) / 2, 
       rigDepth + gutterWidth / 2);

      const leftGutterRoof = this.createPlaneElement(
       'leftGutterRoof', gutterGroup, {
          width: gutterDepth,
          height: gutterWidth
       }, concreteMat);
      leftGutterRoof.rotateX(Math.PI / 2);
      leftGutterRoof.position.set(
       -gutterDepth / 2, roomHeight, rigDepth);

      const rightGutterRoof = this.createPlaneElement(
       'rightGutterRoof', gutterGroup, {
          width: gutterDepth,
          height: gutterWidth
       }, concreteMat);
      rightGutterRoof.rotateX(Math.PI / 2);
      rightGutterRoof.position.set(
       roomWidth + gutterDepth / 2, roomHeight, rigDepth);

      // Add groups to room group
      roomGroup.add(floorGroup);
      roomGroup.add(sideWallsGroup);
      roomGroup.add(gutterGroup);

      return roomGroup;
   }

   createPlaneElement(name, parent, dims, matPrms, offset) {
      const plane = new THREE.Mesh(
       new THREE.PlaneGeometry(dims.width, dims.height),
       new THREE.MeshStandardMaterial(matPrms.fast));
      plane.name = name;
      // plane.castShadow = true;  CAS FIX See comment above about scrap comments
      // plane.receiveShadow = true;
      parent.add(plane);

      // this.pendingPromises.push(matPrms.slow.then(prms => {
      //    const desiredRep = {
      //       x: dims.width,
      //       y: dims.height
      //    }

      //    plane.material = new THREE.MeshStandardMaterial(
      //     cloneMatPrms(prms, desiredRep, offset));
      // }));

      this.updateLoadedTexture(matPrms, plane, dims, offset);

      return plane;
   }

   updateLoadedTexture(matPrms, object, dims, offset) {
      this.pendingPromises.push(matPrms.slow.then(prms => {
         const desiredRep = {
            x: dims.width,
            y: dims.height
         }

         object.material = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, desiredRep, offset));
      }));
   }

   // CAS FIX: Same comment as for makeRoom.  This will need to be several
   // functions.
   makeRig() {
      // CAS, I believe this can work:
      // const {cannonLength, cannonRadius, ballRadius, ...} = BouncePunkSceneGroup
      // At least try it. 
      const cannonLength = BouncePunkSceneGroup.cannonLength;
      const cannonRadius = BouncePunkSceneGroup.cannonRadius;
      const ballRadius = BouncePunkSceneGroup.ballRadius;
      const rodRadius = BouncePunkSceneGroup.rodRadius;
      const trgDepth = BouncePunkSceneGroup.trgDepth;
      const trgRing = BouncePunkSceneGroup.trgRing;
      const wallRing = BouncePunkSceneGroup.wallRing;
      const rigDepth = BouncePunkSceneGroup.rigDepth;
      const rigSize = BouncePunkSceneGroup.rigSize;

      const rigGroup = new THREE.Group();
      rigGroup.name = 'rig';

      // Test target
      const testTargetGroup = new THREE.Group();
      const testTarget = new THREE.Mesh(
       new THREE.BoxGeometry(0.1, 0.1, ballRadius),
       new THREE.MeshStandardMaterial(brassMat.fast));
      testTarget.name = 'testTarget';
      testTargetGroup.add(testTarget);
      testTarget.position.set(rigSize / 2.3, rigSize / 2, 0);
      testTarget.castShadow = true;

      this.pendingPromises.push(brassMat.slow.then(prms => {
         testTarget.material = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, {
             x: 0.1,
             y: 0.1
          }));
      }));

      // this.updateLoadedTexture(brassMat, testTarget, {x: 0.1, y: 0.1});

      const testTargetRod = new THREE.Mesh(
       new THREE.CylinderGeometry(rodRadius, rodRadius, rigDepth, 16),
       new THREE.MeshStandardMaterial(scuffedMetalMat.fast));
      testTargetRod.name = 'testTargetRod';
      testTargetGroup.add(testTargetRod);
      testTargetRod.rotateX(Math.PI / 2);
      testTargetRod.position.set(rigSize / 2.3, rigSize / 2, -rigDepth / 2);
      testTargetRod.castShadow = true;
      // testTargetRod.receiveShadow = true;

      this.pendingPromises.push(scuffedMetalMat.slow.then(prms => {
         testTargetRod.material = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms));
      }));

      rigGroup.add(testTargetGroup);

      const wallRingPoints = [];
      wallRingPoints.push(new THREE.Vector2(rodRadius, 0));
      wallRingPoints.push(new THREE.Vector2(rodRadius, 0.02));
      wallRingPoints.push(new THREE.Vector2(rodRadius + 0.005, 0.025));
      wallRingPoints.push(new THREE.Vector2(
       rodRadius + wallRing - 0.005, 0.025));
      wallRingPoints.push(new THREE.Vector2(rodRadius + wallRing, 0.02));
      wallRingPoints.push(new THREE.Vector2(rodRadius + wallRing, 0));

      const testTargetWallRing = new THREE.Mesh(
       new THREE.LatheGeometry(wallRingPoints, 32),
       new THREE.MeshStandardMaterial(flatSteelMat.fast));
      testTargetWallRing.name = 'testTargetWallRing';
      testTargetGroup.add(testTargetWallRing);
      testTargetWallRing.rotateX(Math.PI / 2);
      testTargetWallRing.position.set(
       rigSize / 2.3, rigSize / 2, -rigDepth);
      testTargetWallRing.receiveShadow = true;

      const trgRingPoints = [];
      trgRingPoints.push(new THREE.Vector2(rodRadius, 0));
      trgRingPoints.push(new THREE.Vector2(rodRadius + 0.005, 0.005));
      trgRingPoints.push(new THREE.Vector2(rodRadius + trgRing, 0));
      const testTargetTrgRing = new THREE.Mesh(
       new THREE.LatheGeometry(trgRingPoints, 32),
       new THREE.MeshStandardMaterial(flatSteelMat.fast));
      testTargetTrgRing.name = 'testTargetTrgRing';
      testTargetGroup.add(testTargetTrgRing);
      testTargetTrgRing.rotateX(-Math.PI / 2);
      testTargetTrgRing.position.set(rigSize / 2.3, rigSize / 2, -0.05);
      testTargetTrgRing.receiveShadow = true;

      const cannonGroup = new THREE.Group();
      cannonGroup.name = 'cannon';
      rigGroup.add(cannonGroup);

      // Make cannon

      const cannonPoints = [];
      const segments = 128;

      // Inside end of barrel
      this.generateCannonArcPoints(
       cannonPoints, ballRadius,
       {
          x: 0,
          y: cannonLength - 0.2
       },
       {
          start: Math.PI / 2,          // Starts at 0, cannonLength - 0.1
          end: 0,                      // Ends at ballRadius, cannonLength - 0.2
          incr: -Math.PI / 16
       });

      // Inner curve of front of muzzle
      this.generateCannonArcPoints(
       cannonPoints, 0.02,
       {
          x: ballRadius + 0.02,
          y: 0.02
       },
       {
          start: - Math.PI,            // Starts at ballRadius, 0.02
          end: - Math.PI / 2,          // Ends at ballRadius + 0.02, 0
          incr: Math.PI / 16
       });

      // Outer curve of front of muzzle
      this.generateCannonArcPoints(
       cannonPoints, 0.02,
       {
          x: cannonRadius - 0.07,
          y: 0.02
       },
       {
          start: - Math.PI / 2,        // Starts at cannonRadius - 0.07, 0
          end: 0,                      // Ends at cannonRadius - 0.05, 0.02
          incr: Math.PI / 16
       });

      // Curve of side of muzzle
      this.generateCannonArcPoints(
       cannonPoints, 0.05,
       {
          x: cannonRadius - 0.015,
          y: 0.08
       },
       {
          start: - 3 * Math.PI / 4,    // Starts at ~cannonRadius - 0.05, 
          end: - 5.01 * Math.PI / 4,   // Ends at ~cannonRadius - 0.05, 
          incr: -Math.PI / 16
       });

      // Curve of back of muzzle
      this.generateCannonArcPoints(
       cannonPoints, 0.02,
       {
          x: cannonRadius - 0.07,
          y: 0.14
       },
       {
          start: 0,                    // Starts at cannonRadius - 0.05, 0.14
          end: Math.PI / 2,            // Ends at cannonRadius - 0.07, 0.16
          incr: Math.PI / 16
       });

      // Curve of back of cannon
      this.generateCannonArcPoints(
       cannonPoints, cannonRadius,
       {
          x: 0,
          y: cannonLength - cannonRadius
       },
       {
          start: 0,
          end: Math.PI / 2,
          incr: Math.PI / 16
       });

      const cannon = new THREE.Mesh(
         new THREE.LatheGeometry(cannonPoints, segments),
         new THREE.MeshStandardMaterial(brassMat.fast));
      cannon.name = 'cannon';
      cannonGroup.add(cannon);
      cannon.rotateZ(Math.PI / 2);
      cannon.position.set(0, rigSize, 0);

      const testLathe = new THREE.Mesh(
       new THREE.LatheGeometry([
          new THREE.Vector2(1, 0),
          new THREE.Vector2(1, 1),
          new THREE.Vector2(1, 5)
       ], 4),
       new THREE.MeshStandardMaterial(brassMat.fast));
      testLathe.name = 'testLathe';
      cannonGroup.add(testLathe);

      this.pendingPromises.push(checkerboardMat.slow.then(prms => {
         testLathe.material = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, {
             x: 1,
             y: 1
          }));
      }));

      // The cannon's uv mapping will be weird, as it assumes all segments
      // are the same length. So, we need to change these uv values to reflect
      // the actual length of each segment.
      // CAS FIX: And this could be a "fixUVs" function.

      // Go through points array and calculate total length of curve
      let totalLength = 0;
      for (let i = 0; i < cannonPoints.length - 1; i++) {
         const p1 = cannonPoints[i];
         const p2 = cannonPoints[i + 1];
         totalLength += Math.sqrt(
          (p2.x - p1.x) * (p2.x - p1.x) +
          (p2.y - p1.y) * (p2.y - p1.y));
      }

      // Go through Uvs and scale them to total length
      // Copy array of uvs
      let uvArray = cannon.geometry.getAttribute('uv').array;
      // cycle through uv array and change each v value
      for (let i = 0; i < segments + 1; i++) {
         // Variable to save length from start of curve to current point
         let lengthFromStart = 0;
         for (let j = 0; j < cannonPoints.length - 1; j++) {
            const vValue = 2 * (i * cannonPoints.length + j) + 1;
            // Constant to save percentage of length from start of curve
            const lengthPercent = lengthFromStart / totalLength;
            uvArray[vValue] = lengthPercent;
            const p1 = cannonPoints[j];
            const p2 = cannonPoints[j + 1];
            lengthFromStart += Math.sqrt(
             (p2.x - p1.x) * (p2.x - p1.x) +
             (p2.y - p1.y) * (p2.y - p1.y));
         }
      }

      // Set uv array to new array
      cannon.geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));

      // Length of texture already calculated, so calculate width
      const textureWidth = 2 * Math.PI * cannonRadius;


      this.pendingPromises.push(brassMat.slow.then(prms => {
         cannon.material = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, {
             x: textureWidth,
             y: totalLength
          }));
      }));














      return rigGroup;

      // let base = new THREE.Mesh(new THREE.BoxGeometry(rigSize, rigSize,
      //    2 * ballRadius), steelMat)
      // base.position.set(rigSize / 2, rigSize / 2, -ballRadius);
      // this.rig.add(base);
      // let platform = new THREE.Mesh(new THREE.BoxGeometry(1, .25, 1),
      //    flatSteelMat);
      // this.ball = new THREE.Mesh(new THREE.SphereGeometry
      //    (ballRadius, ballSteps, ballSteps), flatSteelMat);

      // // Put ball at upper left corner of rig, just touching the base.
      // this.ball.position.set(0, rigSize, 2 * ballRadius);
      // this.ball.castShadow = true;
      // this.rig.add(this.ball);

      // // Put platform at upper left corner of rig, just below the ball
      // platform.position.set(-.5, rigSize - .25, 0);
      // platform.castshadow = true;
      // this.rig.add(platform);

      // // Put rig at back of room.  Assume room origin at center of back wall
      // this.rig.position.set(-rigSize / 2, -rigSize / 2, 2 * ballRadius);
   }

   makeCannonLatheParts(name, parent, points, matPrms) {
      const rigSize = BouncePunkSceneGroup.rigSize;
      const part = new THREE.Mesh(
         new THREE.LatheGeometry(points, 32),
         new THREE.MeshStandardMaterial(matPrms.fast));
      part.name = name;
      parent.add(part);
      part.rotateZ(Math.PI / 2);
      part.position.set(0, rigSize, 0);
  
      this.pendingPromises.push(matPrms.slow.then(prms => {
         part.material = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, {
             x: 1,
             y: 1
          }));
      }));

      return part;
   }

   generateCannonArcPoints(points, radius, center, angle) {
      if (angle.incr < 0) {
         for (let i = angle.start; i >= angle.end; i += angle.incr) {
            const x = center.x + radius * Math.cos(i);
            const y = center.y + radius * Math.sin(i);
            points.push(new THREE.Vector2(x, y));
         }
      } else {
         for (let i = angle.start; i <= angle.end; i += angle.incr) {
            const x = center.x + radius * Math.cos(i);
            const y = center.y + radius * Math.sin(i);
            points.push(new THREE.Vector2(x, y));
         }
      }
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

   getPendingPromises() {
      return this.pendingPromises;
   }
}