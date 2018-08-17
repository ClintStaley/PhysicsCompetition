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
		  }
   }

   intervalID;
   frameRate = 24;
   frame = 0;

   //xposition is equations[0] and y position is equations[1]
   positionEquations = (event) => {
     var equations = [];

     equations.push((time) => {
       return time * event.velocityX + event.posX;
     });

     equations.push((time) => {
       return time * time * -4.9 + time * event.velocityY + event.posY
     });

     return equations;
   }

   playEvent = (event, nextEvent) => {
      var ballLocation = {};
      var equations = this.positionEquations(event);
      var drawBall = this.drawBall;
      var frameRate = this.frameRate;
      var frame = this.frame;

      if (this.intervalID)
        clearInterval(this.intervalID);

       this.intervalID = setInterval(function() {
         ballLocation.posX = equations[0]((frameRate * frame)/1000);
         ballLocation.posY = equations[1]((frameRate * frame)/1000);
         frame++;

         drawBall(ballLocation);
      }, 1000 * (frame/frameRate));
      setTimeout(function() {
         clearInterval(this.intervalID);
      }, 10000);//(nextEvent.time * 1000));
   }

   drawBall = (event) => {
     var props = this.props;

     console.log(event);

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
         <Button className="pull-right">Replay</Button>
         <Button className="pull-right" onClick={() => clearInterval(this.intervalID)}>Pause</Button>
         <Button className="pull-right" onClick={() => this.playEvent(sbm.testResult.events[0][0])}>Play</Button>
         <svg viewBox="-1 -1 101 101" width="100%" className="panel">
            <rect x="0" y="0" width="100" height="100" className="graphBkg"/>
            {grid}
            {obstacles}
            {this.state.ballPos ?
            <circle key={"crc"} cx={this.state.ballPos.posX}
            cy={100-this.state.ballPos.posY} r = {5} className="ball"/>
            : '' }
         </svg>
         {summary}
      </section>);
   }


}
