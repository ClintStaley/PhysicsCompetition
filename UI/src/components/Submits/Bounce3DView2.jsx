import React, { Component } from 'react';
import { BounceMovie } from './BounceMovie';
import * as THREE from "three";
import CameraControls from "camera-controls";
import pingAudio from '../../assets/sound/ping.mp3';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import UIfx from 'uifx';
import * as Loaders from '../Util/ImageUtil'

CameraControls.install({ THREE });
THREE.BackSide;

// Display a wall of obstacles, 
export class Bounce3DView extends React.Component {
   static ballRadius = .1;     // Radius of ball
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

   //Create standard room with set dimensions of 60x60x60 taking
   //an array of materials for the floor,ceiling, and walls.
   static buildRoom(textures) {
      var room = new THREE.Mesh(new THREE.BoxGeometry(60, 60, 60))

      return room
   }
   // Return state displaying background grid and other fixtures
   // appropriate for |movie|
   static getInitState(movie) {
      var scene = new THREE.Scene();
      var room = new THREE.Mesh(new THREE.BoxGeometry(60, 60, 60))
      var renderer = new THREE.WebGL1Renderer();
      var camera = new THREE.PerspectiveCamera();
      var light1 = new THREE.PointLight("0xffffff", 2);
      var light2 = new THREE.PointLight("0xffffff", 5);
      var ball = new THREE.Mesh(new THREE.SphereGeometry(.1,32,16));
      
      
      
      light1.position.set(0, 20, 0);
      light2.position.set(5, 0, 10);
      light1.castShadow = false;
      light2.castShadow = true;

      ball.castShadow = true;

      ball.name = "ball";
      light1.name = "light1";
      light2.name = "light2";
      room.name = 'room';
   
      scene.add(light1);
      scene.add(light2);
      scene.add(room);
      scene.add(ball);
      let width = movie.background.width;
      let height = movie.background.height;
      let longDim = Math.max(width, height);
      console.log(scene)
      // //Add Background Elements
      // this.renderer = new THREE.WebGLRenderer({ antialias: true });
      // this.renderer.setClearColor("#263238");
      // this.renderer.setSize(width, height);
      // this.renderer.shadowMap.enabled = true;

      //Retrieve textures
      // this.steel = Loaders.createTexturedMaterial(textures[0]);

      // Loaders.loadAsset('tube');
      
      this.barrierHit = false;
      this.targets = [];
      this.evtIdx = 0;
      // Add cameras, lighting, and general background elements like the room
      // and the steel wall (but not the targets or barriers) to the scene.

      return {
         trgEvts: [],    // Target creation events (each w/ptr to scene Group)
         evtIdx: -1,     // Index within movie of last event shown in scene
         ballEvt: null,  // Most recent event that placed the ball
         scene,          // scene to render at this point
         movie           // Pointer to current movie
      }
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
      let movie = state.movie;
      let evts = movie.evts;
      let { trgEvts, ballEvt, evtIdx, scene } = state;
      let yTop = movie.background.height;
      let evt;

      // While the event after evtIdx exists and needs adding to 3DElms
      while (evtIdx + 1 < evts.length && evts[evtIdx + 1].time <= timeStamp) {
         evt = evts[++evtIdx];
         if (evt.type === BounceMovie.cMakeBarrier) {
            // Add the indicated barrier to the scene
            var width = evt.hiX - evt.loX;
            var height = evt.hiY - evt.loY;
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 3), Loaders.createMaterial("0xff0000",this.textures[0]));
            mesh.position.x = evt.loX + width / 2;
            mesh.position.y = evt.loY + height / 2;
            mesh.position.z = -27;
            mesh.receiveShadow = false;
            mesh.name = 'Barrier'
            scene.add(mesh);
         }
         else if (evt.type === BounceMovie.cMakeTarget) {
            console.log("ADDING TARGET");
            trgEvts[evt.id] = evt;  // Save event for redrawing if hit
            evt.sceneElm = scene.children.length; // Point to target scene object so it can be moved later
            // Add indicated target to scene
            console.log(evt.sceneElm)
            var width = evt.hiX - evt.loX;
            var height = evt.hiY - evt.loY;
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 3),
             Loaders.createMaterial("0xff0000 ",this.textures[0]));
            mesh.position.x = evt.loX + width / 2;
            mesh.position.y = evt.loY + height / 2;
            mesh.position.z = -27;
            mesh.receiveShadow = false;
            mesh.name='Target'
            scene.add(mesh);
         }
         else if (evt.type === BounceMovie.cBallPosition) {
            ballEvt = evt;
            this.ball.position.x = evt.x;
            this.ball.position.y = evy.y;
         }
         else if (evt.type === BounceMovie.cHitBarrier
            || evt.type === BounceMovie.cHitTarget) {
            ballEvt = evt;

            if (evt.type === BounceMovie.cHitTarget) {
               let trgEvt = trgEvts[evt.targetId];
               // Find sceneElm and adjust it by popping it inward.  
               // Play pin sound.
            }
         }
         // Ball launch and ball exit require no action yet...
      }

      // Undo events to move backward in time. (Note that this and the prior
      // while condition are mutually exclusive.) Assume that barrier and
      // target creation occur at negative time and thus will not be "backed
      // over"
      while (evtIdx > 0 && timeStamp < evts[evtIdx].time) {
         evt = evts[evtIdx--];
         if (evt.type === BounceMovie.cHitTarget) {
            let trgEvt = trgEvts[evt.targetId];
            // Pop indicated target back out.
         }
      }

      // Loop from current evtIdx backward to find most recent event that draws
      // a full ball, or null if most recent is a ballExit.
      ballEvt = null;
      for (let searchIdx = evtIdx; searchIdx >= 0; searchIdx--) {
         let testEvt = evts[searchIdx];
         if (testEvt.type === BounceMovie.cBallExit)
            break;
         else if (testEvt.type === BounceMovie.cBallPosition
            || testEvt.type === BounceMovie.cHitTarget
            || testEvt.type === BounceMovie.cHitBarrier) {
            ballEvt = testEvt;
            break;
         }
      }
      return { trgEvts, ballEvt, evtIdx, scene, movie };
   }

   render() {
      // Add ball to scene in position indicated by state.ballEvt.
      // Render current scene.
      // Remove the ball
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