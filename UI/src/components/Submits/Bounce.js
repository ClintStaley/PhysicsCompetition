import React, { Component } from 'react';
import {FormGroup, FormControl, ControlLabel, Button, Modal }
  from 'react-bootstrap';
import './Bounce.css'

export class BSubmitModal extends Component {
   constructor(props) {
      super(props);

      var balls = [];

      //set default value for entry box
      balls.push({speed: 0, guessX: 0, guessY: 0, guessTime: 0})

      this.state = {balls};

      this.handleChange = this.handleChange.bind(this);
   }

   handleChange(ev) {
      var bIdx, field, newBalls;

      [field, bIdx] = ev.target.id.split(":");
      newBalls = this.state.balls.splice(0);
      newBalls[bIdx][field] = ev.target.value;

      this.setState({balls: newBalls});
   }

   //valid iff all balls are valid
   getValidationState = () => {
      for (var idx = 0; idx < this.state.balls.length; idx++) {
         if (this.getSingleValidationState(idx) !== "success")
            return "error";
      }
      return "success";
   }

   //valid iff speed is a number, and greater than 0
   getSingleValidationState = (idx) => {
      var ball = this.state.balls[idx];
      var valS = Number.parseFloat(ball.speed);
      var valX = Number.parseFloat(ball.posX);
      var valY = Number.parseFloat(ball.posY);
      var valT = Number.parseFloat(ball.time);

      if ((isNaN(ball.speed) || valS < 0) || (isNaN(ball.posX) || valX < 0) ||
       (isNaN(ball.posY) || valY < 0) || (isNaN(ball.time) || valT < 0))
         return "error";

      return "success";
   }

   //add an additional text box to enter another speed
   addBall = () => {
      var newBalls = this.state.balls.splice(0);

      newBalls.push({speed: 0});  // CAS use concat?

      this.setState({balls: newBalls});
   }

   //remove one text box
   removeBall = () => {
      var newBalls = this.state.balls.splice(0);

      newBalls.pop();

      this.setState({balls: newBalls});
   }

   //close, submist iff status is OK, closes modal no matter what
   close = (status) => {
      if (status === 'OK') {
         //this.props.reset();

         this.props.submitFn(this.state.balls.map(ball => ({
            speed: Number.parseFloat(ball.speed)
         })));
      }
      else
         this.props.submitFn(null);
   }

   render() {
      var idS, idx, lines = [];
      var idX, idY, idT;

      for (idx = 0; idx < this.state.balls.length; idx++) {
         idS = `speed:${idx}`;
         idX = `Xpos:${idx}`;
         idY = `Ypos:${idx}`;
         idT = `time:${idx}`;

         lines.push(<div className="container" key={idx}>
           <div className="row">
             <div className="col-sm-2"><h5>Ball {idx}</h5></div>

             <div className="col-sm-2">
               <FormGroup controlId={idS}>
                 <ControlLabel>Launch Speed</ControlLabel>
                 <FormControl
                  type="text"
                  id={idS}
                  value={this.state.balls[idx].speed}
                  required={true}
                  onChange={this.handleChange}/>
                 <FormControl.Feedback/>
               </FormGroup>
             </div>

             <div className="col-sm-2">
              <FormGroup controlId={idX}>
                <ControlLabel>X</ControlLabel>
                <FormControl
                 type="text"
                 id={idX}
                 value={this.state.balls[idx].guessX}
                 required={true}
                 onChange={this.handleChange}
                />
                <FormControl.Feedback/>
              </FormGroup>
           </div>

           <div className="col-sm-2">
              <FormGroup controlId={idY}>
                <ControlLabel>Y</ControlLabel>
                <FormControl
                 type="text"
                 id={idY}
                 value={this.state.balls[idx].guessY}
                 required={true}
                 onChange={this.handleChange}
                />
                <FormControl.Feedback/>
              </FormGroup>
           </div>

           <div className="col-sm-2">
              <FormGroup controlId={idT}>
                <ControlLabel>Time</ControlLabel>
                <FormControl
                 type="text"
                 id={idT}
                 value={this.state.balls[idx].guessTime}
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
          {/*Must be at least one ball in modal, cannot have less than 1*/}
          <Button key={1} disabled = {this.state.balls.length === 1}
           onClick={() => {this.removeBall()}}>Remove Ball</Button>

          <Button key={2}  disabled = {this.getValidationState() !== "success"}
           onClick={() => this.close('OK')}>OK</Button>
          <Button key={3} onClick={() => this.close('Cancel')}>Cancel</Button>
        </Modal.Footer>
      </Modal>);
   }
}

// Expected props are:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display
export class Bounce extends Component {
   constructor(props) {
      super(props);

      //debug, BUGS KNOWN: Frame does not reset on submit
      console.log(props);

      //boolean array, matched up with obstacle array, determines if hit
      var obstacleStatus = [];
      props.prms.obstacles.forEach(() => obstacleStatus.push(true));

      this.props.prms.blockedRectangles && this.props.prms.blockedRectangles.
       forEach(() => obstacleStatus.push(true));

      this.state = {
         obstacleStatus: obstacleStatus,
         frame: 0
      }
   }

