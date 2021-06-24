import React from 'react';
import {BounceMovie} from './BounceMovie';
import * as THREE from "three";
import CameraControls from "camera-controls";
import pingAudio from '../../assets/sound/ping.mp3';
import UIfx from 'uifx';

CameraControls.install({THREE});

// Display a room with a "rig" on one wall.  The rig has the launcher, targets,
// obstacles, and ball.  All 3JS units are meters.
export class Bounce3DView extends React.Component {
   static ballRadius = .1;        // Ball has 10cm radius
   static clearColor = "#263238"; // General blue-gray background
   static rigSize = 10;           // Rig of targets/obstacles is 10m x 10m.
   static launcherWidth = 1;      // 1m piston launcher on left side of rig

   // Placeholders: light shiny metal and buff gray diffuse
   static steelMat = new THREE.MeshPhongMaterial
    ({color: 0x808080, specular: 0xA0A0A0, side: THREE.DoubleSide});
   //new THREE.MeshStandardMaterial
   // ({color: "#ffffff", metalness: 1.0, side: THREE.BackSide});
   static concreteMat = new THREE.MeshStandardMaterial
    ({color: "#808080", side: THREE.BackSide});

   static textures = [
      {
         root: 'steelplate1-ue',
         normal: 'steelplate1_normal-dx.png',
         displacement: 'steelplate1_height.png',
         roughness: 'steelplate1_roughness.png',
         ao: 'steelplate1_ao.png',
         metalness: 'steelplate1_metallic.png'
      },
      {
         root: 'concrete',
         normal: 'normal.jpg',
         displacement: 'displacement.png',
         roughness: 'roughness.png',
         ao: 'ao.png',
         metalness: 'basecolor.png'
      }
   ]

   // Props are: {
   //    movie: movie to display
   //    offset: time offset from movie start in sec
   // }
   constructor(props) {
      super(props);

      this.ping = new UIfx(pingAudio, { volume: 0.5, throttleMs: 100 });

      this.state = Bounce3DView.setOffset(
         Bounce3DView.getInitState(props.movie), props.offset);
   }

   // Create standard room with center of far wall at origin
   static buildRoom() {
      var roomDim = Bounce3DView.rigSize + 2;  // 1 m boundaries around rig
      var room = new THREE.Mesh(
       new THREE.BoxGeometry(roomDim, roomDim, roomDim), [concreteMat,
       concreteMat, concreteMat, metalMat, concreteMat, concreteMat]);

      room.postion.set(0, 0, roomDim);  // Z=0 at back wall

      return room;
   }

