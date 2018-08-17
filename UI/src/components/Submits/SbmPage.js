import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Bounce } from './Bounce'
import {LandGrab, LGSubmitModal} from './LandGrab'

// Expected props are:
//   cmp -- competition object to be worked with
//   team -- team object for the team reviewing/making a submission
export default class SbmPage extends Component {
   constructor(props) {
      super(props);

console.log("Constructing SbmPage with ", props);

      this.cRefreshDelay = 4000; // Every 4 s
      this.cNoteDelay = 333;     // Show notice for 1/3 s

      this.state = {
         sbmFunction: null,   // Function to support modal submit dialog
         refreshNote: "No results yet..." // Refresh state
      }
   }

   componentDidMount = () => {
      this.props.getSbms(this.props.cmp, this.props.team.id,
       () => this.startTimer());
   }

   componentWillUnmount = () => {
      this.stopTimer();
   }

   startTimer = () => {
      this.timerId = setInterval(() => this.refreshSbm(), this.cRefreshDelay);
      console.log("Started " + this.timerId);
   }

   stopTimer = () => {
      console.log("Clearing " + this.timerId);
      this.timerId && clearInterval(this.timerId);
      this.timerId = null;
   }

   doSubmit = (submit) => {
      if (submit)
         this.props.postSbm(this.props.cmp.id, this.props.team.id, submit,
          () => this.startTimer());
      this.setState({sbmFunction : null});
   }

   refreshSbm = () => {
      var current = this.props.sbms && this.props.sbms.current;

      if (current)
         if (current.testResult && this.timerId)
            this.stopTimer();
         else {
            this.setState({refreshNote: "Checking for results..."});
            this.props.refreshSbms(() => setTimeout(() =>
             this.setState({refreshNote: "No results yet.."}), this.cNoteDelay)
            );
         }
   }

   render() {
      var sbm, sbmTime, dateStr, timeStr, sbmFunction, sbmDialog;
      var cmp = this.props.cmp, ctpName;
      var sbmStatus = null;
      var prbDiagram = null;

      if (this.props.sbms.current) {
         sbm = this.props.sbms.current;
         ctpName = this.props.sbms.ctpName;
         sbmTime = new Date(sbm.sbmTime);
         dateStr = sbmTime.toLocaleDateString('en-US',
          {month:"short", day:"numeric"});
         timeStr = sbmTime.toLocaleTimeString();

         sbmStatus = (<div className="panel container">
           <h2>Status of your last submission</h2>
           <div className="row">
             <div className="col-sm-9">
               <h4>Submission received at {timeStr} on {dateStr}</h4>
               <h4>{sbm.score != null ? `Score: ${sbm.score}` :
                this.state.refreshNote}</h4>
             </div>
             <div className="col-sm-3">
               <Button disabled={!this.props.team.canSubmit}
                onClick={() => this.setState({sbmFunction: this.doSubmit})}>
                  Submit Attempt
               </Button>
             </div>
           </div>
         </div>);
      }

      if (ctpName === "LandGrab") {
         prbDiagram = (<LandGrab className="clearfix"
             prms={cmp.prms} sbm={sbm}/>);
         sbmDialog = (<LGSubmitModal prms={cmp.prms}
             submitFn={this.state.sbmFunction}/>);
      }

      else if (ctpName === "Bounce") {
         prbDiagram = (<Bounce className="clearfix"
             prms={cmp.prms} sbm={sbm}/>);
         sbmDialog = (<LGSubmitModal prms={cmp.prms}
             submitFn={this.state.sbmFunction}/>);
      }

      return (<div className="container">
        <h1>{cmp.title}</h1>
        <br/>
        {sbmStatus}
        {prbDiagram}
        {sbmDialog}
      </div>);
   }
}
