
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
         obstacleStatus: obstacleStatus,
         frame: 0
      }
   }

   intervalID;      // Timer ID of interval timer
   frameRate = 24;  // Frames per second to display
   G = 9.80665;
   colors = ["red", "green", "orange", "purple", "cyan"];

   // x position is equations[0] and y position is equations[1]
   positionEquations = (event) => {
     var GRAVITY = 9.80665;

     var equations = {};

     equations.xPos = ((time) =>
       (time * event.velocityX) + event.posX);

     equations.yPos = ((time) =>
        (time * time * -GRAVITY / 2) + (time * event.velocityY) + event.posY
     );

     return equations;
   }

   startMovie = (events) => {
      var frameRate = this.frameRate;

      //saftey so that two seperate intevals are running
      if (this.intervalID)
        clearInterval(this.intervalID);

      this.intervalID = setInterval( () => {
        this.playBall();
      }, 1000/frameRate);
   }

   playBall = () => {
     var frame = this.state.frame;
     var events = this.props.sbm.testResult.events;
     var totalTime = 0;
     var newState = {};

     for (var idx = 0; idx < events.length; idx++) {
        totalTime += events[idx][events[idx].length - 1].time;
     }

     if (++frame / this.frameRate > totalTime)
        clearInterval(this.intervalID);

     newState.frame = frame;

     //newState.obstacleStatus = this.calculateObstacles(frame);

     this.setState(newState);
   }

   calculateObstacles = (frame) => {
     var events = this.props.sbm.testResult.events;
     var time = frame/this.frameRate;

     events.forEach((eventArr) => {
       eventArr.forEach((event) => {
         //if (time > )
       })
     });
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

     this.setState({ frame : 0, obstacleStatus : obstacleStatus });
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

            <BallManager frameRate = {this.frameRate}
            frame = {this.state.frame}
            events = {sbm.testResult.events}
            positionEquations = {this.positionEquations}
            colors = {this.colors}/>

            <TrackManager
            frameRate = {this.frameRate}
            frame = {this.state.frame}
            events = {sbm.testResult.events}
            positionEquations = {this.positionEquations}
            colors = {this.colors}/>
         </svg>
         {summary}
      </section>);
   }
}

class BallManager extends Component {
  constructor(props) {
     super(props);

     console.log("Ball Manager Constructed");
  }

  render() {
    var props = this.props;
    var ballNum = 0;
    var events = props.events

    var event = events[0][0];
    var nextEvent = events[0][0];
    var timeElapsed = 0;

    var currentTime = props.frame / props.frameRate;

    for (var idxA = 0; idxA < events.length; idxA++) {
       for (var idxB = 0; idxB < events[idxA].length; idxB++) {
         nextEvent = events[idxA][idxB];
         if (nextEvent.time + timeElapsed > currentTime ) {
            break;
         }
         event = nextEvent;
         }
      if (nextEvent.time + timeElapsed > currentTime ) {
        break;
      }
      timeElapsed += nextEvent.time;
      ballNum++;
    }

    var equations = props.positionEquations(event);

    return (  <circle key={"crc"}
    cx={equations.xPos(currentTime - timeElapsed - event.time)}
    cy={100 - equations.yPos(currentTime - timeElapsed - event.time)} r = {1}
    className={'ball ' + props.colors[ballNum % 5]}/>);
  }
}

class TrackManager extends Component {
  constructor(props) {
     super(props);

     console.log("Track Manager Constructed");
  }

  colors = ["red", "green", "orange", "purple", "cyan"];

  render() {
     var props = this.props;
     var ballTracks = [];
     var elapsedTime = 0;

     //push all arcs
     for ( var trackNum = 0; trackNum < props.events.length; trackNum++ ) {
        ballTracks.push(
          <BallTrack key={"BallTrack" + trackNum}
          startTime = {elapsedTime}
          frameRate = {props.frameRate}
          currentTime = {props.frame/props.frameRate}
          color = {this.props.colors[trackNum % 5]}
          positionEquations = {this.props.positionEquations}
          events = {this.props.events[trackNum]}/>);

        elapsedTime += this.props.events[trackNum]
         [this.props.events[trackNum].length - 1].time;
     }

    console.log("Track Manager");
    return (<g> {ballTracks} </g>);
  }
}

class BallTrack extends Component {
  constructor(props) {
     super(props);

     console.log("Ball Track Constructed");
  }

  shouldComponentUpdate(nextProps, nextState) {
     var props = this.props;

     //need to re-render, the ball has been reset
     if (nextProps.currentTime < props.currentTime &&
      props.startTime > props.currentTime)
        return true;

     return (nextProps.currentTime >= props.startTime) ||
      (props.currentTime <=  props.events[props.events.length - 1].time
      + props.startTime);
   }

  render() {
    var props = this.props;
    var ballTrack = [];

    //push all arcs
    for (var eventNum = 0; eventNum < props.events.length - 1; eventNum++ ) {
       ballTrack.push(
       <BallArc key={"BallArc" + eventNum}
       startTime = {props.startTime}
       endTime = {props.events[eventNum + 1].time}
       frameRate = {props.frameRate}
       currentTime = {props.currentTime}
       color = {props.color}
       positionEquations = {this.props.positionEquations}
       event = {props.events[eventNum]}/>);
    }

    return (<g> {ballTrack} </g>);
  }
}

class BallArc extends Component {
  constructor(props) {
     super(props);

     console.log("Ball Arc Constructed");
  }

  shouldComponentUpdate(nextProps, nextState) {
    var props = this.props;

    //need to re-render, the ball has been reset
    if (nextProps.currentTime < props.currentTime &&
     props.startTime + props.event.time > props.currentTime)
       return true;

   return (nextProps.currentTime >= props.startTime + props.event.time) ||
    (props.currentTime <= props.endTime + props.startTime);
  }

  render() {
    var ballArc = [];
    var props = this.props;
    var event = props.event;
    var color = props.color;

    var equations = props.positionEquations(props.event);

    //the current time is before the start
    if ( event.time + props.startTime >= props.currentTime )
      color += " invisible";

    //push the initial collision, not first event
    if (event.time != 0.0)
       ballArc.push(<circle key={"ballArc" + event.time}
       cx={equations.xPos(0)}
       cy={100 - equations.yPos(0)}
       r = {1}
       className={"ball faded " + color}/>);

    var startTime = (Math.ceil(event.time * props.frameRate) / props.frameRate);

    for (var timer = startTime - event.time ; timer < props.endTime - event.time; timer += 1.0/props.frameRate ){
       color = props.color;

       if (props.startTime + startTime + timer >= props.currentTime)
          color += " invisible";

       ballArc.push(<circle key={"ballPoint" + (timer + props.startTime)}
       cx={equations.xPos(timer)}
       cy={100 - equations.yPos(timer)}
       r = {.2}
       className={color}/>);
    }

    return (
      <g>
       {ballArc}
      </g>
    );
  }
}
