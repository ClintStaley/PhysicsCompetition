import React, { Component } from "react";
import * as THREE from "three";
import "./Bounce.css";
import "react-rangeslider/lib/index.css";
import CameraControls from "camera-controls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import UIfx from 'uifx';
import pingAudio from '../../../assets/sound/ping.mp3';
//const ThreeBSP = new CspLibrary(THREE)
CameraControls.install({ THREE: THREE });

export class Bounce3DView extends React.Component {
   constructor(props) {
      super(props);
      this.ping = new UIfx(pingAudio, { volume: 0.5, throttleMs: 100 });
      this.state = {
         test: 15,
         playing: false,
         changedTime: false,
         isFirstRender: true,
      };
   }

   loadTexture(path) {
      // load Threejs as loader
      let loader = new THREE.TextureLoader();
      
      let texture = loader.load(path, (texture) => {
         texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
         texture.repeat.set(5, 5);
      });

      return texture;
   }

   loadAsset(url) {
      let loader = new GLTFLoader();
      let modelUrl = `${window.location.origin}/models/${url}/scene.gltf`;

      loader.load(
         modelUrl,
         (modelFile) => {
            console.log(modelFile.scene.children)
            let model = modelFile.scene.children[0];
            model.scale.set(0.1, 0.1, 0.1);
            model.rotation.x = Math.PI;
            model.position.set(-1, 10, -27.0);
            model.castShadow = true;
            this.scene.add(modelFile.scene);
            this.render();

         },
         undefined,
         (err) => console.log(err)
      );
   }


   createTexturedMaterial(maps) {
      let loader = new THREE.TextureLoader();
      let path = `${window.location.origin}/textures/${maps.root}/`;
      let material = new THREE.MeshStandardMaterial(
         {
            color: 0x111111,
            normalMap: this.loadTexture(`${path}/${maps.normal}`),
            displacementMap: this.loadTexture(`${path}/${maps.displacement}`),
            displacementScale: 0.1,
            roughnessMap: this.loadTexture(`${path}/${maps.roughness}`),
            aoMap: this.loadTexture(`${path}/${maps.ao}`),
            metalnessMap: loader.load(`${path}/${maps.metalness}`),
            metalness: 0.5,
         }
      );
      return material;
   }

   createMaterial() {
      let path = `${window.location.origin}/textures/steelplate1-ue/`;

      let material = new THREE.MeshStandardMaterial({
         color: 0x121212,
         roughnessMap: this.loadTexture(`${path}/simple_metal.jpg`),
         metalness: 0.5,
      });
      return material;
   }

   initialBackground() {
      this.scene = new THREE.Scene();
      this.setState({ isFirstRender: false });
   }

   addPointLight(intensity, x, y, z, castShadow) {
      let light = new THREE.PointLight("0xffffff", intensity);
      light.position.set(x, y, z);
      light.castShadow = castShadow;
      this.scene.add(light);
   }

   addBoxMeshes(dimensionsArr) {
      for (const dimensions of dimensionsArr) {
         let boxGeo = new THREE.BoxBufferGeometry
          (dimensions.w, dimensions.h, dimensions.d);
         let box = new THREE.Mesh(boxGeo);

         dimensions.x = dimensions.x === undefined ? 0 : dimensions.x;
         dimensions.y = dimensions.y === undefined ? 0 : dimensions.y;
         dimensions.z = dimensions.x === undefined ? 0 : dimensions.z;
         box.position.set(dimensions.x, dimensions.y, dimensions.z);
         box.receiveShadow = true;

         if (dimensions.material) {
            box.material = dimensions.material;
         } else {
            box.material = this.concrete;
         }
         this.scene.add(box);
      }
   }

