import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../actions/actionCreators';
import { ListGroup, ListGroupItem, Button, FormText} from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import './cmp.css';

class CmpsPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         showDeleteConfirmation: null,
         expanded: {}
      }
   }

   componentDidMount = () => {
      var props = this.props;

      //if (!(props.updateTimes && props.updateTimes.myTeams))
      //   this.props.getTeamsByPrs(this.props.prs.id);

      if (props.showAll) {
         if (!props.updateTimes.cmps){
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
      this.setState({showDeleteConfirmation: null})
   }

   openConfirmation = (cmpId) => {
      this.setState({showDeleteConfirmation: cmpId })
   }

   // toggleView = (ctpId) =>{
   //    var expanded = this.state.expanded;
   //    expanded[ctpId] = !expanded[ctpId];

   //    var cmpIds = Object.keys(this.props.cmps)
   //    console.log(cmpIds)
      
   //    //Check CompetitionType data; update if no Competition data is available
   //    if(Object.keys(this.props.ctps[ctpId].cmps).length===0){
   //       console.log("HERE")
   //       cmpIds.forEach(cmpId =>{
   //          console.log(cmpId);
   //          console.log(this.props.cmps[cmpId])
   //          console.log(this.props.ctps[ctpId])
   //          console.log(this.props.ctps[ctpId])
   //          this.props.ctps[ctpId]
   //          this.props.ctps[ctpId].cmps[cmpId] = this.props.cmps[cmpId];
   //          console.log(this.props.ctps[ctpId].cmps)
   //       })
   //    }
   //    else
   //       this.setState({expanded});
   // }


   toggleView = (ctpId =>{
      var expanded = this.state.expanded;
      var ctps = this.props.ctps;
      var cmps = this.props.cmps;
      expanded[ctpId] = !expanded[ctpId];

      var cmpIds = Object.keys(this.props.cmps);
      console.log(cmpIds)
      console.log(cmpIds.length)

      if(this.props.ctps[ctpId].cmps.length===0){
         for(var i = 0; i<cmpIds.length;i++){
            console.log(ctps[cmps[cmpIds[i].ctpId]])
            ctps[cmps[cmpIds[i].ctpId-1]].cmps[cmpIds[i]] = cmps[cmpIds[i]]
         }
         this.setState({expanded});
      }
      else
         this.setState({expanded});
   })

   render() {
      var props = this.props;
      console.log(props);
      var cmps = props.showAll ? Object.keys(props.cmps) : props.prs.myCmps;
      var ctps =  Object.keys(props.ctps);

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
      
      return (
      <section className="container"> 
       {props.showAll ?
       <div className='grid'>
          {ctps && ctps.map((ctpId, i)=>{
             var ctp = Object.assign({},props.ctps[ctpId]);

             return<CompetitionTypeItem
              key={i}
              expanded = {this.state.expanded[ctpId]}
              toggle = {()=>this.toggleView(ctpId)}
             {...ctp}/>
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

          return <CompetitionItem key={i} {...cmp}/>
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
               <Link to = {props.link} >Join this Competition</Link>
            : 
            <div>
               <Link to = {props.link}>Competition Status</Link>
            </div>
         }
      </ListGroupItem>
   )
}

const CompetitionTypeItem = function(props){
   console.log(props.expanded)
   return(
      <ListGroupItem className="clearfix">
         <div className='ctpItem'>{props.title}</div>
         <div>{props.description}</div>
         <Button onClick={props.toggle}>Show Competitions</Button>
         {/* {props.expanded ?
         // <ListGroup>
         //    {Object.keys(props.cmps).map((cmpId,i)=>{
         //       var cmp = props.cmp [cmpId];

         //       return <CmpItem key={i} title={cmp.title} />
         //    })}
         // </ListGroup>
         :"" */}
         {/* } */}
      </ListGroupItem>
   )
}

const CmpItem = function (props) {
   return(
      <ListGroupItem className ="clearfix">
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
