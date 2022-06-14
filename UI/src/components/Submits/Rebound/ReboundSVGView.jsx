import React, { Component } from 'react';
import {ReboundMovie} from './ReboundMovie';
import {SVGUtil} from '../SVGUtil';
import styles from './ReboundSVGView.module.css';

// General SVG animation design notes:
//
// 1. Create one or more fixed background SVG fixtures, e.g. a graph or 
// playing area.  This is state data since it must be redone if the movie
// changes. Set this and other offset-independent data in getInitState.
//
// 2. Create one or more moving SVG fixtures, e.g. bouncing ball, changing
// circle, etc. Also state data.  Create initial version in getInitState and
// incrementally adjust as movie offset evolves forward or backward.
//
// 3. In render, combine fixed and moving features, possibly with one or 
// more parent <g> tags to adjust their offsets for convenience,  Ultimately
// return an <svg> tag with fixed and moving children.

export class ReboundSVGView extends React.Component {
   static ballRadius = .08;     // Radius of ball
   
   // Props are: {
   //    movie: movie to display
   //    offset: time offset from movie start in sec
   // }
   constructor(props) {
      super(props);

      this.state = ReboundSVGView.setOffset(
       ReboundSVGView.getInitState(props.movie), props.offset);
   }

   // Return a single <g> element comprising the label "Choices:" and a series
   // of balls with weights written on them.
   static getBallChoices(movie, styles) {
      const br = ReboundSVGView.ballRadius;
      var ballChoices = movie.background.ballChoices;
      var xOff = 0;
      var svgElms = [];

      svgElms.push(<text key="ballExpl" x={xOff} y={2*br}
       className={styles.text}>{`Choose 1 to ${ballChoices.maxBalls} balls:`}
       </text>);

      ballChoices.forEach((bc, idx) => {
         var style = styles.ball;

         if (!bc.used)
            style += " " + styles.faded;

         svgElms.push(<circle key={`chc${idx}`}
          cx={(15 + 2.2*idx)*br} cy={1.5*br} r={br} className={style}/>);
         svgElms.push(<text key={"cLbl"+idx} className={styles.label}
          x={(15 + 2.2*idx)*br} y={2*br}>{bc.weight}</text>);
      });

      return <g key="BC">{svgElms}</g>;
   }

   static getBorderedBlock(key, brd, x, y, width, height) {
      return <g key={key+"BBlk"}>
         <rect key={key+"out"} className={styles.outerBlock} 
          x={x} y={y} width={width} height={height}/>
         <rect key={key+"in"} className={styles.innerBlock} 
          x={x+brd} y={y+brd} width={width-2*brd} height={height-2*brd}/>
      </g>
   }

   // Return a single <g> element comprising the playing area, including a graph
   // background and blocked areas above/below the chutes.  Origin is at topleft
   // of the graph.
   static getPlayArea(movie, styles) {
      var br = ReboundSVGView.ballRadius;
      var bkg = movie.background;
      var svgElms = [
         SVGUtil.getGraphGrid(bkg.height, bkg.width, styles, 
          {bigGap: 1, smallDiv: 10, origin: {x:0, y:1.5}}),

         ReboundSVGView.getBorderedBlock("SWBlock", br/2,
          0, bkg.height-bkg.chuteHeight,
          bkg.chuteWidth, bkg.chuteHeight),
 
         ReboundSVGView.getBorderedBlock("SEBlock", br/2,
          bkg.width-bkg.chuteWidth, bkg.height-bkg.chuteHeight,
          bkg.chuteWidth, bkg.chuteHeight),

          ReboundSVGView.getBorderedBlock("NEBlock", br/2,
          bkg.width-bkg.chuteWidth, 0,
          bkg.chuteWidth, bkg.height-bkg.chuteHeight-2*br),

          ReboundSVGView.getBorderedBlock("NWBlock", br/2,
          0, 0, 
          bkg.chuteWidth, bkg.height-bkg.chuteHeight-2*br)
      ];

      return <g key="PA">{svgElms}</g>;
   }

