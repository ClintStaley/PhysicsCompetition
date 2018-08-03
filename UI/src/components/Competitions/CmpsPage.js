import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../actions/actionCreators';
import { ListGroup, ListGroupItem, Button, Glyphicon, Tabs, Tab} from 'react-bootstrap';
import { ConfDialog } from '../concentrator';


class CmpsPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         showDeleteConfirmation: null
      }
   }

   componentDidMount = () => {
      var props = this.props;

      if (props.showAll) {
         if (!props.updateTimes.cmps)
            this.props.getAllCmps();
      }
      else
         if (!props.updateTimes.myCmps)
            this.props.getMyCmps(this.props.prs.id);
   }

   componentDidUpdate = () => {
      var props = this.props;

      if (props.showAll) {
         if (!props.updateTimes.cmps)
            this.props.getAllCmps();
      }
      else
         if (!props.updateTimes.myCmps)
            this.props.getMyCmps(this.props.prs.id);

   }

   // Thus far the only confirmation is for a delete.
   closeConfirmation = (res, cmpId) => {
      if (res === 'Yes') {
         this.props.deleteCmp(this.props.cmps[cmpId].cmpId, cmpId);
      }
      this.setState({showDeleteConfirmation: null})
   }

   openConfirmation = (cmpId) => {
      this.setState({showDeleteConfirmation: cmpId })
   }

   render() {
      var props = this.props;
      var cmps = props.showAll ? Object.keys(props.cmps) : props.prs.myCmps;

      return (
      <section className="container">
      {console.log(props)}
      <ConfDialog
        show={this.state.showDeleteConfirmation  != null }bit
        title="Delete Competition"
        body={`Are you sure you want to delete the Competition
         '${this.state.showDeleteConfirmation}'`}
        buttons={['Yes', 'Abort']}
        onClose={(res) =>
        this.closeConfirmation(res, this.state.showDeleteConfirmation)} />
        <h1>{props.showAll ? 'Join Competition' :  'My Competitions' }</h1>

        {props.showAll ?
           <ListGroup>
              {cmps.map((cmpId, i) => {
                var cmp = props.cmps[cmpId];

                cmp.link = '/JoinCmpPage/' + cmp.id;
                cmp.joiningCmp = props.showAll;
                cmp.joined = props.prs.myCmps.includes(cmpId);

                return <CompetitionItem
                  key={i} {...cmp}/>
              })}
           </ListGroup>
          :
          cmps.length ?
          <ListGroup>
           {cmps.map((cmpId, i) => {
             var cmp = props.cmps[cmpId];

             cmp.link = '/MyCmpPage/' + cmp.id;
             cmp.joiningCmp = props.showAll;
             cmp.joined = false;

             return <CompetitionItem key={i} {...cmp}/>
           })}
           </ListGroup>
           :
           <h4>You are not in any competitions</h4>

       }
      </section>
      )
  }
}

const CompetitionItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
         <Link to = {props.link} >{props.title}</Link>
          {props.joined ? '(already joined)' : ''}

          {props.joiningCmp ?
          <div className="pull-right">
            <Link to = {props.link} >See Teams</Link>
          </div>
          : ''}

          {props.joiningCmp ?
          <div>
           <div>{props.description}</div>
         </div>
         : ''}
      </ListGroupItem>
   )
}

//makes CmpsPage a container componet, rather than a presentational componet
// CAS FIX: I am impressed at your effort to reduce what we might call
// "props footprint", but let's take it to the full level.  For instance,
// do changes to teams or ctps necessitate a rerender of this componeent?
// And, do changes to all updateTimes require it, or just updateTimes.cmps
// and updateTimes.mycmps?
function mapStateToProps(state) {
   return {
      prs: state.prs,
      cmps: state.cmps,
      updateTimes: state.updateTimes
   }
}

function mapDispatchToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

//connects CmpsPage to the store
CmpsPage = connect(mapStateToProps, mapDispatchToProps)(CmpsPage)
export default CmpsPage
