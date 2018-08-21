
import React, { Component } from 'react';
import {FormGroup, FormControl, ControlLabel, Button, Modal }
  from 'react-bootstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import './Bounce.css'

export class BSubmitModal extends Component {

}

// Expected props are:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display
export class Bounce extends Component {
   constructor(props) {
      super(props);

      console.log(props);

      var obstacleStatus = [];

      props.prms.obstacles.forEach(() => obstacleStatus.push(true));

      this.state = {
         sbmConfirm: null, // Function to post current submission
         ballPos: null,
         obstacleStatus: obstacleStatus,
         ballPath: []
      }
   }

   intervalID;      // Timer ID of interval timer
   frameRate = 24;  // Frames per second to display
   frame = 0;
   G = 9.80665;
   colors = ["red", "green", "orange", "purple", "cyan"];

   // x position is equations[0] and y position is equations[1]
   positionEquations = (event) => {
     var equations = {};

     equations.xPos = ((time) =>
       (time * event.velocityX) + event.posX);

     equations.yPos = ((time) =>
        (time * time * -this.G / 2) + (time * event.velocityY) + event.posY
     );

     return equations;
   }

   startMovie = (events) => {
      var frameRate = this.frameRate;

      if (this.intervalID)
        clearInterval(this.intervalID);

      this.intervalID = setInterval( () => {
        this.playSingleEvent(events[0][0], "red", 0, events[0][1], events);
      }, 1000/frameRate);
   }

   //array of arrays
   /*playEvent = (events) => {
     var ballState = {};
     var time = this.frame/this.frameRate;
     var returnValue = this.getEvent(events, time);
     var newState = {};

     if (returnValue === null){
        ballState.posX = -2;
        ballState.posY = -2;
        ballState.color = this.colors[0];

        this.updateState(ballState, newState);

        console.log("ending at time " + time);
        clearInterval(this.intervalID);
      }
     else{
        var event = returnValue.event;
        var timeElapsed = returnValue.timeElapsed;
        var obstaclesHit = returnValue.obstaclesHit;

        var equations = this.positionEquations(event);

        ballState.posX = equations.xPos(time - event.time - timeElapsed);
        ballState.posY = equations.yPos(time - event.time - timeElapsed);
        ballState.color = this.colors[returnValue.ballNum % this.colors.length];

        if ((time - event.time - timeElapsed ) < 0)
           console.log("X is: " +  ballState.posX + " Y is: " +  ballState.posY + " time is: " + (time - event.time - timeElapsed ));

        this.frame++;

        this.state.ballPath.push(ballState);
        newState.ballPath = this.state.ballPath.splice(0);

        //makes obstacles disappear
        if (event.obstacleIdx != -1 && this.state.obstacleStatus[event.obstacleIdx]){
           this.state.obstacleStatus[event.obstacleIdx] = false;
           newState.obstacleStatus =  this.state.obstacleStatus.splice(0);
         }

        this.updateState(ballState, newState);
     }
   }*/

   playSingleEvent = (event, color, timeElapsed, nextEvent, events) => {
     var time = this.frame/this.frameRate;
     var newState = {};
     var ballState = {};
     var frameRate = this.frameRate;
     var colors = this.colors;
     var nextEventInfo = null;

     console.log("single event");

     if (event.obstacleIdx != -1 &&
      this.state.obstacleStatus[event.obstacleIdx]) {
        this.state.obstacleStatus[event.obstacleIdx] = false;
        newState.obstacleStatus =  this.state.obstacleStatus.splice(0);
     }

     if (time + 1/frameRate > nextEvent.time){
        clearInterval(this.intervalID);

        if (nextEvent != null){
          nextEventInfo = this.getNextEvent(events, nextEvent);

          console.log(nextEvent);

          setTimeout(() => {
             this.intervalID = setInterval( () => {
                this.playSingleEvent(this.nextEvent,
                  this.colors[nextEventInfo.ballNum % 5], nextEventInfo.timeElapsed,
                 nextEventInfo.nextEvent, this.events);
             }, 1000/frameRate);
           }, (nextEvent.time - time) * 1000);
         }
      }
     else{
        var equations = this.positionEquations(event);

        ballState.posX = equations.xPos(time - timeElapsed);
        ballState.posY = equations.yPos(time - timeElapsed);
        ballState.color = color;

        if ((time - timeElapsed ) < 0)
           console.log("X is: " +  ballState.posX + " Y is: " +  ballState.posY + " time is: " + (time - event.time - timeElapsed ));

        this.frame++;

        newState.ballPath = this.state.ballPath.splice(0);
        newState.ballPath.push(ballState);

        newState.ballPos = ballState;

        this.setState(newState)
     }
   }


