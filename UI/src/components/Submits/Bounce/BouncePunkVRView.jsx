import React from 'react';
import {BounceMovie} from './BounceMovie';
import * as THREE from "three";
import CameraControls from "camera-controls";
import pingAudio from '../../../assets/sound/ping.mp3';
import UIfx from 'uifx';
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import {BouncePunkSceneGroup} from './BouncePunkSceneGroup';
import {VRMovieController} from '../VRMovieController';
import {ControllerPickHelper} from '../../Util/ControllerPickHelper';

// Display a room with a "rig" on one wall.  The rig has the launcher, targets,
// obstacles, and ball.  All 3JS units are meters.
export class BouncePunkVRView extends React.Component {
   // Props are: {
   //    movie: movie to display
   // }
   constructor(props) {
      super(props);

      this.state = BouncePunkVRView.getInitState(props.movie);
   }

   static makeButton(name, color, x) {
      const button = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5));
      button.name = name;
      button.material.color.setHex(color);

      button.position.x = x;
      button.position.y = 0;
      button.position.z = -3;

      return button;
   }

   static makeControlsGroup() {
      const controlsGroup = new THREE.Group();
      controlsGroup.name = 'controlsGroup';

      // Create buttons
      controlsGroup.add(BouncePunkVRView.makeButton('pauseButton', 0xff0000, -1));
      controlsGroup.add(BouncePunkVRView.makeButton('slowButton', 0xffff00, 0));
      controlsGroup.add(BouncePunkVRView.makeButton('playButton', 0x00ff00, 1));

      return controlsGroup;
   }

   // Return state displaying background grid and other fixtures
   // appropriate for |movie|.  
   static getInitState(movie) {
      const roomHeight = BouncePunkSceneGroup.roomHeight;
      const roomWidth = BouncePunkSceneGroup.roomWidth;
      const roomDepth = BouncePunkSceneGroup.roomDepth;
      const rigSize = BouncePunkSceneGroup.rigSize;

      let scene = new THREE.Scene();
      let sceneGroup = new BouncePunkSceneGroup(movie);

      // Position room so that 0, 0, 0 is back middle of floor
      sceneGroup.getSceneGroup().position.set(-roomWidth / 2, 0, -roomDepth);
      scene.add(sceneGroup.getSceneGroup());

      // Full range, square-decay, white light high on near wall in center
      // let light = new THREE.PointLight(0xffffff, 10);
      let leftLight = new THREE.SpotLight(
       0xffffff, 18, 0, Math.PI / 3.5, 0.8, 0.5);
      scene.add(leftLight).add(leftLight.target);
      leftLight.castShadow = true;
      leftLight.position.set(
       -roomWidth / 2 + 0.5, roomHeight - 0.5, 0);
      leftLight.target.position.set(0, roomHeight / 2, roomDepth);
      let leftLightHelper = new THREE.SpotLightHelper(leftLight);
      scene.add(leftLightHelper);
      // leftLight.decay = 0.5;
      // leftLight.power = 30;
      // leftLight.penumbra = 0.5;
      // leftLight.angle = Math.Pi / 3.5;

      let rightLight = new THREE.SpotLight(
       0xffffff, 18, 0, Math.PI / 2.5, 0.8, 0.5);
      rightLight.castShadow = true;
      rightLight.position.set(
       roomWidth / 2 - 0.5, roomHeight - 0.5, 0);
      rightLight.target.position.set(0, roomHeight, roomDepth);
      // rightLight.decay = 0.5;
      // rightLight.power = 30;
      // rightLight.penumbra = 0.5;
      // rightLight.angle = Math.Pi / 3.5;
      // light.position.set(0, 0, roomDepth / 2);
      // light.castShadow = true;
      // Plus general ambient
      scene.add(rightLight)
       .add(new THREE.AmbientLight(0xffffff)); // 0x808080

      // CAS Fix: Try moving renderer out of state
      let renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.shadowMap.enabled = true;
      renderer.physicallyCorrectLights = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.xr.enabled = true;

      // Create button to initiate a VR session
      const button = VRButton.createButton(renderer);


      const fov = 75;
      const aspect = 2;  // the canvas default
      const near = 0.1;
      const far = 50;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 1.6, 0);

      const movieController = new VRMovieController(movie, (offset) => {
         sceneGroup.setOffset(offset);
      });

      // Group to contain control objects
      const controlsGroup = BouncePunkVRView.makeControlsGroup();
      scene.add(controlsGroup);

      // Map of buttons to VRMovieController methods
      const functionMap = {
         'pauseButton': () => {
            movieController.pause();
         },
         'slowButton': () => {
            movieController.play(0.5);
         },
         'playButton': () => {
            movieController.play(1);
         }
      };

      // Create controller helper
      const controllerHelper = new ControllerPickHelper(scene, renderer);
      const controllerToSelection = new Map();

      // Event listener to trigger function based on object selected
      controllerHelper.addEventListener('selectstart', (event) => {
         const {controller, selectedObject} = event;
         const existingSelection = controllerToSelection.get(controller);
         if (!existingSelection) {
            controllerToSelection.set(controller, selectedObject);
            functionMap[selectedObject.name]();
         }
      });

      controllerHelper.addEventListener('selectend', (event) => {
         const {controller} = event;
         const selection = controllerToSelection.get(controller);
         if (selection) {
            controllerToSelection.delete(controller);
         }
      });

      // Rerender when all pending textures are loaded to show new textures.
      Promise.all(sceneGroup.getPendingPromises()).then(() => {
         renderer.render(scene, camera);
      });

      return {
         scene,
         sceneGroup,
         camera,
         renderer,
         controllerHelper,
         controlsGroup,
         button,
         movieController,
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
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      let rigSize = BouncePunkSceneGroup.rigSize;
      // let cameraControls;

      this.state.renderer.setSize(width, height);

      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();
      this.mount.appendChild(this.state.renderer.domElement);

      this.state.renderer.setAnimationLoop(time => {
         BouncePunkVRView.renderFrame(time, this.state);
      });

      this.mount.appendChild(this.state.button);

      // let cameraBounds = new THREE.Box3(new THREE.Vector3(rigSize - 24,
      //    rigSize - 19, rigSize - 8), new THREE.Vector3(rigSize + 4, rigSize + 4,
      //    rigSize + 5))

      // cameraControls = new CameraControls(
      //    this.state.camera,
      //    this.state.renderer.domElement
      // );
      // Restric right click camera movement
      // cameraControls.setBoundary(cameraBounds);
      // cameraControls.boundaryEnclosesCamera = true;

      // cameraControls.addEventListener("control", () => {
      //    cameraControls.update(1);   // Needed w/nonzero param
      //    this.state.renderer.render(
      //     this.state.scene, this.state.camera);
      // });

      // cameraControls.setTarget(0, 0, 0);  // Center of rig

      // Do a render
      this.state.renderer.render(
       this.state.scene, this.state.camera);
   }

   componentWillUnmount() {
      this.state.button.remove();
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = BouncePunkVRView.getInitState(newProps.movie);
      return BouncePunkVRView.setOffset(rtn, newProps.offset);
   }

   static renderFrame(time, state) {
      state.movieController.animate(time);
      state.controllerHelper.update(state.controlsGroup);

      state.renderer.render(state.scene, state.camera);
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
            style={{height: "600px", width: "100%", position: "relative"}}
            ref={(mount) => {
               this.mount = mount;
            }}
         ></div>
      )
   }
}