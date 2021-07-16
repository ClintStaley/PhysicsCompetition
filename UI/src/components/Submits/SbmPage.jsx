import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Bounce } from './Bounce/Bounce';
import { BSubmitModal } from './Bounce/BounceSubmitModal';
import { LandGrab} from './LandGrab/LandGrab';
import { LGSubmitModal } from './LandGrab/LGSubmitModal';
import {Rebound} from './Rebound/Rebound';
import {ReboundSubmitDlg} from './Rebound/';

// Set up a page managing submissions for a competition and team.  This includes
// a submission dialog, automatic polling for a test result on any standing
// submission, and a display of the results.

// Expected props are:
//   cmp -- competition object to be worked with
//   team -- team object for the team reviewing/making a submission
export default class SbmPage extends Component {
   constructor(props) {
      super(props);

      this.cRefreshDelay = 2000; // Every 2s

      this.state = {
         sbmFunction: null,    // Function to support submit dialog
         refreshNote: "",      // Refresh update message
         ctpName: null,        // Type of page to load
         cmp: this.props.team && this.props.cmps[this.props.team.cmpId]
      }
   }

   // Whenever the component mounts, start the timer, and retrieve
   // the appropriate set of submissions for the current cmp/team
   componentDidMount = () => {
      this.props.getSbms(this.state.cmp, this.props.team.id,
       () => {
          this.setState({ctpName : this.props.sbms.ctpName});
          this.startTimer(); // CAS FIX: Shouldn't this happen only if there is a pending submit?
       });
   }

   // Stop the timer on unmount, to stop repeated polling when page is not
   // displayed.
   componentWillUnmount = () => {
      if (this.timerId)
         this.stopTimer();
   }

   startTimer = () => {
      if (this.timerId)
         this.stopTimer();
      this.timerId = setInterval(() => this.refreshSbm(), this.cRefreshDelay);
   }

   stopTimer = () => {
      this.timerId && clearInterval(this.timerId);
      this.timerId = null;
   }

   doSubmit = (submit) => {
      if (submit)
         this.props.postSbm(this.state.cmp.id, this.props.team.id, submit,
          () => this.startTimer());
      this.setState({sbmFunction : null, refreshNote: "Checking for results"});
   }

   refreshSbm = () => {
      var current = this.props.sbms && this.props.sbms.current;

      if (current)
         if (current.testResult) {
            this.setState({refreshNote: ""});
            this.stopTimer();
         }
         else {
            this.props.refreshSbms(() => {
               this.props.getTeamById(current.cmpId, current.teamId);
               this.setState({refreshNote: this.state.refreshNote + ".."})
            });
         }
   }

   render() {
      var sbm, sbmTime, dateStr, timeStr,  sbmDialog;
      var cmp = this.state.cmp;
      var ctpName = this.state.ctpName;
      var bestScore;
      var sbmStatus;
      var prbDiagram = null;

      bestScore = this.props.team.bestScore !== -1 ?
       `Best score: ${this.props.team.bestScore.toFixed(2)}` :
       'Best score: N/A';

      if (this.props.sbms.current) {
         sbm = this.props.sbms.current;
         sbmTime = new Date(sbm.sbmTime);
         dateStr = sbmTime.toLocaleDateString('en-US',
          {month:"short", day:"numeric"});
         timeStr = sbmTime.toLocaleTimeString();

         sbmStatus = (<div className="panel container">
           <h3>Status of your last submission</h3>
           <div className="row">
             <div className="col-sm-9">
               <h4>Submission received at {timeStr} on {dateStr}</h4>
               <h4>{!sbm.testResult ? this.state.refreshNote : 
                sbm.score !== null ? `Score: ${sbm.score.toFixed(2)}`
                : "Not valid solution"}</h4>
             </div>
           </div>
         </div>);
      }
      else
         sbmStatus 
          = <div><h2>Your team has made no design submissions yet.</h2></div>;

      var sbmButton = (<div className="col-sm-3 float-right">
        <Button disabled={!this.props.team.canSubmit ||
         this.props.sbms.current && !this.props.sbms.current.testResult}
         onClick={() => this.setState({sbmFunction: this.doSubmit})}>
           {this.props.sbms.current 
            ? "Make Another Attempt" : "Make First Attempt"}
        </Button>
      </div>);

      if (ctpName === "LandGrab") {
         prbDiagram = (<LandGrab className="clearfix" prms={cmp.prms}
          sbm={sbm}/>);
         
          sbmDialog = (<LGSubmitModal prms={cmp.prms}
          submitFn={this.state.sbmFunction}/>);
      }
      else if (ctpName === "Bounce") {
         prbDiagram = (<Bounce
          prms={cmp.prms} sbm={sbm}/>);
         
          sbmDialog = (<BSubmitModal prms={cmp.prms}
          submitFn={this.state.sbmFunction}/>);
      }
      /* Install later
      else if (ctpName === "Rebound") {
         prbDiagram = (<Rebound className="clearfix"
          prms={cmp.prms} sbm={sbm}/>);
         
         sbmDialog = (<ReboundSubmitDlg prms={cmp.prms}
          submitFn={this.state.sbmFunction}/>);
      }*/

      return (<div className="container">
        <h1>{cmp.title}<span className="float-right">{bestScore}</span></h1>
        {sbmButton}
        <br/>
        {sbmStatus}
        <br/>
        {prbDiagram}
        {sbmDialog}
      </div>);
   }
}
