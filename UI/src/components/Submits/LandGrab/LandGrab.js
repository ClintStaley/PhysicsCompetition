import React, { Component } from 'react';
import { LandGrabSVGView } from './LandGrabSVGView';
import { LandGrabMovie } from './LandGrabMovie';
import { MovieController } from '../MovieController';



// Expected props are:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display

// LandGrab uses these props to build LandGrabMovie, whicn it passes to 
// a MovieController to display in one of several forms (e.g, LandGrab3DView,
// LandGrabSVGView)
export class LandGrab extends Component {
   constructor(props) {
      super(props);

      this.state = {
         sbmConfirm: null, // Function to post current submission
		}
   }

   static getDerivedStateFromProps(props, state) {
      return {movie: new LandGrabMovie(60, props.prms, props.sbm)};
   }

    //to be implemented later
    getSummary = (testResult, score) => {
      return;
   }

   render() {
      var sbm = this.props.sbm;
      let summary = '';
      if (sbm && sbm.testResult && sbm.score !== null) {
         summary = this.getSummary(sbm.testResult, sbm.score);
      }
      return (<section className="container">
         <h2>Problem Diagram</h2>
         <MovieController
            movie={this.state.movie}
            views={[LandGrabSVGView]}
         />               
         {summary}
      </section>);
   }
}