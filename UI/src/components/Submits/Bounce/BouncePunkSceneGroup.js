import {BounceMovie} from './BounceMovie';
import * as THREE from 'three';
import {brickMat, flatSteelMat, plasterMat, scratchedPlasticMat,
 streakyPlasticMat, brassMat, scuffedMetalMat, olderWoodFloorMat} from
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
   static trgDepth = .2;       // Just as wide as the ball to emphasize accuracy
   static trgRing = .01;       // Ring and rod must be <= 10cm, min block height
   static wallRing = .03;      // Width of ring surrounding rods at wall
   static rigDepth = 1;        // Rig is 1m from back wall
   static rigSize = 10;        // Rig is 10 x 10 meters
   static latheSegments = 128;

   constructor(movie) {
      const rigDepth = BouncePunkSceneGroup.rigDepth;

      console.log(movie);

      this.movie = movie;
      this.topGroup = new THREE.Group(); // Holds pending material promises
      this.pendingPromises = [];
      this.room = this.makeRoom();       // Room and gutter
      this.rig = this.makeRig();         // Rig, with ball, cannon and targets
      this.obstacles = [];                 // Targets already hit
      this.evtIdx = -1;                  // Event index currently displayed

      this.topGroup.add(this.room);
      this.rig.position.set(2, 0, rigDepth);
      this.topGroup.add(this.rig);
      this.setOffset(-0.01);

   }

   makeRoom() {
      const {roomHeight, roomWidth, roomDepth, floorHeight, gutterWidth,
       gutterDepth, rigDepth} = BouncePunkSceneGroup;

      // Create group to house room components
      const roomGroup = new THREE.Group();
      roomGroup.name = 'roomGroup';

      // Create wall sections
      this.makeWalls(roomGroup, brickMat);

      // Create roof
      const roof = this.createPlaneElement(
       'roof', roomGroup, {
          width: roomWidth, 
          height: roomDepth
       }, plasterMat);
      roof.rotateX(Math.PI / 2);
      roof.position.set(roomWidth / 2, roomHeight, roomDepth / 2);

      // Create floor sections
      this.makeFloor(roomGroup, olderWoodFloorMat);

      // Create gutter sections
      this.makeGutter(roomGroup, brickMat, plasterMat);

      return roomGroup;
   }

   makeWalls(roomGroup, wallMat) {
      const {roomHeight, roomWidth, roomDepth, floorHeight, gutterWidth,
       gutterDepth, rigDepth} = BouncePunkSceneGroup;

      // Create walls group
      const wallsGroup = new THREE.Group();
      wallsGroup.name = 'wallsGroup';

      // Back wall
      const backWall = this.createPlaneElement(
       'backWall', wallsGroup, {
          width: roomWidth, 
          height: roomHeight
       }, wallMat);
      backWall.position.set(roomWidth / 2, roomHeight / 2, 0);
      backWall.receiveShadow = true;

      // Left walls
      const leftBackSideWall = this.createPlaneElement(
       'leftBackSideWall', wallsGroup, {
          width: rigDepth - gutterWidth / 2,
          height: roomHeight
       }, wallMat);
      leftBackSideWall.rotateY(Math.PI / 2);
      leftBackSideWall.position.set(
       0, roomHeight / 2, (rigDepth - gutterWidth / 2) / 2);

      const leftFrontSideWall = this.createPlaneElement(
       'leftFrontSideWall', wallsGroup, {
          width: roomDepth - (rigDepth + gutterWidth / 2),
          height: roomHeight
       }, wallMat);
      leftFrontSideWall.rotateY(Math.PI / 2);
      leftFrontSideWall.position.set(
       0, roomHeight / 2, (roomDepth + rigDepth + gutterWidth / 2) / 2);

      // Right walls
      const rightBackSideWall = this.createPlaneElement(
       'rightBackSideWall', wallsGroup, {
          width: rigDepth - gutterWidth / 2,
          height: roomHeight
       }, wallMat);
      rightBackSideWall.rotateY(-Math.PI / 2);
      rightBackSideWall.position.set(
       roomWidth, roomHeight / 2, (rigDepth - gutterWidth / 2) / 2);

      const rightFrontSideWall = this.createPlaneElement(
       'rightFrontSideWall', wallsGroup, {
          width: roomDepth - (rigDepth + gutterWidth / 2),
          height: roomHeight
       }, brickMat);
      rightFrontSideWall.rotateY(-Math.PI / 2);
      rightFrontSideWall.position.set(
       roomWidth, roomHeight / 2, (roomDepth + rigDepth + gutterWidth / 2) / 2);

      // Add walls group to room group
      roomGroup.add(wallsGroup);
   }

   makeFloor(roomGroup, floorMat) {
      const {roomWidth, roomDepth, floorHeight, gutterWidth, rigDepth}
       = BouncePunkSceneGroup;

      // Create roof group
      const floorGroup = new THREE.Group();
      floorGroup.name = 'floorGroup';

      const backFloorTop = this.createPlaneElement(
       'backFloorTop', floorGroup, {
          width: roomWidth,
          height: rigDepth - gutterWidth / 2
       }, floorMat);
      backFloorTop.rotateX(-Math.PI / 2);
      backFloorTop.position.set(
       roomWidth / 2, 0, (rigDepth - gutterWidth / 2) / 2);

      const backFloorSide = this.createPlaneElement(
       'backFloorSide', floorGroup, {
          width: roomWidth,
          height: floorHeight
       }, floorMat);
      backFloorSide.position.set(
       roomWidth / 2, -floorHeight / 2, rigDepth - gutterWidth / 2);

      const frontFloorTop = this.createPlaneElement(
       'frontFloorTop', floorGroup, {
          width: roomWidth,
          height: roomDepth - (rigDepth + gutterWidth / 2),
       }, floorMat);
      frontFloorTop.rotateX(-Math.PI / 2);
      frontFloorTop.position.set(
       roomWidth / 2, 0, (roomDepth + rigDepth + gutterWidth / 2) / 2);

      const frontFloorSide = this.createPlaneElement(
       'frontFloorSide', floorGroup, {
          width: roomWidth,
          height: floorHeight
       }, floorMat);
      frontFloorSide.position.set(
       roomWidth / 2, -floorHeight / 2, rigDepth + gutterWidth / 2);

      // Add floor group to room group
      roomGroup.add(floorGroup);
   }

   makeGutter(roomGroup, gutterWallMat, gutterRoofMat) {
      const {roomHeight, roomWidth, floorHeight, gutterWidth, gutterDepth,
       rigDepth} = BouncePunkSceneGroup;

      // Create gutter group
      const gutterGroup = new THREE.Group();
      gutterGroup.name = 'gutterGroup';

      // Bottom gutter
      const bottomGutterBack = this.createPlaneElement(
       'bottomGutterBack', gutterGroup, {
          width: roomWidth, 
          height: gutterDepth - floorHeight
       }, gutterWallMat);
      bottomGutterBack.position.set(
       roomWidth / 2, - (gutterDepth + floorHeight) / 2,
       rigDepth - gutterWidth / 2);

      const bottomGutterFront = this.createPlaneElement(
       'bottomGutterFront', gutterGroup, {
          width: roomWidth,
          height: gutterDepth - floorHeight
       }, gutterWallMat);
      bottomGutterFront.position.set(
       roomWidth / 2, - (gutterDepth + floorHeight) / 2,
       rigDepth + gutterWidth / 2);

      // Left gutter
      const leftGutterBack = this.createPlaneElement(
       'leftGutterBack', gutterGroup, {
          width: gutterDepth,
          height: roomHeight + gutterDepth
       }, gutterWallMat);
      leftGutterBack.position.set(
       -gutterDepth / 2, (roomHeight - gutterDepth) / 2,
       rigDepth - gutterWidth / 2);

      const leftGutterFront = this.createPlaneElement(
       'leftGutterFront', gutterGroup, {
          width: gutterDepth,
          height: roomHeight + gutterDepth
       }, gutterWallMat);
      leftGutterFront.position.set(
       -gutterDepth / 2, (roomHeight - gutterDepth) / 2, 
       rigDepth + gutterWidth / 2);

      // Right gutter
      const rightGutterBack = this.createPlaneElement(
       'rightGutterBack', gutterGroup, {
          width: gutterDepth,
          height: roomHeight + gutterDepth
       }, gutterWallMat);
      rightGutterBack.position.set(
       roomWidth + gutterDepth / 2, (roomHeight - gutterDepth) / 2,
       rigDepth - gutterWidth / 2);

      const rightGutterFront = this.createPlaneElement(
       'rightGutterFront', gutterGroup, {
          width: gutterDepth,
          height: roomHeight + gutterDepth
       }, gutterWallMat);
      rightGutterFront.position.set(
       roomWidth + gutterDepth / 2, (roomHeight - gutterDepth) / 2, 
       rigDepth + gutterWidth / 2);

      // Gutter roof
      const leftGutterRoof = this.createPlaneElement(
       'leftGutterRoof', gutterGroup, {
          width: gutterDepth,
          height: gutterWidth
       }, gutterRoofMat);
      leftGutterRoof.rotateX(Math.PI / 2);
      leftGutterRoof.position.set(
       -gutterDepth / 2, roomHeight, rigDepth);

      const rightGutterRoof = this.createPlaneElement(
       'rightGutterRoof', gutterGroup, {
          width: gutterDepth,
          height: gutterWidth
       }, gutterRoofMat);
      rightGutterRoof.rotateX(Math.PI / 2);
      rightGutterRoof.position.set(
       roomWidth + gutterDepth / 2, roomHeight, rigDepth);

      // Add gutter group to room group
      roomGroup.add(gutterGroup);
   }

   makeRig() {
      const {cannonLength, cannonRadius, ballRadius, rodRadius, trgDepth,
       trgRing, wallRing, rigDepth, rigSize, latheSegments}
       = BouncePunkSceneGroup;

      const rigGroup = new THREE.Group();
      rigGroup.name = 'rig';

      // // Test target
      // const testTargetGroup = new THREE.Group();
      // const testTarget = new THREE.Mesh(
      //  new THREE.BoxGeometry(0.1, 0.1, ballRadius),
      //  new THREE.MeshStandardMaterial(scratchedPlasticMat.fast));
      // testTarget.name = 'testTarget';
      // testTargetGroup.add(testTarget);
      // testTarget.position.set(rigSize / 2.3, rigSize / 2, 0);
      // testTarget.castShadow = true;

      // this.pendingPromises.push(scratchedPlasticMat.slow.then(prms => {
      //    testTarget.material = new THREE.MeshStandardMaterial(
      //     cloneMatPrms(prms, {
      //        x: 0.1,
      //        y: 0.1
      //     }));
      // }));

      // // this.updateLoadedTexture(brassMat, testTarget, {x: 0.1, y: 0.1});

      // const testTargetRod = new THREE.Mesh(
      //  new THREE.CylinderGeometry(rodRadius, rodRadius, rigDepth, 16),
      //  new THREE.MeshStandardMaterial(scuffedMetalMat.fast));
      // testTargetRod.name = 'testTargetRod';
      // testTargetGroup.add(testTargetRod);
      // testTargetRod.rotateX(Math.PI / 2);
      // testTargetRod.position.set(rigSize / 2.3, rigSize / 2, -rigDepth / 2);
      // testTargetRod.castShadow = true;

      // this.updateLoadedTexture(
      //  scuffedMetalMat, testTargetRod, {
      //     x: 2 * rodRadius * Math.PI,
      //     y: rigDepth
      //  });

      // rigGroup.add(testTargetGroup);

      // const testTargetWallRing = this.createRingElement(
      //  'testTargetWallRing', testTargetGroup, {
      //     innerRad: rodRadius,
      //     ringSize: wallRing,
      //     segments: latheSegments
      //  }, scuffedMetalMat);
      // testTargetWallRing.rotateX(Math.PI / 2);
      // testTargetWallRing.position.set(
      //  rigSize / 2.3, rigSize / 2, -rigDepth);
      // testTargetWallRing.receiveShadow = true;

      // // const trgRingPoints = [];
      // // trgRingPoints.push(new THREE.Vector2(rodRadius, 0));
      // // trgRingPoints.push(new THREE.Vector2(rodRadius + 0.005, 0.005));
      // // trgRingPoints.push(new THREE.Vector2(rodRadius + trgRing, 0));

      // const testTargetTrgRing = this.createRingElement(
      //  'testTargetTrgRing', testTargetGroup, {
      //     innerRad: rodRadius,
      //     ringSize: trgRing,
      //     segments: latheSegments
      //  }, scuffedMetalMat);
      // testTargetTrgRing.rotateX(-Math.PI / 2);
      // testTargetTrgRing.position.set(rigSize / 2.3, rigSize / 2, -0.05);
      // testTargetTrgRing.receiveShadow = true;

      const cannonGroup = new THREE.Group();
      cannonGroup.name = 'cannon';
      rigGroup.add(cannonGroup);

      // Make cannon

      const cannonPoints = [];

      // Inside end of barrel
      this.generateArcPoints(
       cannonPoints, ballRadius, {
          x: 0,
          y: cannonLength - 0.2
       }, {
          start: Math.PI / 2,          // Starts at 0, cannonLength - 0.1
          end: 0,                      // Ends at ballRadius, cannonLength - 0.2
          incr: -Math.PI / 16
       });

      // Inner curve of front of muzzle
      this.generateArcPoints(
       cannonPoints, 0.02, {
          x: ballRadius + 0.02,
          y: 0.02
       }, {
          start: - Math.PI,            // Starts at ballRadius, 0.02
          end: - Math.PI / 2,          // Ends at ballRadius + 0.02, 0
          incr: Math.PI / 16
       });

      // Outer curve of front of muzzle
      this.generateArcPoints(
       cannonPoints, 0.02, {
          x: cannonRadius - 0.07,
          y: 0.02
       }, {
          start: - Math.PI / 2,        // Starts at cannonRadius - 0.07, 0
          end: 0,                      // Ends at cannonRadius - 0.05, 0.02
          incr: Math.PI / 16
       });

      // Curve of side of muzzle
      this.generateArcPoints(
       cannonPoints, 0.05, {
          x: cannonRadius - 0.015,
          y: 0.08
       }, {
          start: - 3 * Math.PI / 4,    // Starts at ~cannonRadius - 0.05, 
          end: - 5.01 * Math.PI / 4,   // Ends at ~cannonRadius - 0.05, 
          incr: -Math.PI / 16
       });

      // Curve of back of muzzle
      this.generateArcPoints(
       cannonPoints, 0.02, {
          x: cannonRadius - 0.07,
          y: 0.14
       }, {
          start: 0,                    // Starts at cannonRadius - 0.05, 0.14
          end: Math.PI / 2,            // Ends at cannonRadius - 0.07, 0.16
          incr: Math.PI / 16
       });

      // Curve of back of cannon
      this.generateArcPoints(
       cannonPoints, cannonRadius, {
          x: 0,
          y: cannonLength - cannonRadius
       }, {
          start: 0,
          end: Math.PI / 2,
          incr: Math.PI / 16
       });


      const cannon = this.createLatheElement(
       'cannon', cannonGroup, {
          points: cannonPoints,
          maxRadius: cannonRadius,
          segments: latheSegments
       }, brassMat);
      cannon.rotateZ(Math.PI / 2);
      cannon.rotateY(Math.PI);
      cannon.position.set(0, rigSize, 0);

      // The cannon's uv mapping will be weird, as it assumes all segments
      // are the same length. So, we need to change these uv values to reflect
      // the actual length of each segment.

      // Make cannon wall mount
      const frontLargeCannonMount = this.createCylinderElement(
       'frontLargeCannonMount', cannonGroup, {
          radius: 0.1,
          height: 1.1,
          segments: latheSegments
       }, scuffedMetalMat);
      frontLargeCannonMount.rotateZ(Math.PI / 2);
      frontLargeCannonMount.rotateY(Math.PI);
      frontLargeCannonMount.position.set(-1.45, rigSize, 0.5);

      const frontMountRing = this.createRingElement(
       'frontMountRing', cannonGroup, {
          innerRad: 0.1,
          ringSize: 0.03,
          segments: latheSegments
       }, scuffedMetalMat);
      frontMountRing.rotateZ(-Math.PI / 2);
      frontMountRing.position.set(-2, rigSize, 0.5);

      const frontSmallCannonMount = this.createCylinderElement(
         'frontSmallCannonMount', cannonGroup, {
            radius: 0.05,
            height: 0.5,
            segments: latheSegments
         }, scuffedMetalMat);
      frontSmallCannonMount.rotateX(Math.PI / 2);
      frontSmallCannonMount.position.set(-1, rigSize, 0.35);

      const backLargeCannonMount = this.createCylinderElement(
       'backLargeCannonMount', cannonGroup, {
          radius: 0.1,
          height: 1.1,
          segments: latheSegments
       }, scuffedMetalMat);
      backLargeCannonMount.rotateZ(Math.PI / 2);
      backLargeCannonMount.rotateY(Math.PI);
      backLargeCannonMount.position.set(-1.45, rigSize, -0.5);

      const backMountRing = this.createRingElement(
       'backMountRing', cannonGroup, {
          innerRad: 0.1,
          ringSize: 0.03,
          segments: latheSegments
       }, scuffedMetalMat);
      backMountRing.rotateZ(-Math.PI / 2);
      backMountRing.position.set(-2, rigSize, -0.5);

      const backSmallCannonMount = this.createCylinderElement(
       'backSmallCannonMount', cannonGroup, {
          radius: 0.05,
          height: 0.5,
          segments: latheSegments
       }, scuffedMetalMat);
      backSmallCannonMount.rotateX(Math.PI / 2);
      backSmallCannonMount.position.set(-1, rigSize, -0.35);

      // Create group for obstacles
      const obstaclesGroup = new THREE.Group();
      obstaclesGroup.name = 'obstaclesGroup';
      rigGroup.add(obstaclesGroup);

      // Create ball
      const ball = this.createSphereElement(
       'ball', rigGroup, {
          radius: ballRadius,
          widthSegments: latheSegments,
          heightSegments: latheSegments / 2
       }, brassMat);
      ball.position.set( -cannonLength / 2, rigSize, 0);

      return rigGroup;
   }

   // Adjust the scenegraph to reflect time.  This may require either forward
   // or backward movement in time.
   setOffset(timeStamp) {
      const {ballRadius, rodRadius, trgDepth, trgRing, wallRing, rigDepth,
       rigSize, latheSegments, gutterWidth} = BouncePunkSceneGroup;
      let evts = this.movie.evts;
      let evt;
      let ball = this.rig.getObjectByName('ball');



      // While the event after evtIdx exists and needs adding to 3DElms
      while (this.evtIdx + 1 < evts.length
       && evts[this.evtIdx + 1].time <= timeStamp) {
         evt = evts[++this.evtIdx];

         // If the event is obstacle creation, add the obstacle to the scene
         if (evt.type === BounceMovie.cMakeBarrier
          || evt.type === BounceMovie.cMakeTarget) {
            // Add the indicated barrier to the scene
            let width = evt.hiX - evt.loX;
            let height = evt.hiY - evt.loY;
            let objGroup;
            if (evt.type === BounceMovie.cMakeTarget) {
               objGroup = this.createObstacle(
                'target', this.rig, {
                   width: width,
                   height: height,
                   depth: trgDepth,
                }, brassMat);
            }
            else if (evt.type === BounceMovie.cMakeBarrier) {
               objGroup = this.createObstacle(
                'barrier', this.rig, {
                   width: width,
                   height: height,
                   depth: trgDepth,
                }, streakyPlasticMat, new THREE.Vector2(0.1, 0));
            }

            objGroup.position.set(evt.loX + width / 2, evt.loY + height / 2, 0);
            this.obstacles[evt.id] = objGroup.getObjectByName(
             'obstacleMoveGroup');
         }

         // If the event contains ball position, update the ball's position
         else if (evt.type === BounceMovie.cBallPosition
          || evt.type === BounceMovie.cHitBarrier
          || evt.type === BounceMovie.cHitTarget) {
            ball.position.set(evt.x, evt.y, 0);
         }
         if (evt.type === BounceMovie.cTargetFade) {
            this.obstacles[evt.targetId].position.z =
             - gutterWidth * evt.fadeLevel;  // fade position
         }
         else if (evt.type === BounceMovie.cBallExit) {
            ball.position.set(0, rigSize, 0);
         }
         // else if (evt.type === BounceMovie.cBallLaunch) {
         //    // Make launcher fire by moving piston
         //    pCyl.position.set(.4, 0, 0);
         //    // Delayed animation to retract piston.
         //    setTimeout(() => {
         //       pCyl.position.set(0, 0, 0);
         //    }, 300);
         // }
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
            ball.position.set(evt.x, evt.y, 0);
         }
         if (evt.type === BounceMovie.cTargetFade) {
            this.obstacles[evt.targetId].position.z =
             - gutterWidth * evt.fadeLevel;  // fade position
         }
         if (evt.type === BounceMovie.cBallLaunch)
            ball.position.set(0, rigSize, 0);
      }
   }

   createObstacle(name, parent, {width, height, depth}, matPrms, offset) {
      const {ballRadius, rodRadius, trgDepth, trgRing, wallRing, rigDepth,
       rigSize, latheSegments} = BouncePunkSceneGroup;

      // Create group for obstacle
      const obstacleGroup = new THREE.Group();
      parent.add(obstacleGroup);

      // Create group for moveable objects
      const obstacleMoveGroup = new THREE.Group();
      obstacleMoveGroup.name = 'obstacleMoveGroup';
      obstacleGroup.add(obstacleMoveGroup);

      // Obstacle
      const obstacle = this.createCubeElement(
       name, obstacleMoveGroup, {width, height, depth}, matPrms, offset);
      obstacle.castShadow = true;

      // Calculate rods needed in x and y direction
      const xRods = 1 + Math.floor(width - 2 * (rodRadius + wallRing));
      const yRods = 1 + Math.floor(height - 2 * (rodRadius + wallRing));
      // Loop through to create support rods
      for (let i = 0; i < xRods; i++) {
         for (let j = 0; j < yRods; j++) {
            const xOld = i * (width / xRods) - width / 2;
            const yOld = j * (height / yRods) - height / 2;

            const x = -(xRods - 1) / 2 + i;
            const y = -(yRods - 1) / 2 + j;

            console.log(x, y);
            this.createSupportRods(obstacleGroup, obstacleMoveGroup, {x, y});
         }
      }

      return obstacleGroup;
   }

   createSupportRods(parent, moveParent, {x, y}) {
      const {rodRadius, trgDepth, trgRing, wallRing, rigDepth,
       latheSegments} = BouncePunkSceneGroup;

      // Add rod
      const rod = this.createCylinderElement(
       'rod', moveParent, {
          radius: rodRadius,
          height: rigDepth,
          segments: latheSegments
       }, scuffedMetalMat);
      rod.position.set(x, y, -rigDepth / 2);
      rod.rotateX(Math.PI / 2);
      rod.castShadow = true;

      // Add obstacle ring
      const obstacleRing = this.createRingElement(
       'obstacleRing', moveParent, {
          innerRad: rodRadius,
          ringSize: trgRing,
          segments: latheSegments
       }, scuffedMetalMat);
      obstacleRing.position.set(x, y, -trgDepth / 2);
      obstacleRing.rotateX(-Math.PI / 2);
      obstacleRing.receiveShadow = true;

      // Add wall ring
      const obstacleWallRing = this.createRingElement(
       'wallRing', parent, {
          innerRad: rodRadius,
          ringSize: wallRing,
          segments: latheSegments
       }, scuffedMetalMat);
      obstacleWallRing.position.set(x, y, -rigDepth);
      obstacleWallRing.rotateX(Math.PI / 2);
      obstacleWallRing.receiveShadow = true;
   }

   createCubeElement(name, parent, {width, height, depth}, matPrms, offset) {
      const cube = new THREE.Mesh(
       new THREE.BoxGeometry(width, height, depth),
       new THREE.MeshStandardMaterial(matPrms.fast));
      cube.name = name;
      parent.add(cube);

      // Texture sides
      this.pendingPromises.push(matPrms.slow.then(prms => {
         const sideMat = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, {
             x: depth,
             y: height
          }, offset));
         const topMat = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, {
             x: width,
             y: depth
          }, offset));
         const frontMat = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, {
             x: width,
             y: height
          }, offset));
         cube.material = [sideMat, sideMat, topMat, topMat, frontMat, frontMat];
      }));

      return cube;
   }

   createSphereElement(name, parent, {radius, widthSegments, heightSegments}, matPrms, offset) {
      const sphere = new THREE.Mesh(
       new THREE.SphereGeometry(radius, widthSegments, heightSegments),
       new THREE.MeshStandardMaterial(matPrms.fast));
      sphere.name = name;
      parent.add(sphere);

      const desiredRep = {
         x: 2 * radius * Math.PI,
         y: radius * Math.PI
      }

      this.updateLoadedTexture(matPrms, sphere, desiredRep, offset);

      return sphere;
   }

   createPlaneElement(name, parent, {width, height}, matPrms, offset) {
      const plane = new THREE.Mesh(
       new THREE.PlaneGeometry(width, height),
       new THREE.MeshStandardMaterial(matPrms.fast));
      plane.name = name;
      parent.add(plane);

      const desiredRep = {
         x: width,
         y: height
      };

      this.updateLoadedTexture(matPrms, plane, desiredRep, offset);

      return plane;
   }

   createCylinderElement(name, parent, {radius, height, segments}, matPrms, offset) {

      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(
       radius, radius, height, segments),
       new THREE.MeshStandardMaterial(matPrms.fast));
      cylinder.name = name;
      parent.add(cylinder);

      const desiredRep = {
         x: 2 * radius * Math.PI,
         y: height
      };

      this.updateLoadedTexture(matPrms, cylinder, desiredRep, offset);

      return cylinder;
   }

   createRingElement(name, parent, {innerRad, ringSize, segments}, matPrms, offset) {

      const points = [];
      points.push(new THREE.Vector2(innerRad + ringSize, 0));
      this.generateArcPoints(
       points, ringSize / 2, {
          x: innerRad + ringSize / 2,
          y: ringSize,
       }, {
          start: 0,
          end: Math.PI,
          incr: Math.PI / 16
       });
      points.push(new THREE.Vector2(innerRad, 0));

      const newDims = {
         points,
         maxRadius: innerRad + ringSize,
         segments: segments
      };

      return this.createLatheElement(name, parent, newDims, matPrms, offset);
   }

   createLatheElement(name, parent, {points, maxRadius, segments}, matPrms, offset) {
      const lathe = new THREE.Mesh(
         new THREE.LatheGeometry(points, segments),
         new THREE.MeshStandardMaterial(matPrms.fast));
      lathe.name = name;
      parent.add(lathe);
  
      this.fixLatheUVs(lathe, {points, maxRadius, segments}, matPrms, offset);

      return lathe;
   }

   updateLoadedTexture(matPrms, object, desiredRep, offset) {
      this.pendingPromises.push(matPrms.slow.then(prms => {
         object.material = new THREE.MeshStandardMaterial(
          cloneMatPrms(prms, desiredRep, offset));
      }));
   }

   // Takes a lathe, and adjusts its UV values to make the texture map evenly,
   // then applies a texture the correct size. 
   fixLatheUVs(lathe, {points, maxRadius, segments}, matPrms, offset) {
      // Go through points array and calculate total length of curve
      let textureLength = 0;
      for (let i = 0; i < points.length - 1; i++) {
         const p1 = points[i];
         const p2 = points[i + 1];
         textureLength += Math.sqrt(
          (p2.x - p1.x) * (p2.x - p1.x) +
          (p2.y - p1.y) * (p2.y - p1.y));
      }

      // Go through Uvs and scale them to total length
      // Copy array of uvs
      let uvArray = lathe.geometry.getAttribute('uv').array;
      // cycle through uv array and change each v value
      for (let i = 0; i < segments + 1; i++) {
         // Variable to save length from start of curve to current point
         let lengthFromStart = 0;
         for (let j = 0; j < points.length - 1; j++) {
            const vValue = 2 * (i * points.length + j) + 1;
            // Constant to save percentage of length from start of curve
            const lengthPercent = lengthFromStart / textureLength;
            uvArray[vValue] = lengthPercent;
            const p1 = points[j];
            const p2 = points[j + 1];
            lengthFromStart += Math.sqrt(
             (p2.x - p1.x) * (p2.x - p1.x) +
             (p2.y - p1.y) * (p2.y - p1.y));
         }
      }

      // Set uv array to new array
      lathe.geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));

      // Length of texture already calculated, so calculate width
      const textureWidth = 2 * Math.PI * maxRadius;

      const desiredRep = {
         x: textureWidth,
         y: textureLength
      };

      this.updateLoadedTexture(matPrms, lathe, desiredRep, offset);
   }

   generateArcPoints(points, radius, center, angle) {
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

   // Return root group of scenegraph represented by this class
   getSceneGroup() {
      return this.topGroup;
   }

   getPendingPromises() {
      return this.pendingPromises;
   }
}