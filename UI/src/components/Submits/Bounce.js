
import React, { Component } from 'react';
import {FormGroup, FormControl, ControlLabel, Button, Modal }
  from 'react-bootstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import './Bounce.css'

export class BSubmitModal extends Component {
  constructor(props) {
     super(props);

     var idx, balls = [];

     balls.push({speed: 0})

     this.state = {balls};

     this.handleChange = this.handleChange.bind(this);
  }

  handleChange(ev) {
    var bIdx, field, val;

    [field, bIdx] = ev.target.id.split(":");

    var balls = this.state.balls.splice(0);
    balls[bIdx].speed = ev.target.value;

     this.setState({balls: balls});
  }

  getValidationState = () => {

     for (var idx = 0; idx < this.state.balls.length; idx++) {
        if (this.getSingleValidationState(idx) != "success")
           return "error";
     }

     return "success";
  }

  getSingleValidationState = (idx) => {
     var ball = this.state.balls[idx];
     console.log(this.state.balls);
     console.log(idx);
     var val = Number.parseFloat(ball.speed);

     if (isNaN(val) || val < 0)
        return "error";

     return "success";
  }

  addBall = () => {
    var balls = this.state.balls.splice(0);

    balls.push({speed: 0});

    this.setState({balls: balls});
  }

  removeBall = () => {
    var balls = this.state.balls.splice(0);

    balls.pop();

    this.setState({balls: balls});
  }

  close = (status) => {
     if (status === 'OK') {
        this.props.submitFn(this.state.balls.map(ball =>
         ({
            speed: Number.parseFloat(ball.speed)
         })));
     }
     else
        this.props.submitFn(null);
  }

  render() {
     var idS, idx, lines = [];

     console.log(this.state.balls);

     for (idx = 0; idx < this.state.balls.length; idx++) {
        idS = `speed:${idx}`;

        lines.push(<div className="container" key={idx}>
          <div className="row">
            <div className="col-sm-2"><h5>Ball {idx}</h5></div>

            <div className="col-sm-4">
              <FormGroup controlId={idS}
              validationState={this.getSingleValidationState(idx)}>
                <ControlLabel>Speed</ControlLabel>
                <FormControl
                  type="text"
                  id={idS}
                  value={this.state.balls[idx].speed}
                  required={true}
                  onChange={this.handleChange}
                />
                <FormControl.Feedback/>
              </FormGroup>
            </div>
          </div>
        </div>)
     }

     return (
     <Modal show={this.props.submitFn !== null}
         onHide={()=>this.close("Cancel")} bsSize="lg">
       <Modal.Header closeButton>
         <Modal.Title>Submit Bounce Solution</Modal.Title>
       </Modal.Header>



       <Modal.Body><form>{lines}</form></Modal.Body>



       <Modal.Footer>
         <Button key={0} onClick={() => {this.addBall()}}>Add Ball</Button>
         <Button key={1} disabled = {this.state.balls.length === 1}
             onClick={() => {this.removeBall()}}>Remove Ball</Button>

         <Button key={2}  disabled = {this.getValidationState() !== "success"}
             onClick={() => this.close('OK')}>OK</Button>
         <Button key={3} onClick={() => this.close('Cancel')}>Cancel</Button>
       </Modal.Footer>
     </Modal>)
  }
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

   playSingleEvent = (event, color, timeElapsed, nextEvent, events) => {
     var time = this.frame/this.frameRate;
     var newState = {};
     var ballState = {};
     var frameRate = this.frameRate;
     var colors = this.colors;
     var nextEventInfo = null;

     if (nextEvent == null){
       ballState.posX = event.posX;
       ballState.posY = event.posY;
       ballState.color = color;

       newState.ballPos = ballState;

       this.setState(newState)
       clearInterval(this.intervalID);
     }
     else{

       if (event.obstacleIdx != -1 &&
        this.state.obstacleStatus[event.obstacleIdx]) {
          this.state.obstacleStatus[event.obstacleIdx] = false;
          this.setState({obstacleStatus: this.state.obstacleStatus.splice(0)});
       }

       if ((time - (timeElapsed - event.time)) + 1/frameRate > nextEvent.time){
          clearInterval(this.intervalID);

          if (nextEvent != null){
            nextEventInfo = this.getNextEvent(events, nextEvent);

            setTimeout(() => {
               this.intervalID = setInterval( () => {
                  this.playSingleEvent(nextEvent,
                   this.colors[nextEventInfo.ballNum % 5],
                   nextEventInfo.timeElapsed,
                   nextEventInfo.nextEvent, events);
               }, 1000/frameRate);
             }, (nextEvent.time - time) * 1000);
           }
        }
       else{
          var equations = this.positionEquations(event);

          console.log(event);

          ballState.posX = equations.xPos(time - timeElapsed);
          ballState.posY = equations.yPos(time - timeElapsed);
          ballState.color = color;

          this.frame++;

          newState.ballPath = this.state.ballPath.splice(0);
          newState.ballPath.push(ballState);

          newState.ballPos = ballState;

          this.setState(newState)
       }
     }
   }


   getNextEvent = (events, currentEvent) => {
     var event = events[0][0];
     var nextEvent = null;
     var timeElapsed = 0;

     for (var idxA = 0; idxA < events.length; idxA++) {
        for (var idxB = 0; idxB < events[idxA].length; idxB++) {
          event = events[idxA][idxB];
          if (currentEvent === event) {
            //get next object
             if (idxB < events[idxA].length - 1)
                nextEvent = events[idxA][idxB + 1];
             else if(idxA < events.length - 1){
               timeElapsed += event.time;
               nextEvent = events[++idxA][0];
             }

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


class ballArc extends Component {
  constructor(props) {
     super(props);

     this.ballArc = [];

     var equations = this.positionEquations(props.event);

     //push the initial collision
     this.ballArc.push(<circle key={"ballArc" + key} 
     cx={equations.xPos(0)}
     cy={100 - equations.yPos(0)}
     r = {.2}
     className={props.color + " invisible"}/>)

     //push all other collisions
     for (var timer = props.startTime; timer < props.endTime; timer += 1.0/props.frameRate ){
        this.ballArc.push(<circle key={"ballArc" + key}
        cx={equations.xPos(timer)}
        cy={100 - equations.yPos(timer)}
        r = {.2}
        className={props.color + " invisible"}/>)
     }
  }

  ballArc;

  // x position is equations.xPos and y position is equations.yPos
  positionEquations = (event) => {
    var equations = {};

    equations.xPos = ((time) =>
      (time * event.velocityX) + event.posX);

    equations.yPos = ((time) =>
       (time * time * -this.G / 2) + (time * event.velocityY) + event.posY
    );

    return equations;
  }

  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
