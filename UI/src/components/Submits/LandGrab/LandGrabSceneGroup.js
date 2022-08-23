import {LandGrabMovie} from './LandGrabMovie';
import * as THREE from 'three';
import {brickMat, plasterMat, streakyPlasticMat, brassMat, scuffedMetalMat,
 olderWoodFloorMat, polishedWoodMat, brassRodMat, colorWriteMat, laserMat} from
 '../../Util/AsyncMaterials';
import {makePlaneElement, makeBoxElement, makeSphereElement,
 makeCylinderElement, makeCircleElement, makeLatheElement,
 generateArcPoints, addMaterial} from '../../Util/SceneUtil';
import {cloneMatPrms} from '../../Util/ImageUtil';

// Create a Group with the following elements:
// 
// A room
// A rig at center of room, a little above the floor.

export class LandGrabSceneGroup {
   // Constants
   // Room dimensions
   static roomWidth = 14;     // Wide enough for 2m on each side of rig
   static roomHeight = 7;     // Enough headroom
   static roomDepth = LandGrabSceneGroup.roomWidth;
   static floorHeight = .05;

   // Balcony dimensions
   static balconyHeight = 2;
   static balconyDepth = 2;
   static railHeight = 1;
   static railWidth = 0.03;
   static railSpacing = 0.5;

   // Rig dimensions
   static rigSize = 10;
   static rigHeight = .75;    // Height from floor to rig surface
   static rigThickness = .03;
   static obstacleThickness = .1;
   static offsetDistance = 0.001;
   static cutWidth = 0.02;

   constructor(movie, isVR, listener) {
      // Create materials object
      this.mats = {};

      this.isVR = isVR;

      // if (listener) {
      //    this.listener = listener;
      //    this.pendingAudio = [];

      //    const audioLoader = new THREE.AudioLoader();
      //    audioLoader.load(pingAudio, (buffer) => {
      //       this.pingBuffer = buffer;
      //       this.pendingAudio.forEach(audio => {
      //          audio.setBuffer(buffer);

      //          // Audio does a weird stereo pan thing when first played. 
      //          // Tried .UpdateMatrixWorld(), and console.logging the whole
      //          // audio object to look for differences, but nothing worked. 
      //          // This audio thing seems to only happen after listener
      //          // position has changed, so that's what to investigate next.
      //       });
      //    });
      // }

      this.movie = movie;
      this.topGroup = new THREE.Group();
      this.pendingPromises = [];         // Holds pending material promises
      this.colliderMeshes = [];          // Colliders for camera boundary
      this.evtIdx = -1;                  // Index of current event
      this.circles = [];                 // Array of objects with circle info

      this.room = this.makeRoom();
      this.rig = this.makeRig(olderWoodFloorMat);

      this.topGroup.add(this.room);
      this.topGroup.add(this.rig);
      this.setupRig(olderWoodFloorMat);

      // Iterate through this.mats, creating each material and applying it to
      // every object in the this.mats.[name].objs array
      Object.values(this.mats).forEach(({mat, x, y, offset, objs}) => {
         // Add promise for material, and a then to run when mat prms load
         this.pendingPromises.push(mat.then(prms => {
            const mat = new THREE.MeshStandardMaterial(
             cloneMatPrms(prms, {
                x,
                y
             }, offset));
            // Apply material to all relevant objects
            objs.forEach(obj => {
               if (obj.material.side === THREE.BackSide)
                  mat.side = obj.material.side;
               obj.material = mat
               obj.material.needsUpdate = true;
            });
         }));
      });
   }

   getScaledDim(dim) {
      return dim * (LandGrabSceneGroup.rigSize / 100);
   }

   makeRoom() {
      const {roomWidth, roomHeight, roomDepth} = LandGrabSceneGroup;

      const roomGroup = new THREE.Group();
      roomGroup.name = 'roomGroup';

      this.makeWalls(roomGroup, brickMat);

      // const roof = makePlaneElement(
      //  'roof', roomGroup, {
      //     width: roomWidth,
      //     height: roomDepth
      //  }, {matPrms: plasterMat}, this.mats);
      // roof.rotateX(Math.PI / 2);
      // roof.position.set(roomWidth / 2, roomHeight, roomDepth / 2);
      // this.colliderMeshes.push(roof);

      // const floor = makePlaneElement(
      //  'floor', roomGroup, {
      //     width: roomWidth,
      //     height: roomDepth
      //  }, {matPrms: polishedWoodMat}, this.mats);
      // floor.rotateX(-Math.PI / 2);
      // floor.position.set(roomWidth / 2, 0, roomDepth / 2);
      // floor.receiveShadow = true;
      // this.colliderMeshes.push(floor);

      if (this.isVR)
         this.makeBalcony(roomGroup, streakyPlasticMat, scuffedMetalMat);

      return roomGroup;
   }

