import React, { Component } from "react";
import * as THREE from "three";
import { AmbientLightProbe } from "three";
import "./Bounce.css";
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css'

export class Bounce3DView extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         test: 15,
         playing: false,
         delta: 0,
         changedTime: false
      };
   }

   componentDidMount() {
      this.model = require("./model-movie.json");
      this.evtIdx = 0;
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      this.scene = new THREE.Scene();

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setClearColor("#263238");
      this.renderer.setSize(width, height);

      this.mount.appendChild(this.renderer.domElement);

      this.fov = 50;
      const aspect = 2;
      const near = .1;
      const far = 25;
      this.camera = new THREE.PerspectiveCamera(this.fov, aspect, near, far);
      //  = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
      this.camera.position.z = 20;
      this.camera.position.y = 0;

      this.scene.add(this.camera);

      this.plight = new THREE.PointLight(0xf1fff1, 1.5);
      this.alight = new THREE.AmbientLight(0xfff1ff, 1.5);

      this.plight.position.set(0, 50, 0);
      this.scene.add(this.plight);
      this.scene.add(this.alight);

      // https://redstapler.co/realistic-reflection-effect-three-js/

      

      this.start;
      this.delta;
      this.d2 = 0;
      this.frames = 0;
      this.duration = this.model.events[this.model.events.length - 1].time * 100;
      // this.animate();

      this.setup();
      this.renderer.render(this.scene, this.camera);
   }

   setup () {
      const set = this.props.movie.evts.filter((evt) => evt.time < 0);
      const r = 5;
      const geometry = new THREE.SphereGeometry(r, 32, 16);
      const material = new THREE.MeshPhongMaterial({
         color: "#555",
      });
      this.ball = new THREE.Mesh(geometry, material);
      this.ball.position.y = 10;
      this.ball.position.x = 0 - this.fov/2 + r;
      this.scene.add(this.ball);

      set.forEach((brr, idx) => {
         const width = brr.hiX - brr.loX;
         const height = brr.hiY - brr.loY;
         const geometry = new THREE.BoxGeometry(width, height, 3);
         const material = new THREE.MeshPhongMaterial({ color: `#${1 + idx}${2 + idx}${3 + idx}` });
         const barrier = new THREE.Mesh(geometry, material);
         barrier.position.x = brr.loX;
         barrier.position.y = brr.loY;
         this.scene.add(barrier);
         this.evtIdx++;
      });
   };

   animate (timestamp) {
      if (this.state.playing) {

         if (!this.start) this.start = timestamp;

         this.frame(timestamp);
         requestAnimationFrame(this.animate);
      }
   };

   setFrame (timestamp, specificTime){
      var timePlaying = specificTime ? specificTime : timestamp - this.start;

      if (timePlaying > this.duration) {
         this.setState({ playing: false });
         return;
      }

      if (specificTime) {
         this.evtIdx = 0;
      }

      if (this.props.movie.evts[this.evtIdx] === undefined) {
         this.setState({ playing: false });
      }

      this.setState({ delta: timePlaying });
      var evts = [];
      while (this.props.movie.evts[this.evtIdx] && this.props.movie.evts[this.evtIdx].time * 100 < timePlaying) {
         evts.push(this.props.movie.evts[this.evtIdx]);
         this.evtIdx++;
      }

      for (const evt of evts) {
         switch (evt.type) {
            case 0:
               this.ball.position.x = evt.x;
               this.ball.position.y = evt.y;
               break;
         }
      }

      this.renderer.render(this.scene, this.camera);
   }

   render() {
      console.log(this.props.movie.evts)
      return (
         <div>
            <button
               onClick={() => {
                  this.start = undefined;
                  this.evtIdx = 0;
                  this.setState({ playing: true }, () =>
                     this.animate()
                  );
               }}
            >
               play
        </button>
            <div
               style={{ height: "600px", width: "100%" }}
               ref={(mount) => {
                  this.mount = mount;
               }}
            ></div>
            <Slider
               value={this.state.delta}
               max={this.duration}
               onChange={(value) => {
                  this.setState({ delta: value, changedTime: true })
                  this.frame(0, value)

               }}
            />
         </div>
      );
   }
}
