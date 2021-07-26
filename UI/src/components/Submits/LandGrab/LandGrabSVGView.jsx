import React, { Component } from "react";
import { LandGrabMovie } from "./LandGrabMovie";
import {SVGUtil} from '../SVGUtil';
import styles from './LandGrabSVGView.module.css';

export class LandGrabSVGView extends React.Component {    
   constructor(props) {
      super(props);

      this.state = LandGrabSVGView.setOffset(
       LandGrabSVGView.getInitState(props.movie), props.offset);
    }

   static getInitState(movie){
      var bkgElms = SVGUtil.getGraphGrid(movie, styles);
      return {
         growthEvts : [],  // array of all growth events (including invalid)
         evtIdx: -1,       // Index within movie of last event shown in svgElms
         bkgElms, // SVG elements to render at this point. Permanant, no appends
         addedSVGs: [], // SVG elms that are progressively added (no removal)
         topLayerSVGs: [], //svg elms that can change on new frame, These 
         // elements will be replaced and rerendered for each frame
         movie             // Pointer to current movie
      }
   }
    
   static getLabel() {
      return "Diagram";
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) //Complete reset
         rtn = LandGrabSVGView.getInitState(newProps.movie);
      return LandGrabSVGView.setOffset(rtn, newProps.offset);
   }

   // Advance/retract |state| so that svgElms reflects all and only those events
   // in |movie| with time <= |timeStamp|.  Assume existing |state| was built
   // from |movie| so incremental change is appropriate.  Return adjusted state
   static setOffset(state, timeStamp) {
      let movie = state.movie;
      let evts = movie.evts;
      
      let {growthEvts, evtIdx, bkgElms, addedSVGs, topLayerSVGs} = state;
      let yTop = movie.background.height;
      let evt;
      // While the event after evtIdx exists and needs adding to svgElms
      while (evtIdx+1 < evts.length && evts[evtIdx+1].time <= timeStamp) {
         evt = evts[++evtIdx];
         if (evt.type === LandGrabMovie.cMakeObstacle) {
               addedSVGs.push(SVGUtil.makeLabeledRect(evt, "obstacle", yTop, styles, 1.7));
         }
         else if (evt.type === LandGrabMovie.cInvalidCircle) {
               addedSVGs.push(SVGUtil.makeLabeledCircle(evt, "badCircle", yTop, styles));
         }
         else if (evt.type === LandGrabMovie.cValidCircle){
               addedSVGs.push(SVGUtil.makeLabeledCircle(evt, "goodCircle", yTop, styles));
         }
         else if (evt.type === LandGrabMovie.cCircleGrowth){
               topLayerSVGs = SVGUtil.makeCircleSlice(evt, "openCircle", yTop, styles);
         }
      }

      if (evts[evtIdx].type !== LandGrabMovie.cCircleGrowth)
         topLayerSVGs = [];

      // THIS NEEDS TO BE REFACTORED FOR NEW SVG ORGANIZATION 
      // conditionally pop if it is any of the addedSVG evts
      // and always use the last available 
      // Undo events to move backward in time. (Note that this and the prior
      // while condition are mutually exclusive.) Assume that barrier and
      // target creation occur at negative time and thus will not be "backed
      // over"
      while (evtIdx > 0 && timeStamp < evts[evtIdx].time) {
         evt = evts[evtIdx--];
         svgElms.pop();

         if(growthEvts[evtIdx])
            svgElms.push(growthEvts[evtIdx]);
      }

      return {growthEvts, evtIdx, bkgElms, addedSVGs, topLayerSVGs, movie};
   }

   render() { 
      let width = this.state.movie.background.width; 
      let height = this.state.movie.background.height;
      //console.log(this.state.svgElms[this.state.svgElms.length-1].props.children);
      
      //console.log(this.state.svgElms[this.state.svgElms.length-2].props.children);
      // I have isolated the issue to addedSVGs list
      return  ( 
      <svg key={"svgOuter"} viewBox={`-.1 -.1 ${width + .1} ${height + .1}`} width="100%"
         className="panel">

         <g>{this.state.bkgElms}</g>
         <g>{this.state.addedSVGs}</g>
         <g>{this.state.topLayerSVGs}</g> 
          
      </svg>);
      // <g> key={"lastElm"} {this.state.svgElms[this.state.svgElms.length-1]}</g>
      
      
      
   }

}