   makeWalls(parent, wallMat) {
      const {roomWidth, roomHeight, roomDepth} = LandGrabSceneGroup;

      const wallsGroup = new THREE.Group();
      wallsGroup.name = 'wallsGroup';

      const backWall = makePlaneElement(
       'widthWall', wallsGroup, {
          width: roomWidth,
          height: roomHeight
       }, {matPrms: wallMat}, this.mats);
      backWall.position.set(roomWidth / 2, roomHeight / 2, 0);
      this.colliderMeshes.push(backWall);

      const frontWall = makePlaneElement(
       'widthWall', wallsGroup, {
          width: roomWidth,
          height: roomHeight
       }, {matPrms: wallMat}, this.mats);
      frontWall.rotateY(Math.PI);
      frontWall.position.set(roomWidth / 2, roomHeight / 2, roomDepth);
      this.colliderMeshes.push(frontWall);

      const leftWall = makePlaneElement(
       'depthWall', wallsGroup, {
          width: roomDepth,
          height: roomHeight
       }, {matPrms: wallMat}, this.mats);
      leftWall.rotateY(Math.PI / 2);
      leftWall.position.set(0, roomHeight / 2, roomDepth / 2);
      this.colliderMeshes.push(leftWall);

      const rightWall = makePlaneElement(
       'depthWall', wallsGroup, {
          width: roomDepth,
          height: roomHeight
       }, {matPrms: wallMat}, this.mats);
      rightWall.rotateY(-Math.PI / 2);
      rightWall.position.set(roomWidth, roomHeight / 2, roomDepth / 2);
      this.colliderMeshes.push(rightWall);

      parent.add(wallsGroup);
   }

   makeBalcony(parent, floorMat, railMat) {
      const {roomWidth, roomHeight, roomDepth, floorHeight, balconyHeight,
       balconyDepth, railHeight, railWidth} = LandGrabSceneGroup;

      const balconyGroup = new THREE.Group();
      balconyGroup.name = 'balconyGroup';
      parent.add(balconyGroup);

      const backBalcony = this.makeBalconySection(
       balconyGroup, floorMat, railMat);
      backBalcony.name = 'backBalcony';

      const rightBalcony = this.makeBalconySection(
       balconyGroup, floorMat, railMat);
      rightBalcony.name = 'rightBalcony';
      rightBalcony.rotateY(-Math.PI / 2);
      rightBalcony.position.set(roomWidth, 0, 0);

      const leftBalcony = this.makeBalconySection(
       balconyGroup, floorMat, railMat);
      leftBalcony.name = 'leftBalcony';
      leftBalcony.rotateY(Math.PI / 2);
      leftBalcony.position.set(0, 0, roomDepth);

      const frontBalcony = this.makeBalconySection(
       balconyGroup, floorMat, railMat);
      frontBalcony.name = 'frontBalcony';
      frontBalcony.rotateY(Math.PI);
      frontBalcony.position.set(roomWidth, 0, roomDepth);
   }

