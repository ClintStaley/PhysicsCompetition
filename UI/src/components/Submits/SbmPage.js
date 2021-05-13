import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Bounce } from './Bounce'
import { BSubmitModal } from './BounceSubmitModal';
import { LandGrab, LGSubmitModal } from './LandGrab'
// import { Ricochet, RSubmitModal } from './Ricochet'

// Set up a page managing submissions for a competition and team.  This includes
// a submission dialog, automatic polling for a test result on any standing
// submission, and a display of the results.

// Expected props are:
//   cmp -- competition object to be worked with
//   team -- team object for the team reviewing/making a submission
export default class SbmPage extends Component {
   constructor(props) {
      super(props);

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
      this.setState({sbmFunction : null});
   }

   refreshSbm = () => {
      var current = this.props.sbms && this.props.sbms.current;

      if (current)
         if (current.testResult && this.timerId) {
            this.stopTimer();
         }
         else {
            this.setState({refreshNote: "Checking for results..."});
            this.props.refreshSbms(() => {
            if (current)  // CAS FIX: How is this ever false?
               this.props.getTeamsById(current.cmpId, current.teamId);
            else
               this.setState({refreshNote: "No results yet.."});
            });
         }
   }

   render() {
      var sbm, sbmTime, dateStr, timeStr,  sbmDialog;
      var cmp = this.state.cmp;
      var ctpName = this.state.ctpName;
      var sbmStatus = null;
      var prbDiagram = null;

      //console.log('Rendering SbmPage for ', this.state);

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
               <h4>{this.props.team.bestScore !== -1 ?
                `Best score: ${this.props.team.bestScore}` :
                'Best score: N/A'}</h4>
               <h4>{sbm.score != null ? `This score: ${sbm.score}` :
                this.state.refreshNote}</h4>
             </div>
           </div>
         </div>);
      }

      var sbmButton = (<div className="col-sm-3">
        <Button disabled={!this.props.team.canSubmit ||
         this.props.sbms.current && !this.props.sbms.current.testResult}
         onClick={() => this.setState({sbmFunction: this.doSubmit})}>
           Make Attempt
        </Button>
      </div>);

      if (ctpName === "LandGrab") {
         prbDiagram = (<LandGrab className="clearfix" prms={cmp.prms}
          sbm={sbm}/>);
         
          sbmDialog = (<LGSubmitModal prms={cmp.prms}
          submitFn={this.state.sbmFunction}/>);
      }
      else if (ctpName === "Bounce") {
         prbDiagram = (<Bounce className="clearfix"
          prms={cmp.prms} sbm={sbm}/>);
         
          sbmDialog = (<BSubmitModal prms={cmp.prms}
          submitFn={this.state.sbmFunction}/>);
      }
      /* Install later
      else if (ctpName === "Ricochet") {
         prbDiagram = (<Ricochet className="clearfix"
          prms={cmp.prms} sbm={sbm}/>);
         
         sbmDialog = (<RSubmitModal prms={cmp.prms}
          submitFn={this.state.sbmFunction}/>);
      }*/

        console.log(sbmDialog);
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
