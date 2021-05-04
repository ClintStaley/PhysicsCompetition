import React, { Component } from "react";
import * as THREE from "three";
import "./Bounce.css";
import "react-rangeslider/lib/index.css";
import CameraControls from "camera-controls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import negy from "../../images/BounceSkyBox/negy.jpg";
import negx from "../../images/BounceSkyBox/negx.jpg";
import negz from "../../images/BounceSkyBox/negz.jpg";
import posy from "../../images/BounceSkyBox/posy.jpg";
import posx from "../../images/BounceSkyBox/posx.jpg";
import posz from "../../images/BounceSkyBox/posz.jpg";
CameraControls.install({ THREE: THREE });

export class Bounce3DView extends React.Component {
  constructor(props) {
    super(props);
    this.random = Math.random() * 1000;
    this.state = {
      test: 15,
      playing: false,
      changedTime: false,
      isFirstRender: true
    };
  }

  createFancyMaterial() {
    let loader = new THREE.TextureLoader();
    let path = `${window.location.origin}/textures/steelplate1-ue/`;
    let material = new THREE.MeshStandardMaterial(
      {
        color:0x111111,
        normalMap:loader.load(`${path}/steelplate1_normal-dx.png`),
        displacementMap:loader.load(`${path}/steelplate1_height.png`),
        displacementScale: 0.2,
        roughnessMap:loader.load(`${path}/steelplate1_roughness.png`),
        aoMap:loader.load(`${path}/steelplate1_ao.png`),
        metalnessMap: loader.load(`${path}/steelplate1_metallic.png`),
        metalness: 0.5,
        
      }
    );
    return material;
  }

  createMaterial() {
    let textureUrl =`${window.location.origin}/textures/embossed_metal.jpg`;
    let texture = new THREE.TextureLoader().load(textureUrl);
    let material = new THREE.MeshPhongMaterial({color: 0x555555, map: texture });
    return material;
  }
//https://3dtextures.me/2018/09/28/metal-plate-010/
  createSkyBox() {
    let images = [posx, negx, posy, negy, posz, negz];
    let materials = [];
    for (const image of images) {
      let texture = new THREE.TextureLoader().load(image);
      let material = new THREE.MeshBasicMaterial({ map: texture });
      material.side = THREE.BackSide;
      materials.push(material);
    }

    let skyboxGeo = new THREE.BoxGeometry(100, 100, 100);
    let skybox = new THREE.Mesh(skyboxGeo, materials);
    skybox.position.set(0, 10, 0);
    this.scene.add(skybox);
  }

  loadAsset(url) {
    let loader = new GLTFLoader();
    let modelUrl = `${window.location.origin}/models/${url}/scene.gltf`;

    loader.load(
      modelUrl,
       (model) => {
        let table = model.scene.children[0];
        table.scale.set(10, 10, 10);
        table.position.set(7, 1.4, 2);
        this.scene.add(model.scene);
        this.render();

      },
      undefined,
      (err) => {
        console.log(err);
      }
    );
  }

  initialBackground(){
    this.scene = new THREE.Scene();
    this.createSkyBox();
    this.setState({isFirstRender: false});
      
  }

  componentDidMount() {
    this.evtIdx = 0;
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(width, height);

    this.mount.appendChild(this.renderer.domElement);

    this.fov = 40;
    const aspect = 2;
    const near = 0.1;
    const far = 1000;
    this.camera = new THREE.PerspectiveCamera(this.fov, aspect, near, far);
    this.camera.position.set(-7, 0, 10);
    this.scene.add(this.camera);

    this.cameraControls = new CameraControls(
      this.camera,
      this.renderer.domElement
    );

    this.cameraControls.addEventListener("control", () => {
      this.cameraControls.update(this.props.offset);
      this.renderer.render(this.scene, this.camera);
    });
    this.cameraControls.setTarget(6.7, 6, 0);

    this.plight = new THREE.PointLight("0xffffff", 5);
    this.plight.position.set(-10, 30, 10);
    this.scene.add(this.plight);

    this.plight2 = new THREE.PointLight("0x123123", 3);
    this.plight2.position.set(20, 30, 10);
    this.scene.add(this.plight2);

    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });

    this.setup();
    this.evtIdx = 0;
    this.cameraControls.update(1);
    this.renderer.render(this.scene, this.camera);
  }

  static getLabel() {
    return "3D";
  }

  hitBarrier() {
    if(this.test){
      for(const child of this.scene.children) {
        if(child.uuid === this.test){
          child.position.z -= 2;
        }
      }
    }
  }

  setup() {
    let set = this.props.movie.evts.filter((evt) => evt.time < 0);
    let ball = this.props.movie.evts.filter(
      (evt) => evt.time === 0 && evt.type === 0
    )[0];
    const r = 0.1;
    const ballGeo = new THREE.SphereGeometry(r, 32, 16);
    this.ball = new THREE.Mesh(ballGeo, this.createMaterial());
    this.ball.position.set(ball.x, ball.y);
    this.scene.add(this.ball);

    const wallGeo = new THREE.PlaneGeometry(8, 8, 512, 512);
    this.wall = new THREE.Mesh(wallGeo, this.createFancyMaterial());
    this.scene.add(this.wall);
    this.wall.position.set(5, 5, -.25);



    set.forEach((brr, idx) => {
      const width = brr.hiX - brr.loX;
      const height = brr.hiY - brr.loY;
      const geometry = new THREE.BoxGeometry(width, height, 1);
      const material = this.createMaterial();
      const barrier = new THREE.Mesh(geometry, material);
      barrier.position.y = brr.loY + height / 2;
      barrier.position.z = 0;
      barrier.position.x = brr.loX + width / 2;
      if(brr.type === 1) {
        this.test = barrier.uuid;
      }
      this.scene.add(barrier);
      this.evtIdx++;
    });
  }

  displayFrame(timestamp) {
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
        case 3:
          this.ball.position.x = evt.x;
          this.ball.position.y = evt.y;
          break;
        case 4:
          this.hitBarrier();
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
