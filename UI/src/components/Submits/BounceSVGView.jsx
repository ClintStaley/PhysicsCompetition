import React, { Component } from 'react';
import {FormGroup, FormControl, HelpBlock, ControlLabel}
  from 'react-bootstrap';
import {BounceMovie} from './BounceMovie';

import './BounceSVGView.css'

export class BounceSVGView extends Component {
   static ballColors = ["red", "green", "orange", "purple", "cyan", "blue"];
   static graphLine = .5;      // Distance between graph lines in meters
   static graphLine = .5;      // Distance between graph lines in meters
   static ballPosRadius = .02; // Radius of ball position marker
   static ballRadius = .1;     // Radius of ball

   // Props are: {
   //    currentOffset: time offset from movie start in sec
   //    movie: movie to display
   // }
   constructor(props) {
      super(props);

      this.state = this.getInitState();
      this.setOffset(props.currentOffset);
   }

   // Return SVG element array displaying background grid and other fixtures.
   getInitState() {
      let bkgElms = [];
      let width = this.props.movie.background.width;
      let height = this.props.movie.background.height;
      let longDim = Math.max(width, height);
      let bigGap = longDim/10;
      let smallGap = bigGap/5;
 
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
      }   
   }

   // Return label for button activating this view
   getLabel() {
      return "Diagram";
   }

   getDerivedStateFromProps(newProps, state) {
      if (newProps.movie !== this.props.movie) // Complete reset
         this.setState(this.getInitState());
      this.setOffset(newProps.currentOffset);
   }

   // Create an svg <g> object representing a rectangle of class |cls| with
   // dimensions as indicated by |evt| and with corner coordinates drawn in
   // text form.
   makeLabeledRect(evt, cls) {
      const textSize = .8;  // Minimum width of rect to fit text inside
      const topLead = .13;  // Leading for text on top
      const btmLead = .05;  // Leading for text on bottom
      
      let elms = [];        // Returned SVG elements
      let width = evt.hiX - evt.loX + 1;
      let height = evt.hiY - evt.loY + 1;
      let classLeft = width > textSize ? "text" : "rhsText";
      let classRight = width > textSize ? "rhsText" : "text";
      let yTop = this.props.movie.background.height;

      // Main rectangle
      elms.push(<rect key={"Blk" + evt.id} x={evt.loX} y={yTop - evt.hiY}
       width={width} height={height} className={cls}/>);
      
      // Upper left label showing (loX, hiY)
      elms.push(<text key={"BlkUL" + evt.id} x={evt.loX} 
       y={yTop - evt.hiY + topLead} className={classLeft}>
       {`(${evt.loX}, ${evt.hiY})`}
       </text>);

      // Upper right label showing (hiX, hiY)
      elms.push(<text key={"BlkUR" + evt.id} x={evt.hiX}
       y={yTop - evt.hiY + topLead} className={classRight}>
       {`(${evt.hiX}, ${evt.hiY})`}
       </text>);

      // Lower left label showing (loX, loY)
      elms.push(<text key={"BlkLL" + evt.id} x={evt.loX} 
       y={yTop - evt.loY + topLead} className={classLeft}>
       {`(${evt.loX}, ${evt.loY})`}
       </text>);


      // Lower right label showing (hiX, loY)
      elms.push(<text key={"BlkLR" + evt.id} x={evt.hiX} 
       y={yTop - evt.loY + topLead} className={classRight}>
       {`(${evt.hiX}, ${evt.loY})`}
       </text>);

      return <g>{elms}</g>;
   }

   // Advance/retract so that all events with time <= |timeStamp| have been
   // performed.  
   setOffset(timeStamp) {
      let evts = this.props.movie.evts;
      let {trgEvts, ball, evtIdx, svgElms} = this.state;
      let yTop = this.props.movie.background.height;
      let evt;

      while (evtIdx < evts.length && timeStamp >= evts[evtIdx+1].time) {
         evt = evts[++evtIdx];
         if (evt.type === BounceMovie.cMakeBarrier) {
            svgElms.push(this.makeLabeledRect(evt, "barrier"));
         }
         else if (evt.type === BounceMovie.cMakeTarget) {
            evt.svgIdx = svgElms.length;
            trgEvts[evt.targetId] = evt;  // Save event for redrawing if hit
            svgElms.push(this.makeLabeledRect(evt, "target"));
         }
         else if (evt.type === BounceMovie.cBallPosition) {
            svgElms.push(<circle key={"ballPos" + evt.time} cx={evt.x}
             cy={yTop - evt.y} r={this.ballPosRadius} 
             className={this.ballColors[evt.ballNumber]}/>);
         }
         else if (evt.type === BounceMovie.cHitBarrier
          || evt.type === BounceMovie.cHitTarget) {
            svgElms.push(<circle key={"Hit" + evt.time} cx={evt.x}
             cy={yTop - evt.y} r={this.ballRadius}
             className={"ball faded " + this.ballColors[evt.ballNumber]} />)

            if (evt.type === BounceMovie.cHitTarget) {
               let trgEvt = trgEvts[evt.targetId];
               svgElms[trgEvt.svgIdx] = this.makeLabeledRect(trgEvt, "hitTarget")
            }
         }
         // Ball launch and ball exit require no action here.
      }

      // Undo events to move backward in time. Note that this and the prior
      // while condition are mutually exclusive. Presumes that barrier and
      // target creation occur at negative time and thus will not be "backed
      // over"
      while (evtIdx > 0 && timeStamp < evts[evtIdx].time) {
         evt = evts[evtIdx--];
         if (evt.type === BounceMovie.cBallPosition
          || evt.type === cHitBarrier || evt.type === cHitTarget)
            svgElms.pop();

         if (evt.type === BounceMovie.cHitTarget) {
            let trgEvt = trgEvts[evt.targetId];
            svgElms[trgEvt.svgIdx] = this.makeLabeledRect(trgEvt, "target")
         }
      }

      // Loop from current evtIdx backward to find most recent event that draws
      // a full ball, or null if most recent is a ballExit.
      ballEvt = null;
      for (searchIdx = evtIdx; searchIdx >= 0; searchIdx--) {
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
      this.setState({trgEvts, ballEvt, evtIdx, svgElms});
   }

   render() {
      let ballEvt = this.state.ballEvt;
      let width = this.props.movie.background.width;
      let height = this.props.movie.background.height;

      return  (
         <svg viewBox={`-.1 -.1 ${width + .1} ${height + .1}`} width="100%"
          className="panel">
            {this.state.svgElms}
            {ballEvt ? <circle key={"Ball" + (ballEvt.time)} cx={ballEvt.x}
             cy={height - ballEvt.y} r={this.ballRadius} 
             className={this.ballColors[ballEvt.ballNumber]}/>: ""}
         </svg>);
   }
}