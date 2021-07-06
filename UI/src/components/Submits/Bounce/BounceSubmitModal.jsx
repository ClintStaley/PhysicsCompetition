import React, { Component } from 'react';
import {Form, Button } from 'react-bootstrap';
import DraggableModal from '../../Util/DraggableModal';

export class BSubmitModal extends Component {
    constructor(props) {
       super(props);
 
       var launchSpec = [];  // Array of ball launch specifications
 
       //set default value for entry box
       launchSpec.push({ speed: 0, finalX: 0, finalY: 0, finalTime: 0 })
 
       this.state = { launchSpec };
 
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
 
    // Handle a change event from field with id field:bIdx where field is speed,
    // finalX, finalY or finalTime and bIDx is 0-based ball number
    handleChange(ev) {
       var bIdx, field;
 
       [field, bIdx] = ev.target.id.split(":");
 
       // Either empty, or a nonnegative number
       if (!ev.target.value || parseFloat(ev.target.value) >= 0.0)
          this.setState({
             "launchSpec": this.state.launchSpec.map((spec, i) => {
                return "" + i === bIdx ?  // CAS FIX reverse cases and use !== for clarity
                   Object.assign({}, spec, { [field]: ev.target.value }) : spec;
             })
          });
    }
 
    // Valid iff all balls are valid
    getValidationState = () => {
       let rtn = true;
 
       this.state.launchSpec.forEach(ball => {
          if (!(Number.parseFloat(ball.speed) >= 0
             && Number.parseFloat(ball.speed) <= 20.0
             && Number.parseFloat(ball.finalTime) >= 0
             && Number.parseFloat(ball.finalX) >= 0
             && Number.parseFloat(ball.finalY) >= 0))
             rtn = false;
       });
       return rtn;
    }
 
    // Add an additional text box to enter another speed
    addBall = () => {
       var newSpec = this.state.launchSpec.concat(
          [{ speed: 0, finalX: 0, finalY: 0, finalTime: 0 }]);
 
       this.setState({ launchSpec: newSpec });
    }
 
    // Remove last text box row
    removeBall = () => {
       this.setState({ launchSpec: this.state.launchSpec.slice(0, -1) });
    }
 
    // Close, and also submit iff status is OK.
    close = (status) => {
       if (status === 'OK') {
          this.props.submitFn(this.state.launchSpec.map(ball => ({
             speed: Number.parseFloat(ball.speed),
             finalTime: Number.parseFloat(ball.finalTime),
             finalX: Number.parseFloat(ball.finalX),
             finalY: Number.parseFloat(ball.finalY)
          })));
       }
       else
          this.props.submitFn(null);
    }
 
    render() {
       var idS, idx, lines = [];
       var idX, idY, idT;
 
       for (idx = 0; idx < this.state.launchSpec.length; idx++) {
          idS = `speed:${idx}`;
          idT = `finalTime:${idx}`;
          idX = `finalX:${idx}`;
          idY = `finalY:${idx}`;
 
          lines.push(<div className="container" key={idx}>
             <div className="row">
                <div className="col-sm-1"><h5>Ball {idx}</h5></div>
                <div className="col-sm-3">
                   <Form.Group controlId={idS}>
                      <Form.Label>
                         Launch Speed
                      </Form.Label>
                      <Form.Control
                         type="text"
                         id={idS}
                         value={this.state.launchSpec[idx].speed}
                         required={true}
                         onChange={this.handleChange} />
                      <Form.Text muted>At most 20 m/s</Form.Text>
                   </Form.Group>
                </div>
 
                <div className="col-sm-2">
                   <Form.Group controlId={idT}>
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                         type="text"
                         id={idT}
                         value={this.state.launchSpec[idx].finalTime}
                         required={true}
                         onChange={this.handleChange}
                      />
                      <Form.Control.Feedback />
                   </Form.Group>
                </div>
 
                <div className="col-sm-2">
                   <Form.Group controlId={idX}>
                      <Form.Label>X</Form.Label>
                      <Form.Control
                         type="text"
                         id={idX}
                         value={this.state.launchSpec[idx].finalX}
                         required={true}
                         onChange={this.handleChange}
                      />
                      <Form.Control.Feedback />
                   </Form.Group>
                </div>
 
                <div className="col-sm-2">
                   <Form.Group controlId={idY}>
                      <Form.Label>Y</Form.Label>
                      <Form.Control
                         type="text"
                         id={idY}
                         value={this.state.launchSpec[idx].finalY}
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
          <Button key={0} onClick={() => { this.addBall() }}>Add Ball</Button>,
 
          <Button key={1} disabled={this.state.launchSpec.length === 1}
             onClick={() => { this.removeBall() }}>Remove Ball</Button>,
 
          <Button key={2} disabled={!this.getValidationState()}
             onClick={() => this.close('OK')}>OK</Button>,
 
          <Button key={3} onClick={() => this.close('Cancel')}>Cancel</Button>
       ];
 
       return (<DraggableModal
          show={this.props.submitFn !== null}
          onHide={() => this.close("Cancel")}
          bsSize="lg"
          title="Submit Bounce Solution"
          body={<form>{lines}</form>}
          footer={buttons}
       />);
    }
 }