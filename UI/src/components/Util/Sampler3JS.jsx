import React, { Component } from "react";
import * as THREE from "three";

export class Sampler3JS extends React.Component{
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
      
      camera.position.z = 10;
      pntLight.position.set(5, 5, 10);
      
      scene.add(ambLight);
      scene.add(pntLight);
      scene.add(new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), mat));
      
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
   componentDidMount(){
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;
      
      this.state.renderer.setSize(width, height);

      this.state.camera.aspect = width/height;
      this.state.camera.updateProjectionMatrix();
      
      this.mount.appendChild(this.state.renderer.domElement);
      this.state.renderer.render(this.state.scene, this.state.camera);

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
