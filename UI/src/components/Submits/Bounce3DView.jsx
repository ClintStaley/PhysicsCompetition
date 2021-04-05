import React, { Component } from "react";
import * as THREE from "three";
import { AmbientLightProbe } from "three";
import "./Bounce.css";
import 'react-rangeslider/lib/index.css'

export class Bounce3DView extends React.Component {
   constructor(props) {
      super(props);
      this.random = Math.random()*1000;
      this.state = {
         test: 15,
         playing: false,
         delta: 0,
         changedTime: false
      };
   }

   componentDidMount() {
      console.log('component did mount')
      this.model = require("./model-movie.json");
      this.evtIdx = 0;
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      this.scene = new THREE.Scene();

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setClearColor("#263238");
      this.renderer.setSize(width, height);

      this.mount.appendChild(this.renderer.domElement);

      this.fov = 65;
      const aspect = 2;
      const near = .1;
      const far = 25;
      this.camera = new THREE.PerspectiveCamera(this.fov, aspect, near, far);
      //  = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
      this.camera.position.z = 5;
      this.camera.position.y = 7.5;
      this.camera.position.x = 5;

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
      this.setFrames = 0;
      this.duration = this.model.events[this.model.events.length - 1].time * 100;
      this.ball;
      this.firstTimeStamp = -1;
      this.frame;
      this.setup();
      this.renderer.render(this.scene, this.camera);
   }

   getLabel() {
      return '3D';
   }

   setup () {
      const set = this.props.movie.evts.filter((evt) => evt.time < 0);
      const r = .4;
      const geometry = new THREE.SphereGeometry(r, 32, 16);
      const material = new THREE.MeshPhongMaterial({
         color: "#555",
      });
      this.ball = new THREE.Mesh(geometry, material);
      this.ball.position.y = 10;
      this.ball.position.x = 0 - this.fov/2 + r;
      this.scene.add(this.ball);
      console.log(this.ball)

      set.forEach((brr, idx) => {
         const width = brr.hiX - brr.loX;
         const height = brr.hiY - brr.loY;
         const geometry = new THREE.BoxGeometry(width, height, .5);
         const material = new THREE.MeshPhongMaterial({ color: `#${1 + idx}${2 + idx}${3 + idx}` });
         const barrier = new THREE.Mesh(geometry, material);
         barrier.position.y = brr.loY;
         barrier.position.z = 0;
         barrier.position.x = brr.loX;
         this.scene.add(barrier);
         this.evtIdx++;
      });
   };

   displayFrame (timestamp){
      var evts = [];
      this.evtIdx = 0;

      while (this.props.movie.evts[this.evtIdx] && this.props.movie.evts[this.evtIdx].time < timestamp) {
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
      if(this.ball && this.scene)
         this.displayFrame(this.props.currentOffset);

      return (
            <div
               style={{ height: "600px", width: "100%" }}
               ref={(mount) => {
                  this.mount = mount;
               }}
            ></div>
      );
   }
}
