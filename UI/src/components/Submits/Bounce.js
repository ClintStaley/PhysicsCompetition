import React, { Component } from 'react';
import { Bounce3D } from './Bounce3D';
import { BounceMovie } from './BounceMovie';
import { ButtonBar } from './ButtonBar';

import './Bounce.css'
import { Sphere } from 'three';


// Expected props are, exactly and only:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display
export class Bounce extends Component {
   constructor(props) {
      super(props);

      this.state = this.getInitialState();
   }

   // Get initial state for construction or reset
   getInitialState = () => {
      // Boolean array indicating if obstacles and/or targets are unhit
      // First portion represents targets; latter represents obstacles
      var obstacleStatus = [];

      this.props.prms.targets.forEach(() => obstacleStatus.push(true));
      this.props.prms.barriers.forEach(() => obstacleStatus.push(true));

      return { frame: 0, obstacleStatus , is2D: true};
   }

   // Any time props are updated (due to new sbm or even updated prms),
   // refresh state accordingly.  Otherwise proceed if state or props are
   // changed.
   shouldComponentUpdate(nextProps, nextState) {
      var props = this.props;

      if (props !== nextProps) {
         this.setState(this.getInitialState());
         if (!nextProps.sbm || !nextProps.sbm.testResult)
            this.stopMovie();
      }

      return props !== nextProps || this.state !== nextState;
   }

   // Stop timer when component closes, to avoid accessing parameters
   // that no longer exist
   componentWillUnmount = () => {
      this.stopMovie();
   }

   intervalID;        // Timer ID of interval timer
   frameRate = 24;    // Frames per second to display
   G = 9.80665;       // Gravity constant
   fieldLength = 10;  // Stage length in meters
   fieldHeight = 10;  // Stage height in meters
   graphLine = .5;    // Distance between graph lines in meters

   colors = ["red", "green", "orange", "purple", "cyan"];   // ball colors

   // x position is equations[0] and y position is equations[1]
   positionEquations = (event) => {
      return {
         xPos: (time) => (time * event.velocityX) + event.posX,
         yPos: (time) => (time * time * -this.G / 2)
            + (time * event.velocityY) + event.posY
      };
   }

   startMovie = (events) => {
      var frameRate = this.frameRate;
      var secondsToMiliseconds = 1000;
      var totalTime = 0;

      // Safety to preclude simultaneously running interval timers
      if (this.intervalID)
         clearInterval(this.intervalID);

      // CAS FIX would make a better forEach.  
      // Sum the duration of all events (ball arcs) to get movie end time.
      for (var idx = 0; idx < events.length; idx++) {
         totalTime += events[idx][events[idx].length - 1].time;
      }

      // Run advanceFrame() at every frame
      this.intervalID = setInterval(() => {
         this.advanceFrame(totalTime);
      }, secondsToMiliseconds / frameRate);
   }

   advanceFrame = (totalTime) => {
      var frame = this.state.frame;

      if (++frame / this.frameRate > totalTime)
         this.stopMovie();

      this.setState({ frame, obstacleStatus: this.calculateObstacles(frame) });
   }

   stopMovie = () => {
      clearInterval(this.intervalID);
   }

   calculateObstacles = (frame) => {
      var events = this.props.sbm.testResult.events;
      var time = frame / this.frameRate;
      var elapsedTime = 0;  // CAS FIX: Rename to baseTime
      var obstacleState = this.state.obstacleStatus.splice(0);

      //fill out the state array so that hit obstacles are greyed out
      events.forEach((eventArr) => {
         eventArr.forEach((event) => {
            //checks if time is greater than collision time on obstacles
            if (event.obstacleIdx !== -1
               && obstacleState[event.obstacleIdx]
               && time > event.time + elapsedTime)
               obstacleState[event.obstacleIdx] = false;
         });
         elapsedTime += eventArr[eventArr.length - 1].time;
      });

      return obstacleState;
   }

