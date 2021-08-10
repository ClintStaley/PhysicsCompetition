import React, { Component } from 'react';
import {Form, Button } from 'react-bootstrap';
import {ReboundMovie} from './ReboundMovie';
import DraggableModal from '../../Util/DraggableModal';
import Select from 'react-select';

export class RbnSubmitModal extends Component {
   constructor(props) {
      super(props);
 
      this.state = {
         gateTime: 0,
         jumpLength: 1.0, 
         ballStarts: [  ],
         unchosen: props.prms.balls.map(
          (wt, idx) => ({value: idx, label: `Ball ${idx+1} ${wt}kg`}))
      };
 
      this.handleChange = this.handleChange.bind(this);
   }
 
    // Allows for enter key to submit
    // CAS: This is repeated in all dialogs; should go in a common base class
    // or better yet see if some combination of <form> and submit button will
    // obviate all this fancy event listening.
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
 
   // Special handler for the dropdown selects since they have stripped-down
   // events and need an extra |sIdx| parameter.
   handleSelect(ev, sIdx) {
      let val = parseInt(ev.value);
      let prms = this.props.prms;
      let unchosen = this.state.unchosen;
      let ballStarts = this.state.ballStarts;
      let ballStart = ballStarts[sIdx];
      let oldBallId = ballStarts[sIdx].id;

      if (oldBallId !== val) {
         ballStart.id = val;
         unchosen = unchosen.filter(v => v.value !== val)
          .concat([{
            value: oldBallId,
            display: `Ball ${oldBallId+1} ${prms.balls[oldBallId].weight}kg`
          }])
          .sort((b1, b2) => {
            let w1 = prms.balls[b1.value].weight;
            let w2 = prms.balls[b2.value].weight;
               return w1 < w2 ? -1 : w1 === w2 ? 0 : 1;
          });
         this.setState({unchosen, ballStarts})
      }
   }

   // Handle a non-select change event from field where id is one of:
   // "jumpLength" -- ensure value >= 1.0 and <= 100.0
   // "gateTime" -- ensure value >= 0.0 and <= 10.0
   //
   // "field:sIdx" -- field is id, pos or speed, and sIdx is an index into
   // ballStarts.  If |id|, adjust value for relevant ballStart, and also
   // adjust state.unchosen.  If |pos| or |speed|, ensure correct ranges and no
   // overlaps/touches
   handleChange(ev) {
      const cMinDist = ReboundMovie.cRadius + .01;
      const cChuteWidth = ReboundMovie.cChuteWidth;
      const cMaxJump = 100.0;
      const cMaxGateTime = 10.0;
      const cMaxSpeed = 1.0;

      let tId = ev.target.id;
      let val = ev.target.value;
      let ballStarts = this.state.ballStarts, ballStart;
 
      console.log(tId);
      if (tId === 'jumpLength') {
         if ((val = parseFloat(val)) && val >= 1.0 && val <= cMaxJump)
            this.setState({jumpLength: val});
      }
      else if (tId === 'gateTime') {
         if ((val = parseFloat(val)) && val >= 0.0 && val <= cMaxGateTime)
            this.setState({gateTime: val});
      }
      else {
         let [field, bIdx] = ev.target.id.split(":");
         let ballStart = ballStarts[bIdx];
         
         if (field === 'pos') {
            val = parseFloat(val);
            if (!isNaN(val) && val >= cMinDist
            && val <= cChuteWidth - cMinDist) {
               ballStart.pos = val;
               ballStarts.sort((s1, s2) => 
                  s2.pos === null || s1.pos !== null && s1.pos < s2.pos ? -1
                  : s1.pos === s2.pos ? 0 : 1
               )
               ballStarts.forEach((bs, idx) => {
                  let prev = ballStarts[idx-1], next = ballStarts[idx+1]

                  bs.error = bs.pos !== null && 
                     (prev && bs.pos - prev.pos < cMinDist 
                     || next && next.pos !== null && next.pos - bs.pos < cMinDist);
               });
               this.setState({ballStarts});
            }
         }
         else {
            val = parseFloat(val);
            if (!isNaN(val) && Math.abs(val) <= cMaxSpeed) {
               ballStart.speed = val;
               this.setState(ballStarts);
            }
         }
      }
   }
 
   // Return true iff all starts have complete data and are nonoverlapping
   getValidationState = () => {
      this.state.ballStarts.forEach(st => {
         if (st.error || st.id === null || st.pos === null || st.speed === null)
            return false;
      });
      return true;
   }
 
