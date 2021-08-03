import React, { Component } from 'react';
import {ReboundMovie} from './ReboundMovie';
import {SVGUtil} from '../SVGUtil';
import styles from './ReboundSVGView.module.css';

export class ReboundSVGView extends React.Component {
   static ballRadius = .05;     // Radius of ball

   // Props are: {
   //    movie: movie to display
   //    offset: time offset from movie start in sec
   // }
   constructor(props) {
      super(props);

      this.state = ReboundSVGView.setOffset(
       ReboundSVGView.getInitState(props.movie), props.offset);
   }

   static getInitState(movie){
      var bkg = movie.background;
      var grid = SVGUtil.getGraphGrid(bkg.height, bkg.width, styles, 1, .1,
       {x: 0, y: 2*ballRadius});
      var ballChoice; // Draw set of balls above, using movie.ballchoice.
      var rig; // Draw four rectangles and gate on top of grid.
      var svgElms = <g>{ballChoice}{grid}{rig}</g>

      return {
         evtIdx: -1, // Index within movie of last event shown in svgElms
         svgElms,    // SVG elements to render at this point
         movie       // Pointer to current movie
      }
   }

   // Return label for button activating this view
   static getLabel() {
      return "Diagram";
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = ReboundSVGView.getInitState(newProps.movie);
      return ReboundSVGView.setOffset(rtn, newProps.offset);
   }

   // Advance/retract |state| so that svgElms reflects all and only those events
   // in |movie| with time <= |timeStamp|.  Assume existing |state| was built
   // from |movie| so incremental change is appropriate.  Return adjusted state
   static setOffset(state, timeStamp) {
      let movie = state.movie;
      let evts = movie.evts;
      let {trgEvts, ballEvt, evtIdx, svgElms} = state;
      let yTop = movie.background.height;
      let evt;
      let hitClass;
      const radius = ReboundSVGView.ballRadius;

      // While the event after evtIdx exists and needs adding to svgElms
      while (evtIdx+1 < evts.length && evts[evtIdx+1].time <= timeStamp) {
         evt = evts[++evtIdx];
         if (evt.type === ReboundMovie.cMakeBarrier) {
            svgElms.push(SVGUtil.makeLabeledRect(evt, "barrier", yTop));
         }
         else if (evt.type === ReboundMovie.cMakeTarget) {
            evt.svgIdx = svgElms.length;
            trgEvts[evt.id] = evt;  // Save event for redrawing if hit
            svgElms.push(SVGUtil.makeLabeledRect(evt, "target", yTop));
         }
         else if (evt.type === ReboundMovie.cBallPosition) {
            svgElms.push(<circle key={"ballPos" + evt.time} cx={evt.x}
             cy={yTop - evt.y} r={ReboundSVGView.ballPosRadius} 
             className={ReboundSVGView.ballColors[evt.ballNumber]}/>);
         }
         else if (evt.type === ReboundMovie.cHitBarrier
          || evt.type === ReboundMovie.cHitTarget) {
            hitClass = "ball faded " + ReboundSVGView.ballColors[evt.ballNumber];

            if (evt.corner)
               svgElms.push(<rect key={"Hit" + evt.time} x={evt.x - radius}
                y={yTop - evt.y - radius} width={2*radius} height={2*radius}
                className={hitClass}/>)
            else
               svgElms.push(<circle key={"Hit" + evt.time} cx={evt.x}
                cy={yTop - evt.y} r={radius} className={hitClass}/>)

            if (evt.type === ReboundMovie.cHitTarget) {
               let trgEvt = trgEvts[evt.targetId];
               svgElms[trgEvt.svgIdx]
                = SVGUtil.makeLabeledRect(trgEvt, "hitTarget", yTop)
            }
         }
         // Ball launch and ball exit require no action here.
      }

      // Undo events to move backward in time. (Note that this and the prior
      // while condition are mutually exclusive.) Assume that barrier and
      // target creation occur at negative time and thus will not be "backed
      // over"
      while (evtIdx > 0 && timeStamp < evts[evtIdx].time) {
         evt = evts[evtIdx--];
         if (evt.type === ReboundMovie.cBallPosition
          || evt.type === ReboundMovie.cHitBarrier 
          || evt.type === ReboundMovie.cHitTarget)
            svgElms.pop();

         if (evt.type === ReboundMovie.cHitTarget) {
            let trgEvt = trgEvts[evt.targetId];
            svgElms[trgEvt.svgIdx]
             = SVGUtil.makeLabeledRect(trgEvt, "target", yTop)
         }
      }

      // Loop from current evtIdx backward to find most recent event that draws
      // a full ball, or null if most recent is a ballExit.
      ballEvt = null;
      for (let searchIdx = evtIdx; searchIdx >= 0; searchIdx--) {
         let testEvt = evts[searchIdx];
         if (testEvt.type === ReboundMovie.cBallExit)
            break;
         else if (testEvt.type === ReboundMovie.cBallPosition 
          || testEvt.type === ReboundMovie.cHitTarget
          || testEvt.type === ReboundMovie.cHitBarrier) {
            ballEvt = testEvt;
            break;
         }
      }
      return {trgEvts, ballEvt, evtIdx, svgElms, movie};
   }

   render() {
      let ballEvt = this.state.ballEvt;
      let width = this.state.movie.background.width;
      let height = this.state.movie.background.height;

      return  ( 
         <svg viewBox={`-.1 -.1 ${width + .1} ${height + .1}`} width="100%"
          className="panel">
            <g>{this.state.svgElms}</g>
            {ballEvt ? <circle key={"BallLoc"} cx={ballEvt.x}
             cy={height - ballEvt.y} r={ReboundSVGView.ballRadius} 
             className={ReboundSVGView.ballColors[ballEvt.ballNumber]}/>: ""}
         </svg>);
   }
}