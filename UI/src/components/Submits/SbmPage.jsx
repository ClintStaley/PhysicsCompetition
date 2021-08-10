import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import {Bounce} from './Bounce/Bounce';
import {BSubmitModal} from './Bounce/BounceSubmitModal';
import {LandGrab} from './LandGrab/LandGrab';
import {LGSubmitModal} from './LandGrab/LGSubmitModal';
import {Rebound} from './Rebound/Rebound';
import {RbnSubmitModal} from './Rebound/RbnSubmitModal';

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
         cmp: this.props.team && this.props.cmps[this.props.team.cmpId],
         teamId: this.props.team.id,
      }
   }

   // Whenever the component mounts, start the timer, and retrieve
   // the appropriate set of submissions for the current cmp/team
   componentDidMount = () => {
      this.props.getSbms(this.state.cmp, this.state.teamId,
       () => {
          this.setState({ctpName : this.props.sbms[this.state.teamId].ctpName});
          this.startTimer(); // CAS FIX: Shouldn't this happen only if there is a pending submit? No we still need it to update for sbms from other users
       });
   }

   // Stop the timer on unmount, to stop repeated polling when page is not
   // displayed.
   componentWillUnmount = () => {
      if (this.timerId)
         this.stopTimer();
   }

   //used to refresh sbm if not present
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
         this.props.postSbm(this.state.cmp.id, this.state.teamId, submit,
          () => this.startTimer());
      this.setState({sbmFunction : null, refreshNote: "Checking for results"});
   }

   openInstructions = () => {
      var link = '/Docs/Cmps/';
      var ctpName = this.state.ctpName
      var cmpType = this.state.cmp.hints //later change to have index for instructions
      link = link.concat(ctpName + '/Hints/' + cmpType + '/Instructions.html');
 
      window.open(link, "_blank");
   }

   refreshSbm = () => {
      var current = this.props.sbms && 
       this.props.sbms[this.state.teamId].current; // current is current Sbm
      if (current){
         if (current.testResult) {
            this.setState({refreshNote: ""});
            this.stopTimer();
         }
      
         
            this.props.refreshSbms(current.cmpId, current.teamId, () => {
               this.props.getTeamById(current.cmpId, current.teamId);
               this.setState({refreshNote: this.state.refreshNote + ".."})   
            });
         
      }
   }

   render() {
      var sbm, sbmTime, dateStr, timeStr, sbmDialog;
      var cmp = this.state.cmp;
      var ctpName = this.state.ctpName;
      var bestScore;
      var sbmStatus;
      var prbDiagram = null;
      var teamsSbms = this.props.sbms[this.props.team.id];

      bestScore = this.props.team.bestScore !== -1 ?
       `Best score: ${this.props.team.bestScore.toFixed(2)}` :
       'Best score: N/A';
      if (teamsSbms && teamsSbms.current) {
         sbm = teamsSbms.current; // current submission for this team
         sbmTime = new Date(sbm.sbmTime);
         dateStr = sbmTime.toLocaleDateString('en-US',
          {month:"short", day:"numeric"});
         timeStr = sbmTime.toLocaleTimeString();
         if (sbm.testResult) // if sbm has been evaluated
            sbmStatus = (
             <div className="panel container">
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
         sbm && !sbm.testResult}
         onClick={() => this.setState({sbmFunction: this.doSubmit})}>
           {sbm ? "Make Another Attempt" : "Make First Attempt"}
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
      else if (ctpName === "Rebound") {
         prbDiagram = (<Rebound className="clearfix"
          prms={cmp.prms} sbm={sbm}/>);
         sbmDialog = (<RbnSubmitModal prms={cmp.prms}
          submitFn={this.state.sbmFunction}/>);
      }

      return (<div className="container">
        <h1>{cmp.title}<span className="float-right">{bestScore}</span></h1>
        {sbmButton}
        <br/>
        
        {sbmStatus}
        <br/>
         <div className = "instructionLink">
          <a onClick = {this.openInstructions}>Hints</a>
         </div>
        <br/>
        {prbDiagram}
        {sbmDialog}
      </div>);
   }
}
