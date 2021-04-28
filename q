[1mdiff --git a/UI/src/components/Main/Main.js b/UI/src/components/Main/Main.js[m
[1mindex 2d8ed82..3b282b0 100644[m
[1m--- a/UI/src/components/Main/Main.js[m
[1m+++ b/UI/src/components/Main/Main.js[m
[36m@@ -46,7 +46,6 @@[m [mclass Main extends Component {[m
    // {...this.props} />)}} />[m
 [m
    render() {[m
[31m-      console.log(this.props);[m
      var ProtectedRoute = this.ProtectedRoute;[m
 [m
     return ([m
[1mdiff --git a/UI/src/components/SignIn/SignIn.js b/UI/src/components/SignIn/SignIn.js[m
[1mindex 9153d26..0a90013 100644[m
[1m--- a/UI/src/components/SignIn/SignIn.js[m
[1m+++ b/UI/src/components/SignIn/SignIn.js[m
[36m@@ -13,8 +13,8 @@[m [mclass SignIn extends Component {[m
       //makes loggin in east, temp[m
       //has admin loggin info already filled out upon load[m
       this.state = {[m
[31m-         email: '',[m
[31m-         password: ''[m
[32m+[m[32m         email: 'admin@softwareinventions.com',[m
[32m+[m[32m         password: 'password'[m
       };[m
 [m
       // bind event handlers to the correct context[m
[1mdiff --git a/UI/src/components/Submits/Bounce3DView.jsx b/UI/src/components/Submits/Bounce3DView.jsx[m
[1mindex ecfcbcd..d6309c1 100644[m
[1m--- a/UI/src/components/Submits/Bounce3DView.jsx[m
[1m+++ b/UI/src/components/Submits/Bounce3DView.jsx[m
[36m@@ -18,6 +18,7 @@[m [mexport class Bounce3DView extends React.Component {[m
    }[m
 [m
    componentDidMount() {[m
[32m+[m[32m      console.log('component did mount')[m
       this.model = require("./model-movie.json");[m
       this.evtIdx = 0;[m
       const width = this.mount.clientWidth;[m
[36m@@ -30,14 +31,15 @@[m [mexport class Bounce3DView extends React.Component {[m
 [m
       this.mount.appendChild(this.renderer.domElement);[m
 [m
[31m-      this.fov = 100;[m
[32m+[m[32m      this.fov = 65;[m
       const aspect = 2;[m
       const near = .1;[m
       const far = 25;[m
       this.camera = new THREE.PerspectiveCamera(this.fov, aspect, near, far);[m
       //  = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);[m
       this.camera.position.z = 5;[m
[31m-      this.camera.position.y = 10;[m
[32m+[m[32m      this.camera.position.y = 7.5;[m
[32m+[m[32m      this.camera.position.x = 5;[m
 [m
       this.scene.add(this.camera);[m
 [m
[36m@@ -58,7 +60,7 @@[m [mexport class Bounce3DView extends React.Component {[m
       this.setFrames = 0;[m
       this.duration = this.model.events[this.model.events.length - 1].time * 100;[m
 [m
[31m-      this.setup();[m
[32m+[m[32m      //this.setup();[m
       this.renderer.render(this.scene, this.camera);[m
    }[m
 [m
[36m@@ -68,7 +70,7 @@[m [mexport class Bounce3DView extends React.Component {[m
 [m
    setup () {[m
       const set = this.props.movie.evts.filter((evt) => evt.time < 0);[m
[31m-      const r = 1;[m
[32m+[m[32m      const r = .4;[m
       const geometry = new THREE.SphereGeometry(r, 32, 16);[m
       const material = new THREE.MeshPhongMaterial({[m
          color: "#555",[m
[36m@@ -81,11 +83,11 @@[m [mexport class Bounce3DView extends React.Component {[m
       set.forEach((brr, idx) => {[m
          const width = brr.hiX - brr.loX;[m
          const height = brr.hiY - brr.loY;[m
[31m-         const geometry = new THREE.BoxGeometry(width, height, 1);[m
[32m+[m[32m         const geometry = new THREE.BoxGeometry(width, height, .5);[m
          const material = new THREE.MeshPhongMaterial({ color: `#${1 + idx}${2 + idx}${3 + idx}` });[m
          const barrier = new THREE.Mesh(geometry, material);[m
          barrier.position.y = brr.loY;[m
[31m-         barrier.position.z = 1;[m
[32m+[m[32m         barrier.position.z = 0;[m
          barrier.position.x = brr.loX;[m
          this.scene.add(barrier);[m
          this.evtIdx++;[m
[36m@@ -152,28 +154,28 @@[m [mexport class Bounce3DView extends React.Component {[m
       console.log('render here')[m
       console.log(this.random)[m
       return ([m
[31m-         <div>[m
[31m-            <button[m
[31m-               onClick={this.play}[m
[31m-            >[m
[31m-               play[m
[31m-        </button>[m
[32m+[m[32m      //    <div>[m
[32m+[m[32m      //       <button[m
[32m+[m[32m      //          onClick={this.play}[m
[32m+[m[32m      //       >[m
[32m+[m[32m      //          play[m
[32m+[m[32m      //   </button>[m
             <div[m
                style={{ height: "600px", width: "100%" }}[m
                ref={(mount) => {[m
                   this.mount = mount;[m
                }}[m
             ></div>[m
[31m-            <Slider[m
[31m-               value={this.state.delta}[m
[31m-               max={this.duration}[m
[31m-               onChange={(value) => {[m
[31m-                  this.setState({ delta: value, changedTime: true })[m
[31m-                  this.setFrame(0, value)[m
[31m-[m
[31m-               }}[m
[31m-            />[m
[31m-         </div>[m
[32m+[m[32m         //    <Slider[m
[32m+[m[32m         //       value={this.state.delta}[m
[32m+[m[32m         //       max={this.duration}[m
[32m+[m[32m         //       onChange={(value) => {[m
[32m+[m[32m         //          this.setState({ delta: value, changedTime: true })[m
[32m+[m[32m         //          this.setFrame(0, value)[m
[32m+[m
[32m+[m[32m         //       }}[m
[32m+[m[32m         //    />[m
[32m+[m[32m         // </div>[m
       );[m
    }[m
 }[m
[1mdiff --git a/UI/src/components/Submits/BounceMovie.js b/UI/src/components/Submits/BounceMovie.js[m
[1mindex 1655fbf..8aa5ef2 100644[m
[1m--- a/UI/src/components/Submits/BounceMovie.js[m
[1m+++ b/UI/src/components/Submits/BounceMovie.js[m
[36m@@ -62,30 +62,30 @@[m [mexport class BounceMovie {[m
    }[m
 [m
    addBallPositionEvt(time, x, y, ballNumber) {[m
[31m-      this.evts.push({type: cBallPosition, time, x, y, ballNumber});[m
[32m+[m[32m      this.evts.push({type: BounceMovie.cBallPosition, time, x, y, ballNumber});[m
    }[m
 [m
    addMakeBarrierEvt(time, id, loX, loY, hiX, hiY) {[m
[31m-      this.evts.push({type: cMakeBarrier, id, loX, loY, hiX, hiY});[m
[32m+[m[32m      this.evts.push({type: BounceMovie.cMakeBarrier, id, loX, loY, hiX, hiY});[m
    }[m
 [m
    addMakeTargetEvt(time, id, loX, loY, hiX, hiY) {[m
[31m-      this.evts.push({type: cMakeTarget, time, id, loX, loY, hiX, hiY});[m
[32m+[m[32m      this.evts.push({type: BounceMovie.cMakeTarget, time, id, loX, loY, hiX, hiY});[m
    }[m
 [m
    addHitBarrierEvt(time, x, y, ballNumber, barrierId) {[m
[31m-      this.evts.push({type: cHitBarrier, time, x, y, ballNumber, barrierId});[m
[32m+[m[32m      this.evts.push({type: BounceMovie.cHitBarrier, time, x, y, ballNumber, barrierId});[m
    }[m
 [m
    addHitTargetEvt(time, x, y, ballNumber, targetId) {[m
[31m-      this.evts.push({type: cHitTarget, time, x, y, ballNumber, targetId});[m
[32m+[m[32m      this.evts.push({type: BounceMovie.cHitTarget, time, x, y, ballNumber, targetId});[m
    }[m
 [m
    addBallLaunchEvt(time, ballNumber) {[m
[31m-      this.evts.push({type: cBallLaunch, time, ballNumber});[m
[32m+[m[32m      this.evts.push({type: BounceMovie.cBallLaunch, time, ballNumber});[m
    }[m
 [m
    addBallExitEvt(time, x, y, ballNumber) {[m
[31m-      this.evts.push({type: cBallExit, time, x, y, ballNumber});[m
[32m+[m[32m      this.evts.push({type: BounceMovie.cBallExit, time, x, y, ballNumber});[m
    }[m
 }[m
\ No newline at end of file[m
[1mdiff --git a/UI/src/components/Submits/MovieController.jsx b/UI/src/components/Submits/MovieController.jsx[m
[1mindex 454b21f..ab8a971 100644[m
[1m--- a/UI/src/components/Submits/MovieController.jsx[m
[1m+++ b/UI/src/components/Submits/MovieController.jsx[m
[36m@@ -1,5 +1,6 @@[m
 import React, { Component } from 'react';[m
 import './MovieBarController.css';[m
[32m+[m[32mimport {Bounce3DView} from './Bounce3DView';[m
 [m
 export class MovieController extends Component {[m
 [m
[36m@@ -34,7 +35,8 @@[m [mexport class MovieController extends Component {[m
                   </button>[m
                )[m
             }[m
[31m-            {this.currentView.render()}[m
[32m+[m[32m            {/* {this.currentView.render()} */}[m
[32m+[m[32m            <Bounce3DView/>[m
          </div>[m
 [m
          );[m
[1mdiff --git a/UI/src/components/Submits/SbmPage.js b/UI/src/components/Submits/SbmPage.js[m
[1mindex 2860bdd..6dc544a 100644[m
[1m--- a/UI/src/components/Submits/SbmPage.js[m
[1m+++ b/UI/src/components/Submits/SbmPage.js[m
[36m@@ -1,6 +1,7 @@[m
 import React, { Component } from 'react';[m
 import { Button } from 'react-bootstrap';[m
[31m-import { Bounce, BSubmitModal } from './Bounce'[m
[32m+[m[32mimport { Bounce } from './Bounce'[m
[32m+[m[32mimport { BSubmitModal } from './BounceSubmitModal';[m
 import { LandGrab, LGSubmitModal } from './LandGrab'[m
 import { Ricochet, RSubmitModal } from './Ricochet'[m
 [m
