import React, { Component } from 'react';
// import {Rebound3DView } from './Rebound3DView';
import {ReboundSVGView} from "./ReboundSVGView"; 
import {ReboundMovie} from './ReboundMovie';
import {MovieController} from '../MovieController';

import './Rebound.css'

// Expected props are, exactly and only:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display
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
   static views = [ReboundSVGView] // Rebound3DView];

   render() {
      let sbm = this.props.sbm;
      let summary = '';
   
   console.log("Movie", this.state.movie);
      if (sbm && sbm.testResult && sbm.score !== null) {
         summary = this.getSummary(sbm.testResult, sbm.score);
      }
         //<MovieController
         //   movie={this.state.movie}
         //   views={Rebound.views}
         ///>  
      return (<section className="container">
         <h2>Problem Diagram</h2>
         <h3>Movie controller goes here</h3>
             
         {summary}
      </section>);
   }
}