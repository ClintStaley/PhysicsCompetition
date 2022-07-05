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
import VRControl from '../../Util/VRControl';
import {GUI} from 'dat.gui';
import {HTMLMesh} from 'three/examples/jsm/interactive/HTMLMesh.js';
import {InteractiveGroup} from 'three/examples/jsm/interactive/InteractiveGroup.js';
import ThreeMeshUI from 'three-mesh-ui';
import FontJSON from '../../../assets/fonts/Roboto-msdf.json';
import FontImage from '../../../assets/fonts/Roboto-msdf.png';

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
      const {roomHeight, roomWidth, roomDepthVR, roomDepth3D, rigDepth, rigSize}
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
      // renderer.shadowMap.type = THREE.BasicShadowMap;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.xr.enabled = true;
      renderer.xr.setFramebufferScaleFactor(0.8);

      // Create button to initiate a VR session
      const enterVRButton = VRButton.createButton(renderer);

      const fov = 75;
      const aspect = 2;  // the canvas default
      const near = 0.1;
      const far = 50;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 1.6, 0);

      const cameraGroup = new THREE.Group();
      cameraGroup.add(camera);
      cameraGroup.position.set(
       roomWidth / 2, BouncePunkSceneGroup.balconyHeight,
       BouncePunkSceneGroup.roomDepthVR - 1);
      scene.add(cameraGroup);

      const movieController = new VRMovieController(movie, (offset) => {
         sceneGroup.setOffset(offset);
      });

      const guiPrms = {
         play: () => {
            movieController.play(1);
            console.log('play');
         },
         playSlow: () => {
            movieController.play(0.1);
            console.log('play slow');
         },
         pause: () => {
            movieController.pause();
            console.log('pause');
         },
      }

      const container = new ThreeMeshUI.Block({
         justifyContent: 'center',
         contentDirection: 'row-reverse',
         fontFamily: FontJSON,
         fontTexture: FontImage,
         fontSize: 0.07,
         padding: 0.02,
         borderRadius: 0.11
      });
      container.contentDirection = 'column';
      container.rotateX(-Math.PI / 4);

      // Objects to store button options and state attributes
      const buttonOptions = {
         width: 0.4,
         height: 0.15,
         justifyContent: 'center',
         offset: 0.02,
         margin: 0.02,
         borderRadius: 0.075
      };

      const hoveredStateAttributes = {
         state: 'hovered',
         attributes: {
            offset: 0.15,
            backgroundColor: new THREE.Color(0x999999),
            backgroundOpacity: 1,
            fontColor: new THREE.Color(0xffffff)
         },
      };

      const idleStateAttributes = {
         state: 'idle',
         attributes: {
            offset: 0.15,
            backgroundColor: new THREE.Color(0x666666),
            backgroundOpacity: 0.3,
            fontColor: new THREE.Color(0xffffff)
         },
      };

      const selectedStateAttributes = {
         offset: 0.005,
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

      const controlButtons = [
         buttonPlay,
         buttonPlaySlow,
         buttonPause
      ];

      buttonPlay.setupState({
         state: 'selected',
         attributes: selectedStateAttributes,
         onSet: () => {
            guiPrms.play();
         }
      });
      buttonPlay.setupState(hoveredStateAttributes);
      buttonPlay.setupState(idleStateAttributes);

      buttonPlaySlow.setupState({
         state: 'selected',
         attributes: selectedStateAttributes,
         onSet: () => {
            guiPrms.playSlow();
         }
      });
      buttonPlaySlow.setupState(hoveredStateAttributes);
      buttonPlaySlow.setupState(idleStateAttributes);

      buttonPause.setupState({
         state: 'selected',
         attributes: selectedStateAttributes,
         onSet: () => {
            guiPrms.pause();
         }
      });
      buttonPause.setupState(hoveredStateAttributes);
      buttonPause.setupState(idleStateAttributes);

      container.add(buttonPlay, buttonPlaySlow, buttonPause);

      const vrControl = VRControl(renderer, camera, scene);
      cameraGroup.add(vrControl.controllerGrips[0], vrControl.controllers[0]);
      cameraGroup.add(vrControl.controllerGrips[1], vrControl.controllers[1]);

      vrControl.controllers[0].addEventListener('selectstart', () => {
         selectState = true;
      });
      vrControl.controllers[0].addEventListener('selectend', () => {
         selectState = false;
      });

      let controllers = {
         leftController: null,
         rightController: null
      };

      let selectState = false;

      function setControllerHandedness(event, index) {
         console.log(event);
         if (event.data.handedness === 'right') {
            controllers.rightController = event.target;

            // // Add line
            // const line = new THREE.Line(pointerGeometry);
            // line.material.color.setHex(0xDDDDDD);
            // line.scale.z = 0.5;
            // this.rightController.controller.add(line);
            // this.rightController.line = line;
            vrControl.addPointer(index);
         }
         else {
            controllers.leftController = event.target;
            // this.dispatchEvent({
            //    type: 'leftControllerConnected',
            //    controllerGrip: controller.controllerGrip
            // });
            vrControl.controllerGrips[index].add(container);
         }
      }

      vrControl.controllers[0].addEventListener('connected', (event) => {
         setControllerHandedness(event, 0);
      });
      vrControl.controllers[1].addEventListener('connected', (event) => {
         setControllerHandedness(event, 1);
      });


      // const controllerToSelection = new Map();

      // controllerHelper.addEventListener('leftControllerConnected', (event) => {
      //    event.controllerGrip.add(container);
      // });

      // controllerHelper.addEventListener('leftControllerConnected', (event) => {
      //    event.controllerGrip.add(container);
      // })

      // // Create html gui to control scene
      // const gui = new GUI({width: 400});
      // gui.add(guiPrms, 'play')
      // .name('Play');
      // gui.add(guiPrms, 'playSlow')
      // .name('1/10 Speed');
      // gui.add(guiPrms, 'pause')
      // .name('Pause');
      // gui.add(movieController, 'currentOffset', 0, movieController.duration)
      // .name('').step(0.01).onChange(() => {
      //     guiPrms.pause();
      //     movieController.setOffset(movieController.currentOffset);
      //  });
      // gui.domElement.style.visibility = 'hidden';

      // // Interactive group to hold GUI, attached to left controller
      // const guiGroup = new InteractiveGroup(renderer, camera);
      // controllerHelper.addEventListener('leftControllerConnected', (event) => {
      //    event.controllerGrip.add(guiGroup);
      // })
      // // controllerHelper.leftController.controllerGrip.add(guiGroup);

      // // HTML mesh to hold gui
      // const guiMesh = new HTMLMesh(gui.domElement);
      // guiMesh.rotation.x = -Math.PI / 3;
      // guiMesh.rotation.y = Math.PI / 8;
      // guiMesh.position.set(0, 0, -0.2);
      // guiGroup.add(guiMesh);

      // Rerender when all pending textures are loaded to show new textures.
      Promise.all(sceneGroup.getPendingPromises()).then(() => {
         renderer.render(scene, camera);
      });

      return {
         scene,
         sceneGroup,
         camera,
         renderer,
         // controllerHelper,
         vrControl,
         selectState,
         controllers,
         controlButtons,
         enterVRButton,
         movieController,
         movie,
         // controlsGroup: guiGroup,
         // gui
      };
   }

   static makeLights(scene, lightColor, roomDepth) {
      const {roomHeight, roomWidth} = BouncePunkSceneGroup;

      const numOfLights = 2;
      // const lightColor = 0xFFECE1;

      for (let i = 0; i < numOfLights; i++) {
         let light = new THREE.PointLight(lightColor);
         light.decay = 0.2;
         light.castShadow = true;
         light.position.set(
          (i + 0.5) * (roomWidth / numOfLights),
          roomHeight - 3, roomDepth - 1);
         light.power = 85 / numOfLights;
         scene.add(light);
         let lightHelper = new THREE.PointLightHelper(light);
         scene.add(lightHelper);
      }

      // let ballLight = new THREE.SpotLight(lightColor);
      // // (, 18, 0, Math.PI / 20, 0.8, 2);
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
      let rigSize = BouncePunkSceneGroup.rigSize;
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
      // this.state.gui.destroy();
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = BouncePunkVRView.getInitState(newProps.movie);
      return BouncePunkVRView.setOffset(rtn, newProps.offset);
   }

   renderFrame(time) {
      ThreeMeshUI.update();
      // state.controllerHelper.update(state.controlsGroup);
      this.state.movieController.animate(time);
      this.state.renderer.render(this.state.scene, this.state.camera);
      // state.gui.updateDisplay();
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
      console.log('updating buttons!');

      let intersect;

      const raycaster = new THREE.Raycaster();

      if (this.state.renderer.xr.isPresenting) {
         this.state.vrControl.setFromController(0, raycaster.ray);
         intersect = this.raycast(raycaster);

         // Position the little white dot at the end of the controller pointing ray
         if (intersect) this.state.vrControl.setPointerAt(0, intersect.point);
      }

      // Update targeted button state (if any)
      if (intersect && intersect.object.isUI) {
         if (this.state.selectState) {
            // Component.setState internally call component.set with the options you defined in component.setupState
            intersect.object.setState('selected');
         }
         else {
            // Component.setState internally call component.set with the options you defined in component.setupState
            intersect.object.setState('hovered');
         }
      }

      // Update non-targeted buttons state
      this.state.controlButtons.forEach((obj) => {
         if ((!intersect || obj !== intersect.object) && obj.isUI) {

            // Component.setState internally call component.set with the options you defined in component.setupState
            obj.setState('idle');
         }
      });
   }

   raycast(raycaster) {

      return this.state.controlButtons.reduce( ( closestIntersection, obj ) => {
         const intersection = raycaster.intersectObject( obj, true );
   
         if ( !intersection[ 0 ] ) return closestIntersection;
   
         if ( !closestIntersection || intersection[ 0 ].distance < closestIntersection.distance ) {
   
            intersection[ 0 ].object = obj;
   
            return intersection[ 0 ];
   
         }
   
         return closestIntersection;
   
      }, null );
   
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