   makeBalconySection(parent, floorMat, railMat) {
      const {roomWidth, roomHeight, roomDepth, floorHeight, balconyHeight,
       balconyDepth, railHeight, railWidth, railSpacing} = LandGrabSceneGroup;

      const balconySection = new THREE.Group();
      parent.add(balconySection);

      const balconyFloorTop = makePlaneElement(
       'balconyFloor', balconySection, {
          width: roomWidth - balconyDepth,
          height: balconyDepth
       }, {matPrms: floorMat}, this.mats);
      balconyFloorTop.rotateX(-Math.PI / 2);
      balconyFloorTop.position.set(
       (roomWidth - balconyDepth) / 2, balconyHeight, balconyDepth / 2);

      const balconyFloorSide = makePlaneElement(
       'balconyFloorSide', balconySection, {
          width: roomWidth - 2 * balconyDepth,
          height: floorHeight
       }, {matPrms: floorMat}, this.mats);
      balconyFloorSide.position.set(
       roomWidth / 2, balconyHeight - floorHeight / 2,
       balconyDepth);

      const balconyFloorBottom = makePlaneElement(
       'balconyFloorBottom', balconySection, {
          width: roomWidth - balconyDepth,
          height: balconyDepth
       }, {matPrms: floorMat}, this.mats);
      balconyFloorBottom.rotateX(Math.PI / 2);
      balconyFloorBottom.position.set(
       (roomWidth - balconyDepth) / 2, balconyHeight - floorHeight,
       balconyDepth / 2);

      const rail = makeBoxElement(
       'rail', balconySection, {
          width: roomWidth - 2 * balconyDepth + railWidth,
          height: railWidth,
          depth: railWidth
       }, {matPrms: railMat}, this.mats);
      rail.position.set(
       (roomWidth - railWidth) / 2, balconyHeight + railHeight,
       balconyDepth - railWidth / 2);

      for (let i = 0; i < roomWidth - 2 * balconyDepth; i += railSpacing) {
         const railRod = makeBoxElement(
          'railRod', balconySection, {
             width: railWidth,
             height: railHeight - railWidth,
             depth: railWidth
          }, {matPrms: railMat}, this.mats);
         railRod.position.set(
          i + balconyDepth + railWidth / 2, balconyHeight + railHeight / 2,
          balconyDepth - railWidth / 2);
      }

      return balconySection;
   }

   makeRig(rigMat) {
      const {roomWidth, roomHeight, roomDepth, rigSize, rigHeight, rigThickness}
       = LandGrabSceneGroup;

      const rigGroup = new THREE.Group();
      rigGroup.name = 'rigGroup';

      // Rig is rotated 90 degrees so that event x and y can be used easily.
      rigGroup.rotateX(-Math.PI / 2);
      rigGroup.position.set(
       (roomWidth - rigSize) / 2, rigHeight, (roomDepth + rigSize) / 2);

      const rigTop = makePlaneElement(
       'rigFace', rigGroup, {
          width: rigSize,
          height: rigSize
       }, {matPrms: rigMat}, this.mats);
      rigTop.position.set(rigSize / 2, rigSize / 2, 0);
      rigTop.renderOrder = 102;

      const rigBottom = makePlaneElement(
       'rigFace', rigGroup, {
          width: rigSize,
          height: rigSize
       }, {matPrms: rigMat}, this.mats);
      rigBottom.rotateX(Math.PI);
      rigBottom.position.set(
       rigSize / 2, rigSize / 2, -rigThickness);
      rigBottom.renderOrder = 102;
      // rigBottom.castShadow = true;

      const rigLeft = makePlaneElement(
       'rigSide', rigGroup, {
          width: rigThickness,
          height: rigSize
       }, {matPrms: rigMat}, this.mats);
      rigLeft.rotateY(-Math.PI / 2);
      rigLeft.position.set(
       0, rigSize / 2, -rigThickness / 2);

      const rigRight = makePlaneElement(
       'rigSide', rigGroup, {
          width: rigThickness,
          height: rigSize
       }, {matPrms: rigMat}, this.mats);
      rigRight.rotateY(Math.PI / 2);
      rigRight.position.set(
       rigSize, rigSize / 2, -rigThickness / 2);

      const rigBack = makePlaneElement(
       'rigEnd', rigGroup, {
          width: rigSize,
          height: rigThickness
       }, {matPrms: rigMat}, this.mats);
      rigBack.rotateX(-Math.PI / 2);
      rigBack.position.set(
       rigSize / 2, rigSize, -rigThickness / 2);

      const rigFront = makePlaneElement(
       'rigEnd', rigGroup, {
          width: rigSize,
          height: rigThickness
       }, {matPrms: rigMat}, this.mats);
      rigFront.rotateX(Math.PI / 2);
      rigFront.position.set(
       rigSize / 2, 0, -rigThickness / 2);

      return rigGroup;
   }