   // Add an additional text box to enter another speed
   addBall = () => {
      let ballStarts = this.state.ballStarts.concat(
       [{id: null, pos: null, speed: null}]);
 
      this.setState({ballStarts});
   }
 
   // Remove last text box row
   removeBall = () => {
      this.setState({ballStarts: this.state.ballStarts.slice(0, -1)});
   }
 
   // Close, and also submit iff status is OK.
   // CAS: This should be a direct call out to a close function in the caller.
   // This two-step thing is needless.
   close = (status) => {
      if (status === 'OK') {
         let {gateTime, jumpLength, ballStarts} = this.state;
         this.props.submitFn({gateTime, jumpLength, ballStarts});
      }
      else
         this.props.submitFn(null);
   }
 
   render() {
      const cMinDist = ReboundMovie.cRadius + .01;
      const cChuteWidth = ReboundMovie.cChuteWidth;
      const cMaxJump = 100.0;
      const cMaxGateTime = 10.0;
      const cMaxSpeed = 1.0;

      let idPos, idSpeed;
      let form = [];
 
      form.push(<div className="container" key="mainData">
         <div className="row">
            <div className="col-sm-6">
               <Form.Group controlId="jumpLength">
                  <Form.Label>
                     Jump Length
                  </Form.Label>
                  <Form.Control
                     type="text"
                     value={this.state.jumpLength}
                     required={true}
                     onChange={this.handleChange}
                  />
                  <Form.Text muted>
                     {`Between 1.0 and ${cMaxJump.toPrecision(2)}`}
                  </Form.Text>
               </Form.Group>
            </div>
 
            <div className="col-sm-6">
               <Form.Group controlId="gateTime">
                  <Form.Label>Gate Time</Form.Label>
                  <Form.Control
                     type="text"
                     value={this.state.gateTime}
                     required={true}
                     onChange={this.handleChange}
                  />
               </Form.Group>
               <Form.Text muted>
                     {`Between 1.0 and ${cMaxGateTime.toPrecision(2)}`}
               </Form.Text>
            </div>
         </div>
      </div>);

      for (let idx = 0; idx < this.state.ballStarts.length; idx++) {
         idPos = `pos:${idx}`;
         idSpeed = `speed:${idx}`;
 
         form.push(<div className="container" key={"start"+idx}>
            <div className="row">
               <div className="col-sm-4">
                  <Form.Group>
                     <Form.Label>
                        Ball Choice
                     </Form.Label>
                     <Select
                        name="BallId"
                        options={this.state.unchosen}
                        value={this.state.unchosen[0].value}
                        onChange={ev => {   // Hack in missing access to idx
                           let id = idx; 
                           this.handleSelect(ev, idx);
                        }}/>
                  </Form.Group>
               </div>
 
               <div className="col-sm-4">
                  <Form.Group controlId={idPos}>
                     <Form.Label>Position</Form.Label>
                     <Form.Control
                        type="text"
                        value={this.state.ballStarts[idx].pos}
                        required={true}
                        onChange={this.handleChange}
                     />
                     <Form.Text muted>
                        {`Between ${cMinDist.toPrecision(2)} and ` +
                          `${(cChuteWidth - cMinDist).toPrecision(2)}`}
                     </Form.Text>
                     <Form.Control.Feedback />
                  </Form.Group>
               </div>
 
               <div className="col-sm-4">
                  <Form.Group controlId={idSpeed}>
                     <Form.Label>Speed</Form.Label>
                     <Form.Control
                        type="text"
                        value={this.state.ballStarts[idx].speed}
                        required={true}
                        onChange={this.handleChange}
                     />
                     <Form.Text muted>
                       {`Between ${-cMaxSpeed.toPrecision(2)} and ` +
                        `${cMaxSpeed.toPrecision(2)}`}
                     </Form.Text>
                     <Form.Control.Feedback />
                  </Form.Group>
               </div>
            </div>
         </div>)
      }
 
       let buttons = [
          <Button key={0} onClick={() => {this.addBall()}}>Add Ball</Button>,
 
          <Button key={1} disabled={this.state.ballStarts.length < 2}
             onClick={() => {this.removeBall()}}>Remove Ball</Button>,
 
          <Button key={2} disabled={!this.getValidationState()}
             onClick={() => this.close('OK')}>OK</Button>,
 
          <Button key={3} onClick={() => this.close('Cancel')}>Cancel</Button>
       ];
 
       return (<DraggableModal
          show={this.props.submitFn !== null}
          onHide={() => this.close("Cancel")}
          title="Submit Bounce Solution"
          body={<form>{form}</form>}
          footer={buttons}
       />);
    }
 }