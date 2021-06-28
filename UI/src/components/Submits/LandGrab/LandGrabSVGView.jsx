import React, { Component } from "react";
import { LandGrabMovie } from "./LandGrabMovie";
import {SVGUtil} from '../SVGUtil';
import './LandGrab.css';

export class LandGrabSVGView extends React.Component {
    static circleColors = ["goodCircle", "badCircle", "openCircle"];


    constructor(props) {
        super(props);

        this.state = LandGrabSVGView.setOffset(
            LandGrabSVGView.getInitState(props.movie), props.offset);
    }

    static getInitState(movie){
        var bkgElms = SVGUtil.getbkgElms(movie);
        return {
            growthEvts : {},
            evtIdx: -1,       // Index within movie of last event shown in svgElms
            svgElms: bkgElms, // SVG elements to render at this point
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
        
        let {growthEvts, evtIdx, svgElms} = state;
        let yTop = movie.background.height;
        let evt;

        // While the event after evtIdx exists and needs adding to svgElms
        while (evtIdx+1 < evts.length && evts[evtIdx+1].time <= timeStamp) {
            evt = evts[++evtIdx];
            if (growthEvts[evtIdx-1]){
                    svgElms.pop();
                    
                }
                
            if (evt.type === LandGrabMovie.cMakeObstacle) {
                svgElms.push(SVGUtil.makeLabeledRect(evt, "obstacle", yTop));
            }
            else if (evt.type === LandGrabMovie.cInvalidCircle) {
                svgElms.push(SVGUtil.makeLabeledCircle(evt, "badCircle", yTop));
                console.log(evts[evtIdx].time);
            }
            else if (evt.type === LandGrabMovie.cValidCircle){
                svgElms.push(SVGUtil.makeLabeledCircle(evt, "goodCircle", yTop));
                console.log(evts[evtIdx].time);

            }
            else if (evt.type === LandGrabMovie.cCircleGrowth){
                growthEvts[evtIdx] = SVGUtil.makeLabeledCircle(evt, "openCircle", yTop);
                svgElms.push(growthEvts[evtIdx]);
            }
            //add indexing to remove circle growth
            else if (evt.type === LandGrabMovie.cInvalidCircleGrowth){
               growthEvts[evtIdx] = SVGUtil.makeLabeledCircle(evt, "badCircle", yTop);
               svgElms.push(growthEvts[evtIdx]);
            }
        }

      // Undo events to move backward in time. (Note that this and the prior
      // while condition are mutually exclusive.) Assume that barrier and
      // target creation occur at negative time and thus will not be "backed
      // over"
      
      while (evtIdx > 0 && timeStamp < evts[evtIdx].time) {
        
        evt = evts[evtIdx--];
        svgElms.pop();
        if(growthEvts[evtIdx]){
            
            svgElms.push(growthEvts[evtIdx]);
        }
    }
    

        return {growthEvts, evtIdx, svgElms, movie};
    }

    render() { 
        let width = this.state.movie.background.width;
        let height = this.state.movie.background.height;

      // console.log("Rendering at ", this.props.offset, this.state.svgElms);
      return  ( 
         <svg viewBox={`-.1 -.1 ${width + .1} ${height + .1}`} width="100%"
          className="panel">
            <g>{this.state.svgElms}</g>
         </svg>);
        
    }

}