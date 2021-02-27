import React, { Component } from "react";
import * as THREE from "three";

export class Bounce3D extends React.Component {
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    let scene = new THREE.Scene();

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor("#263238");
    renderer.setSize(width, height);

    this.mount.appendChild(renderer.domElement);

    let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 20;
    camera.position.y = 5;
    scene.add(this.camera);

    this.plight = new THREE.PointLight(0xf1fff1, 1.5);
    this.alight = new THREE.AmbientLight(0x25f1ff, 1.5);

    this.plight.position.set(0, 50, 50);
    scene.add(this.plight);
    scene.add(this.alight);

    // https://redstapler.co/realistic-reflection-effect-three-js/

    const geometry = new THREE.SphereGeometry(2);
    const material = new THREE.MeshPhongMaterial({
      color: "#555",
    });
    let cube = new THREE.Mesh(geometry, material);
    cube.position.y = 18.5;
    cube.position.x = -13.5;
    scene.add(cube);
    this.renderScene();

    let firstEvent = this.props.events[0];
    console.log(firstEvent);

    let vy = firstEvent[0].velocityY;
    let vx = firstEvent[0].velocityX;

    // each event in props.events is a subject -- ie a ball
    // each event within those subjects is a vector over time

    let subjectIdx = 0;
    let eventIdx = 0;
    let isOver = false;
    let events = this.props.events;
    let ev = events[subjectIdx][eventIdx];
    let nextEv = events[subjectIdx][eventIdx + 1];
    let start = Date.now();
    let endOfCurrentEvent = start + nextEv.time * 1000;

    var animate = function () {
      if (!isOver) {
        requestAnimationFrame(animate);
        // vx += 0.001;
        cube.position.x += ev.velocityX / 100;
        vy += 0.002;
        cube.position.y -= vy;
        renderer.render(scene, camera);
        if (Date.now() >= endOfCurrentEvent) {
          if (eventIdx + 1 < events[subjectIdx].length) {
            eventIdx++;
          } else {
            if (subjectIdx + 1 < events.length) {
              subjectIdx++;
            }
          }

          ev = events[subjectIdx][eventIdx];
          if (ev) {
            if (eventIdx + 1 < events[subjectIdx].length) {
              nextEv = events[subjectIdx][eventIdx + 1];
            }
            endOfCurrentEvent = start + ev.time * 1000;
          } else {
            isOver = true;
          }
        }
      }
    };

    animate();
  }

  renderScene = () => {
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <div
        style={{ height: "800px", width: "800px", marginBottom: "200px" }}
        ref={(mount) => {
          this.mount = mount;
        }}
      ></div>
    );
  }
}
