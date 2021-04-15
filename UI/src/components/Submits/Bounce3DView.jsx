import React, { Component } from "react";
import * as THREE from "three";
import { AmbientLightProbe } from "three";
import "./Bounce.css";
import 'react-rangeslider/lib/index.css'
import CameraControls from 'camera-controls';

export class Bounce3DView extends React.Component {
   constructor(props) {
      super(props);
      this.random = Math.random() * 1000;
      CameraControls.install({THREE});
      this.state = {
         test: 15,
         playing: false,
         changedTime: false,
      };
   }

   createMetalMaterial() {
      return new THREE.MeshPhongMaterial({ color:0x223344 });
      //return new THREE.MeshBasicMaterial({ envMap: this.sphereCamera.renderTarget });
   }

   createSkyBox() {
      console.log('called');
      let path = '../../images/BounceSkyBox/';
      let images = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'];
      let materials = [];
      for (const image of images) {
         let texture = new THREE.TextureLoader().load(path + image + '.jpg');
         let material = new THREE.MeshBasicMaterial({ map: texture });
         material.side = THREE.BackSide;
         materials.push(material);
      }

      let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
      return new THREE.Mesh(skyboxGeo, materials);

   }

   componentDidMount() {
      this.evtIdx = 0;
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      this.scene = new THREE.Scene();

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setClearColor("#263238");
      this.renderer.setSize(width, height);

      this.mount.appendChild(this.renderer.domElement);

      this.fov = 40;
      const aspect = 2;
      const near = .1;
      const far = 25;
      this.camera = new THREE.PerspectiveCamera(this.fov, aspect, near, far);
      this.camera.position.z = 10;
      this.camera.position.y = 6.5;
      this.camera.position.x = 7;

      
      this.scene.add(this.camera);

      this.cameraControls = new CameraControls( this.camera, this.renderer.domElement );



      this.plight = new THREE.PointLight('0xfff', 5);
      this.plight.position.set(-10, 30, 10);
      this.scene.add(this.plight);

      this.plight2 = new THREE.PointLight('0x123', 3);
      this.plight2.position.set(20, 30, 10);
      this.scene.add(this.plight2);

      this.sphereCamera = new THREE.CubeCamera(1, 1000, 500);
      this.sphereCamera.position.set(0, 100, 0);
      this.scene.add(this.sphereCamera);

      //this.scene.add(this.createSkyBox())

      // https://redstapler.co/realistic-reflection-effect-three-js/
      this.setup();
      this.renderer.render(this.scene, this.camera);
   }

   getLabel() {
      return '3D';
   }

   setup() {
      console.log(this.props.movie.evts)
      let set = this.props.movie.evts.filter((evt) => evt.time < 0);
      let ball = this.props.movie.evts.filter((evt) => evt.time === 0 && evt.type === 0)[0]
      const r = .1;
      const geometry = new THREE.SphereGeometry(r, 32, 16);
      const material = this.createMetalMaterial();

      this.ball = new THREE.Mesh(geometry, material);
      this.scene.add(this.ball);
      this.ball.position.x = ball.x;
      this.ball.position.y = ball.y;

      set.forEach((brr, idx) => {
         console.log(brr)
         const width = brr.hiX - brr.loX;
         const height = brr.hiY - brr.loY;
         const geometry = new THREE.BoxGeometry(width, height, .5);
         const material = this.createMetalMaterial();
         const barrier = new THREE.Mesh(geometry, material);
         barrier.position.y = brr.loY + height / 2;
         barrier.position.z = 0;
         barrier.position.x = brr.loX + width / 2;
         this.scene.add(barrier);
         this.evtIdx++;
      });
   };

   displayFrame(timestamp) {
      var evts = [];
      this.evtIdx = 0;

      while (this.props.movie.evts[this.evtIdx] && this.props.movie.evts[this.evtIdx].time <= timestamp) {
         evts.push(this.props.movie.evts[this.evtIdx]);
         this.evtIdx++;
      }

      for (const evt of evts) {
         switch (evt.type) {
            case 0:
               this.ball.position.x = evt.x;
               this.ball.position.y = evt.y;
               break;
            case 3:
               this.ball.position.x = evt.x;
               this.ball.position.y = evt.y;
               break;
            case 4:
               this.ball.position.x = evt.x;
               this.ball.position.y = evt.y;
               break;
         }
      }
      //this.sphereCamera.updateCubeMap(this.renderer, this.scene);
      this.cameraControls.update( timestamp);
      this.renderer.render(this.scene, this.camera);
   }

   render() {
      if (this.ball && this.scene)
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