   //sets frame to zero
   reset = () => {
      var obstacleStatus = [];
      this.props.prms.obstacles.forEach(() => obstacleStatus.push(true));
      this.props.prms.blockedRectangles.forEach(() => obstacleStatus.push(true));

      this.setState({ frame : 0, obstacleStatus : obstacleStatus });
   }

   //hack
   shouldComponentUpdate(nextProps, nextState) {
      var props = this.props;

      if (props !== nextProps)
         this.reset();


      return true;
   }

   //clear interval when component closes,
   //avioids tryting to read paramaters that no longer exist
   componentWillUnmount = () => {
      clearInterval(this.intervalID);
   }


   intervalID;        // Timer ID of interval timer
   frameRate = 24;    // Frames per second to display
   G = 9.80665;       //gravity constant
   fieldLength = 10; //the stage length in meters
   fieldHeight = 10; //the sage height in meters
   graphLine = .5;     //how far apart the graph lines are in meters
   //colors of balls
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
      var secondsToMiliseconds = 1000;
      var totalTime = 0;

      //saftey so that two seperate intevals are running
      if (this.intervalID)0
         clearInterval(this.intervalID);

      for (var idx = 0; idx < events.length; idx++) {
         totalTime += events[idx][events[idx].length - 1].time;
      }

      //runs playBall() at every frame
      this.intervalID = setInterval( () => {
         this.playBall(totalTime);
      }, secondsToMiliseconds/frameRate);
   }

   playBall = (totalTime) => {
      var frame = this.state.frame;
      var newState = {};

      if (++frame / this.frameRate > totalTime)
         clearInterval(this.intervalID);

      newState.frame = frame;
      newState.obstacleStatus = this.calculateObstacles(frame);

      this.setState(newState);
   }

   calculateObstacles = (frame) => {
      var events = this.props.sbm.testResult.events;
      var time = frame/this.frameRate;
      var elapsedTime = 0;
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

   //builds table on bottom of page, only shows detailed info about a hit,
   //after that his is shown on the animation.
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

   //starts movie over, resets state
   replay = () => {
      var obstacleStatus = [];
      this.props.prms.obstacles.forEach(() => obstacleStatus.push(true));

      this.props.prms.blockedRectangles.forEach(() => obstacleStatus.push(true));

      this.setState({ frame : 0, obstacleStatus : obstacleStatus });

      this.startMovie(this.props.sbm.testResult.events);
   }

   render() {
      var prms = this.props.prms;
      var sbm = this.props.sbm;
      var hashClass, offs, rect, grid, obstacles;
      var summary = null;
      var dimensions =
       {fieldLength: this.fieldLength, fieldHeight: this.fieldHeight};
      var numObstacles = prms.obstacles.length;

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
          className={hashClass}/>);
         grid.push(
          <line key={"YL" + offs} x1="0" y1={offs} x2={fieldLength} y2={offs}
          className={hashClass}/>);
      }


      // Obstacle rectangles
      obstacles = [];

      prms.blockedRectangles && prms.blockedRectangles.forEach((rect, idx) => {
         obstacles.push(
          <rect key={"BR"+(idx)} x={rect.loX} y={fieldHeight-rect.hiY}
          width={rect.hiX - rect.loX} height={rect.hiY - rect.loY}
          className= {this.state.obstacleStatus[idx + numObstacles] ? "bPlatform" :
          "hitBPlatform"}/>);

          var classLeft = (rect.hiX - rect.loX) > .8 ? "text" : "rhsText";
          var classRight = (rect.hiX - rect.loX) > .8 ? "rhsText" : "text";

         obstacles.push(
          <text key={"BUL"+idx} x={rect.loX} y={fieldHeight-rect.hiY+.13}
          className={classLeft}>{"(" + rect.loX + "," + rect.hiY + ")"}</text>);
         obstacles.push(
          <text key={"BUR"+idx} x={rect.hiX} y={fieldHeight-rect.hiY+.13}
          className={classRight}>{"(" + rect.hiX + "," + rect.hiY + ")"}</text>);
         obstacles.push(
          <text key={"BLL"+idx} x={rect.loX} y={fieldHeight-rect.loY-.05}
          className={classLeft}>{"(" + rect.loX + "," + rect.loY + ")"}</text>);
         obstacles.push(
          <text key={"BLR"+idx} x={rect.hiX} y={fieldHeight-rect.loY-.05}
          className={classRight}>{"(" + rect.hiX + "," + rect.loY + ")"}</text>);
      });

