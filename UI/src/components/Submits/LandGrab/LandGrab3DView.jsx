import React from 'react';
import {LandGrabMovie} from './LandGrabMovie';
import * as THREE from "three";
import CameraControls from "camera-controls";
import {LandGrabSceneGroup} from './LandGrabSceneGroup';

CameraControls.install({THREE});

export class LandGrab3DView extends React.Component {
   // Props are: {
   //    movie: movie to display
   //    offset: time offset from movie start in sec
   // }
   constructor(props) {
      super(props);

      this.state = LandGrab3DView.setOffset(
       LandGrab3DView.getInitState(props.movie), props.offset);
   }

   // Return state displaying background grid and other fixtures
   // appropriate for |movie|.
   static getInitState(movie) {
      const {roomWidth, roomHeight, roomDepth, rigSize} = LandGrabSceneGroup;
      let scene = new THREE.Scene();

      let camera = new THREE.PerspectiveCamera(70);
      // JSB Fix: Work out why camera is offset by 0.5
      camera.position.set(roomWidth / 2 - 0.5, rigSize, roomDepth);
      const listener = new THREE.AudioListener();
      camera.add(listener);

      let sceneGroup = new LandGrabSceneGroup(movie, true, listener);
      scene.add(sceneGroup.getSceneGroup());

      const numOfLights = 2;
      const lightColor = 0xFFECE1;
      const lightIntensity = 18;
      const lightDecay = 0.2;
      const totalPower = 60;

      for (let i = 0; i < numOfLights; i++) {
         for (let j = 0; j < numOfLights; j++) {
            let light = new THREE.PointLight(
             lightColor, lightIntensity, 0, lightDecay);
            light.castShadow = true;
            light.position.set(
             (i + 0.5) * (roomWidth / numOfLights),  
             roomHeight - 0.5,
             (j + 0.5) * (roomDepth / numOfLights));
            light.power = totalPower / numOfLights; 
            scene.add(light);
            // light.renderOrder = 103;
            // let lightHelper = new THREE.PointLightHelper(light);
            // scene.add(lightHelper);
         }
      }

      // Plus general ambient
      scene.add(new THREE.AmbientLight(lightColor));

      // CAS FIX: Try moving renderer out of state
      let renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.shadowMap.enabled = true;
      renderer.physicallyCorrectLights = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      // Rerender when all pending textures are loaded to show new textures.
      Promise.all(sceneGroup.getPendingPromises()).then(() => {
         renderer.render(scene, camera);
         console.log("All pending textures loaded");
      });

      return {
         scene,
         sceneGroup,
         camera,
         renderer,
         movie
      };
   }

   componentDidMount() {
      const {roomWidth, roomHeight, roomDepth, rigSize, rigHeight}
       = LandGrabSceneGroup;
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      let cameraControls;

      this.state.renderer.setSize(width, height);

      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();
      this.mount.appendChild(this.state.renderer.domElement);

      let cameraBounds = new THREE.Box3(new THREE.Vector3(0.5, 0.5, 0.5),
       new THREE.Vector3(roomWidth - 0.5, roomHeight + 5, roomDepth - 0.5));

      cameraControls = new CameraControls(
         this.state.camera,
         this.state.renderer.domElement
      );

      // Restrict right click camera movement
      cameraControls.setBoundary(cameraBounds);
      cameraControls.boundaryEnclosesCamera = true;
      cameraControls.maxDistance = roomDepth;
      cameraControls.colliderMeshes = this.state.sceneGroup.getColliderMeshes();

      cameraControls.addEventListener('control', () => {
         cameraControls.update(1);   // Needed w/nonzero param
         this.state.renderer.render(this.state.scene, this.state.camera);
      });

      function animate() {
         requestAnimationFrame(animate);
         cameraControls.update(1);
         this.state.renderer.render(this.state.scene, this.state.camera);
      }

      // Point to center of rig
      cameraControls.setTarget(
       roomWidth / 2, rigHeight / 2 + 0.5, roomDepth / 2);
      cameraControls.update();

      // Do a render
      this.state.renderer.render(this.state.scene, this.state.camera);

      this.state.cameraControls = cameraControls;
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = LandGrab3DView.getInitState(newProps.movie);
      return LandGrab3DView.setOffset(rtn, newProps.offset);
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