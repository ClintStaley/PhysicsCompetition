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
import {GUI} from 'dat.gui';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';

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
      const {roomHeight, roomWidth, roomDepthVR, rigDepth} = BouncePunkSceneGroup;
      const rigSize = BouncePunkSceneGroup.rigSize;

      let scene = new THREE.Scene();
      let sceneGroup = new BouncePunkSceneGroup(movie);

      // Position room so that 0, 0, 0 is back middle of floor
      // sceneGroup.getSceneGroup().position.set(-roomWidth / 2, 0, -roomDepthVR);
      scene.add(sceneGroup.getSceneGroup());

      const test = new THREE.Mesh(
       new THREE.BoxGeometry(1, 1, 1),
       new THREE.MeshBasicMaterial({color: 0x00ff00}));
      scene.add(test);

      const numOfLights = 4;

      for (let i = 0; i < numOfLights; i++) {
         let light = new THREE.SpotLight(
          0xffffff, 18, 0, Math.PI / 5, 1, 2);
         light.castShadow = true;
         light.position.set(
          1 + i, roomHeight - 0.5, roomDepthVR - 0.5);
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
       roomWidth / 2, roomHeight / 2, roomDepthVR - 0.5);
      ballLight.power = 400;
      // ballLight.target = sceneGroup.getBall();
      ballLight.target.position.set(
       (roomWidth - rigSize) / 2, rigSize, rigDepth);
      scene.add(ballLight).add(ballLight.target);
      ballLight.target.updateMatrixWorld();

      // Plus general ambient
      scene.add(new THREE.AmbientLight(0xffffff)); // 0x808080

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

      const cameraGroup = new THREE.Group();
      cameraGroup.add(camera);
      cameraGroup.position.set(roomWidth / 2, 0, 10);
      scene.add(cameraGroup);

      const movieController = new VRMovieController(movie, (offset) => {
         sceneGroup.setOffset(offset);
      });

      const params = {
         pause: function () {
            movieController.pause();
            console.log('pause');
         },
         slow: function () {
            movieController.play(0.5);
            console.log('slow');
         },
         play: function () {
            movieController.play(1);
            console.log('play');
         }
      }

      const gui = new GUI();
      gui.add(params, 'pause');
      gui.add(params, 'slow');
      gui.add(params, 'play');
      gui.domElement.style.visibility = 'hidden';

      const group = new InteractiveGroup( renderer, camera );
      cameraGroup.add( group );

      const mesh = new HTMLMesh( gui.domElement );
      mesh.position.x = 0;
      mesh.position.y = 1;
      mesh.position.z = -1.5;
      mesh.rotation.x = -Math.PI / 8;
      mesh.scale.setScalar( 5 );
      group.add( mesh );

      // Create controller helper
      const controllerHelper = new ControllerPickHelper(cameraGroup, renderer);
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
         button,
         movieController,
         movie,
         gui
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

      // Do a render
      this.state.renderer.render(
       this.state.scene, this.state.camera);
   }

   componentWillUnmount() {
      this.state.button.remove();
      this.state.gui.destroy();
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = BouncePunkVRView.getInitState(newProps.movie);
      return BouncePunkVRView.setOffset(rtn, newProps.offset);
   }

   static renderFrame(time, state) {
      state.movieController.animate(time);

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