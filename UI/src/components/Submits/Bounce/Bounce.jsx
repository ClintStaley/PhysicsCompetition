import React, { Component } from 'react';
import { Bounce3DView } from './Bounce3DView2';
import {BounceSVGView} from "./BounceSVGView"; 
import { BounceMovie } from './BounceMovie';
import { MovieController } from '../MovieController';

import './Bounce.css'

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
      return {movie: new BounceMovie(60, props.prms, props.sbm)};
   }

   // Build table on bottom of page showing detailed info about each hit,
   // after that hit is shown on the animation.
   getSummary = (testResult, score) => {
      var hits = [];
      var ballEvents = [];
      var colors = Bounce.ballColors;
      var numColors = colors.length;

      if (score !== null) {
         testResult.events.forEach((ballArray, ballNum) => {
            hits.push(<h4 key={"Ball #" + ballNum}
             className={colors[ballNum % numColors]}>Ball #{ballNum+1}</h4>)

            //creates rows on table, 4 sig figs on values
            ballArray.forEach((event, evtNum) => {
               ballEvents.push(
                  <tr key={"tableSummary" + evtNum}>
                     <th>{evtNum === 0 ? "Launch" : event.obstacleIdx >= 0 ?
                      `Bounce off target ${event.obstacleIdx}` : "Exit"}
                     </th>
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
                        <th>Event</th>
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
            <h4>Targets Hit: {testResult.obstaclesHit}</h4>
            {hits}
         </div>
      )
   }

   render() {
      let sbm = this.props.sbm;
      let summary = '';
      
      if (sbm && sbm.testResult && sbm.score !== null) {
         summary = this.getSummary(sbm.testResult, sbm.score);
      }

      return (<section className="container">
         <h2>Problem Diagram</h2>
         <MovieController
            movie={this.state.movie}
            views={[BounceSVGView, Bounce3DView]}
         />               
         {summary}
      </section>);
   }
}