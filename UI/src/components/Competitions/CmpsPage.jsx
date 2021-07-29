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
         cmpsByCtp: []
      }
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = {...oldState};
      
      if ((newProps.cmps !== oldState.cmps)||(newProps.showAll !== oldState.showAll)) {
         var cmpsByCtp = [];
         var cmpIds = Object.keys(newProps.cmps);
         var ctpIds = Object.keys(newProps.ctps);
         
         if(newProps.showAll===true){
            ctpIds.forEach(id => {cmpsByCtp[newProps.ctps[id].id] = [] });

            for (var i = 0; i < cmpIds.length; i++) {
               var id = parseInt(cmpIds[i]);
               cmpsByCtp[newProps.cmps[id].ctpId].push(newProps.cmps[id]);
            }
            return{
               showDeleteConfirmation:null,
               cmpsByCtp: cmpsByCtp
            }
            
         }else{
            for (var i = 0; i < newProps.prs.myCmps.length; i++) {
               var currentCmp = newProps.cmps[newProps.prs.myCmps[i]];
               console.log(currentCmp)
               if(currentCmp===undefined){
                  return{
                     showDeleteConfirmation:null,
                     cmpsByCtp:cmpsByCtp
                  }
               }
               if(currentCmp && typeof(cmpsByCtp[currentCmp.ctpId])!==Array)
                  cmpsByCtp[currentCmp.ctpId] = [currentCmp]
               else
                  cmpsByCtp[currentCmp.ctpId].push(currentCmp)
            }
         }
         return{
            showDeleteConfirmation:null,
            cmpsByCtp:cmpsByCtp
         }
      }
      rtn.cmps = newProps.cmps
      console.log(rtn)
      return rtn;
   }

   componentDidMount = () => {
      var props = this.props;
      if (props.showAll) {
         if (!props.updateTimes.cmps) {
            this.props.getAllCmps();
            this.props.getAllCtps();
         }
      }
      else {
         if (!props.updateTimes.myCmps) {
            this.props.getAllCtps();
            this.props.getCmpsByPrs(this.props.prs.id);
         }
      }
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
      console.log(this.state.expanded)
      var props = this.props;
      var ctps = Object.keys(props.ctps);
      var cmpsByCtpIds = Object.keys(this.state.cmpsByCtp)
      var cmpsByCtp=[...this.state.cmpsByCtp]
      if (Object.keys(props.cmps).length === 0) {
         return <div>
            ...Loading
         </div>
      }
      else {
         return (
            <section className="container">
               {props.showAll ?
                  <div className='grid'>
                     {ctps && ctps.map((ctpId, i) => {
                        var ctp =props.ctps[ctpId];
                        console.log(ctpId)

                        return <JoinCompetitionItem
                           key={i}
                           cmpsByCtp={this.state.cmpsByCtp[ctp.id]}
                           expanded={this.state.expanded[ctpId]}
                           toggle={() => this.toggleView(ctpId)}
                           {...ctp} />
                     })}
                  </div>
                  :
                  cmpsByCtpIds && cmpsByCtpIds.length ?
                     <div className='grid'>
                        {cmpsByCtpIds && cmpsByCtpIds.map((ctpId, i) => {
                           var ctp = props.ctps[ctpId-1]
                           var cmps = cmpsByCtp[ctpId]
                           console.log(ctpId-1)
                           return <ActiveCompetitionItem
                              key={i}
                              cmps={cmps}
                              {...ctp}
                              expanded={this.state.expanded[ctpId-1]}
                              toggle={() => this.toggleView(ctpId-1)} />
                        })}
                     </div>
                     :
                     <h4>You are not in any competitions, see Join Competitions to join one</h4>
               }
            </section>
         )
      }
   }
}

const ActiveCompetitionItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
         <div className='cmpItem'>{props.title}</div>
         <div>{props.description}</div>
         <Button onClick={props.toggle}>Show My Competitions</Button>
         {props.expanded ?
            props.cmps.map((cmp, i) => {
               var cmpItem = cmp;

               return <CmpItem
                  key={i}
                  link={'MyCmpPage/' + cmp.id}
                  title={cmpItem.title}
                  joined={true}
               />

            })

            : ""
         }

      </ListGroupItem>
   )
}

//CAS: This looks basically fine, though ditch the -1 per comments above.
// But, I don't understand why we need special cases above.  *Always* have
// this.state.cmpsByCtp, always an array, initially empty.  Assume it will
// *always* be there in render, and do one CompetitionTypeItem per element.
// Fill it in GDSFP.  The code above should be half as complex as it is.
const JoinCompetitionItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
         <div className='ctpItem'>{props.title}</div>
         <div>{props.description}</div>
         <Button onClick={props.toggle}>Show Competitions</Button>
         {props.expanded ?
            <ListGroup>
               {Object.keys(props.cmpsByCtp).map((cmpId, i) => {
                  var cmp = props.cmpsByCtp[cmpId];

                  return <CmpItem
                     key={i}
                     link={'/JoinCmpPage/' + cmp.id}
                     title={cmp.title} />
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
         {props.joined ?
            <div className="float-right">
               <Link to={props.link}>Status</Link>
            </div>
            :
            <div className="float-right">
               <Link to={props.link} >Join </Link>
            </div>
         }
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