   // Build table on bottom of page showing detailed info about each hit,
   // after that hit is shown on the animation.
   getSummary = (testResult, score) => {
      var hits = [];
      var ballEvents = [];
      var eventNum = 1, ballNum = 1;
      var colors = this.colors;
      var numColors = colors.length;

      if (score) {
         testResult.events.forEach((ballArray) => {
            hits.push(<h4 key={"Ball #" + ballNum}
               className={colors[(ballNum - 1) % numColors]}>Ball # {ballNum}</h4>)

            //creates rows onb table, 4 sig figs on values
            ballArray.forEach((event) => {
               if (event.obstacleIdx !== -1 &&
                  !this.state.obstacleStatus[event.obstacleIdx])
                  ballEvents.push(
                     <tr key={"tableSummary" + eventNum++}>
                        <th>{parseFloat(event.time.toFixed(4))}</th>
                        <th>{parseFloat(event.posX.toFixed(4))}</th>
                        <th>{parseFloat(event.posY.toFixed(4))}</th>
                        <th>{parseFloat(event.velocityX.toFixed(4))}</th>
                        <th>{parseFloat(event.velocityY.toFixed(4))}</th>
                     </tr>);
            });

            hits.push(
               <table key={"Summary" + ballNum++}>
                  <tbody>
                     <tr>
                        <th>Time</th>
                        <th>X Position</th>
                        <th>Y Position</th>
                        <th>X Velocity</th>
                        <th>Y Velocity</th>
                     </tr>
                     {ballEvents}
                  </tbody>
               </table>);

            ballEvents = [];
         });
      }

      return (
         <div>
            <h4>Platforms Hit: {testResult.obstaclesHit}</h4>
            {hits}
         </div>
      )
   }

   // Retart movie.
   replay = () => {
      this.setState(this.getInitialState());
      this.startMovie(this.props.sbm.testResult.events);
   }

   render() {
      var prms = this.props.prms;
      var sbm = this.props.sbm;
      var hashClass, offs, rect, grid, obstacles;
      var summary = null;
      var dimensions =
         { fieldLength: this.fieldLength, fieldHeight: this.fieldHeight };
      var numObstacles = prms.targets.length;

      var fieldHeight = this.fieldHeight;
      var fieldLength = this.fieldLength;
      var graphOffset = this.graphLine;
      var longerSide = fieldLength > fieldHeight ? fieldLength : fieldHeight;

      // Heavy cross hatches every 10 meters, with light cross hatches between
      grid = [];
      for (offs = graphOffset; offs < longerSide; offs += graphOffset) {
         hashClass = offs % (graphOffset * 2) ===
            graphOffset ? "graph5B" : "graph10B";
         grid.push(
            <line key={"XL" + offs} x1={offs} y1="0" x2={offs} y2={fieldHeight}
               className={hashClass} />);
         grid.push(
            <line key={"YL" + offs} x1="0" y1={offs} x2={fieldLength} y2={offs}
               className={hashClass} />);
      }


      // Obstacle rectangles
      obstacles = [];

      prms.barriers && prms.barriers.forEach((rect, idx) => {
         obstacles.push(
            <rect key={"BR" + (idx)} x={rect.loX} y={fieldHeight - rect.hiY}
               width={rect.hiX - rect.loX} height={rect.hiY - rect.loY}
               className={this.state.obstacleStatus[idx + numObstacles] ? "bPlatform" :
                  "hitBPlatform"} />);

         var classLeft = (rect.hiX - rect.loX) > .8 ? "text" : "rhsText";
         var classRight = (rect.hiX - rect.loX) > .8 ? "rhsText" : "text";

         obstacles.push(
            <text key={"BUL" + idx} x={rect.loX} y={fieldHeight - rect.hiY + .13}
               className={classLeft}>{"(" + rect.loX + "," + rect.hiY + ")"}</text>);
         obstacles.push(
            <text key={"BUR" + idx} x={rect.hiX} y={fieldHeight - rect.hiY + .13}
               className={classRight}>{"(" + rect.hiX + "," + rect.hiY + ")"}</text>);
         obstacles.push(
            <text key={"BLL" + idx} x={rect.loX} y={fieldHeight - rect.loY - .05}
               className={classLeft}>{"(" + rect.loX + "," + rect.loY + ")"}</text>);
         obstacles.push(
            <text key={"BLR" + idx} x={rect.hiX} y={fieldHeight - rect.loY - .05}
               className={classRight}>{"(" + rect.hiX + "," + rect.loY + ")"}</text>);
      });

      prms.targets.forEach((rect, idx) => {
         obstacles.push(
            <rect key={"R" + idx} x={rect.loX} y={fieldHeight - rect.hiY}
               width={rect.hiX - rect.loX} height={rect.hiY - rect.loY}
               className={this.state.obstacleStatus[idx] ? "platform" :
                  "hitPlatform"} />);

         var classLeft = (rect.hiX - rect.loX) > .8 ? "text" : "rhsText";
         var classRight = (rect.hiX - rect.loX) > .8 ? "rhsText" : "text";

         var highY = rect.hiY - rect.loY > .3 ? rect.hiY :
            ((0.3 - (rect.hiY - rect.loY)) / 2) + rect.hiY;
         var lowY = rect.hiY - rect.loY > .3 ? rect.loY :
            rect.loY - ((0.3 - (rect.hiY - rect.loY)) / 2);

         obstacles.push(
            <text key={"UL" + idx} x={rect.loX} y={fieldHeight - highY + .13}
               className={classLeft}>{"(" + rect.loX + "," + rect.hiY + ")"}</text>);
         obstacles.push(
            <text key={"UR" + idx} x={rect.hiX} y={fieldHeight - highY + .13}
               className={classRight}>{"(" + rect.hiX + "," + rect.hiY + ")"}</text>);
         obstacles.push(
            <text key={"LL" + idx} x={rect.loX} y={fieldHeight - lowY - .05}
               className={classLeft}>{"(" + rect.loX + "," + rect.loY + ")"}</text>);
         obstacles.push(
            <text key={"LR" + idx} x={rect.hiX} y={fieldHeight - lowY - .05}
               className={classRight}>{"(" + rect.hiX + "," + rect.loY + ")"}</text>);
      });

      if (sbm && sbm.testResult && sbm.score)
         summary = this.getSummary(sbm.testResult, sbm.score);

      var readyRun = !sbm || !sbm.testResult;

      return (<section className="container">
         <h2>Problem Diagram</h2>

            <button onClick={()=>{this.setState({is2D:!this.state.is2D})}}>switch view</button>

            {this.state.is2D ? <div>
               <ButtonBar 
                  play={() => this.startMovie(sbm.testResult.events)} 
                  replay={() => this.replay()} 
                  pause={() => this.stopMovie()} 
               />

               <svg viewBox={"-.1 -.1 " + (fieldLength + .1) + " " + (fieldHeight + .1)}
                  width="100%" className="panel">
                  <rect x="0" y="0" width={fieldLength} height={fieldHeight}
                     className="graphBkg" />
                  {grid}
                  {obstacles}

                  {sbm && sbm.testResult ?
                     <g>
                        <BallManager frameRate={this.frameRate}
                           frame={this.state.frame}
                           events={sbm.testResult.events}
                           positionEquations={this.positionEquations}
                           colors={this.colors}
                           dimensions={dimensions} />

                        <TrackManager
                           frameRate={this.frameRate}
                           frame={this.state.frame}
                           events={sbm.testResult.events}
                           positionEquations={this.positionEquations}
                           colors={this.colors}
                           dimensions={dimensions} />
                     </g>
                     : ''}
               </svg>
               </div> : 
                  <Bounce3D movie={new BounceMovie(60, prms, sbm)}/>
            }
            
         {summary}
      </section>);
   }
}

// Keep track of the ball; draw the ball with the correct color
class BallManager extends Component {
   render() {
      var props = this.props;
      var ballNum = -1;
      var events = props.events;
      var fieldHeight = props.dimensions.fieldHeight;

      var event = events[0][0];
      var nextEvent = events[0][0];
      var timeElapsed = 0;

      var currentTime = props.frame / props.frameRate;

      for (var idxA = 0; idxA < events.length; idxA++) {
         ballNum++;

         for (var idxB = 0; idxB < events[idxA].length; idxB++) {
            nextEvent = events[idxA][idxB];
            if (nextEvent.time + timeElapsed > currentTime) {
               break;
            }
            event = nextEvent;
         }
         if (nextEvent.time + timeElapsed > currentTime) {
            break;
         }
         //makes sure there is another ball
         if (events[idxA + 1])
            timeElapsed += nextEvent.time;
      }

      var equations = props.positionEquations(event);

      return (<circle key={"crc"}
         cx={equations.xPos(currentTime - timeElapsed - event.time)}
         cy={fieldHeight - equations.yPos(currentTime - timeElapsed - event.time)}
         r={.1}
         className={'ball ' + props.colors[ballNum % 5]} />);
   }
}

// Show all tracks taken by all balls thus far
class TrackManager extends Component {
   render() {
      var props = this.props;
      var ballTracks = [];
      var elapsedTime = 0;

      // Push all arcs
      for (var trackNum = 0; trackNum < props.events.length; trackNum++) {
         ballTracks.push(
            <BallTrack key={"BallTrack" + trackNum}
               startTime={elapsedTime}
               frameRate={props.frameRate}
               currentTime={props.frame / props.frameRate}
               color={this.props.colors[trackNum % 5]}
               positionEquations={this.props.positionEquations}
               events={this.props.events[trackNum]}
               dimensions={this.props.dimensions} />);

         elapsedTime += this.props
            .events[trackNum][this.props.events[trackNum].length - 1].time;
      }
      return (<g> {ballTracks} </g>);
   }
}

// Show path one ball takes along its life
class BallTrack extends Component {

