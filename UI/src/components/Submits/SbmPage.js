import React, { Component } from 'react';
import { ConfDialog } from '../concentrator';
import * as api from '../../api';

// Expected props are:
//   cmp -- competition object to be worked with
//   team -- team object for the team reviewing/making a submission
export default class SbmPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         ctpTitle: "", // Name of competition type (of first and all submits)
         sbms: null   // Current submission history.
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
         .then(ctp => ({ctpTitle: ctp.title, sbms})))
      .then((newState) => this.setState(newState));
      //.catch((errList) => dsp({type: 'SHOW_ERR', details: errList})// use props.team.id and props.cmp.id to update sbm
   }

   render() {
      var cmp = this.props.cmp;
      var sbm = this.state.sbms && this.state.sbms[0];
      var ctpTitle = this.state.ctpTitle;

      return (
         <div>
            <h2>{ctpTitle}</h2>
            <h2>{cmp.title}</h2>
            <h3>{JSON.stringify(cmp.prms)}</h3>
            <h3>{sbm && JSON.stringify(sbm.content)}</h3>
            <h3>{sbm && JSON.stringify(sbm.testResult)}</h3>
         </div>
      );
   }
}
