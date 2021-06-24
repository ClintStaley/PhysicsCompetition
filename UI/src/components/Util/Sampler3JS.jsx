import CameraControls from "camera-controls";
import React, { Component } from "react";
import * as THREE from "three";
import { Side } from "three";

CameraControls.install({ THREE: THREE });

export class Sampler3JS extends React.Component {
   // Placeholders: light shiny metal and buff gray diffuse
   static steelMat = new THREE.MeshStandardMaterial({metalness: 1.0});
   static concreteMat = new THREE.MeshStandardMaterial({color: "#808080"});

   static materials = [this.concreteMat,this.concreteMat,this.concreteMat,this.concreteMat,this.concreteMat,this.concreteMat]
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

   constructor(props) {
      super(props);

      this.state = Sampler3JS.getInitState();
   }

   static getInitState() {
      var scene = new THREE.Scene();
      var renderer = new THREE.WebGLRenderer();
      var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      var mat = new THREE.MeshPhongMaterial({color: 0xff00ff});

      const ambLight = new THREE.AmbientLight(0x808080);
      const pntLight = new THREE.PointLight(0xFFFFFF, .8, 0, 2);

      camera.position.set(0, 0, 1);
      pntLight.position.set(5, 5, 10);

      var cubeGeo = new THREE.BoxGeometry(60, 60, 60, this.materials);
      var cube = new THREE.Mesh(cubeGeo, new THREE.MeshFaceMaterial());

      scene.add(ambLight);
      scene.add(pntLight);
      scene.add(cube);
      console.log(scene)
      console.log(camera.position)

      const cameraHelper = new THREE.CameraHelper(camera);
      scene.add(cameraHelper);

      return {
         scene,
         camera,
         renderer
      }
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

      this.state.renderer.setSize(width, height);

      this.state.camera.aspect = width / height;
      this.state.camera.updateProjectionMatrix();

      this.mount.appendChild(this.state.renderer.domElement);
      this.cameraControls = new CameraControls(this.state.camera, this.state.renderer.domElement);
      this.cameraControls.addEventListener("control", () => {
         console.log(this.state.camera.position)
         if(this.cameraControls.update(1))
            this.state.renderer.render(this.state.scene, this.state.camera);
      })

      this.cameraControls.setTarget(0,0,0);
      this.cameraControls.update(1);
   }

   render() {

      return (
         <div
            style={{ height: "600px", width: "800px" }}
            ref={(mount) => {
               this.mount = mount;
               console.log(mount);
            }}
         />);
   }
}
