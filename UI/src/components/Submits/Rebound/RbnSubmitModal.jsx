import React, { Component } from 'react';
import {Form, Button } from 'react-bootstrap';
import DraggableModal from '../../Util/DraggableModal';

export class RbnSubmitModal extends Component {
   ballRadius = 0.5;

   constructor(props) {
      super(props);

      this.state = {startSpec: new Array(props.prms.balls.length).fill(null, 0)};
      this.handleChange = this.handleChange.bind(this);
   }

   // Set up event handler for enter key to be a submit.
   componentDidMount() {
      document.addEventListener("keydown", this.handleKeyPress, false);
   }

   // Drop event handler when this component ends
   componentWillUnmount() {
      document.removeEventListener("keydown", this.handleKeyPress, false);
   }

   // Handle keypresses that are \r by doing a close if validation is good
   handleKeyPress = (target) => {
      if (target.keyCode === "\r".charCodeAt(0) && this.getValidationState()) {
         target.preventDefault();
         this.close("OK");
      }
   }

   // Handle a change event from field with id field:bIdx where field is speed
   // or startX and bIdx is 0-based ball number
   handleChange(ev) {
      var bIdx, field;

      [field, bIdx] = ev.target.id.split(":");

      // Either empty, or number between -1.0 and 1.0
      if (!ev.target.value || (parseFloat(ev.target.value) >= -1.0
         && parseFloat(ev.target.value) <= 1.0))
         this.setState({"startSpec": this.state.startSpec.map((spec, i) => {
            return ""+i === bIdx ? 
            Object.assign({}, spec, {[field]: ev.target.value}) : spec;
         })});
   }

   // Valid iff all balls are valid
   getValidationState = () => {
      let rtn = true;
      let startSpec = this.spec.startSpec;

      for (var i = 0; i < startSpec.length; i++)
         for (var j = i+1; j < startSpec.length; j++)
            if (startSpec[i] && startSpec[j]) {
               let diff = parseFloat(startSpec[i].startX)
                  - parseFloat(startSpec[j].startX);
               if (diff > -2*this.ballRadius && diff < 2*this.ballRadius)
                  rtn = false;
            }

      return rtn;
   }

   // Close, and also submit iff status is OK.
   close = (status) => {
      if (status === 'OK') {
         this.props.submitFn(this.state.launchSpec.map(ball => ({
            speed: Number.parseFloat(ball.speed),
            startX: Number.parseFloat(ball.startX),
         })));
      }
      else
         this.props.submitFn(null);
   }

   // Todo: change to maintain state as numbers, translating back to text
   render() {
      var idS, idx, lines = [];
      var idX;

      for (idx = 0; idx < this.state.launchSpec.length; idx++) {
         idS = `speed:${idx}`;
         idX = `startX:${idx}`;

         lines.push(<div className="container" key={idx}>
            <div className="row">
               <div className="col-sm-1"><h5>Ball {idx}</h5></div>
               <div className="col-sm-2">
               <FormGroup controlId={idS}>
                  <ControlLabel>Speed</ControlLabel>
                  <FormControl
                  type="text"
                  id={idS}
                  value={this.state.launchSpec[idx].speed}
                  required={true}
                  onChange={this.handleChange}/>
                  <HelpBlock>At most +-1 m/s</HelpBlock>
                  <FormControl.Feedback/>
               </FormGroup>
               </div>

               <div className="col-sm-2">
               <FormGroup controlId={idX}>
                  <ControlLabel>X</ControlLabel>
                  <FormControl
                  type="text"
                  id={idX}
                  value={this.state.launchSpec[idx].startX}
                  required={true}
                  onChange={this.handleChange}
                  />
                  <HelpBlock>Do not overlap other balls</HelpBlock>
                  <FormControl.Feedback/>
               </FormGroup>
               </div>
            </div>
         </div>)
      }
   
      var buttons = [
         <Button key={2}  disabled = {!this.getValidationState()}
         onClick={() => this.close('OK')}>OK</Button>,

         <Button key={3} onClick={() => this.close('Cancel')}>Cancel</Button>
      ];

      return (<DraggableModal 
         show={this.props.submitFn !== null}  
         onHide={()=>this.close("Cancel")} 
         bsSize="lg"
         title = "Submit Ricochet Solution"
         body = {<form>{lines}</form>}
         footer = {buttons}
         />);
   }
}