import React, { Component } from 'react';
import {BounceMovie} from './BounceMovie';

import './BounceSVGView.css'

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

   // Return state displaying background grid and other fixtures
   // appropriate for |movie|
   static getInitState(movie) {
      let bkgElms = [];
      let width = movie.background.width;
      let height = movie.background.height;
      let longDim = Math.max(width, height);
      let bigGap = longDim/10;  // Gap between heavy graph lines
      let smallGap = bigGap/5;  // Gap between light graph lines
 
      bkgElms.push(<rect x="0" y="0" width={width} height={height}
       className="graphBkg"/>);

      // Vertical lines
      for (var bigOffset = 0; bigOffset <= width; bigOffset += bigGap) {

         bkgElms.push(<line key={"VL" + bigOffset} x1={bigOffset} y1="0"
          x2={bigOffset} y2={height} className="heavyLine"/>);

         for (var smallOffset = bigOffset + smallGap;
          smallOffset < bigOffset + bigGap; smallOffset += smallGap)
            bkgElms.push(<line key={"VL" + smallOffset} x1={smallOffset} y1="0"
             x2={smallOffset} y2={height} className="lightLine" />);
      }
   
      // Horizontal lines
      for (var bigOffset = 0; bigOffset <= height; bigOffset += bigGap) {

         bkgElms.push(<line key={"HL" + bigOffset} x1="0" y1={bigOffset}
            x2={width} y2={bigOffset} className="heavyLine" />);

         for (var smallOffset = bigOffset + smallGap;
          smallOffset < bigOffset + bigGap; smallOffset += smallGap)
            bkgElms.push(<line key={"HL" + smallOffset} x1="0" y1={smallOffset}
             x2={width} y2={smallOffset} className="lightLine" />);
      }

      return {
         trgEvts: [],      // Target creation events (each w/index into svgElms)
         ballEvt: null,    // Most recent ball position or hit event
         evtIdx: -1,       // Index within movie of last event shown in svgElms
         svgElms: bkgElms, // SVG elements to render at this point
         movie             // Pointer to current movie
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

   // Return an svg <g> object representing a rectangle of class |cls| with
   // dimensions as indicated by |evt| and with corner coordinates drawn in
   // text form, inside the rectangle if room suffices, otherwise outside.
   static makeLabeledRect(evt, cls, yTop) {
      const textSize = 1.2;  // Minimum width of rect to fit text inside
      const textHeight = .13;  // Height of a text line
      const minHeight = textHeight * 2.1; // Minimum height to fit 2 text lines
      
      let elms = [];        // Returned SVG elements
      let width = evt.hiX - evt.loX;
      let height = evt.hiY - evt.loY;

      // Values to put text inside or outside the rectangle, in both dimensions
      let classLeft = width > textSize ? "text" : "rhsText";
      let classRight = width > textSize ? "rhsText" : "text";
      let topYAdjust = height > minHeight ? textHeight : 0;
      let btmYAdjust = height > minHeight ? 0 : textHeight;

      // Main rectangle
      elms.push(<rect key={"Blk" + evt.id} x={evt.loX} y={yTop - evt.hiY}
       width={width} height={height} className={cls}/>);
      
      // Upper left label showing (loX, hiY)
      elms.push(<text key={"BlkUL" + evt.id} x={evt.loX} 
       y={yTop - evt.hiY + topYAdjust} className={classLeft}>
       {`(${evt.loX.toFixed(2)}, ${evt.hiY.toFixed(2)})`}
       </text>);

      // Upper right label showing (hiX, hiY)
      elms.push(<text key={"BlkUR" + evt.id} x={evt.hiX}
       y={yTop - evt.hiY + topYAdjust} className={classRight}>
       {`(${evt.hiX.toFixed(2)}, ${evt.hiY.toFixed(2)})`}
       </text>);

      // Lower left label showing (loX, loY)
      elms.push(<text key={"BlkLL" + evt.id} x={evt.loX} 
       y={yTop - evt.loY + btmYAdjust} className={classLeft}>
       {`(${evt.loX.toFixed(2)}, ${evt.loY.toFixed(2)})`}
       </text>);

      // Lower right label showing (hiX, loY)
      elms.push(<text key={"BlkLR" + evt.id} x={evt.hiX} 
       y={yTop - evt.loY + btmYAdjust} className={classRight}>
       {`(${evt.hiX.toFixed(2)}, ${evt.loY.toFixed(2)})`}
       </text>);

      return <g>{elms}</g>;
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

      while (evtIdx < evts.length-1 && timeStamp >= evts[evtIdx+1].time) {
         evt = evts[++evtIdx];
         if (evt.type === BounceMovie.cMakeBarrier) {
            svgElms.push(BounceSVGView.makeLabeledRect(evt, "barrier", yTop));
         }
         else if (evt.type === BounceMovie.cMakeTarget) {
            evt.svgIdx = svgElms.length;
            trgEvts[evt.id] = evt;  // Save event for redrawing if hit
            svgElms.push(BounceSVGView.makeLabeledRect(evt, "target", yTop));
         }
         else if (evt.type === BounceMovie.cBallPosition) {
            svgElms.push(<circle key={"ballPos" + evt.time} cx={evt.x}
             cy={yTop - evt.y} r={BounceSVGView.ballPosRadius} 
             className={BounceSVGView.ballColors[evt.ballNumber]}/>);
         }
         else if (evt.type === BounceMovie.cHitBarrier
          || evt.type === BounceMovie.cHitTarget) {
            svgElms.push(<circle key={"Hit" + evt.time} cx={evt.x}
             cy={yTop - evt.y} r={BounceSVGView.ballRadius}
             className={"ball faded "
              + BounceSVGView.ballColors[evt.ballNumber]} />)

            if (evt.type === BounceMovie.cHitTarget) {
               let trgEvt = trgEvts[evt.targetId];
               svgElms[trgEvt.svgIdx]
                = BounceSVGView.makeLabeledRect(trgEvt, "hitTarget", yTop)
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
         if (evt.type === BounceMovie.cBallPosition
          || evt.type === BounceMovie.cHitBarrier 
          || evt.type === BounceMovie.cHitTarget)
            svgElms.pop();

         if (evt.type === BounceMovie.cHitTarget) {
            let trgEvt = trgEvts[evt.targetId];
            svgElms[trgEvt.svgIdx]
             = BounceSVGView.makeLabeledRect(trgEvt, "target", yTop)
         }
      }

      // Loop from current evtIdx backward to find most recent event that draws
      // a full ball, or null if most recent is a ballExit.
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

      // console.log("Rendering at ", this.props.offset, this.state.svgElms);
      return  ( 
         <svg viewBox={`-.1 -.1 ${width + .1} ${height + .1}`} width="100%"
          className="panel">
            <g>{this.state.svgElms}</g>
            {ballEvt ? <circle key={"BallLoc"} cx={ballEvt.x}
             cy={height - ballEvt.y} r={BounceSVGView.ballRadius} 
             className={BounceSVGView.ballColors[ballEvt.ballNumber]}/>: ""}
         </svg>);
   }
}