   setupRig(rigMat) {
      const {rigSize, rigHeight, rigThickness, offsetDistance, cutWidth}
       = LandGrabSceneGroup;
      let evts = this.movie.evts;
      let evt;

      for (let i = 0; i < evts.length; i++) {
         evt = evts[i];
      
         if (evt.type === LandGrabMovie.cMakeObstacle) {
            const width = this.getScaledDim(evt.hiX - evt.loX);
            const height = this.getScaledDim(evt.hiY - evt.loY);

            const obstacle = makeBoxElement(
             'obstacle', this.rig, {
                width,
                height,
                depth: rigThickness
             }, {matPrms: streakyPlasticMat}, this.mats);

            obstacle.position.set(this.getScaledDim(evt.loX) + width / 2,
             this.getScaledDim(evt.loY) + height / 2, 0);

            console.log('obstacle', evt);
         }
         
         if (evt.type === LandGrabMovie.cValidCircle) {
            const circleId = evt.circleId;
            console.log('CIRCLE', evt);

            const circleGroup = new THREE.Group();
            circleGroup.name = 'circleGroup';
            circleGroup.position.set(
             this.getScaledDim(evt.x), this.getScaledDim(evt.y), 0);
            this.rig.add(circleGroup);

            const hole = makeCylinderElement(
             'hole', circleGroup, {
                radius: this.getScaledDim(evt.r),
                height: rigThickness + offsetDistance,
                segments: 32,
                thetaLength: 0
             }, {matPrms: colorWriteMat}, this.mats);
            hole.rotateX(Math.PI / 2);
            hole.rotateY(Math.PI / 2);
            hole.position.set(0, 0, -rigThickness / 2);
            hole.renderOrder = 101;

            const holeInside = makeCylinderElement(
             `holeInside ${circleId}`, circleGroup, {
                radius: this.getScaledDim(evt.r),
                height: rigThickness + offsetDistance,
                segments: 32,
                openEnded: true
             }, {matPrms: rigMat}, this.mats);
            holeInside.rotateX(Math.PI / 2);
            holeInside.rotateY(Math.PI / 2);
            holeInside.position.set(0, 0, -rigThickness / 2);
            holeInside.material.side = THREE.BackSide;
            holeInside.material.needsUpdate = true;

            const circleMoveGroup = new THREE.Group();
            circleGroup.add(circleMoveGroup);

            const circleSide = makeCylinderElement(
             `circleSide ${circleId}`, circleMoveGroup, {
                radius: this.getScaledDim(evt.r) - cutWidth,
                height: rigThickness,
                segments: 32,
                openEnded: true
             }, {matPrms: rigMat}, this.mats);
            circleSide.rotateX(Math.PI / 2);
            circleSide.rotateY(Math.PI / 2);
            circleSide.position.set(0, 0, -rigThickness / 2);

            const circleTop = makeCircleElement(
             `circleFace ${circleId}`, circleMoveGroup, {
                radius: this.getScaledDim(evt.r) - cutWidth,
                segments: 32,
                thetaLength: 0
             }, {matPrms: rigMat}, this.mats);

            const circleBottom = makeCircleElement(
             `circleFace ${circleId}`, circleMoveGroup, {
                radius: this.getScaledDim(evt.r) - cutWidth,
                segments: 32,
             }, {matPrms: rigMat}, this.mats);
            circleBottom.rotateX(Math.PI);
            circleBottom.position.set(0, 0, -rigThickness);
            
            // Object to store circle meshes
            let circle = {
               hole: {
                  mesh: hole,
                  inside: holeInside
               },
               circle: {
                  top: circleTop,
                  bottom: circleBottom,
                  side: circleSide
               },
               moveGroup: circleMoveGroup
            };
            console.log('circle', circle);

            this.circles[circleId] = circle;
         }
      }

      // const testObstruction = makeCylinderElement(
      //  'testObstruction', this.rig, {
      //     radius: 1,
      //     height: rigThickness + offsetDistance,
      //     segments: 32
      //  }, {matPrms: colorWriteMat}, this.mats);
      // testObstruction.rotateX(Math.PI / 2);
      // testObstruction.position.set(
      //  rigSize / 2, rigSize / 2, -rigThickness / 2);
      // testObstruction.renderOrder = 101;

      // const testCylInside = makeCylinderElement(
      //  'testCylInside', this.rig, {
      //     radius: 1,
      //     height: rigThickness + offsetDistance,
      //     segments: 32,
      //     openEnded: true
      //  }, {matPrms: olderWoodFloorMat}, this.mats);
      // testCylInside.rotateX(Math.PI / 2);
      // testCylInside.position.set(
      //  rigSize / 2, rigSize / 2, -rigThickness / 2);
      // testCylInside.material.side = THREE.BackSide;
      // testCylInside.material.needsUpdate = true;

      this.cutter = makeCylinderElement(
       'cutter', this.rig, {
          radius: cutWidth / 2,
          height: 20,
          segments: 8
       }, {matPrms: laserMat}, this.mats);
      this.cutter.rotateX(Math.PI / 2);
      this.cutter.visible = false;
   }

