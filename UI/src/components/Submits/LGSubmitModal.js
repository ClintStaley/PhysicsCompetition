import React, { Component } from 'react';
import {FormGroup, FormControl, HelpBlock, Button }
  from 'react-bootstrap';
import DragModal from '../Util/DraggableModal.js';

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
       var idX, idY, idR, idx, lines = [], buttons = [];
 
       for (idx = 0; idx < this.props.prms.numCircles; idx++) {
          idX = `centerX:${idx}`;
          idY = `centerY:${idx}`;
          idR = `radius:${idx}`;
 
          lines.push(<div className="modal-container" key={idx}>
            <div className="row">
              <div><h5 className='circle-title'>Circle {idx+1}</h5></div>
 
              <div className='col-sm-2'>
                <FormGroup controlId={idX}>
                  <FormControl.ControlLabel>X Coord</FormControl.ControlLabel>
                  <FormControl
                    type="text"
                    id={idX}
                    value={this.state.circles[idx].centerX}
                    required={true}
                    onChange={this.handleChange}
                  />
                  <FormControl.Feedback/>
                  <FormControl.HelpBlock>At most 100</FormControl.HelpBlock>
                </FormGroup>
              </div>
 
              <div className='col-sm-2'>
                <FormGroup controlId={idY}>
                  <FormControl.ControlLabel>Y Coord</FormControl.ControlLabel>
                  <FormControl
                    type="text"
                    id={idY}
                    value={this.state.circles[idx].centerY}
                    required={true}
                    onChange={this.handleChange}
                  />
                  <FormControl.Feedback/>
                  <FormControl.HelpBlock>At most 100</FormControl.HelpBlock>
                </FormGroup>
              </div>
 
              <div className='col-sm-2'>
                <FormGroup controlId={idR}>
                  <FormControl.ControlLabel>Radius</FormControl.ControlLabel>
                  <FormControl
                    type="text"
                    id={idR}
                    value={this.state.circles[idx].radius}
                    required={true}
                    onChange={this.handleChange}
                  />
                  <FormControl.Feedback/>
                  <FormControl.HelpBlock>At most 100</FormControl.HelpBlock>
                </FormGroup>
              </div>
            </div>
          </div>)
       }
       buttons.push(
          <Button key={0} disabled = {this.getValidationState() !== "success"}
           onClick={() => this.close('OK')}>OK</Button>);
       buttons.push(
          <Button key={1} onClick={() => this.close('Cancel')}>Cancel</Button>);
 
       return (<DragModal 
          show={this.props.submitFn !== null}  
          onHide={()=>this.close("Cancel")} 
          bsSize="lg"
          title = "Submit LandGrab Solution"
          body = {<form>{lines}</form>}
          footer = {buttons}
          />);
    }
 }