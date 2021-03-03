import React, { Component } from "react";
import * as THREE from "three";

export class Bounce3D extends React.Component {


  constructor(props){
    super(props);
    this.state = {
      test: 15
    }
  }

  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(width, height);

    this.mount.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 20;
    this.camera.position.y = 5;
    this.scene.add(this.camera);

    this.plight = new THREE.PointLight(0xf1fff1, 1.5);
    this.alight = new THREE.AmbientLight(0x25f1ff, 1.5);

    this.plight.position.set(0, 50, 50);
    this.scene.add(this.plight);
    this.scene.add(this.alight);

    // https://redstapler.co/realistic-reflection-effect-three-js/

    const geometry = new THREE.SphereGeometry(2);
    const material = new THREE.MeshPhongMaterial({
      color: "#555",
    });
    this.state.cube = new THREE.Mesh(geometry, material);
    this.state.cube.position.y = 18.5;
    this.state.cube.position.x = -13.5;
    this.scene.add(this.state.cube);

    let firstEvent = this.props.events[0];
    console.log(firstEvent);

    let vy = firstEvent[0].velocityY;
    let vx = firstEvent[0].velocityX;

    // each event in props.events is a subject -- ie a ball
    // each event within those subjects is a vector over time

    let subjectIdx = 0;
    let eventIdx = 0;
    this.state.isOver = false;
    let events = this.props.events;
    let ev = events[subjectIdx][eventIdx];
    let nextEv = events[subjectIdx][eventIdx + 1];
    let start = Date.now();
    let endOfCurrentEvent = start + nextEv.time * 1000;
    console.log(this);

    this.animate();
  }

  animate = () => {
    if (!this.state.isOver) {
      requestAnimationFrame(this.animate);
      // vx += 0.001;
      this.renderer.render(this.scene, this.camera);

      this.state.cube.position.y = this.state.test;
    }

  }

  render() {
    console.log(this.state.test);
    return (
      <div>
        <button onClick={() => {
          const newState = {}
          newState['test'] = this.state.test + 0.3;
          this.setState(newState);
        }}>hello</button>
        <div
          style={{ height: "800px", width: "800px", marginBottom: "200px" }}
          ref={(mount) => {
            this.mount = mount;
          }}
        ></div>
      </div>
    );
  }
}
