import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Bounce, BSubmitModal } from './Bounce'
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
         sbmFunction: null,                // Function to support submit dialog
         refreshNote: "No results yet...", // Refresh state
         ctpName: null,                    // Type of page to load
         cmp: this.props.team && this.props.cmps[this.props.team.cmpId]
      }
   }

   // Whenever the component mounts, start the timer, and retrieve
   // the appropriate set of submissions for the current cmp/team
   componentDidMount = () => {
      console.log("mount");
      this.props.getSbms(this.state.cmp, this.props.team.id,
       () => {
          this.setCtpType();
          this.startTimer(); // Shouldn't this happen only if there is a pending submit?
       });
   }

   // Stop the timer on unmount, to stop repeated polling when page is not
   // displayed.
   componentWillUnmount = () => {
      if (this.timerId)
         this.stopTimer();
   }

   setCtpType = () => {
      this.setState({ctpName : this.props.sbms.ctpName});
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
      this.setState({sbmFunction : null});
   }

   refreshSbm = () => {
      var current = this.props.sbms && this.props.sbms.current;

      if (current)
         if (current.testResult && this.timerId){
            this.stopTimer();
         }
         else {
            this.setState({refreshNote: "Checking for results..."});
            this.props.refreshSbms(() => {
            if (current)
               this.props.getTeamsById(current.cmpId, current.teamId);
            else
               this.setState({refreshNote: "No results yet.."});
          }
            );
         }
   }

   render() {
      var sbm, sbmTime, dateStr, timeStr,  sbmDialog;
      var cmp = this.state.cmp, ctpName;
      var sbmStatus = null;
      var prbDiagram = null;

      ctpName = this.state.ctpName;

      if (this.props.sbms.current) {
         sbm = this.props.sbms.current;
         sbmTime = new Date(sbm.sbmTime);
         dateStr = sbmTime.toLocaleDateString('en-US',
          {month:"short", day:"numeric"});
         timeStr = sbmTime.toLocaleTimeString();

         sbmStatus = (<div className="panel container">
           <h2>Status of your last submission</h2>
           <div className="row">
             <div className="col-sm-9">
               <h4>Submission received at {timeStr} on {dateStr}</h4>
               <h4>{this.props.team.bestScore !== -1 ? `Best score: ${this.props.team.bestScore}` :
                'Best score: NA'}</h4>
               <h4>{sbm.score != null ? `This score: ${sbm.score}` :
                this.state.refreshNote}</h4>
             </div>
           </div>
         </div>);
      }

      var sbmButton = (<div className="col-sm-3">
        <Button disabled={(!this.props.team.canSubmit) ||
            (this.props.sbms.current && !this.props.sbms.current.testResult)}
         onClick={() => this.setState({sbmFunction: this.doSubmit})}>
           Submit Attempt
        </Button>
      </div>);

      if (ctpName === "LandGrab") {
         prbDiagram = (<LandGrab className="clearfix"
             prms={cmp.prms} sbm={sbm}/>);
         sbmDialog = (<LGSubmitModal prms={cmp.prms}
             submitFn={this.state.sbmFunction}/>);
      }

      else if (ctpName === "Bounce") {
         prbDiagram = (<Bounce className="clearfix"
             prms={cmp.prms} sbm={sbm}/>);
         sbmDialog = (<BSubmitModal prms={cmp.prms}
             submitFn={this.state.sbmFunction}/>);
      }

      return (<div className="container">
        <h1>{cmp.title}</h1>
        <br/>
        {sbmButton}
        {sbmStatus}
        {prbDiagram}
        {sbmDialog}
      </div>);
   }
}