      prms.obstacles.forEach((rect, idx) => {
         obstacles.push(
          <rect key={"R"+idx} x={rect.loX} y={fieldHeight-rect.hiY}
          width={rect.hiX - rect.loX} height={rect.hiY - rect.loY}
          className= {this.state.obstacleStatus[idx] ? "platform" :
          "hitPlatform"}/>);

         var classLeft = (rect.hiX - rect.loX) > .8 ? "text" : "rhsText";
         var classRight = (rect.hiX - rect.loX) > .8 ? "rhsText" : "text";

         var highY = rect.hiY - rect.loY > .3 ? rect.hiY :
           ((0.3 - (rect.hiY - rect.loY))/2) + rect.hiY;
         var lowY = rect.hiY - rect.loY > .3 ? rect.loY :
           rect.loY - ((0.3 - (rect.hiY - rect.loY))/2);

         obstacles.push(
          <text key={"UL"+idx} x={rect.loX} y={fieldHeight-highY+.13}
          className={classLeft}>{"(" + rect.loX + "," + rect.hiY + ")"}</text>);
         obstacles.push(
          <text key={"UR"+idx} x={rect.hiX} y={fieldHeight-highY+.13}
          className={classRight}>{"(" + rect.hiX + "," + rect.hiY + ")"}</text>);
         obstacles.push(
          <text key={"LL"+idx} x={rect.loX} y={fieldHeight-lowY-.05}
          className={classLeft}>{"(" + rect.loX + "," + rect.loY + ")"}</text>);
         obstacles.push(
          <text key={"LR"+idx} x={rect.hiX} y={fieldHeight-lowY-.05}
          className={classRight}>{"(" + rect.hiX + "," + rect.loY + ")"}</text>);
      });

      if (sbm && sbm.testResult && sbm.score)
         summary = this.getSummary(sbm.testResult, sbm.score);

      var readyRun = !sbm || !sbm.testResult;

      return (<section className="container">
        <h2>Problem Diagram</h2>
        <Button className="pull-right" disabled = {readyRun}
         onClick={() => this.replay()}>Replay</Button>
        <Button className="pull-right" disabled = {readyRun}
         onClick={() => clearInterval(this.intervalID)}>Pause</Button>
        <Button className="pull-right" disabled = {readyRun}
         onClick={() => this.startMovie(sbm.testResult.events)}>Play</Button>
        <svg viewBox={"-.1 -.1 " + (fieldLength + .1) + " " + (fieldHeight + .1)}
         width="100%" className="panel">
          <rect x="0" y="0" width={fieldLength} height={fieldHeight}
           className="graphBkg"/>
          {grid}
          {obstacles}

          {sbm && sbm.testResult ?
          <g>
            <BallManager frameRate = {this.frameRate}
             frame = {this.state.frame}
             events = {sbm.testResult.events}
             positionEquations = {this.positionEquations}
             colors = {this.colors}
             dimensions = {dimensions}/>

            <TrackManager
             frameRate = {this.frameRate}
             frame = {this.state.frame}
             events = {sbm.testResult.events}
             positionEquations = {this.positionEquations}
             colors = {this.colors}
             dimensions = {dimensions}/>
          </g>
          : ''}
        </svg>
        {summary}
      </section>);
   }
}

//keeps track of the ball, draws the ball with the correct color
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
            if (nextEvent.time + timeElapsed > currentTime ) {
               break;
            }
            event = nextEvent;
         }
         if (nextEvent.time + timeElapsed > currentTime ) {
            break;
         }
         //makes sure ther is another ball
         if (events[idxA + 1])
            timeElapsed += nextEvent.time;
      }

      var equations = props.positionEquations(event);

      return (  <circle key={"crc"}
       cx={equations.xPos(currentTime - timeElapsed - event.time)}
       cy={fieldHeight - equations.yPos(currentTime - timeElapsed - event.time)}
       r = {.1}
       className={'ball ' + props.colors[ballNum % 5]}/>);
   }
}

//is all the tracks the balls take in thier lives
class TrackManager extends Component {
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
            events = {this.props.events[trackNum]}
            dimensions = {this.props.dimensions}/>);

         elapsedTime += this.props
          .events[trackNum][this.props.events[trackNum].length - 1].time;
      }
      return (<g> {ballTracks} </g>);
   }
}

//is the path one ball takes along its life
class BallTrack extends Component {

   shouldComponentUpdate(nextProps, nextState) {
      var props = this.props;

      //need to re-render, the ball has been reset
      if (nextProps.currentTime < props.currentTime &&
       props.startTime > props.currentTime)
         return true;

      //returns true iff current time is between event start time and end time
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
          event = {props.events[eventNum]}
          dimensions = {props.dimensions}/>);
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
      if ( event.time + props.startTime >= props.currentTime )
         color += " invisible";

      //push the initial collision, not first event
      if (event.time !== 0.0)
         ballArc.push(<circle key={"ballArc" + event.time}
          cx={equations.xPos(0)}
          cy={fieldHeight - equations.yPos(0)}
          r = {.1}
          className={"ball faded " + color}/>);

      var startTime =
       (Math.ceil(event.time * props.frameRate) / props.frameRate);

      for (var timer = startTime - event.time;
       timer < props.endTime - event.time; timer += 1.0/props.frameRate ){
         color = props.color;

         if (props.startTime + startTime + timer >= props.currentTime)
            color += " invisible";

         ballArc.push(<circle key={"ballPoint" + (timer + props.startTime)}
          cx={equations.xPos(timer)}
          cy={fieldHeight - equations.yPos(timer)}
          r = {.02}
          className={color}/>);
      }

      return (
      <g>
        {ballArc}
      </g>
      );
   }
}
