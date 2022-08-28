import {LandGrabMovie} from './LandGrabMovie';
import * as THREE from 'three';
import {brickMat, plasterMat, streakyPlasticMat, brassMat, scuffedMetalMat,
 olderWoodFloorMat, polishedWoodMat, brassRodMat, colorWriteMat, laserMat} from
 '../../Util/AsyncMaterials';
import {makePlaneElement, makeBoxElement, makeSphereElement,
 makeCylinderElement, makeCircleElement, makeExtrudeElement, makeLatheElement,
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

   // CNC dimensions
   static cncArmClearance = .3;     // Clearance between CNC arm and rig
   static cncBracketClearance = .2; // Clearance between CNC bracket and rig
   static cncHeadClearance = .15;   // Clearance between CNC head and rig
   static cncCutterClearance = .05; // Clearance between CNC cutter and rig
   static cncSlotDepth = .03;       // Slot in arm and arm bracket
   static cncSlotWidth = .05;
   static cncSlotInset = .01;
   static cncArmDepth = .1;         // Arm and bracket have same cross-section
   static cncArmHeight = .25;
   static cncBracketHeight = .3;
   static cncBracketPlateHeight = .075;
   static cncBracketDepth = .25;
   static cncBracketPlateDepth = .2
   static cncBracketWidth = .2;
   static cncHeadHeight = .25;
   static cncHeadRadius = .075;
   static cncCutterReach = 0.1;    // Distance cutter lowers by to cut

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
      this.transitions = [];             // Array of of transition positions

      this.room = this.makeRoom();
      this.rig = this.makeRig(olderWoodFloorMat);
      this.cnc = this.makeCNC(scuffedMetalMat);

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
      rigTop.receiveShadow = true;

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

   makeCNC(cncMat) {
      const {rigSize, cutWidth, cncArmHeight, cncSlotWidth, cncArmDepth,
       cncSlotInset, cncSlotDepth, cncArmClearance, cncHeadClearance, 
       cncBracketClearance, cncBracketHeight, cncBracketDepth,
       cncBracketPlateDepth, cncBracketWidth, cncBracketPlateHeight,
       cncHeadRadius, cncHeadHeight, cncCutterHeight, cncCutterClearance,
       cncCutterReach} = LandGrabSceneGroup;

      // Different groups, nested to produce x, y and z movements
      const topGroup = new THREE.Group();
      topGroup.name = 'topGroup';
      this.rig.add(topGroup);

      const yGroup = new THREE.Group();
      yGroup.name = 'yGroup';
      topGroup.add(yGroup);

      const xyGroup = new THREE.Group();
      xyGroup.name = 'xyGroup';
      yGroup.add(xyGroup);

      const xyzGroup = new THREE.Group();
      xyzGroup.name = 'xyzGroup';
      xyGroup.add(xyzGroup);

      const cncRailShape = new THREE.Shape([
         new THREE.Vector2(0, 0),
         new THREE.Vector2(0, cncArmHeight),
         new THREE.Vector2(cncArmDepth, cncArmHeight),
         new THREE.Vector2(cncArmDepth, (cncArmHeight + cncSlotWidth) / 2),
         new THREE.Vector2(cncArmDepth - cncSlotDepth + cncSlotInset,
          (cncArmHeight + cncSlotWidth) / 2),
         new THREE.Vector2(cncArmDepth - cncSlotDepth + cncSlotInset,
          (cncArmHeight + cncSlotWidth) / 2 + cncSlotInset),
         new THREE.Vector2(cncArmDepth - cncSlotDepth,
          (cncArmHeight + cncSlotWidth) / 2 + cncSlotInset),
         new THREE.Vector2(cncArmDepth - cncSlotDepth,
          (cncArmHeight - cncSlotWidth) / 2 - cncSlotInset),
         new THREE.Vector2(cncArmDepth - cncSlotDepth + cncSlotInset,
          (cncArmHeight - cncSlotWidth) / 2 - cncSlotInset),
         new THREE.Vector2(cncArmDepth - cncSlotDepth + cncSlotInset,
          (cncArmHeight - cncSlotWidth) / 2),
         new THREE.Vector2(cncArmDepth, (cncArmHeight - cncSlotWidth) / 2),
         new THREE.Vector2(cncArmDepth, 0)
      ]);

      const cncLeftRail = makeExtrudeElement(
       'cncRail', topGroup, {
          shape: cncRailShape,
          options: {
             depth: rigSize + cncArmHeight,
             bevelEnabled: false
          }
       }, {matPrms: cncMat}, this.mats);
      cncLeftRail.rotateX(Math.PI / 2);
      cncLeftRail.position.set(-cncArmHeight / 2 - cncArmDepth,
       rigSize + cncArmHeight, cncArmClearance);

      const cncRightRail = makeExtrudeElement(
       'cncRail', topGroup, {
          shape: cncRailShape,
          options: {
             depth: rigSize + cncArmHeight,
             bevelEnabled: false
          }
       }, {matPrms: cncMat}, this.mats);
      cncRightRail.rotateX(Math.PI / 2);
      cncRightRail.rotateZ(Math.PI);
      cncRightRail.position.set(
       rigSize + cncArmHeight / 2 + cncArmDepth,
       rigSize + cncArmHeight, cncArmClearance + cncArmHeight);

      const cncCenterRail = makeExtrudeElement(
       'cncRail', yGroup, {
          shape: cncRailShape,
          options: {
             depth: rigSize + cncArmHeight,
             bevelEnabled: false
          }
       }, {matPrms: cncMat}, this.mats);
      cncCenterRail.rotateX(Math.PI / 2);
      cncCenterRail.rotateY(-Math.PI / 2);
      cncCenterRail.position.set(rigSize + cncArmHeight / 2,
       2 * cncArmDepth + cncBracketDepth - cncBracketPlateDepth / 2,
       cncArmClearance);

      const cncCenterRailLeftSlot = makeBoxElement(
       'cncRailSlot', yGroup, {
          width: cncSlotDepth,
          height: cncArmDepth - cncSlotDepth,
          depth: cncSlotWidth + 2 * cncSlotInset
       }, {matPrms: cncMat}, this.mats);
      cncCenterRailLeftSlot.position.set(
       -(cncSlotDepth + cncArmHeight) / 2, (-cncBracketPlateDepth + 2
       * cncBracketDepth + 3 * cncArmDepth + cncSlotDepth) / 2,
       cncArmClearance + cncArmHeight / 2);

      const cncCenterRailRightSlot = makeBoxElement(
       'cncRailSlot', yGroup, {
          width: cncSlotDepth,
          height: cncArmDepth - cncSlotDepth,
          depth: cncSlotWidth + 2 * cncSlotInset
       }, {matPrms: cncMat}, this.mats);
      cncCenterRailRightSlot.position.set(
       rigSize + (cncSlotDepth + cncArmHeight) / 2, (-cncBracketPlateDepth + 2
       * cncBracketDepth + 3 * cncArmDepth + cncSlotDepth) / 2,
       cncArmClearance + cncArmHeight / 2);

      const cncArmBracket = makeExtrudeElement(
       'cncArmBracket', xyGroup, {
          shape: cncRailShape,
          options: {
             depth: cncArmClearance + cncArmHeight - cncHeadClearance,
             bevelEnabled: false
          }
       }, {matPrms: cncMat}, this.mats);
      cncArmBracket.rotateZ(-Math.PI / 2);
      cncArmBracket.position.set(-cncArmHeight / 2,
       cncArmDepth + cncBracketDepth - cncBracketPlateDepth / 2,
       cncBracketClearance);

      const cncArmBracket2 = makeBoxElement(
       'cncArmBracket2', xyGroup, {
          width: cncArmHeight,
          height: cncSlotDepth,
          depth: cncSlotWidth + 2 * cncSlotInset
       }, {matPrms: cncMat}, this.mats);
      cncArmBracket2.position.set(0,
       cncArmDepth + cncBracketDepth - cncBracketPlateDepth / 2
       + cncSlotDepth / 2, cncArmClearance + cncArmHeight / 2);

      const cncBracket = makeBoxElement(
       'cncBracket', xyzGroup, {
          width: cncBracketWidth,
          height: cncBracketDepth - cncBracketPlateDepth,
          depth: cncBracketHeight
       }, {matPrms: cncMat}, this.mats);
      cncBracket.position.set(
       0, cncBracketDepth / 2,
       cncBracketClearance + cncBracketHeight / 2 - cncCutterReach);

      const cncBracket2 = makeBoxElement(
       'cncBracket2', xyzGroup, {
          width: cncSlotWidth + 2 * cncSlotInset,
          height: cncSlotDepth,
          depth: cncBracketHeight
       }, {matPrms: cncMat}, this.mats);
      cncBracket2.position.set(0,
       cncBracketDepth + (cncSlotDepth - cncBracketPlateDepth) / 2,
       cncBracketClearance + cncBracketHeight / 2 - cncCutterReach);

      const cncBracketPlate = makeBoxElement(
       'cncBracketPlate', xyzGroup, {
          width: cncBracketWidth,
          height: cncBracketPlateDepth,
          depth: cncBracketPlateHeight
       }, {matPrms: cncMat}, this.mats);
      cncBracketPlate.position.set(
       0, 0, cncBracketClearance + cncBracketPlateHeight / 2 - cncCutterReach);

      const cncHead = makeCylinderElement(
       'cncHead', xyzGroup, {
          radius: cncHeadRadius,
          height: cncHeadHeight,
          segments: 16
       }, {matPrms: cncMat}, this.mats);
      cncHead.rotateX(Math.PI / 2);
      cncHead.position.set(0, 0, cncHeadClearance + cncHeadHeight / 2
       - cncCutterReach);

      const cncCutter = makeCylinderElement(
       'cncCutter', xyzGroup, {
          radius: cutWidth / 2,
          height: cncHeadClearance - cncCutterClearance,
          segments: 8
       }, {matPrms: cncMat}, this.mats);
      cncCutter.rotateX(Math.PI / 2);
      cncCutter.position.set(
       0, 0, (cncHeadClearance + cncCutterClearance) / 2 - cncCutterReach);

      // const leftRail = makeBoxElement(
      //  'cncSideRail', topGroup, {
      //     width: .1,
      //     height: .1,
      //     depth: rigSize
      //  }, {matPrms: cncMat}, this.mats);
      // leftRail.position.set(-.05, rigSize / 2, cncHeight);
      // leftRail.rotateX(-Math.PI / 2);
      // leftRail.castShadow = true;

      // const cutter = makeCylinderElement(
      //  'cutter', xyzGroup, {
      //     radius: cutWidth / 2,
      //     height: .3,
      //     segments: 8
      //  }, {matPrms: scuffedMetalMat}, this.mats);
      // cutter.rotateX(Math.PI / 2);
      // cutter.position.set(0, 0, 0.05);
      // cutter.castShadow = true;

      // const cncArm = makeBoxElement(
      //  'cncArm', yGroup, {
      //     width: rigSize,
      //     height: .1,
      //     depth: .1
      //  }, {matPrms: scuffedMetalMat}, this.mats);
      // cncArm.position.set(rigSize / 2, .22, cncHeight);
      // cncArm.castShadow = true;

      // const cncHeadArmBracket = makeBoxElement(
      //  'cncHeadArmBracket', xyGroup, {
      //     width: .2,
      //     height: .14,
      //     depth: .14
      //  }, {matPrms: scuffedMetalMat}, this.mats);
      // cncHeadArmBracket.position.set(0, .22, cncHeight);
      // cncHeadArmBracket.castShadow = true;

      // const cncHeadBracket = makeBoxElement(
      //  'cncHeadBracket', xyGroup, {
      //     width: .3,
      //     height: .3,
      //     depth: .1
      //  }, {matPrms: scuffedMetalMat}, this.mats);
      // cncHeadBracket.position.set(0, 0, cncHeight);
      // cncHeadBracket.castShadow = true;

      // const cncHead = makeCylinderElement(
      //  'cncHead', xyzGroup, {
      //     radius: .1,
      //     height: .3,
      //     segments: 16
      //  }, {matPrms: scuffedMetalMat}, this.mats);
      // cncHead.rotateX(Math.PI / 2);
      // cncHead.position.set(0, 0, cncHeight - 0.05);
      // cncHead.castShadow = true;

      // const testExtrude = makeExtrudeElement(
      //  'testExtrude', topGroup, {
      //     shape: new THREE.Shape([
      //        new THREE.Vector2(0, 0),
      //        new THREE.Vector2(0, .2),
      //        new THREE.Vector2(.3, .2),
      //        new THREE.Vector2(.2, 0)
      //     ]),
      //     options: {
      //        depth: .3,
      //        bevelEnabled: false
      //     }
      //  }, {matPrms: scuffedMetalMat}, this.mats);
      // testExtrude.position.set(5, 5, 3);
      // testExtrude.castShadow = true;

      // const cncBracket = makeExtrudeElement(
      //  'cncBracket', yGroup, {
      //     shape: new THREE.Shape([
      //        new THREE.Vector2(0, 0),
      //        new THREE.Vector2(0, .2),
      //        new THREE.Vector2(.2, 0)
      //     ]),
      //     options: {
      //        depth: .2,
      //        bevelEnabled: false
      //     }
      //  }, {matPrms: scuffedMetalMat}, this.mats);
      // cncBracket.position.set(0, .22, cncHeight);
      // cncBracket.castShadow = true;
      

      // Return object to hold different moving groups
      return {
         topGroup,
         yGroup,
         xyGroup,
         xyzGroup
      };
   }

   setupRig(rigMat) {
      const {rigSize, rigHeight, rigThickness, offsetDistance, cutWidth,
       cncCutterReach} = LandGrabSceneGroup;
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
         }
         
         if (evt.type === LandGrabMovie.cValidCircle) {
            const circleId = evt.circleId;

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

            this.circles[circleId] = circle;

            this.transitions[circleId] = {
               x: this.getScaledDim(evt.x + evt.r),
               y: this.getScaledDim(evt.y),
            };
            this.transitions[circleId + 1] = {
               x: 0,
               y: 0,
            };
         }
      }


      for (let i = 0; i < evts.length; i++) {
         evt = evts[i];

         if (evt.type === LandGrabMovie.cTransition) {
            // Transition from a to b
            const a = this.transitions[evt.circleId];
            const b = this.transitions[evt.circleId + 1];

            // Transition is 1/4 move cutter up, 1/2 move to circle, 1/4 down
            if (evt.fadeLevel < 1/8) {
               const s = (cncCutterReach/2) * (evt.fadeLevel) ** 2 / (1/8) ** 2;
               evt.pos = new THREE.Vector3(a.x, a.y, s);
            }
            else if (evt.fadeLevel < 1/4) {
               const s = cncCutterReach
                - (cncCutterReach/2) * (1/4 - evt.fadeLevel) ** 2 / (1/8) ** 2;
               evt.pos = new THREE.Vector3(a.x, a.y, s);
            }
            else if (evt.fadeLevel < 1/2) {
               const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
               const s = (d/2) * (evt.fadeLevel - 1/4) ** 2 / (1/4) ** 2;
               const p = s / d;
               
               const x = a.x + (b.x - a.x) * p;
               const y = a.y + (b.y - a.y) * p;
               evt.pos = new THREE.Vector3(x, y, cncCutterReach);
            }
            else if (evt.fadeLevel < 3/4) {
               const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
               const s = d
                - (d/2) * (3/4 - evt.fadeLevel) ** 2 / (1/4) ** 2;
               const p = s / d;

               const x = a.x + (b.x - a.x) * p;
               const y = a.y + (b.y - a.y) * p;
               evt.pos = new THREE.Vector3(x, y, cncCutterReach);
            }
            else if (evt.fadeLevel < 7/8) {
               const s = cncCutterReach
                - (cncCutterReach/2) * (3/4 - evt.fadeLevel) ** 2 / (1/8) ** 2;
               evt.pos = new THREE.Vector3(b.x, b.y, s);
            }
            else {
               const s = (cncCutterReach/2) * (1 - evt.fadeLevel) ** 2 / (1/8) ** 2;
               evt.pos = new THREE.Vector3(b.x, b.y, s);
            }
         }
      }
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
            this.updateCircle(evt.circleId, evt.angle);
            this.cnc.yGroup.position.y = this.getScaledDim(
             evt.y + evt.r * Math.sin(evt.angle));
            this.cnc.xyGroup.position.x = this.getScaledDim(
             evt.x + evt.r * Math.cos(evt.angle));
            this.cnc.visible = true;
         }

         if (evt.type === LandGrabMovie.cCircleFade) {
            const fadeTime = evt.fadeTime;
            const circle = this.circles[evt.circleId];

            if (Math.abs(fadeTime - LandGrabMovie.cFadeTime) < 0.05)
               circle.moveGroup.children.forEach(child => {
                  child.visible = false;
               });
            else {
               circle.moveGroup.position.z = -1/2 * 9.81 * fadeTime**2;
               circle.moveGroup.rotateY(-Math.sqrt(fadeTime) / 30);
            }
         }

         if (evt.type === LandGrabMovie.cTransition) {
            // // Transition from a to b
            // const a = this.transitions[evt.circleId];
            // const b = this.transitions[evt.circleId + 1];

            // if (evt.fadeLevel < 0.3) {
            //    this.cnc.yGroup.position.y = a.y;
            //    this.cnc.xyGroup.position.x = a.x;
            //    this.cnc.xyzGroup.position.z = evt.fadeLevel / 3 - .1;
            // }
            // else if (evt.fadeLevel > 0.7) {
            //    this.cnc.yGroup.position.y = b.y;
            //    this.cnc.xyGroup.position.x = b.x;
            //    this.cnc.xyzGroup.position.z = (1 - evt.fadeLevel) / 3 - .1;
            // }
            // else {
            //    this.cnc.yGroup.position.y = a.y + (b.y - a.y)
            //     * (evt.fadeLevel - 0.3) / 0.4;
            //    this.cnc.xyGroup.position.x = a.x + (b.x - a.x)
            //     * (evt.fadeLevel - 0.3) / 0.4;
            // }

            this.cnc.yGroup.position.y = evt.pos.y;
            this.cnc.xyGroup.position.x = evt.pos.x;
            this.cnc.xyzGroup.position.z = evt.pos.z;
         }
      }

      while (this.evtIdx > 0 && timeStamp < evts[this.evtIdx].time) {
         evt = evts[this.evtIdx--];

         if (evt.type === LandGrabMovie.cCircleGrowth) {
            this.updateCircle(evt.circleId, evt.angle);
            this.cnc.yGroup.position.y = this.getScaledDim(
             evt.y + evt.r * Math.sin(evt.angle));
            this.cnc.xyGroup.position.x = this.getScaledDim(
             evt.x + evt.r * Math.cos(evt.angle));
         }

         if (evt.type === LandGrabMovie.cCircleFade) {
            const fadeTime = evt.fadeTime;
            const circle = this.circles[evt.circleId];

            if (Math.abs(fadeTime - LandGrabMovie.cFadeTime) < 0.05)
               circle.moveGroup.children.forEach(child => {
                  child.visible = true;
               });
            else {
               circle.moveGroup.position.z = -1/2 * 9.81 * fadeTime**2;
               circle.moveGroup.rotateY(Math.sqrt(fadeTime) / 30);
            }
         }

         if (evt.type === LandGrabMovie.cTransition) {
            // Transition from a to b
            const a = this.transitions[evt.circleId];
            const b = this.transitions[evt.circleId + 1];

            // if (evt.fadeLevel < 0.3) {
            //    this.cnc.yGroup.position.y = a.y;
            //    this.cnc.xyGroup.position.x = a.x;
            //    this.cnc.xyzGroup.position.z = evt.fadeLevel / 3 - .1;
            // }
            // else if (evt.fadeLevel > 0.7) {
            //    this.cnc.yGroup.position.y = b.y;
            //    this.cnc.xyGroup.position.x = b.x;
            //    this.cnc.xyzGroup.position.z = (1 - evt.fadeLevel) / 3 - .1;
            // }
            // else {
            //    this.cnc.yGroup.position.y = a.y + (b.y - a.y)
            //     * (evt.fadeLevel - 0.3) / 0.4;
            //    this.cnc.xyGroup.position.x = a.x + (b.x - a.x)
            //     * (evt.fadeLevel - 0.3) / 0.4;
            // }

            this.cnc.yGroup.position.y = evt.pos.y;
            this.cnc.xyGroup.position.x = evt.pos.x;
            this.cnc.xyzGroup.position.z = evt.pos.z;
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