   componentDidMount() {
      this.evtIdx = 0;
      const width = this.mount.clientWidth;
      const height = this.mount.clientHeight;

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setClearColor("#263238");
      this.renderer.setSize(width, height);
      this.renderer.shadowMap.enabled = true;

      this.mount.appendChild(this.renderer.domElement);

      this.fov = 40;
      const aspect = 2;
      const near = 0.1;
      const far = 1000;
      this.camera = new THREE.PerspectiveCamera(this.fov, aspect, near, far);
      this.camera.position.set(-7, 5, 0);
      this.scene.add(this.camera);

      this.cameraControls = new CameraControls(
         this.camera,
         this.renderer.domElement
      );

      this.cameraControls.addEventListener("control", () => {
         this.cameraControls.update(this.props.offset); // Needed w/o animation?
         this.renderer.render(this.scene, this.camera);
      });


      this.cameraControls.setTarget(6.7, 6, -25);

      //pulls png files from the public/texture directory.

      let steelTextureMaps = {
         root: 'steelplate1-ue',
         normal: 'steelplate1_normal-dx.png',
         displacement: 'steelplate1_height.png',
         roughness: 'steelplate1_roughness.png',
         ao: 'steelplate1_ao.png',
         metalness: 'steelplate1_metallic.png'
      }
      this.steel = this.createTexturedMaterial(steelTextureMaps);
      let concreteTextureMaps = {
         root: 'concrete',
         normal: 'normal.jpg',
         displacement: 'displacement.png',
         roughness: 'roughness.png',
         ao: 'ao.png',
         metalness: 'basecolor.png'
      }
      this.concrete = this.createTexturedMaterial(concreteTextureMaps);
      this.addBoxMeshes([
         { w: 60, h: 1, d: 60, material: this.createMaterial() },
         { w: 60, h: 1, d: 60, y: 30, material: this.createMaterial() },
         { w: 1, h: 30, d: 60, x: -30, y: 15,  },
         { w: 1, h: 30, d: 60, x: 30, y: 15 },
         { w: 60, h: 30, d: 1, z: 30, y: 15 },
         { w: 60, h: 30, d: 1, z: -30, y: 15 },
      ])

      this.loadAsset('tube');

      //this.addPointLight(10, 0, 200, -20, true);
      this.addPointLight(2, 0, 20, 0, false);
      this.addPointLight(5, 0, 10, 20, true);

      this.barrierHit = false;
      this.targets = [];
      this.evtIdx = 0;
      this.setup();
      this.cameraControls.update(this.props.currentOffset);

   }

   static getLabel() {
      return "3D";
   }


   setup() {

      let set = this.props.movie.evts.filter((evt) => evt.time < 0);
      let ball = this.props.movie.evts.filter(
         (evt) => evt.time === 0 && evt.type === 0
      )[0];
      const r = 0.1;
      const ballGeo = new THREE.SphereGeometry(r, 32, 16);
      this.ball = new THREE.Mesh(ballGeo, this.createMaterial());
      this.ball.position.set(ball.x, ball.y,-27);
      this.scene.add(this.ball);
      this.ball.castShadow = true;

      const wallGeo = new THREE.PlaneGeometry(12, 12, 512, 512);
      this.wall = new THREE.Mesh(wallGeo, this.steel);
      this.scene.add(this.wall);
      this.wall.position.set(5, 5, -28.25);
      const wallDepthGeo = new THREE.BoxGeometry(12, 12, 2);
      this.wallDepth = new THREE.Mesh(wallDepthGeo, this.createMaterial());
      //This sets the wall in the middle of the room
      this.wallDepth.position.set(5, 5, -29.25);
      this.wallDepth.castShadow = false;
      this.scene.add(this.wallDepth);

      set.forEach((brr) => {
         const width = brr.hiX - brr.loX;
         const height = brr.hiY - brr.loY;
         const geometry = new THREE.BoxGeometry(width, height, 3);
         const material = this.createMaterial();
         const mesh = new THREE.Mesh(geometry, material);
         mesh.position.y = brr.loY + height / 2;
         mesh.position.z = -27;
         mesh.position.x = brr.loX + width / 2;
         mesh.receiveShadow = false;

         if (brr.type === 2) {
            this.targets.push({ mesh: mesh, hit: false });
         }
         this.scene.add(mesh);
         this.evtIdx++;
      });
   }

   setTargetState(targetId, isHit) {
      let target = this.targets[targetId];
      target.hit = isHit;

      if (isHit && !this.props.scrubbing)
         this.ping.play(0.25);

      for (let trg of this.targets)
         trg.mesh.position.z = trg.hit ? -28.5 : -27;

   }

   displayFrame(timestamp) {
      if (this.props.scrubbing) {
         this.evtIdx = 0;
      }
      var evts = [];
      this.timestamp = timestamp;
      while (
         this.props.movie.evts[this.evtIdx] &&
         this.props.movie.evts[this.evtIdx].time <= timestamp
      ) {
         evts.push(this.props.movie.evts[this.evtIdx]);
         this.evtIdx++;
      }

      for (const evt of evts) {
         switch (evt.type) {
            case 0:
               this.ball.position.x = evt.x;
               this.ball.position.y = evt.y;
               break;
            case 2:
               this.setTargetState(evt.id, false);
               break;
            case 3:
               this.setTargetState(evt.targetId, true);
               break;
            case 4:
               this.ping.play(0.25)
               break;
         }
      }
      this.renderer.render(this.scene, this.camera);
   }

   render() {

      if (this.state.isFirstRender)
         this.initialBackground();
      else
         this.displayFrame(this.props.offset);


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
