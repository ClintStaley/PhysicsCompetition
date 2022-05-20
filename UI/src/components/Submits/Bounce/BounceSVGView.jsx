import React, { Component } from 'react';
import {BounceMovie} from './BounceMovie';
import {SVGUtil} from '../SVGUtil';
import style from './BounceSVGView.module.css'

export class BounceSVGView extends React.Component {
   static ballColors = ["red", "green", "orange", "purple", "cyan", "blue"];
   static ballPosRadius = .02; // Radius of ball position marker
   static ballRadius = .1;     // Radius of ball

   // Props are: {
   //    movie: movie to display
   //    offset: time offset from movie start in sec
   // }
   constructor(props) {
      super(props);

      this.state = BounceSVGView.setOffset(
       BounceSVGView.getInitState(props.movie), props.offset);
   }

   static getInitState(movie){
      var bkg = movie.background;
      var svgElms = [SVGUtil.getGraphGrid(bkg.height, bkg.width, style)];

      return {
         trgEvts: [],    // Target creation events (each w/index into svgElms)
         ballEvt: null,  // Most recent ball position or hit event
         evtIdx: -1,     // Index within movie of last event shown in svgElms
         svgElms,        // background and grid lines
         movie           // Pointer to current movie
      }
   }

   // Return label for button activating this view
   static getLabel() {
      return "Diagram";
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.movie) // Complete reset
         rtn = BounceSVGView.getInitState(newProps.movie);
      return BounceSVGView.setOffset(rtn, newProps.offset);
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
      const radius = BounceSVGView.ballRadius;

      // While the event after evtIdx exists and needs adding to svgElms
      while (evtIdx+1 < evts.length && evts[evtIdx+1].time <= timeStamp) {
         evt = evts[++evtIdx];
         if (evt.type === BounceMovie.cMakeBarrier) {
            svgElms.push(SVGUtil.makeLabeledRect(evt, "barrier", yTop, style, .13));
         }
         else if (evt.type === BounceMovie.cMakeTarget) {
            evt.svgIdx = svgElms.length;
            trgEvts[evt.id] = evt;  // Save event for redrawing if hit
            svgElms.push(SVGUtil.makeLabeledRect(evt, "target", yTop, style, .13));
         }
         else if (evt.type === BounceMovie.cBallPosition) {
            svgElms.push(<circle key={"ballPos" + evt.time} cx={evt.x}
             cy={yTop - evt.y} r={BounceSVGView.ballPosRadius} 
             className={style[BounceSVGView.ballColors[evt.ballNumber]]}/>);
         }
         else if (evt.type === BounceMovie.cHitBarrier
          || evt.type === BounceMovie.cHitTarget) {
            //hitClass = "ball faded " + BounceSVGView.ballColors[evt.ballNumber];
            hitClass = BounceSVGView.ballColors[evt.ballNumber];

            if (evt.corner)
               svgElms.push(<rect key={"Hit" + evt.time} x={evt.x - radius}
                y={yTop - evt.y - radius} width={2*radius} height={2*radius}
                className={style.faded + " " + style[hitClass]}/>)
            else
               svgElms.push(<circle key={"Hit" + evt.time} cx={evt.x}
                cy={yTop - evt.y} r={radius} 
                className={style.faded + " " +style[hitClass]}/>)

            if (evt.type === BounceMovie.cHitTarget) {
               let trgEvt = trgEvts[evt.targetId];
               svgElms[trgEvt.svgIdx]
                = SVGUtil.makeLabeledRect(trgEvt, "hitTarget", yTop, style, .13)
            }
         }
         // Ball launch and ball exit require no action here.
      }

      // Undo events to move backward in time. (Note that this and the 
      // prior while condition are mutually exclusive.) Assume that
      // barrier and target creation occur at negative time and thus 
      // will not be "backed over"
      while (evtIdx > 0 && timeStamp < evts[evtIdx].time) {
         evt = evts[evtIdx--];
         if (evt.type === BounceMovie.cBallPosition
          || evt.type === BounceMovie.cHitBarrier 
          || evt.type === BounceMovie.cHitTarget)
            svgElms.pop();

         if (evt.type === BounceMovie.cHitTarget) {
            let trgEvt = trgEvts[evt.targetId];
            svgElms[trgEvt.svgIdx]
             = SVGUtil.makeLabeledRect(trgEvt, "target", yTop, style, .13)
         }
      }

      // Loop from current evtIdx backward to find most recent event 
      // that draws a full ball, or null if most recent is a ballExit.
      ballEvt = null;
      for (let searchIdx = evtIdx; searchIdx >= 0; searchIdx--) {
         let testEvt = evts[searchIdx];
         if (testEvt.type === BounceMovie.cBallExit)
            break;
         else if (testEvt.type === BounceMovie.cBallPosition 
          || testEvt.type === BounceMovie.cHitTarget
          || testEvt.type === BounceMovie.cHitBarrier) {
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
             cy={height - ballEvt.y} r={BounceSVGView.ballRadius} 
             className={style[BounceSVGView.ballColors[ballEvt.ballNumber]]}/>: ""}
         </svg>);
   }
}