   // Return initial state based on |movie|, including fixed ball-choice and
   // playing area, gate open/close, and current event index and animated/moving
   // svg data.
   static getInitState(movie){
      var bkg = movie.background;
      var br = ReboundSVGView.ballRadius;
      var gates = [
         <rect key="gate0" className={styles.gate}          // Closed gate
          x={bkg.chuteWidth} y = {bkg.height-bkg.chuteHeight-3*br}
          width={br/10} height={4*br}/>,
         <rect key="gate1" className={styles.gate}          // Open gate
          x={bkg.chuteWidth} y = {bkg.height-bkg.chuteHeight-6*br}
          width={br/10} height={4*br}/>
      ];

      return {
         movie,                // Current movie
         svgBallChoices: ReboundSVGView.getBallChoices(movie, styles),
         svgPlayArea: ReboundSVGView.getPlayArea(movie,styles),
         
         gates,                // Gate choices

         evtIdx: -1,           // Index of last event shown in svgMoving
         svgMoving: [gates[0]] // First SVG element is always gate.
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

   // Return updated version of |svgMoving| array based on cBallPosition |evt|
   // Translate |evt| y-coordinates using |yTop| as y=0 in SVG space.
   static setNewPos(evt, yTop, svgMoving, labels) {
      const br = ReboundSVGView.ballRadius;

      return svgMoving.slice(0,1).concat(           // Keep gate; replace balls
         evt.pos.map((pos, idx) => (
            <g key={"bll"+idx}>
               <circle key={"crc"+idx} className={styles.ball}
                r={br} cx={pos.x} cy={yTop - pos.y}/>
               <text key={"lbl"+idx} className={styles.label}
                x={pos.x} y={yTop - pos.y + br/2}  >
                  {labels[idx]}
               </text>
            </g>
         ))
      );
   }

   // Advance/retract |state| so that svgElms reflects all and only those events
   // in |movie| with time <= |timeStamp|.  Assume existing |state| was built
   // from |movie| so incremental change is appropriate.  Return adjusted state.
   static setOffset(state, timeStamp) {
      let {movie, evtIdx, gates, svgMoving} = state;
      let evts = movie.evts;
      let labels = movie.background.labels;
      let yTop = movie.background.height;
      let evt, searchIdx;
      let lastPos = null, lastGate = null;

      // While the event after evtIdx exists and needs consideration
      while (evtIdx+1 < evts.length && evts[evtIdx+1].time <= timeStamp) {
         evt = evts[++evtIdx];
         if (evt.type === ReboundMovie.cBallPosition)
            lastPos = evt;
         else if (evt.type === ReboundMovie.cGateOpen
          || evt.type === ReboundMovie.cGateClose) 
            lastGate = evt;
      }
      
      // Implement only the most recent ball position or gate event.
      if (lastPos)
         svgMoving = ReboundSVGView.setNewPos(lastPos, yTop, svgMoving, labels);
      if (lastGate)
         svgMoving[0] = gates[lastGate.type === ReboundMovie.cGateClose ? 0 : 1];

      // If going backwards in time
      if (timeStamp < evts[evtIdx].time) { 

         // wind back to event just before or at timeStamp
         while (evtIdx > 0 && timeStamp < evts[evtIdx].time)
            evtIdx--;

         // Find most recent event that sets ball positions, and implement it.
         // The cBallPosition at time -.01 guarantees existence.
         for (searchIdx = evtIdx; searchIdx >= 0 
          && evts[searchIdx].type !== ReboundMovie.cBallPosition; searchIdx--)
            ;

         svgMoving = ReboundSVGView.setNewPos
          (evts[searchIdx], yTop, svgMoving, labels);
      
         // Find most recent event that sets the gate, and implement it.  The
         // cGateClose at -.01 guarantees existence.
         for (searchIdx = evtIdx; searchIdx >= 0 
          && evts[searchIdx].type !== ReboundMovie.cGateOpen
          && evts[searchIdx].type !== ReboundMovie.cGateClose;
            searchIdx--)
               ;
         svgMoving[0] = gates[
          evts[searchIdx].type === ReboundMovie.cGateClose ? 0 : 1]
      }

      return {...state, evtIdx, svgMoving};
   }

   render() {
      const br = ReboundSVGView.ballRadius;
      let width = this.state.movie.background.width;
      let height = this.state.movie.background.height;

      return  ( 
         <svg viewBox={`-.1 -.1 ${width + .1} ${3*br + height + .1}`}
          width="100%" className="panel">
            {this.state.svgBallChoices}
            <g key="PA" transform={`translate(0 ${3*br})`}>
               {this.state.svgPlayArea}
               {this.state.svgMoving}
            </g>
         </svg>);
   }
}