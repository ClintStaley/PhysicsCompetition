import React, { Component } from "react";
import * as THREE from "three";
import "./Bounce.css";
import "react-rangeslider/lib/index.css";
import CameraControls from "camera-controls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CSG } from 'three-csg-ts';
import UIfx from 'uifx';
import pingAudio from '../../assets/sound/ping.mp3';
import negy from "../../images/BounceSkyBox/ny.png";
import negx from "../../images/BounceSkyBox/nx.png";
import negz from "../../images/BounceSkyBox/nz.png";
import posy from "../../images/BounceSkyBox/py.png";
import posx from "../../images/BounceSkyBox/px.png";
import posz from "../../images/BounceSkyBox/pz.png";
//const ThreeBSP = new CspLibrary(THREE)
CameraControls.install({ THREE: THREE });

export class Bounce3DView extends React.Component {
  constructor(props) {
    super(props);
    this.ping = new UIfx(pingAudio, {volume: 0.5, throttleMs: 100});
    this.state = {
      test: 15,
      playing: false,
      changedTime: false,
      isFirstRender: true,
      barrierHit: false
    };
  }

  loadTexture(path) {
    let loader = new THREE.TextureLoader();
    let texture = loader.load(path, (texture)=>{
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set( 3, 3 );
    });

    return texture;
  }

  createFancyMaterial() {
    let loader = new THREE.TextureLoader();
    let path = `${window.location.origin}/textures/steelplate1-ue/`;
    let material = new THREE.MeshStandardMaterial(
      {
        color:0x111111,
        normalMap:this.loadTexture(`${path}/steelplate1_normal-dx.png`),
        displacementMap:this.loadTexture(`${path}/steelplate1_height.png`),
        displacementScale: 0.1,
        roughnessMap:this.loadTexture(`${path}/steelplate1_roughness.png`),
        aoMap:this.loadTexture(`${path}/steelplate1_ao.png`),
        metalnessMap: loader.load(`${path}/steelplate1_metallic.png`),
        metalness: 0.5,
      }
    );
    return material;
  }

  createMaterial() {
    let path = `${window.location.origin}/textures/steelplate1-ue/`;

    let material = new THREE.MeshStandardMaterial({
      color:0x121212,
       roughnessMap:this.loadTexture(`${path}/simple_metal.jpg`),
        metalness: 0.5,
    });
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

    let skyboxGeo = new THREE.BoxGeometry(50, 50, 50);
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

  addPointLight(intensity, x, y, z) {
    let light = new THREE.PointLight("0xffffff", intensity);
    light.position.set(x, y, z);
    this.scene.add(light);
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

    this.addPointLight(10, 0, 200, -20);
    this.addPointLight(2, 0, 20, 0);
    this.addPointLight(5, 0, 10, 20);

    this.setup();
    this.evtIdx = 0;
    this.barrierHit = false;
    this.targetIds = [];
    this.cameraControls.update(this.props.currentOffset);

    //this.renderer.render(this.scene, this.camera);
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
    this.ball.position.set(ball.x, ball.y);
    this.scene.add(this.ball);

    const wallGeo = new THREE.PlaneGeometry(12, 12, 512, 512);
    this.wall = new THREE.Mesh(wallGeo, this.createFancyMaterial());
    this.scene.add(this.wall);
    this.wall.position.set(5, 5, -.25);
    const wallDepthGeo = new THREE.BoxGeometry(12, 12, 2);
    this.wallDepth = new THREE.Mesh(wallDepthGeo, this.createMaterial());
    this.wallDepth.position.set(5, 5, -1.25);
    this.scene.add(this.wallDepth);

    const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 2), this.createMaterial());
    wall.position.set(5, 5, -1.25);
    const test = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), this.createMaterial());
    test.position.set(5, 5, -1.25);
    
  //   console.log(wall.faces)
  //   wall.updateMatrix()
  //   test.updateMatrix()
  //   const wallbsp = CSG.fromMesh(wall);
  //   const testbsp = CSG.fromMesh(test);
  //   const subtraction = wallbsp.subtract(testbsp);
  //   const subtractionMesh = CSG.toMesh(subtraction, wall.matrix);
  //  // subtraction.addAttribute('position', 'test');

    // Make 2 box meshes..
    // const meshA = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshNormalMaterial());
    // const meshB = new THREE.Mesh(new THREE.BoxGeometry(1,1,1));

    // // Offset one of the boxes by half its width..
    // meshB.position.add(new THREE.Vector3(0.5, 0.5, 0.5));

    // // Make sure the .matrix of each mesh is current
    // meshA.updateMatrix();
    // meshB.updateMatrix();

    // // Create a bsp tree from each of the meshes
    // const bspA = CSG.fromMesh(meshA);
    // const bspB = CSG.fromMesh(meshB);

    // // Subtract one bsp from the other via .subtract... other supported modes are .union and .intersect
    // const bspResult = bspA.subtract(bspB);

    // // Get the resulting mesh from the result bsp
    // this.meshResult = CSG.toMesh(bspResult, meshA.matrix);

    // // Set the results material to the material of the first cube.
    // this.meshResult.material = meshA.material;
    // this.scene.add(this.meshResult);



    set.forEach((brr) => {
      brr.hiX *= 10;
      brr.hiY *= 10;
      brr.loX *= 10;
      brr.loY *= 10;
      const width = brr.hiX - brr.loX;
      const height = brr.hiY - brr.loY;
      const geometry = new THREE.BoxGeometry(width, height, 3);
      const material = this.createMaterial();
      const barrier = new THREE.Mesh(geometry, material);
      barrier.position.y = brr.loY + height / 2;
      barrier.position.z = 0;
      barrier.position.x = brr.loX + width / 2;
      if(brr.type === 1) {
        this.barrierId = barrier.uuid;
      }
      this.scene.add(barrier);
      this.evtIdx++;
    });
  }

  hitBarrier() {
    this.barrierHit = !this.barrierHit;
      for(const child of this.scene.children) {
        if(child.uuid === this.barrierId){
          this.ping.play(0.25)
          child.position.z = this.barrierHit ? -0.55 : 0;
        }
      }
  }

  displayFrame(timestamp) {
    if(this.props.scrubbing) {
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
