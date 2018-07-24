import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import * as actionCreators from '../../actions/actionCreators';
import TeamModal from './TeamModal'

class TeamPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         showConfirmation: null,
         modalTeamId: null
      }

      // CAS FIX: This sort of thing doesn't go in the component constructor
      // Consider instead placing it in the render method of the relevant
      // Route tag.
      console.log(JSON.stringify(this.props.teams));
      this.props.getTeams(this.props.prss.id);
   }

   openConfirmation = (teamId) => {
      this.setState({showConfirmation: teamId})
   }

   // Thus far the only confirmation is for a delete.
   closeConfirmation = (res, teamId) => {
      if (res === 'Yes') {
         this.props.deleteTeam(this.props.teams[teamId].cmpId, teamId);
      }
      this.setState({showConfirmation: null})
   }

   openConfirmation = (teamNum) => {
      this.setState({showConfirmation: teamNum })
   }

   openModal = (teamId) => {
      if (this.props.teams[teamId].members ||
       this.props.teams[teamId].members.length  === 0){
         this.props.updateMembers(this.props.teams[teamId].cmpId ,teamId,
          () => this.setState({ modalTeamId: teamId }) );
       }
   }

   dismissModal = (teamId, result) => {
      if (result.status === "OK") {
         this.props.editTeam(this.props.teams[teamId].cmpId, teamId,
          result.updatedTeam);
      }
      this.setState({modalTeamId: null});
   }


   toggleView = (teamId) => {
      //check for membership data, only update when no membership data is available
      if (this.props.teams[teamId].members ||
       this.props.teams[teamId].members.length  === 0){
         this.props.updateMembers(this.props.teams[teamId].cmpId ,teamId);
      }
      //toggle team toggles the member list on the screen
      this.props.toggleTeam(this.props.teams[teamId].cmpId, teamId);
   }

   deleteTeam = (teamNum) => {
      console.log(teamNum);
      console.log(this.state.showConfirmation);
      console.log(this.props.teams[teamNum]);
      this.props.deleteTeam(this.props.teams[teamNum].cmpId, teamNum);
   }

   deleteMember = (memberId, teamId) => {
      //add delete member
      this.props.deleteTeam(this.props.teams[teamId].cmpId, teamId);
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
      {/*shows when the entire page is rendered again*/}
      {/*As of now the entire page rerenders when a team is togled, should change in future*/}
        <h1>Team Overview</h1>
        <ListGroup>
          {Object.keys(this.props.teams).map((teamNum, i) => {
            var team = this.props.teams[teamNum];

            {/*Creates a team item with all the required knowledge*/}
            return <TeamItem
              key={i} {...team}
              toggleTeam = {() => this.toggleView(teamNum)}
              openModal = {() => this.openModal(teamNum)}
              openConfirmation = {() => this.openConfirmation(teamNum)}
              leader = {team.leaderId === this.props.prss.id}
              prss = {this.props.prss.id}/>
          })
       }
        </ListGroup>
      </section>
      )
   }
}

// A Team Item
const TeamItem = function (props) {
   return (
   <ListGroupItem className="clearfix">
     {props.leader ?
       <Button onClick={props.toggleTeam}><mark>{props.teamName}</mark></Button>
       :
       <Button onClick={props.toggleTeam}>{props.teamName}</Button>}
     {props.leader ?
       <div className="pull-right">
         <Button bsSize="small" onClick={props.openModal}><Glyphicon glyph="edit" /></Button>
         <Button bsSize="small" onClick={props.openConfirmation}><Glyphicon glyph="trash" /></Button>
       </div>
     : ''}
     {props.toggled ?
     <ListGroup>
       {Object.keys(props.members).map((MemNum, i) => {
         var member = props.members[MemNum];
         {/*passes member data and privlige*/}
         return <MemberItem
           key={i} {...member}
           privlige = {props.leader || member.id === props.prss}/>
         })
       }
     </ListGroup>
     : ''}
   </ListGroupItem>
   )
}

//A member list item
const MemberItem = function (props) {
   return (
   <ListGroupItem className="clearfix">
     {console.log("Member Created")}
     <Link to="#">{props.firstName}</Link>
     {props.privlige ?
     <div className="pull-right">
       <Button bsSize="small" onClick={props.EditMember}><Glyphicon glyph="edit" /></Button>
       <Button bsSize="small" onClick={props.DeleteMember}><Glyphicon glyph="trash" /></Button>
     </div>
      : ''}
   </ListGroupItem>
   )
}

//makes teamPage a container componet, rather than a presentational componet
function mapStateToProps(state) {
   return {
      prss: state.prss,
      teams: state.teams
   }
}

function mapDispachToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

//connects teamPage to the store
TeamPage = connect(mapStateToProps, mapDispachToProps)(TeamPage)
export default TeamPage
