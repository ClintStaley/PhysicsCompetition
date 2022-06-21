import React from 'react';
import {BounceMovie} from './BounceMovie';
import * as THREE from "three";
import CameraControls from "camera-controls";
import pingAudio from '../../../assets/sound/ping.mp3';
import UIfx from 'uifx';
import {BouncePunkSceneGroup} from './BouncePunkSceneGroup';
import { SpotLight } from 'three';

CameraControls.install({THREE});

// Display a room with a "rig" on one wall.  The rig has the launcher, targets,
// obstacles, and ball.  All 3JS units are meters.
export class BouncePunk3DView extends React.Component {
   // Props are: {
   //    movie: movie to display
   //    offset: time offset from movie start in sec
   // }
   constructor(props) {
      super(props);

      this.state = BouncePunk3DView.setOffset(
         BouncePunk3DView.getInitState(props.movie), props.offset);
   }

   // Return state displaying background grid and other fixtures
   // appropriate for |movie|.  
   static getInitState(movie) {
      const {roomHeight, roomWidth, roomDepth3D, rigSize} = BouncePunkSceneGroup;
      let scene = new THREE.Scene();
      let sceneGroup = new BouncePunkSceneGroup(movie);
      scene.add(sceneGroup.getSceneGroup());

      const numOfLights = 4;

      for (let i = 0; i < numOfLights; i++) {
         let light = new THREE.SpotLight(
          0xffffff, 18, 0, Math.PI / 5, 1, 2);
         light.castShadow = true;
         light.position.set(
          1 + i, roomHeight - 0.5, roomDepth3D - 0.5);
         light.position.x =
          (i + 0.5) * (roomWidth / numOfLights);
         light.target.position.set(light.position.x, 5, 0);
         light.power = 800;
         scene.add(light).add(light.target);
         light.target.updateMatrixWorld();
         // let lightHelper = new THREE.SpotLightHelper(light);
         // scene.add(lightHelper);
      }

      let ballLight = new THREE.SpotLight(
       0xffffff, 18, 0, Math.PI / 20, 0.8, 2);
      ballLight.name = "ballLight";
      ballLight.castShadow = true;
      ballLight.position.set(
       roomWidth / 2, roomHeight / 2, roomDepth3D - 0.5);
      ballLight.power = 400;
      // ballLight.target = sceneGroup.getBall();
      ballLight.target.position.set(-rigSize / 2, rigSize / 2, 0);
      scene.add(ballLight).add(ballLight.target);
      ballLight.target.updateMatrixWorld();

      // Plus general ambient
      scene.add(new THREE.AmbientLight(0xffffff)); // 0x808080

      // CAS Fix: Try moving renderer out of state
      let renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.shadowMap.enabled = true;
      renderer.physicallyCorrectLights = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      let camera = new THREE.PerspectiveCamera(
       60, 1, .01, 10 * BouncePunkSceneGroup.rigSize);
      camera.position.set(roomWidth / 2, rigSize / 2, 10);  // Center of near wall

      // Rerender when all pending textures are loaded to show new textures.
      Promise.all(sceneGroup.getPendingPromises()).then(() => {
         renderer.render(scene, camera);
      });

      return {
         scene,
         sceneGroup,
         camera,
         renderer,
         movie
      };
   }

   // Do state setup dependent on this.mount, including:
   //
   // 1. Set size of renderer.
   // 2. Adjust camera aspect ratio from default initial value of 1.
   // 3. Attach the renderer dom element to the mount.
   // 4. Do a render
   componentDidMount() {
      const {roomWidth, roomHeight, rigDepth, rigSize} = BouncePunkSceneGroup;
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      let cameraControls;

      this.state.renderer.setSize(width, height);

      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();
      this.mount.appendChild(this.state.renderer.domElement);

      // let cameraBounds = new THREE.Box3(new THREE.Vector3(rigSize - 24,
      //    rigSize - 19, rigSize - 8), new THREE.Vector3(rigSize + 4, rigSize + 4,
      //    rigSize + 5))

      cameraControls = new CameraControls(
         this.state.camera,
         this.state.renderer.domElement
      );
      // Restric right click camera movement
      // cameraControls.setBoundary(cameraBounds);
      // cameraControls.boundaryEnclosesCamera = true;

      cameraControls.addEventListener("control", () => {
         cameraControls.update(1);   // Needed w/nonzero param
         this.state.renderer.render(this.state.scene, this.state.camera);
      });

      cameraControls.setTarget(roomWidth / 2, rigSize / 2, rigDepth);  // Center of rig
      cameraControls.update();

      // Do a render
      this.state.renderer.render(this.state.scene, this.state.camera);
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = BouncePunk3DView.getInitState(newProps.movie);
      return BouncePunk3DView.setOffset(rtn, newProps.offset);
   }


   // Advance/retract |state| so that state reflects all and only those events
   // in |movie| with time <= |timeStamp|.  Assume existing |state| was built
   // from |movie| so incremental change is appropriate.  Return adjusted state
   static setOffset(state, timeStamp) {
      let {scene, sceneGroup, camera, renderer, movie} = state;
      sceneGroup.setOffset(timeStamp);
      return {
         scene,
         sceneGroup,
         camera,
         renderer,
         movie
      }
   }

   render() {
      this.state.renderer.render(this.state.scene, this.state.camera);

      // Update ball spotlight to point to ball
      if (this.state.sceneGroup.getCurrentBall())
         this.state.scene.getObjectByName("ballLight").target = this.state.sceneGroup.getCurrentBall();
      return (
         <div
            style={{height: "600px", width: "100%"}}
            ref={(mount) => {
               this.mount = mount;
            }}
         ></div>
      )
   }
}