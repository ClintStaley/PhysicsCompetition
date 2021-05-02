import React, { Component } from 'react';
import { Bounce3DView } from './Bounce3DView';
import {BounceSVGView} from "./BounceSVGView";
import { BounceMovie } from './BounceMovie';
import { MovieController } from './MovieController';

import './Bounce.css'
import { Sphere } from 'three';

// Expected props are, exactly:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display
//
// Bounce uses these props to build a BounceMovie, whicn it passes to 
// a MovieController to display in one of several forms (e.g, Bounce3DView,
// BounceSVGView)
export class Bounce extends Component {
   constructor(props) {
      super(props);

      this.state = {}
   }

   getDerivedStateFromProps(props, state) {
      if (props.sbm && props.testResult)
         return {movie: new BounceMovie(24, props.prms, props.sbm)};
      else {
         this.stopMovie();
         return {movie: null};
      }
   }

   // Stop timer when component closes, to avoid accessing parameters
   // that no longer exist
   componentWillUnmount = () => {
      this.stopMovie();
   }

   intervalID;        // Timer ID of interval timer
   frameRate = 24;    // Frames per second to display
   G = 9.80665;       // Gravity constant
   fieldLength = 10;  // Stage length in meters
   fieldHeight = 10;  // Stage height in meters
   graphLine = .5;    // Distance between graph lines in meters

   colors = ["red", "green", "orange", "purple", "cyan"];   // ball colors

   // x position is equations[0] and y position is equations[1]
   positionEquations = (event) => {
      return {
         xPos: (time) => (time * event.velocityX) + event.posX,
         yPos: (time) => (time * time * -this.G / 2)
            + (time * event.velocityY) + event.posY
      };
   }

   startMovie = (events) => {
      var frameRate = this.frameRate;
      var secondsToMiliseconds = 1000;
      var totalTime = 0;

      // Safety to preclude simultaneously running interval timers
      if (this.intervalID)
         clearInterval(this.intervalID);

      // CAS FIX would make a better forEach.  
      // Sum the duration of all events (ball arcs) to get movie end time.
      for (var idx = 0; idx < events.length; idx++) {
         totalTime += events[idx][events[idx].length - 1].time;
      }

      // Run advanceFrame() at every frame
      this.intervalID = setInterval(() => {
         this.advanceFrame(totalTime);
      }, secondsToMiliseconds / frameRate);
   }

   advanceFrame = (totalTime) => {
      var frame = this.state.frame;

      if (++frame / this.frameRate > totalTime)
         this.stopMovie();

      this.setState({ frame, obstacleStatus: this.calculateObstacles(frame) });
   }

   stopMovie = () => {
      clearInterval(this.intervalID);
   }

   calculateObstacles = (frame) => {
      var events = this.props.sbm.testResult.events;
      var time = frame / this.frameRate;
      var elapsedTime = 0;  // CAS FIX: Rename to baseTime
      var obstacleState = this.state.obstacleStatus.splice(0);

      //fill out the state array so that hit obstacles are greyed out
      events.forEach((eventArr) => {
         eventArr.forEach((event) => {
            //checks if time is greater than collision time on obstacles
            if (event.obstacleIdx !== -1
               && obstacleState[event.obstacleIdx]
               && time > event.time + elapsedTime)
               obstacleState[event.obstacleIdx] = false;
         });
         elapsedTime += eventArr[eventArr.length - 1].time;
      });

      return obstacleState;
   }

   // Build table on bottom of page showing detailed info about each hit,
   // after that hit is shown on the animation.
   getSummary = (testResult, score) => {
      var hits = [];
      var ballEvents = [];
      var eventNum = 1, ballNum = 1;
      var colors = this.colors;
      var numColors = colors.length;

      if (score) {
         testResult.events.forEach((ballArray) => {
            hits.push(<h4 key={"Ball #" + ballNum}
               className={colors[(ballNum - 1) % numColors]}>Ball # {ballNum}</h4>)

            //creates rows onb table, 4 sig figs on values
            ballArray.forEach((event) => {
               if (event.obstacleIdx !== -1 &&
                  !this.state.obstacleStatus[event.obstacleIdx])
                  ballEvents.push(
                     <tr key={"tableSummary" + eventNum++}>
                        <th>{parseFloat(event.time.toFixed(4))}</th>
                        <th>{parseFloat(event.posX.toFixed(4))}</th>
                        <th>{parseFloat(event.posY.toFixed(4))}</th>
                        <th>{parseFloat(event.velocityX.toFixed(4))}</th>
                        <th>{parseFloat(event.velocityY.toFixed(4))}</th>
                     </tr>);
            });

            hits.push(
               <table key={"Summary" + ballNum++}>
                  <tbody>
                     <tr>
                        <th>Time</th>
                        <th>X Position</th>
                        <th>Y Position</th>
                        <th>X Velocity</th>
                        <th>Y Velocity</th>
                     </tr>
                     {ballEvents}
                  </tbody>
               </table>);

            ballEvents = [];
         });
      }

      return (
         <div>
            <h4>Platforms Hit: {testResult.obstaclesHit}</h4>
            {hits}
         </div>
      )
   }

   // Restart movie.
   replay = () => {
      this.setState(this.getInitialState());
      this.startMovie(this.props.sbm.testResult.events);
   }

   render() {
      let prms = this.props.prms;
      let sbm = this.props.sbm;
      let jsonMovie = null;
      let summary = null;
      let ready = sbm && sbm.testResult && sbm.score;
      
      console.log(sbm);

      if (ready) {
         jsonMovie = new BounceMovie(60, prms, sbm);

         summary = this.getSummary(sbm.testResult, sbm.score);
      }

      return (<section className="container">
         (ready ?
          [<h2>Problem Diagram</h2>
          <MovieController
             jsonMovie={jsonMovie}
             play={() => this.startMovie(sbm.testResult.events)} 
             replay={() => this.replay()} 
             pause={() => this.stopMovie()} 
             views={[Bounce3DView, BounceSVGView]}
          />,               
          {summary}] : '')
      </section>);
   }
}