   getNextEvent = (events, currentEvent) => {
     var event = events[0][0];
     var nextEvent = null;
     var timeElapsed = 0;

     for (var idxA = 0; idxA < events.length; idxA++) {
        for (var idxB = 0; idxB < events[idxA].length; idxB++) {
          event = events[idxA][idxB];
          if (currentEvent.time === event.time) {
            //get next object
             if (idxB < events[idxA].length - 1)
                nextEvent = events[idxA][idxB + 1];
             else if(idxA < events.length - 1)
                nextEvent = events[++idxA][idxB];

             return {timeElapsed: (timeElapsed + event.time), ballNum: idxA, nextEvent: nextEvent};
          }
        }
        timeElapsed += event.time;
      }
      return null;
   }

   getSummary = (testResult) => {
     var hits = [];
     var ballEvents = [];
     var eventNum = 1, ballNum = 1;

     testResult.events.forEach((ballArray) => {
        hits.push(<h4 key={"Ball #" + ballNum}
        className={this.colors[ballNum - 1 % 5]}>Ball # {ballNum}</h4>)

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
              </tr>)
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

     return (
       <div>
          <h4>Platforms Hit: {testResult.obstaclesHit}</h4>
          {hits}
       </div>
     )
   }

   replay = () => {
     this.frame = 0;
     this.startMovie(this.props.sbm.testResult.events);

     var obstacleStatus = [];
     this.props.prms.obstacles.forEach(() => obstacleStatus.push(true));
     this.setState({ obstacleStatus : obstacleStatus });

     this.setState({ ballPath : [] });
   }

   render() {
      var prms = this.props.prms;
      var sbm = this.props.sbm;
      var hashClass, offs, rect, grid, obstacles;
      var tr, timeStr, dateStr, circle, sbmTime, summary = null;
      var ballPath;

      // Heavy cross hatches every 10, with light cross hatches between
      grid = [];
      for (offs = 5; offs < 100; offs += 5) {
         hashClass = offs % 10 === 5 ? "graph5" : "graph10";
         grid.push(<line key={"XL" + offs} x1={offs} y1="0" x2={offs} y2="100"
          className={hashClass}/>);
         grid.push(<line key={"YL" + offs} x1="0" y1={offs} x2="100" y2={offs}
          className={hashClass}/>);
      }

      // Obstacle rectangles
      obstacles = [];
      prms.obstacles.forEach((rect, idx) => {
         obstacles.push(<rect key={"R"+idx} x={rect.loX} y={100-rect.hiY}
          width={rect.hiX - rect.loX} height={rect.hiY - rect.loY}
          className= {this.state.obstacleStatus[idx] ? "platform" : "hitPlatform"}/>);

         obstacles.push(<text key={"UL"+idx} x={rect.loX} y={100-rect.hiY+2}
          className="text">{"(" + rect.loX + "," + rect.hiY + ")"}</text>);
         obstacles.push(<text key={"UR"+idx} x={rect.hiX} y={100-rect.hiY+2}
          className="rhsText">{"(" + rect.hiX + "," + rect.hiY + ")"}</text>);
         obstacles.push(<text key={"LL"+idx} x={rect.loX} y={100-rect.loY}
          className="text">{"(" + rect.loX + "," + rect.loY + ")"}</text>);
         obstacles.push(<text key={"LR"+idx} x={rect.hiX} y={100-rect.loY}
          className="rhsText">{"(" + rect.hiX + "," + rect.loY + ")"}</text>);

      });

      ballPath = [];
      this.state.ballPath.forEach((point, key) => {
         ballPath.push(<circle key={"crc" + key} cx={point.posX}
         cy={100-point.posY} r = {.2} className={point.color}/>);
      });

      if (sbm.testResult)
         summary = this.getSummary(sbm.testResult);


      return (<section className="container">
         <h2>Problem Diagram</h2>
         <Button className="pull-right" onClick={() => this.replay()}>Replay</Button>
         <Button className="pull-right" onClick={() => clearInterval(this.intervalID)}>Pause</Button>
         <Button className="pull-right" onClick={() => this.startMovie(sbm.testResult.events)}>Play</Button>
         <svg viewBox="-1 -1 101 101" width="100%" className="panel">
            <rect x="0" y="0" width="100" height="100" className="graphBkg"/>
            {grid}
            {obstacles}
            {ballPath}
            {this.state.ballPos ?
            <circle key={"crc"} cx={this.state.ballPos.posX}
            cy={100-this.state.ballPos.posY} r = {1}
            className={'ball ' + this.state.ballPos.color}/>
            : '' }
         </svg>
         {summary}
      </section>);
   }


}
