import React, {Component} from 'react';
// import {LandGrab3DView} from './LandGrab3DView';
import {LandGrabSVGView} from './LandGrabSVGView';
import {LandGrabMovie} from './LandGrabMovie';
import {LGSubmitModal} from './LGSubmitModal';
import {ViewChooser} from '../ViewChooser';
import {MovieController} from '../MovieController';

// Expected props are:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display, if any
//  sbmFunction -- function to call with new submission, or null if no new sbm
//                 is expected.
//
// LandGrab uses these props to build LandGrabMovie, whicn it passes to 
// a ViewChooser to display in one of several forms (e.g, LandGrab3DView,
// LandGrabSVGView or LandGrabVRView)
export class LandGrab extends Component {
   constructor(props) {
      super(props);

      this.state = {
         sbmConfirm: null, // Function to post current submission
		}
   }

   static getDerivedStateFromProps(newProps, oldState) {
      if (!oldState.props || newProps.prms !== oldState.props.prms
       || newProps.sbm !== oldState.props.sbm) {
         return {
            props: newProps, 
            movie: new LandGrabMovie(60, newProps.prms, newProps.sbm)
         };
      }
      else
         return oldState; 
   }

    //to be implemented later
   getSummary = (testResult, score) => {
      return;
   }

   // Create array once to avoid appearance of prop changes.
   static viewSpecs = [
      {
         label: "Diagram",
         viewMaker: mv => <MovieController movie={mv} viewCls={LandGrabSVGView}/>
      },
      // {
      //    label: "Movie",
      //    viewMaker: mv => <MovieController movie={mv} viewCls={LandGrab3DView} />
      // },
      // {
      //    label: "VR",
      //    viewMaker: mv => <LandGrabVRView movie={mv} />
      // }
   ];

   render() {
      var sbm = this.props.sbm;
      let summary = '';

      if (sbm && sbm.testResult && sbm.score !== null) {
         summary = this.getSummary(sbm.testResult, sbm.score);
      }

      return (<section className="container">
         <h2>Problem Diagram</h2>
         <ViewChooser
            movie={this.state.movie}
            viewSpecs={LandGrab.viewSpecs}
         />               
         {summary}
         <LGSubmitModal prms={this.props.prms}
          submitFn={this.props.sbmFunction}/>
      </section>);
   }
}