   shouldComponentUpdate(nextProps, nextState) {
      var props = this.props;

      //need to re-render, the ball has been reset
      if (nextProps.currentTime < props.currentTime &&
         props.startTime > props.currentTime)
         return true;

      //returns true iff current time is between event start time and end time
      return (nextProps.currentTime >= props.startTime) ||
         (props.currentTime <= props.events[props.events.length - 1].time
            + props.startTime);
   }

   render() {
      var props = this.props;
      var ballTrack = [];

      //push all arcs
      for (var eventNum = 0; eventNum < props.events.length - 1; eventNum++) {
         ballTrack.push(
            <BallArc key={"BallArc" + eventNum}
               startTime={props.startTime}
               endTime={props.events[eventNum + 1].time}
               frameRate={props.frameRate}
               currentTime={props.currentTime}
               color={props.color}
               positionEquations={this.props.positionEquations}
               event={props.events[eventNum]}
               dimensions={props.dimensions} />);
      }

      return (<g> {ballTrack} </g>);
   }
}

//one arc of a balls path
class BallArc extends Component {
   shouldComponentUpdate(nextProps, nextState) {
      var props = this.props;

      //need to re-render, the ball has been reset
      if (nextProps.currentTime < props.currentTime &&
         props.startTime + props.event.time > props.currentTime)
         return true;

      //returns true iff current time is after arc start,
      //and before arc end time
      return (nextProps.currentTime >= props.startTime + props.event.time) ||
         (props.currentTime <= props.endTime + props.startTime);
   }

   render() {
      var ballArc = [];
      var props = this.props;
      var event = props.event;
      var color = props.color;
      var fieldHeight = props.dimensions.fieldHeight;

      var equations = props.positionEquations(props.event);

      //the current time is before the start
      if (event.time + props.startTime >= props.currentTime)
         color += " invisible";

      //push the initial collision, not first event
      if (event.time !== 0.0)
         ballArc.push(<circle key={"ArcStart" + event.time}
            cx={equations.xPos(0)}
            cy={fieldHeight - equations.yPos(0)}
            r={.1}
            className={"ball faded " + color} />);

      var startTime =
         (Math.ceil(event.time * props.frameRate) / props.frameRate);

      for (var timer = startTime - event.time;
         timer < props.endTime - event.time; timer += 1.0 / props.frameRate) {
         color = props.color;

         if (props.startTime + startTime + timer >= props.currentTime)
            color += " invisible";

         ballArc.push(<circle key={"ArcPoint" + (timer + props.startTime)}
            cx={equations.xPos(timer)}
            cy={fieldHeight - equations.yPos(timer)}
            r={.02}
            className={color} />);
      }

      return (
         <g>
            {ballArc}
         </g>
      );
   }
}
