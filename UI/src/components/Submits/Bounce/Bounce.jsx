import React, {Component} from 'react';
import {Bounce3DView} from './Bounce3DView';
import {BounceSVGView} from "./BounceSVGView"; 
import {BounceMovie}  from './BounceMovie';
import {BSubmitModal} from './BounceSubmitModal';
import {ViewChooser} from '../ViewChooser';
import {MovieController}  from '../MovieController';

import style from './Bounce.module.css'

// Expected props are, exactly:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display, if any
//  sbmFunction -- function to call with new submission, or null if no new sbm
//                 is expected.
//
// Bounce uses these props to build a BounceMovie, whicn it passes to 
// a ViewChooser to display in one of several forms (e.g, Bounce3DView,
// BounceSVGView or BounceVRView)
export class Bounce extends Component {

   static ballColors = ["red", "green", "orange", "purple", "cyan", "blue"];

   constructor(props) {
      super(props);

      this.state = Bounce.getDerivedStateFromProps(props, {});
   }

   static getDerivedStateFromProps(newProps, oldState) {
      if (!oldState.props || newProps.prms !== oldState.props.prms
       || newProps.sbm !== oldState.props.sbm) {
         return {
            props: newProps, 
            movie: new BounceMovie(60, newProps.prms, newProps.sbm)
         };
      }
      else
         return oldState;
   }

   // Build table on bottom of page showing detailed info about each hit,
   // after that hit is shown on the animation.
   getSummary = (testResult, score) => {
      var hits = [];
      var totalTime = -1;  // Predecrement to compensate for extra totalTime add
      var ballEvents;
      var colors = Bounce.ballColors;
      var numColors = colors.length;

      if (score !== null) {
         testResult.events.forEach((ballArray, ballNum) => {
            hits.push(<h4 key={"Ball #" + ballNum}
             className={style[colors[ballNum % numColors]]}>Ball #{ballNum+1}</h4>)

            ballEvents = [];

            // Add one table row per event to |ballEvents|
            ballArray.forEach((event, evtNum) => {
               ballEvents.push(
                  <tr key={"tableSummary" + evtNum}>
                     <th>{evtNum === 0 ? "Launch" : event.obstacleIdx >= 0 ?
                      `Bounce off target ${event.obstacleIdx}` : "Exit"}
                     </th>
                     <th>{parseFloat(event.time.toFixed(3))}</th>
                     <th>{parseFloat(event.posX.toFixed(3))}</th>
                     <th>{parseFloat(event.posY.toFixed(3))}</th>
                     <th>{parseFloat(event.velocityX.toFixed(3))}</th>
                     <th>{parseFloat(event.velocityY.toFixed(3))}</th>
                  </tr>);
            });

            totalTime += ballArray[ballArray.length-1].time + 1;

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
         });
          
         var scoreExpl = `Score of ${score.toFixed(2)} based on total time
          ${totalTime.toFixed(2)}`;
         
         if (testResult.sbmPenalty)
            scoreExpl += ` with excess submit penalty of
             ${testResult.sbmPenalty.toFixed(2)}`
         
         return (<div>
            <h4>{scoreExpl}</h4>
            {hits}
         </div>);
      }
      else
         return "";
   }

   // Create array once to avoid appearance of prop changes.
   static viewSpecs = [
      {
         label: "Diagram",
         viewMaker: mv => <MovieController movie={mv} viewCls={BounceSVGView}/>
      },
      {
         label: "Movie",
         viewMaker: mv => <MovieController movie={mv} viewCls={Bounce3DView}/>
      },
      //{
      //   label: "VR",
      //   viewMaker: mv => <BounceVRView movie={mv}/>
      //}
   ];

   render() {
      let sbm = this.props.sbm;
      let summary = '';
      
      if (sbm && sbm.testResult && sbm.score !== null) {
         summary = this.getSummary(sbm.testResult, sbm.score);
      }

      return (<section className="container">
         <h2>Problem Diagram</h2>
         <ViewChooser
            movie={this.state.movie}
            viewSpecs={Bounce.viewSpecs}
         />               
         {summary}
         <BSubmitModal prms={this.props.prms}
          submitFn={this.props.sbmFunction}/>;
      </section>);
   }
}