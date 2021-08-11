import React, { Component } from 'react';
import {Form, Button } from 'react-bootstrap';
import {ReboundMovie} from './ReboundMovie';
import DraggableModal from '../../Util/DraggableModal';
import Select from 'react-select';

export class RbnSubmitModal extends Component {
   constructor(props) {
      super(props);
 
      this.state = {
         gateTime: null,
         strGateTime:"",
         jumpLength: null,
         strJumpLength: "", 
         ballStarts: [],
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
      let prms = this.props.prms;
      let unchosen = this.state.unchosen;
      let ballStarts = this.state.ballStarts;
      let ballStart = ballStarts[sIdx];

      if (ballStart.optId !== ev) {
         if (ballStart.optId !== null)
            unchosen = unchosen.concat([ballStart.optId]);

         ballStart.optId = ev;
         ballStart.id = parseInt(ev.value);   // Has to be valid

         unchosen = unchosen.filter(v => v !== ev);

         unchosen = unchosen.sort((b1, b2) => {
            let w1 = prms.balls[b1.value].weight;
            let w2 = prms.balls[b2.value].weight;
               return w1 < w2 ? -1 : w1 === w2 ? 0 : 1;
          });
         
         this.setState({unchosen, ballStarts})
      }
   }

   checkPosErrors(ballStarts) {
      const cMin = ReboundMovie.cRadius + .01;
      const cMid = 2*ReboundMovie.cRadius + .01;
      const cMax = ReboundMovie.cChuteWidth - cMin;

      ballStarts.forEach(s => s.error = !isNaN(s.pos) 
       && (s.pos < cMin || s.pos > cMax));

      for (let idx1 = 0; idx1 < ballStarts.length-1; idx1++)
         for (let idx2 = idx1+1; idx2 < ballStarts.length; idx2++) {
            let bs1 = ballStarts[idx1], bs2 = ballStarts[idx2];

            bs1.error = bs1.error || !isNaN(bs1.pos) && !isNaN(bs2.pos)
             && Math.abs(bs1.pos - bs2.pos) < cMid;
            bs2.error = bs2.error || !isNaN(bs1.pos) && !isNaN(bs2.pos)
             && Math.abs(bs1.pos - bs2.pos) < cMid;
         }
   }

   // Handle a non-select change event from field where id is one of:
   // "jumpLength" -- ensure value >= 1.0 and <= 100.0
   // "gateTime" -- ensure value >= 0.0 and <= 10.0
   //
   // "field:sIdx" -- field is id, pos or speed, and sIdx is an index into
   // ballStarts.  If |id|, adjust value for relevant ballStart, and also
   // adjust state.unchosen.  If |pos| or |speed|, ensure correct ranges and no
   // overlaps/touches.
   handleChange(ev) {
      const cMaxJump = 100.0;
      const cMaxGateTime = 10.0;
      const cMaxSpeed = 1.0;
      const cChuteWidth = ReboundMovie.cChuteWidth;

      let ballStarts = this.state.ballStarts;
      let tId = ev.target.id;
      let strVal = ev.target.value;        // String form allows "1." and ""
      let val = Number.parseFloat(strVal); // Number form allows math checking
 
      // Only legit NaN cases past this point.
      if (isNaN(val) && strVal && strVal !== "-")
         return;

      if (tId === 'jumpLength' && (isNaN(val) || val >= 1.0
       && val <= cMaxJump)){ 
         this.setState({jumpLength: val, strJumpLength: strVal});
      }
      else if (tId === 'gateTime' && (isNaN(val) || val >= 0.0
       && val <= cMaxGateTime)) {
         this.setState({gateTime: val, strGateTime: strVal});
      }
      else {
         let [field, bIdx] = tId.split(":");
         let ballStart = ballStarts[bIdx];
         
         if (field === 'pos'
          && (isNaN(val) || val >= 0 && val <= cChuteWidth)) {
            ballStart.strPos = strVal;
            ballStart.pos = val;

            this.checkPosErrors(ballStarts);
            this.setState({ballStarts});
         }
         else if (field === 'speed' 
          && (isNaN(val) || Math.abs(val) <= cMaxSpeed)) {
            ballStart.strSpeed = strVal;
            ballStart.speed = val;
            this.setState(ballStarts);
         }
      }
   }
 
   // Return true iff all starts have complete data and are nonoverlapping
   getValidationState = () => {
      this.state.ballStarts.forEach(st => {
         if (st.error || st.id === null || isNaN(st.pos) || isNaN(st.speed))
            return false;
      });
      return true;
   }
 
   // Add a ball start.  Record both 
   addBall = () => {
      let ballStarts = this.state.ballStarts.concat(
       [{id: null, optId: null, 
         pos: null, strPos: "", speed: null, strSpeed: ""}]);
 
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

      let ballStarts = this.state.ballStarts;
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
                     value={this.state.strJumpLength}
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
                     value={this.state.strGateTime}
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

      for (let idx = 0; idx < ballStarts.length; idx++) {
         idPos = `pos:${idx}`;
         idSpeed = `speed:${idx}`;
 
         form.push(<div className="container" key={"start"+idx}>
            <div className="row">
               <div className="col-sm-3">
                  <Form.Group>
                     <Form.Label>
                        Ball Choice
                     </Form.Label>
                     <Select
                        name="BallId"
                        options={this.state.unchosen}
                        value={ballStarts[idx].optId}
                        onChange={ev => {   // Hack in missing access to idx
                           let id = idx; 
                           this.handleSelect(ev, idx);
                        }}/>
                  </Form.Group>
               </div>
 
               <div className="col-sm-3">
                  <Form.Group controlId={idPos}>
                     <Form.Label>Position</Form.Label>
                     <Form.Control
                        type="text"
                        value={ballStarts[idx].strPos}
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
 
               <div className="col-sm-3">
                  <Form.Group controlId={idSpeed}>
                     <Form.Label>Speed</Form.Label>
                     <Form.Control
                        type="text"
                        value={ballStarts[idx].strSpeed}
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
               <div className="col-sm-3 alert alert-danger">
                  {ballStarts[idx].error ? "Overlap" : "No overlap"}
               </div>
            </div>
         </div>)
      }
 
       let buttons = [
          <Button key={0} 
           disabled={ballStarts.length >= this.props.prms.maxBalls}
           onClick={() => {this.addBall()}}>Add Ball</Button>,
 
          <Button key={1} disabled={ballStarts.length < 2}
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