import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actionCreators from '../../actions/actionCreators';
import {ListGroup, ListGroupItem, Button} from 'react-bootstrap';
import ReactTooltip from 'react-tooltip';
import './cmp.css';

// Properties:
// showAll: Show panels for all available competitions, else just those whose
//  ids are in prs.myCmps.
// ctps: Competitions types, from redux store
// cmps: Competitions, from redux store

class CmpsPage extends Component {
   // Important prop to understand is the showAll property
   // showAll == true -> joinCmps page, else activeCmpsPage
   constructor(props) {
      super(props);
      this.state = {
         showDeleteConfirmation: null,
         expanded: {},
         cmpsByCtp: [],
      }
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if ((newProps.cmps !== oldState.cmps) || (newProps.showAll !==
       oldState.showAll)) {
         var cmpsByCtp = [];
         var cmpIds = Object.keys(newProps.cmps);
         var ctpIds = Object.keys(newProps.ctps);

         // Create state for Join Competitions page
         if (newProps.showAll) {
            cmpIds.forEach(id => {
               var ctpId = newProps.cmps[id].ctpId;
               
               if (!cmpsByCtp[ctpId])
                  cmpsByCtp[ctpId] = [];
               cmpsByCtp[ctpId].push(newProps.cmps[id]);
            });
         }

         // Create state for Active Competitions page limiting cmpsByCtp to my
         // current competitions.
         else { 
            for (var i = 0; i < newProps.prs.myCmps.length; i++) {
               var currentCmp = newProps.cmps[newProps.prs.myCmps[i]];
             
               if (currentCmp) {
                  if (!cmpsByCtp[currentCmp.ctpId])
                     cmpsByCtp[currentCmp.ctpId] = [currentCmp];
                  else
                     cmpsByCtp[currentCmp.ctpId].push(currentCmp);
               }
            }
         }
         rtn = {
            showDeleteConfirmation: null,
            cmpsByCtp,
            showAll: newProps.showAll
         }
      }

      return rtn;
   }

   componentDidMount = () => {
      var props = this.props;

      if (props.showAll) {
         if (!props.updateTimes.cmps) {
            this.props.getAllCtps();
            this.props.getAllCmps();
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
      this.setState({ showDeleteConfirmation: null });
   }

   openConfirmation = (cmpId) => {
      this.setState({ showDeleteConfirmation: cmpId });
   }

   // Open instructions for ctp with indicated codename
   openInstructions = (ctpCodeName) => {
      var link
       = `${process.env.PUBLIC_URL}/Docs/Cmps/${ctpCodeName}/Instructions.html`;

      window.open(link, "_blank");
   }
 
   // render uses ternary operator on showAll prop to decide which page to load
   render() {
      var props = this.props;
      var ctpIds = Object.keys(props.ctps);
      var cmpsByCtpIds = Object.keys(this.state.cmpsByCtp)
      var cmpsByCtp = this.state.cmpsByCtp;

      return (
         <section className="container">
            {props.showAll ?
               <div className='grid'>
                  {ctpIds && ctpIds.map((ctpId, i) => {
                     var ctp = props.ctps[ctpId];

                     return <JoinCompetitionItem
                        key={i}
                        cmpsByCtp={this.state.cmpsByCtp[ctp.id]}
                        expanded={this.state.expanded[ctpId]}
                        openInstructions
                         ={() => this.openInstructions(ctp.codeName)}
                        {...ctp} />
                  })}
               </div>
               :
               cmpsByCtpIds && cmpsByCtpIds.length ?
                  <div className='grid'>
                     {cmpsByCtpIds && cmpsByCtpIds.map((ctpId, i) => {
                        var ctp = props.ctps[ctpId];
                        var cmps = cmpsByCtp[ctpId];
                        return <ActiveCompetitionItem
                           key={i}
                           cmps={cmps}
                           expanded={this.state.expanded[ctpId]}
                           {...ctp} />
                     })}
                  </div>
                  :
                  <h4>You are not in any competitions, see Join Competitions
                     to join one</h4>
            }
         </section>
      )
   }
}

const ActiveCompetitionItem = function (props) {
   const [expanded, setExpanded] = React.useState(false);
   var toggleView = (() => setExpanded(!expanded));
   
   return (
      <div className="clearfix cmpPanel">
         <div className='cmpHeader'>{props.title}</div>
         <div>{props.description}</div>
         <Button onClick={toggleView}>Show My Competitions</Button>
         {expanded ?
            <ListGroup>{
               props.cmps.map((cmp, i) => {
                  return <CmpItem
                     key={i}
                     link={'MyCmpPage/' + cmp.id}
                     title={cmp.title}
                     joined={true}
                     description={cmp.description}
                  />
               })}
             </ListGroup>
            : ""
         }
      </div>
   )
}

const JoinCompetitionItem = function (props) {
   const [expanded, setExpanded] = React.useState(false);
   var toggleView = (() => setExpanded(!expanded));
   return (
      <div className="clearfix cmpPanel">
         <div className='cmpHeader'>{props.title}</div>
         <div className = "instructionLink">
            <a onClick = {props.openInstructions}>Instructions</a>
         </div>
         <Button onClick={toggleView}>Show Competitions</Button>
         {expanded ?
            <ListGroup>
               {Object.keys(props.cmpsByCtp).map((cmpId, i) => {
                  var cmp = props.cmpsByCtp[cmpId];

                  return <CmpItem
                     key={i}
                     link={'/JoinCmpPage/' + cmp.id}
                     title={cmp.title} 
                     description={cmp.description}
                  />
               })}
            </ListGroup>
            : ""
         }
      </div>
   )
}

const CmpItem = function (props) {
   return (
      <ListGroupItem className="clearfix" data-tip={props.description}>
         <ReactTooltip/>
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

//makes CmpsPage a container component, rather than a presentational component
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
