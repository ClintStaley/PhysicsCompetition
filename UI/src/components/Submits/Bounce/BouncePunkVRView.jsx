import React from 'react';
import {BounceMovie} from './BounceMovie';
import * as THREE from "three";
import CameraControls from "camera-controls";
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import {BouncePunkSceneGroup} from './BouncePunkSceneGroup';
import {VRMovieController} from '../VRMovieController';
import VRControl from '../../Util/VRControl';
import ThreeMeshUI from 'three-mesh-ui';
import FontJSON from '../../../assets/fonts/Roboto-msdf.json';
import FontImage from '../../../assets/fonts/Roboto-msdf.png';

let selectState = false;

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

   // Return state displaying background grid and other fixtures
   // appropriate for |movie|.  
   static getInitState(movie) {
      const {roomWidth, roomDepthVR, balconyDepth, balconyHeight}
       = BouncePunkSceneGroup;
      // const rigSize = BouncePunkSceneGroup.rigSize;

      let scene = new THREE.Scene();
      let sceneGroup = new BouncePunkSceneGroup(movie, true);

      // Position room so that 0, 0, 0 is back middle of floor
      scene.add(sceneGroup.getSceneGroup());

      BouncePunkVRView.makeLights(scene, 0xFFECE1, sceneGroup.roomDepth);

      // CAS Fix: Try moving renderer out of state
      let renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.shadowMap.enabled = true;
      renderer.physicallyCorrectLights = true;
      renderer.shadowMap.type = THREE.BasicShadowMap;
      // renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.xr.enabled = true;
      renderer.xr.setFramebufferScaleFactor(0.8);

      // Create button to initiate a VR session
      const enterVRButton = VRButton.createButton(renderer);

      const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 50);
      camera.position.set(0, 1.6, 0); // Approximate position of head

      const cameraGroup = new THREE.Group();
      cameraGroup.add(camera);
      cameraGroup.position.set(
       roomWidth / 2, balconyHeight, roomDepthVR - 1);
      scene.add(cameraGroup);

      const movieController = new VRMovieController(movie, (offset) => {
         sceneGroup.setOffset(offset);
      });

      const guiScale = 0.4;

      // Create gui block to hold buttons
      const controlsBlock = new ThreeMeshUI.Block({
         justifyContent: 'center',
         contentDirection: 'column',
         fontFamily: FontJSON,
         fontTexture: FontImage,
         padding: 0.02 * guiScale,
         borderRadius: 0.11 * guiScale,
         backgroundOpacity: 1
      });
      controlsBlock.rotateX(-Math.PI / 2);
      controlsBlock.position.set(0, 0, -0.3);

      // Objects to store button options and state attributes
      const buttonOptions = {
         width: 0.4 * guiScale,
         height: 0.15 * guiScale,
         justifyContent: 'center',
         fontSize: 0.07 * guiScale,
         offset: 0.02 * guiScale,
         margin: 0.02 * guiScale,
         borderRadius: 0.075 * guiScale,
         backgroundOpacity: 1
      };

      // State attributes to change appearance when interacted with
      const hoveredStateAttributes = {
         state: 'hovered',
         attributes: {
            offset: buttonOptions.offset,
            backgroundColor: new THREE.Color(0x999999),
            // backgroundOpacity: 1,
            fontColor: new THREE.Color(0xffffff)
         },
      };

      const idleStateAttributes = {
         state: 'idle',
         attributes: {
            offset: buttonOptions.offset,
            backgroundColor: new THREE.Color(0x666666),
            // backgroundOpacity: 1,
            fontColor: new THREE.Color(0xffffff)
         },
      };

      const selectedStateAttributes = {
         offset: buttonOptions.offset / 4,
         backgroundColor: new THREE.Color(0x777777),
         fontColor: new THREE.Color(0x222222)
      };

      const buttonPlay = new ThreeMeshUI.Block(buttonOptions);
      buttonPlay.add(
         new ThreeMeshUI.Text({content: 'Play'})
      );
      const buttonPlaySlow = new ThreeMeshUI.Block(buttonOptions);
      buttonPlaySlow.add(
         new ThreeMeshUI.Text({content: 'Play Slow'})
      );
      const buttonPause = new ThreeMeshUI.Block(buttonOptions);
      buttonPause.add(
         new ThreeMeshUI.Text({content: 'Pause'})
      );

      // Set up button states
      buttonPlay.setupState({
         state: 'selected',
         attributes: selectedStateAttributes,
         onSet: () => {
            movieController.play(1);
         }
      });
      buttonPlay.setupState(hoveredStateAttributes);
      buttonPlay.setupState(idleStateAttributes);

      buttonPlaySlow.setupState({
         state: 'selected',
         attributes: selectedStateAttributes,
         onSet: () => {
            movieController.play(0.1);
         }
      });
      buttonPlaySlow.setupState(hoveredStateAttributes);
      buttonPlaySlow.setupState(idleStateAttributes);

      buttonPause.setupState({
         state: 'selected',
         attributes: selectedStateAttributes,
         onSet: () => {
            movieController.pause();
         }
      });
      buttonPause.setupState(hoveredStateAttributes);
      buttonPause.setupState(idleStateAttributes);

      // Sub-block to hold smaller buttons
      const subBlock = new ThreeMeshUI.Block(controlsBlock);
      subBlock.contentDirection = 'row';
      subBlock.padding = 0;
      subBlock.offset = 0;

      // Add buttons and sub-block to gui block
      controlsBlock.add(buttonPlay, buttonPlaySlow, buttonPause, subBlock);

      // Options and states for small buttons
      const smallButtonOptions = {...buttonOptions}
      smallButtonOptions.width = buttonOptions.width / 2 - buttonOptions.margin;
      smallButtonOptions.fontSize /= 1.3;

      // const smallHoveredStateAttributes = {
      //    state: 'hovered',
      //    attributes: {
      //       offset: 0.02,
      //       backgroundColor: new THREE.Color(0x999999),
      //       // backgroundOpacity: 1,
      //       fontColor: new THREE.Color(0xffffff)
      //    },
      // };

      // const smallIdleStateAttributes = {
      //    state: 'idle',
      //    attributes: {
      //       offset: 0.02,
      //       backgroundColor: new THREE.Color(0x666666),
      //       // backgroundOpacity: 1,
      //       fontColor: new THREE.Color(0xffffff)
      //    },
      // };

      // const smallSelectedStateAttributes = {
      //    offset: 0.005,
      //    backgroundColor: new THREE.Color(0x777777),
      //    fontColor: new THREE.Color(0x222222)
      // };

      const smallButtonUp = new ThreeMeshUI.Block(smallButtonOptions);
      smallButtonUp.add(
         new ThreeMeshUI.Text({content: 'Up'})
      );
      const smallButtonDown = new ThreeMeshUI.Block(smallButtonOptions);
      smallButtonDown.add(
         new ThreeMeshUI.Text({content: 'Down'})
      );

      smallButtonUp.setupState({
         state: 'selected',
         attributes: selectedStateAttributes,
         onSet: () => {
            console.log('Up');
            cameraGroup.position.y = balconyHeight;
            cameraGroup.position.z = roomDepthVR - balconyDepth + 0.5;
         }
      });
      smallButtonUp.setupState(hoveredStateAttributes);
      smallButtonUp.setupState(idleStateAttributes);

      smallButtonDown.setupState({
         state: 'selected',
         attributes: selectedStateAttributes,
         onSet: () => {
            console.log('Down');
            cameraGroup.position.y = 0;
            cameraGroup.position.z = roomDepthVR - 2;
         }
      });
      smallButtonDown.setupState(hoveredStateAttributes);
      smallButtonDown.setupState(idleStateAttributes);

      subBlock.add(smallButtonUp, smallButtonDown);

      // Array of objects that can be interacted with, to test for selection
      const controlButtons = [
         buttonPlay,
         buttonPlaySlow,
         buttonPause,
         smallButtonUp,
         smallButtonDown
      ];

      // Create VR controller to handle controllers and relevant functions
      const vrControl = VRControl(renderer, camera, scene);
      cameraGroup.add(vrControl.controllerGrips[0], vrControl.controllers[0]);
      cameraGroup.add(vrControl.controllerGrips[1], vrControl.controllers[1]);

      // Object to hold controllers when they connect
      let controllers = {
         leftController: null,
         rightController: null
      };

      // Assigns GUI to left controller, pointer and select listeners to right
      function setControllerHandedness(event, index) {
         console.log(event);
         if (event.data.handedness === 'right') {
            controllers.rightController = event.target;
            controllers.rightController.index = index;

            vrControl.addPointer(index);

            controllers.rightController.addEventListener('selectstart', () => {
               selectState = true;
               console.log('selectstart');
            });
            controllers.rightController.addEventListener('selectend', () => {
               selectState = false;
               console.log('selectend');
            });
         }
         else {
            controllers.leftController = event.target;
            controllers.leftController.index = index;
            vrControl.controllerGrips[index].add(controlsBlock);
         }
      }

      // When controllers connect, determine handedness
      vrControl.controllers[0].addEventListener('connected', (event) => {
         setControllerHandedness(event, 0);
      });
      vrControl.controllers[1].addEventListener('connected', (event) => {
         setControllerHandedness(event, 1);
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
         vrControl,
         controllers,
         controlButtons,
         enterVRButton,
         movieController,
         movie,
      };
   }

   static makeLights(scene, lightColor, roomDepth) {
      const {roomHeight, roomWidth} = BouncePunkSceneGroup;

      const numOfLights = 1;

      for (let i = 0; i < numOfLights; i++) {
         let light = new THREE.PointLight(lightColor);
         light.decay = 0.2;
         light.castShadow = true;
         light.position.set(
          (i + 0.5) * (roomWidth / numOfLights),
          roomHeight - 3, roomDepth - 1);
         light.power = 85 / numOfLights;
         light.shadow.mapSize.width = 1024;
         light.shadow.mapSize.height = 1024;
         light.shadow.radius = 1;
         scene.add(light);
         // let lightHelper = new THREE.PointLightHelper(light);
         // scene.add(lightHelper);
      }

      // // Create spotlight which follows ball
      // let ballLight = new THREE.SpotLight(lightColor);
      // ballLight.angle = Math.PI / 30;
      // ballLight.penumbra = 0.8;
      // ballLight.decay = 2;
      // ballLight.name = "ballLight";
      // ballLight.castShadow = true;
      // ballLight.position.set(
      //  roomWidth / 2, roomHeight / 2, roomDepth3D - 0.5);
      // ballLight.power = 400;
      // // ballLight.target = sceneGroup.getBall();
      // ballLight.target.position.set(
      //  (roomWidth - rigSize) / 2, rigSize, rigDepth);
      // scene.add(ballLight).add(ballLight.target);
      // ballLight.target.updateMatrixWorld();

      // Plus general ambient
      scene.add(new THREE.AmbientLight(lightColor));
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
      // let cameraControls;

      this.state.renderer.setSize(width, height);

      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();
      this.mount.appendChild(this.state.renderer.domElement);

      this.state.renderer.setAnimationLoop(time => {
         this.renderFrame(time);
      });

      this.mount.appendChild(this.state.enterVRButton);

      // Do a render
      this.state.renderer.render(
       this.state.scene, this.state.camera);
   }

   componentWillUnmount() {
      this.state.enterVRButton.remove();
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = BouncePunkVRView.getInitState(newProps.movie);
      return BouncePunkVRView.setOffset(rtn, newProps.offset);
   }

   renderFrame(time) {
      ThreeMeshUI.update();
      this.state.movieController.animate(time);
      this.state.renderer.render(this.state.scene, this.state.camera);
      if (this.state.controllers.leftController) // Controller that holds gui
         this.updateButtons();
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

   updateButtons() {
      let intersect;

      const raycaster = new THREE.Raycaster();

      if (this.state.controllers.rightController) { // Pointer controller
         const index = this.state.controllers.rightController.index;

         this.state.vrControl.setFromController(index, raycaster.ray);
         intersect = this.raycast(raycaster);

         // Position the white dot at the end of the controller pointing ray
         if (intersect)
            this.state.vrControl.setPointerAt(index, intersect.point);
         else
            this.state.vrControl.setPointerAt(index, null);
      }

      // Update targeted button state (if any)
      if (intersect && intersect.object.isUI) {
         if (selectState) {
            // Component.setState internally call component.set with the
            // options you defined in component.setupState
            intersect.object.setState('selected');
         }
         else {
            // Component.setState internally call component.set with the
            // options you defined in component.setupState
            intersect.object.setState('hovered');
         }
      }

      // Update non-targeted buttons state
      this.state.controlButtons.forEach((obj) => {
         if ((!intersect || obj !== intersect.object) && obj.isUI) {

            // Component.setState internally call component.set with the
            // options you defined in component.setupState
            obj.setState('idle');
         }
      });
   }

   raycast(raycaster) {
      return this.state.controlButtons.reduce((closestIntersection, obj) => {
         const intersection = raycaster.intersectObject(obj, true);

         if (!intersection[0])
            return closestIntersection;

         if (!closestIntersection
          || intersection[0].distance < closestIntersection.distance) {
            intersection[0].object = obj;

            return intersection[0];
         }

         return closestIntersection;
      }, null);
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