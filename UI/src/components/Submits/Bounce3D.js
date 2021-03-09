import React, { Component } from "react";
import * as THREE from "three";
import { AmbientLightProbe } from "three";
import "./Bounce.css";

export class Bounce3D extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: 15,
      playing: false,
      time: 0,
    };
  }

  componentDidMount() {
    this.model = require("./model-movie.json");
    this.evtIdx = 0;
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(width, height);

    this.mount.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
    this.camera.position.z = 20;
    this.camera.position.y = 20;

    this.scene.add(this.camera);

    this.plight = new THREE.PointLight(0xf1fff1, 1.5);
    this.alight = new THREE.AmbientLight(0xfff1ff, 1.5);

    this.plight.position.set(0, 50, 0);
    this.scene.add(this.plight);
    this.scene.add(this.alight);

    // https://redstapler.co/realistic-reflection-effect-three-js/

    const geometry = new THREE.SphereGeometry(2, 32, 16);
    const material = new THREE.MeshPhongMaterial({
      color: "#555",
    });
    this.ball = new THREE.Mesh(geometry, material);
    this.ball.position.y = 28.5;
    this.ball.position.x = -13.5;
    this.scene.add(this.ball);

    this.start;
    this.delta;
    this.d2 = 0;
    this.frames = 0;
    this.duration = this.model.events[this.model.events.length - 1].time * 100;
    // this.animate();

    this.setup();
    this.renderer.render(this.scene, this.camera);
  }

  setup = () => {
    const set = this.model.events.filter((evt) => evt.time < 0);

    set.forEach((brr) => {
      const width = brr.hiX - brr.loX;
      const height = brr.hiY - brr.loY;
      const geometry = new THREE.BoxGeometry(width, height, 3);
      const material = new THREE.MeshPhongMaterial({ color: "#678" });
      const barrier = new THREE.Mesh(geometry, material);
      barrier.position.x = brr.loX;
      barrier.position.y = brr.loY;
      this.scene.add(barrier);
      this.evtIdx++;
    });
  };

  animate = (timestamp) => {
    if (this.state.playing) {
      if (!this.start) this.start = timestamp;

      this.delta = timestamp - this.start;

      console.log(this.delta);

      if (this.delta > this.duration) return;

      var evts = [];
      while (this.model.events[this.evtIdx].time * 100 < this.delta) {
        evts.push(this.model.events[this.evtIdx]);
        this.evtIdx++;
      }

      console.log(evts);

      for (const evt of evts) {
        switch (evt.type) {
          case 0:
            this.ball.position.x = evt.x;
            this.ball.position.y = evt.y;
            break;
        }
      }

      this.setState({ time: this.state.time + 1 });
      // vx += 0.001;
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.animate);
    }
  };

  render() {
    return (
      <div>
        <button
          onClick={() => {
            this.setState({ playing: !this.state.playing }, () =>
              this.animate()
            );
          }}
        >
          play
        </button>
        <div
          style={{ height: "600px", width: "100%" }}
          ref={(mount) => {
            this.mount = mount;
          }}
        ></div>
        <div
          id="slider-bg"
          onMouseOver={(event) => {
            let vratio = (event.clientX - 80) / event.target.getBoundingClientRect().width;
            let start = vratio * this.duration;
            this.setState({ time: start });

            var evts = [];
            var idx = 0;
            while (this.model.events[idx].time * 100 < start) {
              evts.push(this.model.events[idx]);
              idx++;
            }





          }}
          style={{
            height: "11px",
            width: "calc(100%)",
            background: "white",
            border: "solid 1px black",
          }}
        >
          <div
            id="slider"
            style={{
              height: "10px",
              width: "10%",
              background: "rgb(189, 63, 63)",
              position: "relative",
            }}
          ></div>
        </div>
      </div>
    );
  }
}
