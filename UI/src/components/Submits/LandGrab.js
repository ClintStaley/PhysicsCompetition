import React, { Component } from 'react';
import './LandGrab.css';
import { LandGrabSVGView } from './LandGrabSVGView';
import { LandGrabMovie } from './LandGrabMovie';
import { MovieController } from './MovieController';



// Expected props are:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display
export class LandGrab extends Component {
   constructor(props) {
      super(props);

      this.state = {
         sbmConfirm: null, // Function to post current submission
		}
   }
    //to be implemented later
    getSummary = (testResult, score) => {
      return;
   }

   render() {
      var prms = this.props.prms;
      var sbm = this.props.sbm;
      var jsonMovie = null;
      var summary = null;
      var ready = sbm && sbm.testResult && sbm.score !== null;
      if (ready) {
         jsonMovie = new LandGrabMovie(60, prms, sbm);
         summary = this.getSummary(sbm.testResult, sbm.score);
      }
      return (<section className="container">
         <h2>Problem Diagram</h2>
            {ready ?
            [<h2>Problem Diagram</h2>,
            <MovieController
               jsonMovie={jsonMovie}
               play={() => this.startMovie(sbm.testResult.events)} 
               replay={() => this.replay()} 
               pause={() => this.stopMovie()} 
               views={[LandGrabSVGView]}
            />,               
            summary] : ''}
         
      </section>);
   }
}
/*
<svg viewBox="0 0 100 100" width="100%" className="panel">
            <rect x="0" y="0" width="100" height="100" className="graphBkg"/>
            {grid}
            {obstacles}
            {circles}
         </svg>
         {summary} */