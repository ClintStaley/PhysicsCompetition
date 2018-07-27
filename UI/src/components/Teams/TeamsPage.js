import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ListGroup, ListGroupItem, Button, Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import * as actionCreators from '../../actions/actionCreators';
import TeamModal from './TeamModal'

class TeamsPage extends Component {
   constructor(props) {
      super(props);
console.log("teamPage rerender");
      this.state = {
         showConfirmation: null,
         modalTeamId: null,
         expanded: {}
      }

      this.props.getTeamsByPrs(this.props.prs.id);
      console.log(JSON.stringify(this.props.teams));
   }

   openConfirmation = (teamId) => {
      this.setState({showConfirmation: teamId})
   }

   // Thus far the only confirmation is for a delete.
   closeConfirmation = (res, teamId) => {
      if (res === 'Yes') {
         this.props.delTeam(this.props.teams[teamId].cmpId, teamId);
      }
      this.setState({showConfirmation: null})
   }

   openConfirmation = (teamId) => {
      this.setState({showConfirmation: teamId })
   }

   openModal = (teamId) => {
      if (this.props.teams[teamId].mmbs ||
       this.props.teams[teamId].mmbs.length){
         this.props.getMmbs(this.props.teams[teamId].cmpId, teamId,
          () => this.setState({ modalTeamId: teamId }) );
       }
   }

   dismissModal = (teamId, result) => {
      if (result.status === "OK") {
         this.props.putTeam(this.props.teams[teamId].cmpId, teamId,
          result.updatedTeam);
      }
      this.setState({modalTeamId: null});
   }

   toggleView = (teamId) => {
      //check for membership data, only update when no membership data is available
      console.log("Toggling " + JSON.stringify(this.props.teams[teamId]));
      if (Object.keys(this.props.teams[teamId].mmbs).length === 0) {
         this.props.getMmbs(this.props.teams[teamId].cmpId, teamId);
      }

      var expanded = this.state.expanded;
      expanded[teamId] = !expanded[teamId];
      this.setState({expanded});
   }

   delTeam = (teamId) => {
      this.props.delTeam(this.props.teams[teamId].cmpId, teamId);
   }

   delMmb = (mmbId, teamId) => {
      //add del member
      this.props.delTeam(this.props.teams[teamId].cmpId, teamId);
   }

   addMmb = (mmbEmail, teamId) => {
      this.props.addMmb(mmbEmail, this.props.teams[teamId].cmpId, teamId);
   }

   render() {
      return (
      <section className="container">
        {console.log("Team Render")}
        {this.state.modalTeamId ?
        <TeamModal
            showModal={ this.state.modalTeamId }
            title={"Edit Team"}
            team = {this.props.teams[this.state.modalTeamId]}
            onDismiss={(teamData) => this.dismissModal(this.state.modalTeamId, teamData)} />
        : ''}
        <ConfDialog
          show={this.state.showConfirmation  != null }
          title="Delete Team"
          body={`Are you sure you want to delete the Team '${this.state.showConfirmation}'`}
          buttons={['Yes', 'Abort']}
          onClose={(res) => this.closeConfirmation(res, this.state.showConfirmation)} />

        <h1>Team Overview</h1>
        <ListGroup>
          {Object.keys(this.props.teams).map((teamId, i) => {
            var team = this.props.teams[teamId];

            return <TeamLine
              key={i}
              prs = {this.props.prs.id}
              mmbs = {team.mmbs}
              leaderId = {team.leaderId}
              name = {team.teamName}
              expanded = {this.state.expanded[teamId]}
              toggle = {() => this.toggleView(teamId)}
              edit = {() => this.openModal(teamId)}
              del = {() => this.openConfirmation(teamId)}/>
          })}
        </ListGroup>
      </section>
      )
   }
}

const TeamLine = function (props) {
   const addTip = (
      <Popover id="TeamsPage-addTip">Add a new team member</Popover>
   )
   const delTip = (
      <Popover id="TeamsPage-delTip">Remove this team</Popover>
   )
   var isLeader = props.leaderId === props.prs.id;

   return (
   <ListGroupItem className="clearfix">
     {isLeader ?
       <Button onClick={props.toggle}><mark>{props.name}</mark></Button>
       :
       <Button onClick={props.toggle}>{props.name}</Button>
     }
     {isLeader ?
       <div className="pull-right">
         <Button bsSize="small" onClick={props.addMmb}>
           <Glyphicon glyph="plus" />
         </Button>

         <Button bsSize="small" onClick={props.edit}>
           <Glyphicon glyph="edit" />
         </Button>

         <Button bsSize="small" onClick={props.del}>
           <Glyphicon glyph="trash" />
         </Button>
       </div>
       : ''
    }
    {props.expanded ?
    <ListGroup>
      {Object.keys(props.mmbs).map((memNum, i) => {
         var mmb = props.mmbs[memNum];
         return <MmbItem
           key={i} {...mmb}
           isLeader = {mmb.id === props.leaderId}
           canDrop = {
             // Drop anyone but you if you're leader, otherwise only yourself
             props.leader && mmb.id !== props.prs
             || mmb.id === props.prs}
            />
         })
       }
     </ListGroup>
     : ''}
   </ListGroupItem>
   )
}

//A member list item
const MmbItem = function (props) {
   const delTip = (
      <Popover id="TeamsPage-delTip">Remove this member</Popover>
   )

   return (
   <ListGroupItem className="clearfix">
     <Link to="#">{props.firstName}</Link>
     {props.isLeader ? ' (lead)' : ''}
     {props.canDrop ?
        <div className="pull-right">
          <OverlayTrigger trigger={["focus", "hover"]}
          placement="bottom" overlay={delTip}>
            <Button bsSize="small" onClick={props.delMmb}>
              <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
        </div>
      : ''}
   </ListGroupItem>
   )
}

//makes TeamsPage a container componet, rather than a presentational componet
function mapStateToProps(state) {
   return {
      prs: state.prs,
      teams: state.teams
   }
}

function mapDispachToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

//connects TeamsPage to the store
TeamsPage = connect(mapStateToProps, mapDispachToProps)(TeamsPage)
export default TeamsPage
