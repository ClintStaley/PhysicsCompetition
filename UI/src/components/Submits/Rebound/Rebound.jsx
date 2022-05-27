import React, {Component} from 'react';
// import {Rebound3DView } from './Rebound3DView';
import {ReboundSVGView} from "./ReboundSVGView"; 
import {ReboundMovie} from './ReboundMovie';
import {RbnSubmitModal} from './RbnSubmitModal';
import {ViewChooser} from '../ViewChooser';
import {MovieController} from '../MovieController';

import './Rebound.css'

// Expected props are, exactly:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display, if any
//  sbmFunction -- function to call with new submission, or null if no new sbm
//                 is expected.
//
// Rebound uses these props to build a ReboundMovie, which it passes to
// a ViewChooser to display in one of several forms (e.g, Rebound3DView,
// ReboundSVGView or ReboundVRView)
export class Rebound extends Component {
   constructor(props) {
      super(props);

      this.state = Rebound.getDerivedStateFromProps(props, {});
   }

   // Get initial state for construction or reset.  State is frame number and
   // current location/speed of all balls, plus gate status.
   static getDerivedStateFromProps(newProps, oldState) {
      if (!oldState.props || newProps.prms !== oldState.props.prms
       || newProps.sbm !== oldState.props.sbm) {
         return {
            props: newProps, 
            movie: new ReboundMovie(60, newProps.prms, newProps.sbm)
         };
      }
      else
         return oldState;
   }

   intervalID;        // Timer ID of interval timer
   frameRate = 24;    // Frames per second to display
   G = 9.80665;       //gravity constant
   fieldLength = 10;  //the stage length in meters
   fieldHeight = 10;  //the sage height in meters
   graphLine = .5;    //how far apart the graph lines are in meters

   // x position is equations[0] and y position is equations[1]
   positionEquations = (event) => {
      return {
         xPos: (time) => (time * event.velocityX) + event.posX,
         yPos: (time) => (time * time * -this.G / 2)
          + (time * event.velocityY) + event.posY
      };
   }

   // Build table on bottom of page showing detailed info about each hit,
   // after that hit is shown on the animation.
   getSummary = (testResult, score) => {
      return (
         <div>
         </div>
      )
   }

   // Create array once to avoid appearance of prop changes.
   static viewSpecs = [
      {
         label: "Diagram",
         viewMaker: mv => <MovieController movie={mv} viewCls={ReboundSVGView}/>
      },
      // {
      //    label: "Movie",
      //    viewMaker: mv => <MovieController movie={mv} viewCls={Rebound3DView}/>
      // },
      // {
      //    label: "VR",
      //    viewMaker: mv => <ReboundVRView movie={mv} />
      // }
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
            viewSpecs={Rebound.viewSpecs}
         />    
         {summary}
         <RbnSubmitModal prms={this.props.prms}
          submitFn={this.props.sbmFunction}/>;
      </section>);
   }
}