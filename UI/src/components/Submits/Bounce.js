import React, { Component } from 'react';
import { Bounce3DView } from './Bounce3DView';
//import {BounceSVGView} from "./BounceSVGView";
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

   static ballColors = ["red", "green", "orange", "purple", "cyan", "blue"];

   constructor(props) {
      super(props);

      this.state = {}
   }

   static getDerivedStateFromProps(props, state) {
      if (props.sbm && props.testResult)
         return {movie: new BounceMovie(24, props.prms, props.sbm)};
      else
         return {movie: null};
   }

   // Build table on bottom of page showing detailed info about each hit,
   // after that hit is shown on the animation.
   getSummary = (testResult, score) => {
      var hits = [];
      var ballEvents = [];
      var eventNum = 1, ballNum = 1;
      var colors = this.ballColors;
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
      let ready = sbm && sbm.testResult && sbm.score !== null;
      
      console.log("Rendering bounce for ", sbm);

      if (ready) {
         jsonMovie = new BounceMovie(60, prms, sbm);
         summary = this.getSummary(sbm.testResult, sbm.score);
      }

      return (<section className="container">
         (ready ?
          [<h2>Problem Diagram</h2>.
          <MovieController
             jsonMovie={jsonMovie}
             play={() => this.startMovie(sbm.testResult.events)} 
             replay={() => this.replay()} 
             pause={() => this.stopMovie()} 
             views={[Bounce3DView]}
          />,               
          {summary}] : '')
      </section>);
   }
}