   setOffset(timeStamp) {
      const {roomWidth, roomHeight, roomDepth, rigSize, rigHeight, rigThickness,
       offsetDistance} = LandGrabSceneGroup;
      let evts = this.movie.evts;
      let evt;

      while (this.evtIdx + 1 < evts.length
       && evts[this.evtIdx + 1].time <= timeStamp) {
         evt = evts[++this.evtIdx];

         if (evt.type === LandGrabMovie.cCircleGrowth) {
            // console.log('CIRCLE GROWTH', evt);
            this.updateCircle(evt.circleId, evt.angle);
            this.cutter.position.set(
             this.getScaledDim(evt.x + evt.r * Math.cos(evt.angle)),
             this.getScaledDim(evt.y + evt.r * Math.sin(evt.angle)), 0);
            this.cutter.visible = true;
         }

         if (evt.type === LandGrabMovie.cCircleFade) {
            const fadeTime = evt.fadeTime;
            const circle = this.circles[evt.circleId];

            if (Math.abs(fadeTime - LandGrabMovie.cFadeTime) < 0.05)
               circle.moveGroup.children.forEach(child => {
                  child.visible = false;
               });
            else
               circle.moveGroup.position.z = -1/2 * 9.81 * fadeTime**2;
         }
      }

      while (this.evtIdx > 0 && timeStamp < evts[this.evtIdx].time) {
         evt = evts[this.evtIdx--];

         if (evt.type === LandGrabMovie.cCircleGrowth) {
            // console.log('CIRCLE GROWTH', evt);
            this.updateCircle(evt.circleId, evt.angle);
            this.cutter.position.set(
             this.getScaledDim(evt.x + evt.r * Math.cos(evt.angle)),
             this.getScaledDim(evt.y + evt.r * Math.sin(evt.angle)), 0);
            this.cutter.visible = true;
         }

         if (evt.type === LandGrabMovie.cCircleFade) {
            const fadeTime = evt.fadeTime;
            const circle = this.circles[evt.circleId];

            if (Math.abs(fadeTime - LandGrabMovie.cFadeTime) < 0.05)
               circle.moveGroup.children.forEach(child => {
                  child.visible = true;
               });
            else
               circle.moveGroup.position.z = -1/2 * 9.81 * fadeTime**2;
         }
      }
   }

   makeObstacle(name, parent, {width, height}, {matPrms, offset}) {
      const {} = BounceSceneGroup;
   }

   updateCircle(circleId, angle) {
      const {hole, circle} = this.circles[circleId];

      this.updateAngle(hole.mesh, angle);
      this.updateAngle(circle.top, angle);
      this.updateAngle(circle.bottom, angle);
   }

   updateAngle(mesh, angle) {
      let params = mesh.geometry.parameters;
      const type = mesh.geometry.type;

      params.thetaLength = angle;

      mesh.geometry.dispose();
      if (type === 'CylinderGeometry') {
         mesh.geometry = new THREE.CylinderGeometry(params.radiusTop,
          params.radiusBottom, params.height, params.radialSegments,
          params.heightSegments, params.openEnded, params.thetaStart,
          params.thetaLength);
      }
      else if (type === 'CircleGeometry') {
         mesh.geometry = new THREE.CircleGeometry(params.radius,
          params.segments, params.thetaStart, params.thetaLength);
      }
   }

   getSceneGroup() {
      return this.topGroup;
   }

   getPendingPromises() {
      return this.pendingPromises;
   }

   getColliderMeshes() {
      return this.colliderMeshes;
   }
}