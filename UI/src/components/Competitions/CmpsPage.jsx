import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../actions/actionCreators';
import { ListGroup, ListGroupItem, Button, FormText } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import './cmp.css';

class CmpsPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         showDeleteConfirmation: null,
         expanded: {},
         cmps: {},
         ctps: [],
         cmpsByCtp: []
      }
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.cmps !== oldState.cmps) {
            var cmpIds = Object.keys(newProps.cmps);
            var ctpIds = Object.keys(newProps.ctps);
            ctpIds.forEach(id => {
               rtn.cmpsByCtp[newProps.ctps[id].id] = []
            })
            cmpIds.forEach(id => {
               rtn.cmpsByCtp[newProps.cmps[id].ctpId].push(newProps.cmps[id]);
            })
      }
      return rtn;
   }

   componentDidMount = () => {
      var props = this.props;

      //if (!(props.updateTimes && props.updateTimes.myTeams))
      //   this.props.getTeamsByPrs(this.props.prs.id);

      if (props.showAll) {
         if (!props.updateTimes.cmps) {
            this.props.getAllCmps();
            this.props.getAllCtps();

         }
      }
      else
         if (!props.updateTimes.myCmps)
            this.props.getCmpsByPrs(this.props.prs.id);
   }

   componentDidUpdate = this.componentDidMount;

   // Thus far the only confirmation is for a delete.
   closeConfirmation = (res, cmpId) => {
      if (res === 'Yes') {
         this.props.deleteCmp(this.props.cmps[cmpId].cmpId, cmpId);
      }
      this.setState({ showDeleteConfirmation: null })
   }

   openConfirmation = (cmpId) => {
      this.setState({ showDeleteConfirmation: cmpId })
   }

   toggleView = (ctpId => {
      var expanded = this.state.expanded;
      expanded[ctpId] = !expanded[ctpId];

      this.setState({ expanded });

   })

   render() {
      var props = this.props;
      var cmps = props.showAll ? Object.keys(props.cmps) : props.prs.myCmps;
      var ctps = Object.keys(props.ctps);

      // Create an array called cmpsByCtp, indexed by ctp.id, with values
      // that are themselves arrays of cmps.
      // Pass through all cmps, assigning every one of them into the relevant
      // eleemnt of cmpsByCtp.
      // Now, loop through cmpsByCtp to create one CompetitionItem per ctp,
      // passing the array of cmps as one of the properties, so the 
      // CompetitionItem can display (or not, depending on expanded) the
      // cmps under it.
      // Toggle does not do this work; it just changes the state.expanded
      // flags to control the appearance of the CompetitionItems.  Each
      // CompetitionItem always has a full list of its cmps, whether it
      // shows it or not.

      // CAS still not seeing why we need both these branches...
      // There should be just **one** loop making a set of
      // CompetitionTypeItems, one per index of 
      return (
         <section className="container">
            {props.showAll ?
               <div className='grid'>
                  {ctps && ctps.map((ctpId, i) => {
                     var ctp = Object.assign({}, props.ctps[ctpId]);

                     return <CompetitionTypeItem
                        key={i}
                        cmpsByCtp={this.state.cmpsByCtp}
                        expanded={this.state.expanded[ctpId]}
                        toggle={() => this.toggleView(ctpId)}
                        {...ctp} />
                  })}
               </div>
               :
               cmps && cmps.length ?
                  <div className='grid'>
                     {cmps.map((cmpId, i) => {
                        var cmp = Object.assign({}, props.cmps[cmpId]);

                        cmp.link = '/MyCmpPage/' + cmp.id;
                        cmp.joiningCmp = props.showAll;
                        cmp.joined = false;

                        return <CompetitionItem key={i} {...cmp} />
                     })}
                  </div>
                  :
                  <h4>You are not in any competitions, see Join Competitions to join one</h4>
            }
         </section>
      )
   }
}

const CompetitionItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
         <div className='cmpItem'>{props.title}</div>
         <div>{props.description}</div>
         {props.joiningCmp ?
            props.joined ?
               <div>(already joined)</div>
               :
               <Link to={props.link} >Join this Competition</Link>
            :
            <div>
               <Link to={props.link}>Competition Status</Link>
            </div>
         }
      </ListGroupItem>
   )
}

//CAS: This looks basically fine, though ditch the -1 per comments above.
// But, I don't understand why we need special cases above.  *Always* have
// this.state.cmpsByCtp, always an array, initially empty.  Assume it will
// *always* be there in render, and do one CompetitionTypeItem per element.
// Fill it in GDSFP.  The code above should be half as complex as it is.
const CompetitionTypeItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
         <div className='ctpItem'>{props.title}</div>
         <div>{props.description}</div>
         <Button onClick={props.toggle}>Show Competitions</Button>
         {props.expanded ?
            <ListGroup>
               {Object.keys(props.cmpsByCtp[props.id]).map((cmpId, i) => {
                  var cmp = props.cmpsByCtp[props.id ][cmpId];

                  return <CmpItem key={i} title={cmp.title} />
               })}
            </ListGroup>
            : ""
         }
      </ListGroupItem>
   )
}

const CmpItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
         {props.title}
      </ListGroupItem>
   )
}

//makes CmpsPage a container componet, rather than a presentational componet
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
