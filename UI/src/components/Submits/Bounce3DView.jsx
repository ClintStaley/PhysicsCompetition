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
//import table from './models/scene.gltf';
CameraControls.install({ THREE: THREE });

export class Bounce3DView extends React.Component {
  constructor(props) {
    super(props);
    this.random = Math.random() * 1000;
    this.state = {
      test: 15,
      playing: false,
      changedTime: false,
      isFirstRender: true,
      scene: new THREE.Scene()
    };
  }

  createMetalMaterial() {
    //return new THREE.MeshPhongMaterial({ color: 0x223344 });
    return new THREE.MeshLambertMaterial({
      color: 0xffffff,
      envMap: this.cubeRenderTarget.texture,
    });
  }

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
    skybox.position.set(0, 0, 0);
    this.state.scene.add(skybox);
  }

  loadAsset(url) {
    let loader = new GLTFLoader();
    let modelUrl = `${window.location.origin}/models/${url}/scene.gltf`;
    let scene = this.state.scene;
    let self = this;

    loader.load(
      modelUrl,
       (model) => {
        let table = model.scene.children[0];
        table.scale.set(10, 10, 10);
        table.position.set(7, 1.4, 2);
        scene.add(model.scene);
        this.render();

      },
      undefined,
      (err) => {
        console.log(err);
      }
    );
  }

  initialBackground(){
    console.log('first call???')
    this.loadAsset("table");
    this.createSkyBox();
    //this.render
    this.setState({isFirstRender: false});
      
  }

  componentDidMount() {
    this.evtIdx = 0;
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    //this.state.scene = new THREE.Scene();

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

    this.state.scene.add(this.camera);

    this.cameraControls = new CameraControls(
      this.camera,
      this.renderer.domElement
    );

    this.cameraControls.addEventListener("control", () => {
      console.log('controlllll', this.props.currentOffset)
      this.cameraControls.update(this.props.currentOffset);
      this.renderer.render(this.state.scene, this.camera);
    });
    this.cameraControls.setTarget(6.7, 6, 0);

    this.plight = new THREE.PointLight("0xffffff", 5);
    this.plight.position.set(-10, 30, 10);
    this.state.scene.add(this.plight);

    this.plight2 = new THREE.PointLight("0x123123", 3);
    this.plight2.position.set(20, 30, 10);
    this.state.scene.add(this.plight2);

    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    this.cubeCamera = new THREE.CubeCamera(1, 1000, this.cubeRenderTarget);
    this.cubeCamera.position.set(0, 100, 0);
    this.state.scene.add(this.cubeCamera);


    // https://redstapler.co/realistic-reflection-effect-three-js/
    this.setup();
    this.cameraControls.update(1);
    this.renderer.render(this.state.scene, this.camera);
  }

  getLabel() {
    return "3D";
  }

  setup() {
    let set = this.props.movie.evts.filter((evt) => evt.time < 0);
    let ball = this.props.movie.evts.filter(
      (evt) => evt.time === 0 && evt.type === 0
    )[0];
    const r = 0.1;
    const geometry = new THREE.SphereGeometry(r, 32, 16);
    const material = this.createMetalMaterial();

    this.ball = new THREE.Mesh(geometry, material);
    this.state.scene.add(this.ball);
    this.ball.position.x = ball.x;
    this.ball.position.y = ball.y;

    set.forEach((brr, idx) => {
      const width = brr.hiX - brr.loX;
      const height = brr.hiY - brr.loY;
      const geometry = new THREE.BoxGeometry(width, height, 0.5);
      const material = this.createMetalMaterial();
      const barrier = new THREE.Mesh(geometry, material);
      barrier.position.y = brr.loY + height / 2;
      barrier.position.z = 0;
      barrier.position.x = brr.loX + width / 2;
      this.state.scene.add(barrier);
      this.evtIdx++;
    });
  }

  displayFrame(timestamp) {
    var evts = [];
    this.evtIdx = 0;
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
          this.ball.position.x = evt.x;
          this.ball.position.y = evt.y;
          break;
      }
    }
    this.cubeCamera.update(this.renderer, this.state.scene);
    this.renderer.render(this.state.scene, this.camera);
  }

  render() {

    if (this.state.isFirstRender)      
      this.initialBackground();
    else
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
