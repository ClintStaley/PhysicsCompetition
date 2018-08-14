import React, { Component } from 'react';
import { ConfDialog } from '../concentrator';
import { Button } from 'react-bootstrap';
import {LandGrab, LGSubmitModal} from './LandGrab'
import * as api from '../../api';

// Expected props are:
//   cmp -- competition object to be worked with
//   team -- team object for the team reviewing/making a submission
export default class SbmPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         ctpCodeName: "",  // Ctp codeName (of first and all submits)
         sbms: null,       // Current submission history.
         sbmFunction: null // Function to support modal submit dialog
      }
   }

   componentDidMount = () => {
      this.updateSbms();
   }

   // Fetch relevant sbm(s) and also the ctp name, updating state as
   // a single step since ctpName is essential to display of sbms.
   updateSbms = () => {
      api.getSbms(this.props.cmp.id, this.props.team.id, 1)
      .then(sbms => api.getCtpById(this.props.cmp.ctpId)
         .then(ctp => ({ctpCodeName: ctp.codeName, sbms})))
      .then((newState) => this.setState(newState));
      //.catch((errList) => dsp({type: 'SHOW_ERR', details: errList})// use props.team.id and props.cmp.id to update sbm
   }

   doSubmit = (submit) => {
      if (submit)
         api.postSbm(this.props.cmp.id, this.props.team.id, submit)
         .then(uri => api.get(uri))
         .then(newSbm => {this.setState( // Add new sbm to state; close dialog
            {sbms: [newSbm].concat(this.state.sbms), sbmFunction: null}
         )});
   }

   render() {
      var sbm, sbmTime, dateStr, timeStr, sbmFunction, sbmDialog;
      var cmp = this.props.cmp, ctpCodeName = this.state.ctpCodeName;
      var sbmStatus = null;
      var prbDiagram = null;

      if (this.state.sbms && this.state.sbms.length > 0) {
         sbm = this.state.sbms[0];
         sbmTime = new Date(sbm.sbmTime);
         dateStr = sbmTime.toLocaleDateString('en-US',
          {month:"short", day:"numeric"});
         timeStr = sbmTime.toLocaleTimeString();

         sbmStatus = (<div className="panel container">
           <h2>Status of your last submission</h2>
           <div className="row">
             <div className="col-sm-9">
               <h4>Submission received at {timeStr} on {dateStr}</h4>
               <h4>{sbm.score ? `Score: ${sbm.score}` : "Result pending..."}</h4>
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

      if (ctpCodeName === "LandGrab") {
         prbDiagram = (<LandGrab className="clearfix"
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