   // Return state displaying background grid and other fixtures
   // appropriate for |movie|.  
   static getInitState(movie) {
      const rigSize = Bounce3DView.rigSize;
      const ballRadius = Bounce3DView.ballRadius
      var scene = new THREE.Scene();
      
      // CAS Fix: Try moving renderer out of state
      var renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setClearColor(Bounce3DView.clearColor);
      renderer.shadowMap.enabled = true;

      var camera = new THREE.PerspectiveCamera(40, 1, .01, 10*rigSize);
      camera.position.set(0, 0, rigSize);  // Center of near wall
   
      // Full range, square-decay, white light high on near wall in center
      var light = new THREE.PointLight(0xffffff, 1);
      light.position.set(0, 5, rigSize/2);
      light.castShadow = true;
      scene.add(light).add(new THREE.AmbientLight(0x404040));  // Plus general ambient
      //scene.add(new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50),
      // Bounce3DView.steelMat));

      // Add a launcher at upper-left corner of rig. Flat horizontal steel plate
      //   with right edge at origin launch point minus .1m, so a ball can be
      //   set on the right edge of plate with center at precise upper left 
      //   corner of rig (0, 10).  On plate is a steel piston arrangement that 
      //   snaps forward to hit and launch the ball.

      // Make rig a group so we can put origin at lower left front of base
      var rig = new THREE.Group();

      var base = new THREE.Mesh(new THREE.BoxGeometry(rigSize, rigSize,
       2*ballRadius), Bounce3DView.steelMat)
      base.position.set(rigSize/2, rigSize/2, -ballRadius);
      rig.add(base);

      var ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 16, 16),
       Bounce3DView.steelMat);
      
      // Put ball at upper left corner of rig, just touching the base.
      ball.position.set(0, rigSize, ballRadius);
      ball.castShadow = true;
      rig.add(ball);

      // Put rig at back of room.  Assume room origin at center of back wall
      rig.position.set(-rigSize/2, -rigSize/2, 2*ballRadius);
      scene.add(rig);

      return {
         scene,
         rig,
         camera,
         renderer,
         ball,
         targets: [],  // Array of target scene elements indexed by trg id
         evtIdx: -1,
         movie
      };
   }

   // Do state setup dependent on this.mount, including:
   //
   // 1. Set size of renderer.
   // 2. Adjust camera aspect ratio from default initial value of 1.
   // 3. Attach the renderer dom element to the mount.
   // 4. Do a render
   componentDidMount(){
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      var cameraControls;
      
      this.state.renderer.setSize(width, height);

      this.state.camera.aspect = width/height;
      this.state.camera.updateProjectionMatrix();
      this.mount.appendChild(this.state.renderer.domElement);

      cameraControls = new CameraControls(
         this.state.camera,
         this.state.renderer.domElement
      );

      cameraControls.addEventListener("control", () => {
         cameraControls.update(1);   // Needed w/nonzero param
         this.state.renderer.render(this.state.scene, this.state.camera);
      });

      cameraControls.setTarget(0, 0, 0);  // Center of rig
      this.state.renderer.render(this.state.scene, this.state.camera);
   }

   // Return label for button activating this view
   static getLabel() {
      return "3D";
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = Bounce3DView.getInitState(newProps.movie);
      return Bounce3DView.setOffset(rtn, newProps.offset);
   }

   // Advance/retract |state| so that state reflects all and only those events
   // in |movie| with time <= |timeStamp|.  Assume existing |state| was built
   // from |movie| so incremental change is appropriate.  Return adjusted state
   static setOffset(state, timeStamp) {
      const ballRadius  = Bounce3DView.ballRadius;
      let {targets, ball, evtIdx, scene, rig, camera, renderer, movie} = state;
      let evts = movie.evts;
      let yTop = movie.background.height;
      let evt;

      // While the event after evtIdx exists and needs adding to 3DElms
      while (evtIdx + 1 < evts.length && evts[evtIdx + 1].time <= timeStamp) {
         evt = evts[++evtIdx];
         if (evt.type === BounceMovie.cMakeBarrier
          || evt.type === BounceMovie.cMakeTarget) {
            // Add the indicated barrier to the scene
            var width = evt.hiX - evt.loX;
            var height = evt.hiY - evt.loY;

            var obj = new THREE.Mesh(
             new THREE.BoxGeometry(width, height, 2*ballRadius), 
             Bounce3DView.steelMat);
            obj.position.set(evt.loX + width/2, evt.loY + height/2, ballRadius);
            rig.add(obj);

            if (evt.type === BounceMovie.cMakeTarget) {
               targets[evt.id] = obj;
            }
         }
         else if (evt.type === BounceMovie.cBallPosition
          || evt.type === BounceMovie.cHitBarrier 
          || evt.type === BounceMovie.cHitTarget) {
            ball.position.set(evt.x, evt.y, ballRadius);

            if (evt.type === BounceMovie.cHitTarget) {
               targets[evt.targetId].position.z = -ballRadius; // Pop in
               // Play pin sound.
            }
         }
         else if (evt.type === BounceMovie.cBallExit)
            ball.position.set(0, Bounce3DView.rigSize, ballRadius);
         else if (evt.type === BounceMovie.cBallLaunch) {
            // Make Launcher fire by moving piston
            // Some sort of delayed animation to retract piston.
         }
      }

      // Undo events to move backward in time. (Note that this and the prior
      // while condition are mutually exclusive.) Assume that barrier and
      // target creation occur at negative time and thus will not be "backed
      // over"
      while (evtIdx > 0 && timeStamp < evts[evtIdx].time) {
         evt = evts[evtIdx--];
         
         if (evt.type === BounceMovie.cBallPosition
          || evt.type === BounceMovie.cHitBarrier 
          || evt.type === BounceMovie.cHitTarget) {
            ball.position.set(evt.x, evt.y, ballRadius);
  
            if (evt.type === BounceMovie.cHitTarget)
               targets[evt.targetId].position.z = ballRadius;  // Pop target out
         }
         if (evt.type === BounceMovie.cBallLaunch)
            ball.position.set(0, Bounce3DView.rigSize, ballRadius);
      }

      return {
         scene,
         rig,
         camera,
         renderer,
         ball,
         targets,   // Array of target scene elements indexed by trg id
         evtIdx,
         movie
      };
   }

   render() {
      this.state.renderer.render(this.state.scene, this.state.camera);
      return (
         <div
            style={{ height: "600px", width: "100%" }}
            ref={(mount) => {
               this.mount = mount;
            }}
         ></div>
      )
   }
}