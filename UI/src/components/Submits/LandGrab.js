import React, { Component } from 'react';
import {FormGroup, FormControl, HelpBlock, ControlLabel, Button, Modal }
  from 'react-bootstrap';
import './LandGrab.css'

/* Expected Properties
 * prms-- parameter of the LandGrab competition to which to submit
 * submitFn -- function passed an array of circles or null on cancel.
 *
 * Iffcost  submitFn is nonnull, show a dialog to enter a LandGrab submit.  On
 * "OK" for that dialog, call submitFn with a submit-ready array of circles,
 * or with null if the dialog was cancelled.
 */

export class LGSubmitModal extends Component {
   constructor(props) {
      super(props);

      var idx, circles = [];

      for (idx = 0; idx < props.prms.numCircles; idx++)
         circles.push({
            centerX: "",
            centerY: "",
            radius: ""
         });

      this.state = {circles};
      this.handleChange = this.handleChange.bind(this);
   }

   // Allows for enter key to submit
   componentDidMount() {
      document.addEventListener("keydown", this.handleKeyPress, false);
   }
   componentWillUnmount() {
      document.removeEventListener("keydown", this.handleKeyPress, false);
   }

   handleKeyPress = (target) => {

      if (target.keyCode === "\r".charCodeAt(0) && !this.getValidationState()) {
         target.preventDefault();
         this.close("OK");
      }
   }

   handleChange(ev) {
      var cIdx, field, val;

      [field, cIdx] = ev.target.id.split(":");
      cIdx = Number.parseInt(cIdx, 10);

      // Require value be string representing positive float
      val = Number.parseFloat(ev.target.value);

      if (!ev.target.value || val >= 0.0)
         this.setState({"circles": this.state.circles.map((crc, i) => {
            return i === cIdx ? Object.assign({}, crc, {[field]: ev.target.value}) : crc;
         })});
   }

   getValidationState = () => {
      var goodCircles = 0;

      this.state.circles.forEach(crc => {
         if (Number.parseFloat(crc.centerX) >= 0.0
          && Number.parseFloat(crc.centerX) <= 100.0
          && Number.parseFloat(crc.centerY) >= 0.0
          && Number.parseFloat(crc.centerY) <= 100.0
          && Number.parseFloat(crc.radius) >= 0.0
          && Number.parseFloat(crc.radius) <= 50.0)
            goodCircles++;
      })

      return goodCircles === this.props.prms.numCircles ? "success" : "error";
   }

   close = (status) => {
      if (status === 'OK') {
         this.props.submitFn(this.state.circles.map(crc =>
          ({
             centerX: Number.parseFloat(crc.centerX),
             centerY: Number.parseFloat(crc.centerY),
             radius: Number.parseFloat(crc.radius)
          })));
      }
      else
         this.props.submitFn(null);
   }

