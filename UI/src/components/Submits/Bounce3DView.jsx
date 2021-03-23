import React, { Component } from "react";
import * as THREE from "three";
import { AmbientLightProbe } from "three";
import "./Bounce.css";
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css'

export class Bounce3DView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: 15,
      playing: false,
      delta: 0,
      changedTime:false
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

    const left = -20;
    const right = 20;
    const top = 20;
    const bottom = -20;
    const near = 5;
    const far = 50;
    this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        //  = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
    this.camera.position.z = 20;
    this.camera.position.y = 0;

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
    this.ball.position.y = -1;
    this.ball.position.x = 0;
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
    console.log(this.props.movie.evts);
    const set = this.props.movie.evts.filter((evt) => evt.time < 0);//this.model.events.filter((evt) => evt.time < 0);
    let brr = set[0]
    const width = brr.hiX - brr.loX;
    const height = brr.hiY - brr.loY;
    const geometry = new THREE.BoxGeometry(width, height, 3);
    const material = new THREE.MeshPhongMaterial({ color: `#123` });
    const barrier = new THREE.Mesh(geometry, material);
    barrier.position.x = brr.loX;
    barrier.position.y = brr.loY;
    this.scene.add(barrier);

    // set.forEach((brr, idx) => {
    //   const width = brr.hiX - brr.loX;
    //   const height = brr.hiY - brr.loY;
    //   const geometry = new THREE.BoxGeometry(width, height, 3);
    //   const material = new THREE.MeshPhongMaterial({ color: `#${1 + idx}${2 + idx}${3 + idx}` });
    //   const barrier = new THREE.Mesh(geometry, material);
    //   barrier.position.x = brr.loX;
    //   barrier.position.y = brr.loY;
    //   this.scene.add(barrier);
    //   this.evtIdx++;
    // });
  };

  animate = (timestamp) => {
    if (this.state.playing) {

      if (!this.start) this.start = timestamp;

      this.frame(timestamp);
      requestAnimationFrame(this.animate);
    }
  };


  frame = (timestamp, test) => {
    console.log(`rerendering ${test}`)

      var timePlaying = test ? test : timestamp - this.start;

      if (timePlaying > this.duration) {
        this.setState({playing:false});
        return;
      } 

      if (test) {
        this.evtIdx = 0;
      }

      this.setState({delta:timePlaying});
      var evts = [];
      while (this.model.events[this.evtIdx].time * 100 < timePlaying) {
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

      this.renderer.render(this.scene, this.camera);
  }

  render() {
    console.log(this.props.movie);
    return (
      <div>
        <button
          onClick={() => {
            this.start = undefined;
            this.evtIdx = 0;
            this.setState({ playing: true }, () =>
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
        <Slider
          value={this.state.delta}
          max={this.duration}
          onChange={(value)=>{
            this.setState({delta:value, changedTime:true})
            this.frame(0, value)
            
          }}
        />
      </div>
    );
  }
}
