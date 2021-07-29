import React, { Component } from 'react';
import {Form, Button } from 'react-bootstrap';
import DraggableModal from '../../Util/DraggableModal';

export class LGSubmitModal extends Component {
   constructor(props) {
      super(props);

      var cSpec = []; // Array of Circle specifications

      //set default value for entry box
      cSpec.push({ centerX: 0, centerY: 0, radius: 0 })

      this.state = { cSpec };

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

   // Handle a change event from field with id field:bIdx where field is
   // posX, poxY, and Radius, and bIdx is 0-based circle number
   handleChange(ev) {
      var cIdx, field;

      [field, cIdx] = ev.target.id.split(":");

      //cIdx = Number.parseInt(cIdx, 10);
      // Either empty, or a nonnegative number
      if (!ev.target.value || parseFloat(ev.target.value) >= 0.0)
         this.setState({
            "cSpec": this.state.cSpec.map((spec, i) => {
               return "" + i !== cIdx ? spec :
                  Object.assign({}, spec, { [field]: ev.target.value });
            })
         });
   }

   // valid iff circle centers are in range and 0 <= radius <= 50
    getValidationState = () => {
      let rtn = true;
      this.state.cSpec.forEach(circle => {
         if (!(Number.parseFloat(circle.centerX) > 0
             && Number.parseFloat(circle.centerX) < 100
             && Number.parseFloat(circle.centerY) > 0
             && Number.parseFloat(circle.centerY) < 100
             && Number.parseFloat(circle.radius) > 0
             && Number.parseFloat(circle.radius) <= 50))
               rtn = false;
        });
      
        return rtn;
   }

   // Add an aditional text box to enter another circle
   addCircle = () => {
      var newSpec = this.state.cSpec.concat(
         [{centerX: 0, centerY: 0, radius: 0}]);
      
      this.setState({cSpec: newSpec});
   }

   // Remove last text box row
   removeCircle = () => {
      this.setState({cSpec: this.state.cSpec.slice(0,-1) });
   }

   //Close and also submit iff status is ok
   close = (status) => {
      if (status === "OK") {
         this.props.submitFn(this.state.cSpec.map(circle => ({
            centerX: Number.parseFloat(circle.centerX),
            centerY: Number.parseFloat(circle.centerY),
            radius: Number.parseFloat(circle.radius)
         })));
      }
      else
         this.props.submitFn(null);
   }

   render() {
      var idx, lines = [];
      var idX, idY, idR;

      for (idx = 0; idx < this.state.cSpec.length; idx++) {
         idX = `centerX:${idx}`;
         idY = `centerY:${idx}`;
         idR = `radius:${idx}`;

         lines.push(<div className="container" key={idx}>
            <div className="row">
            <div className="col-sm-1"><h5>Circle { idx +1 }</h5></div>
                <div className="col-sm-3">
                   <Form.Group>
                      <Form.Label>
                         Radius
                      </Form.Label>
                      <Form.Control
                         type="text"
                         id={idR}
                         value={this.state.cSpec[idx].radius}
                         required={true}
                         onChange={this.handleChange} />
                      <Form.Text muted>Less than 50</Form.Text>
                   </Form.Group>
                </div>
                <div className="col-sm-2">
                   <Form.Group>
                      <Form.Label>X</Form.Label>
                      <Form.Control
                         type="text"
                         id={idX}
                         value={this.state.cSpec[idx].centerX}
                         required={true}
                         onChange={this.handleChange}
                      />
                      <Form.Control.Feedback />
                   </Form.Group>
                </div>
 
                <div className="col-sm-2">
                   <Form.Group>
                      <Form.Label>Y</Form.Label>
                      <Form.Control
                         type="text"
                         id={idY}
                         value={this.state.cSpec[idx].centerY}
                         required={true}
                         onChange={this.handleChange}
                      />
                      <Form.Control.Feedback />
                   </Form.Group>
                </div>

             </div>
          </div>)
       }
      var buttons = [
         <Button key={0} disabled = {this.state.cSpec.length == 
            this.props.prms.numCircles} onClick={() => {this.addCircle()}}
            >Add Circle</Button>,
         <Button key={1} disabled = {this.state.cSpec.length === 1}
            onClick={() => {this.removeCircle() }}>Remove Circle</Button>,

         <Button key={2} disabled = {!this.getValidationState()}
            onClick={() => this.close('OK')}>OK</Button>,
         
         <Button key={3} onClick={() => this.close('Cancel')}>Cancel</Button>
      ];

      return (<DraggableModal
         show={this.props.submitFn !== null}
         onHide={() => this.close('Cancel')}
         bsSize="lg"
         title="Submit LandGrab Solution"
         body={<form>{lines}</form>}
         footer={buttons}
         />);
   }
}