   render() {
      var idX, idY, idR, idx, lines = [];

      for (idx = 0; idx < this.props.prms.numCircles; idx++) {
         idX = `centerX:${idx}`;
         idY = `centerY:${idx}`;
         idR = `radius:${idx}`;

         lines.push(<div className="container" key={idx}>
           <div className="row">
             <div className="col-sm-2"><h5>Circle {idx}</h5></div>

             <div className="col-sm-2">
               <FormGroup controlId={idX}>
                 <ControlLabel>X Coord</ControlLabel>
                 <FormControl
                   type="text"
                   id={idX}
                   value={this.state.circles[idx].centerX}
                   required={true}
                   onChange={this.handleChange}
                 />
                 <FormControl.Feedback/>
                 <HelpBlock>At most 100</HelpBlock>
               </FormGroup>
             </div>

             <div className="col-sm-2">
               <FormGroup controlId={idY}>
                 <ControlLabel>Y Coord</ControlLabel>
                 <FormControl
                   type="text"
                   id={idY}
                   value={this.state.circles[idx].centerY}
                   required={true}
                   onChange={this.handleChange}
                 />
                 <FormControl.Feedback/>
                 <HelpBlock>At most 100</HelpBlock>
               </FormGroup>
             </div>

             <div className="col-sm-2">
               <FormGroup controlId={idR}>
                 <ControlLabel>Radius</ControlLabel>
                 <FormControl
                   type="text"
                   id={idR}
                   value={this.state.circles[idx].radius}
                   required={true}
                   onChange={this.handleChange}
                 />
                 <FormControl.Feedback/>
                 <HelpBlock>At most 50</HelpBlock>
               </FormGroup>
             </div>
           </div>
         </div>)
      }

      return (
      <Modal show={this.props.submitFn !== null}
          onHide={()=>this.close("Cancel")} bsSize="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submit LandGrab Solution</Modal.Title>
        </Modal.Header>

        <Modal.Body><form>{lines}</form></Modal.Body>

        <Modal.Footer>
          <Button key={0}  disabled = {this.getValidationState() !== "success"}
              onClick={() => this.close('OK')}>OK</Button>
          <Button key={1} onClick={() => this.close('Cancel')}>Cancel</Button>
        </Modal.Footer>
      </Modal>)
   }
}
// Expected props are:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display
export class LandGrab extends Component {
   constructor(props) {
      super(props);

      this.state = {
         sbmConfirm: null, // Function to post current submission
		}
   }

   render() {
      var prms = this.props.prms;
      var sbm = this.props.sbm;
      var hashClass, offs, rect, grid, obstacles;
      var tr, circles, summary = null;

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

          var classLeft = (rect.hiX - rect.loX) > .8 ? "text" : "rhsText";
          var classRight = (rect.hiX - rect.loX) > .8 ? "rhsText" : "text";

          var highY = rect.hiY - rect.loY > .3 ? rect.hiY :
            ((0.3 - (rect.hiY - rect.loY))/2) + rect.hiY;
          var lowY = rect.hiY - rect.loY > .3 ? rect.loY :
            rect.loY - ((0.3 - (rect.hiY - rect.loY))/2);

         obstacles.push(<text key={"UL"+idx} x={rect.loX} y={100-highY+.13}
          className="ULText">{"(" + rect.loX + "," + rect.hiY + ")"}</text>);
         obstacles.push(<text key={"UR"+idx} x={rect.hiX} y={100-highY+.13}
          className="URText">{"(" + rect.hiX + "," + rect.hiY + ")"}</text>);
         obstacles.push(<text key={"LL"+idx} x={rect.loX} y={100-lowY-.5}
          className="LLText">{"(" + rect.loX + "," + rect.loY + ")"}</text>);
         obstacles.push(<text key={"LR"+idx} x={rect.hiX} y={100-lowY-.5}
          className="LRText">{"(" + rect.hiX + "," + rect.loY + ")"}</text>);
      });

      if (sbm) {
         tr = sbm.testResult;

         circles = [];
         sbm.content.forEach((crc, idx) => {
            var crcClass = !tr ?  "openCircle"
             : tr.circleStatus[idx] ? "goodCircle" : "badCircle";

            circles.push(<circle key={"crc"+idx} cx={crc.centerX}
             cy={100-crc.centerY} r={crc.radius} className={crcClass}/>);
            circles.push(<circle key={"center"+idx} cx={crc.centerX}
             cy={100-crc.centerY} r=".2"/>);
            circles.push(<text key={"crcLbl"+idx} x={crc.centerX+1}
                y={100-crc.centerY} className="LLText">
              {"(" + crc.centerX + "," + crc.centerY + ")"}
            </text>);
         });

         if (tr)
            summary = (<h4>Area covered: {tr.areaCovered.toFixed(4)}</h4>);
      }

      return (<section className="container">
         <h2>Problem Diagram</h2>
         <svg viewBox="0 0 100 100" width="100%" className="panel">
            <rect x="0" y="0" width="100" height="100" className="graphBkg"/>
            {grid}
            {obstacles}
            {circles}
         </svg>
         {summary}
      </section>);
   }
}
