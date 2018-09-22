
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

      this.state = {
         sbmConfirm: null, // Function to post current submission
         ballPos: null
      };
   }

   intervalID = 0;      // Timer ID of interval timer
   frameRate = 24;  // Frames per second to display
   frame = 0;
   G = 9.80665;

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

     this.intervalID = setInterval( () => this.playEvents(events) , 1000/frameRate);


      /*setTimeout(function() {
         clearInterval(this.intervalID);
      }, 1000);//(nextEvent.time * 1000));*/
   }

   //array of arrays
   playEvents = (events) => {
     var ballLocation = {};
     var time = this.frame/this.frameRate;
     var returnValue = this.getEvent(events, time);

     if (returnValue === null){
        console.log("ending at time " + time);
        clearInterval(this.intervalID);
      }
     else{
        var event = returnValue.event;
        var timeElapsed = returnValue.timeElapsed;

        var equations = this.positionEquations(event);

        ballLocation.posX = equations.xPos(time - event.time - timeElapsed );
        ballLocation.posY = equations.yPos(time - event.time - timeElapsed);

        if ((time - event.time - timeElapsed ) < 0)
           console.log("X is: " +  ballLocation.posX + " Y is: " +  ballLocation.posY + " time is: " + (time - event.time - timeElapsed ));

        this.frame++;

        this.drawBall(ballLocation);
     }
   }


   getEvent = (events, time) => {
     var event = events[0][0];
     var prevEvent = events[0][0];
     var timeElapsed = 0;

     for (var idxA = 0; idxA < events.length; idxA++) {
        for (var idxB = 0; idxB < events[idxA].length; idxB++) {
          prevEvent = event;
          event = events[idxA][idxB];
          if (time <= event.time) {
             console.log("Ball #: " + idxA);
             return {event: prevEvent, timeElapsed: timeElapsed};
          }
        }
        timeElapsed += event.time;
        time -= event.time;
      }
      return null;
   }

   drawBall = (event) => {
     var props = this.props;

     this.setState({ ballPos :  Object.assign( {}, event )});
   }

   getSummary = (testResult) => {
     var hits = [];
     var ballEvents = [];
     var eventNum = 1, ballNum = 1;

     testResult.events.forEach((ballArray) => {
        hits.push(<h4 key={"Ball #" + ballNum}>Ball # {ballNum}</h4>)

        ballArray.forEach((event) => {
           if (event.obstacleIdx !== -1)
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

   render() {
      var prms = this.props.prms;
      var sbm = this.props.sbm;
      var hashClass, offs, rect, grid, obstacles;
      var tr, timeStr, dateStr, circle, sbmTime, summary = null;

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
          className="obstacle"/>);

         obstacles.push(<text key={"UL"+idx} x={rect.loX} y={100-rect.hiY+2}
          className="text">{"(" + rect.loX + "," + rect.hiY + ")"}</text>);
         obstacles.push(<text key={"UR"+idx} x={rect.hiX} y={100-rect.hiY+2}
          className="rhsText">{"(" + rect.hiX + "," + rect.hiY + ")"}</text>);
         obstacles.push(<text key={"LL"+idx} x={rect.loX} y={100-rect.loY}
          className="text">{"(" + rect.loX + "," + rect.loY + ")"}</text>);
         obstacles.push(<text key={"LR"+idx} x={rect.hiX} y={100-rect.loY}
          className="rhsText">{"(" + rect.hiX + "," + rect.loY + ")"}</text>);
      });

      if (sbm.testResult)
         summary = this.getSummary(sbm.testResult);


      return (<section className="container">
         <h2>Problem Diagram</h2>
         <Button className="pull-right" onClick={() => {
           this.frame = 0;
           this.startMovie(sbm.testResult.events)
         }}>
           Replay
        </Button>
         <Button className="pull-right" onClick={() => clearInterval(this.intervalID)}>Pause</Button>
         <Button className="pull-right" onClick={() => this.startMovie(sbm.testResult.events)}>Play</Button>
         <svg viewBox="-1 -1 101 101" width="100%" className="panel">
            <rect x="0" y="0" width="100" height="100" className="graphBkg"/>
            {grid}
            {obstacles}
            {this.state.ballPos ?
            <circle key={"crc"} cx={this.state.ballPos.posX}
            cy={100-this.state.ballPos.posY} r = {1} className="ball"/>
            : '' }
         </svg>
         {summary}
      </section>);
   }


}
