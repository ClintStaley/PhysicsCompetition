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
         cmpsByCtp: []
      }
   }

   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.cmps !== oldState.cmps) {
         var cmpIds = Object.keys(newProps.cmps);
         var ctpIds = Object.keys(newProps.ctps);

         ctpIds.forEach(id => { rtn.cmpsByCtp[newProps.ctps[id].id] = [] })

         for (var i = 0; i < cmpIds.length; i++) {
            var id = parseInt(cmpIds[i]);
            rtn.cmpsByCtp[newProps.cmps[id].ctpId].push(newProps.cmps[id]);
         }
      }
      rtn.cmps = newProps.cmps
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
         if (!props.updateTimes.myCmps){
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
      var props = this.props;
      var cmps = props.showAll ? Object.keys(props.cmps) : props.prs.myCmps;
      var ctps = Object.keys(props.ctps);
      var prs = props.prs
      console.log(this.state)

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
                        var ctp = Object.assign({}, props.ctps[ctpId]);

                        return <JoinCompetitionItem
                           key={i}
                           cmpsByCtp={this.state.cmpsByCtp[ctp.id]}
                           expanded={this.state.expanded[ctpId]}
                           toggle={() => this.toggleView(ctpId)}
                           {...ctp} />
                     })}
                  </div>
                  :
                  prs.myCmps && prs.myCmps.length ?
                     <div className='grid'>
                        {prs.myCmps.map((cmpId, i) => {
                           var cmp = props.cmps[cmpId];
                           var ctp = props.ctps[cmp.ctpId - 1];
                           var cmpsByCtp = [...this.state.cmpsByCtp[ctp.id]];

                           //Eliminate cmps of type ctp.id from cmpsByCtp if the 
                           //user is not in the competition
                           cmpsByCtp.forEach((element,index)=>{
                              if(props.prs.myCmps.includes(element.id)){}
                              else{cmpsByCtp.splice(index,1)}})

                           return <ActiveCompetitionItem key={i}
                           {...ctp}
                           cmps={cmps}
                           cmpsByCtp ={cmpsByCtp} 
                           expanded= {this.state.expanded[ctp.id]}
                           toggle={()=>this.toggleView(ctp.id)}/>
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
            <ListGroup>
               {
                  props.cmpsByCtp.map((cmp,i)=>{
                     var cmp = cmp;

                     return <CmpItem 
                     key={i}
                     link={'MyCmpPage/'+cmp.id}
                     title={cmp.title}
                     joined={true}
                        />

                  })
               }
            </ListGroup>
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
