import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import * as actionCreators from '../../actions/actionCreators';
import TeamModel from './TeamModel'

class TeamPage extends Component {
   constructor(props) {
      super(props);

      // Initialize teams; grab all teams for user
      this.state = {
         showConfirmation: false,
         openModal: false
      }
      this.props.getTeams(this.props.prss.id);
      console.log("constructor");
   }

   openConfirmation = () => {
      this.setState({showConfirmation: true })
   }

   closeConfirmation = (res, teamNum) => {
      if (res === 'Yes') {
         this.deleteTeam(teamNum);
      }
      this.setState({ showConfirmation: false})
   }

   openConfirmation = () => {
      this.setState({showConfirmation: true })
   }

   openModal = (team) => {
//      const newState = { showModal: true };
//      if (team)
//         newState['editCnv'] = team;
      this.setState({ showModal: true });
   }

   modalDismiss = (teamNum, result) => {
      if (result.status === "OK") {
         var curTeam = this.props.teams[teamNum];
         this.props.editTeam(teamNum, Object.assign({}, curTeam,result.UpdatedTeam));
      }
      console.log(result);
      console.log("close Model");
      this.setState({ showModal: false });
   }


   toggleView = (teamId) => {
      //check for membership data, only update when no membership data is available
      //if (Object.keys(this.props.teams[teamId].members).length  === 0)
      //this.props.updateMembers(this.props.teams[teamId].cmpId ,teamId);

      //toggle team toggles the member list on the screen
      this.props.toggleTeam(this.props.teams[teamId].cmpId, teamId);
   }

   deleteTeam = (teamNum) => {
      this.props.deleteTeam(this.props.teams[teamNum].cmpId, teamNum);
   }

   deleteMember = (memberId, teamId) => {
      //add delete member
      this.props.deleteTeam(this.props.teams[teamId].cmpId, teamId);
   }

   render() {
      return (
      <section className="container">
      {/*shows when the entire page is rendered again*/}
      {/*As of now the entire page rerenders when a team is togled, should change in future*/}
      {console.log("Big Render")}
        <h1>Team Overview</h1>
        <ListGroup>
          {Object.keys(this.props.teams).map((teamNum, i) => {
            var team = this.props.teams[teamNum];

            {/*Creates a team item with all the required knowledge*/}
            return <TeamItem
              key={i} {...team}
              toggleTeam = {() => this.toggleView(teamNum)}

              openModal = {() => this.openModal()}
              showModal = {this.state.showModal}
              closeModel = {(teamData) => this.modalDismiss(teamNum, teamData)}

              openConfirmation = {() => this.openConfirmation()}
              showConfirmation = {this.state.showConfirmation}

              closeConfirmation = {(res) => this.closeConfirmation(res, teamNum)}

              leader = {team.ownerId === this.props.prss.id}
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
         <Button onClick={props.toggleTeam}>{props.teamName}</Button>
      }
      {console.log(props)}
         {props.leader ?
            <div className="pull-right">
               <Button bsSize="small" onClick={props.openModal}><Glyphicon glyph="edit" /></Button>
               {props.showModal ?
                <TeamModel
                   showModal={props.showModal}
                   title={"Edit Team"}
                   team = {props}
                   members = {props.members}
                   onDismiss={props.closeModel} />
                : ''}
               <Button bsSize="small" onClick={props.openConfirmation}><Glyphicon glyph="trash" /></Button>
                <ConfDialog
                  show={props.showConfirmation}
                  title="Delete Team"
                  body={`Are you sure you want to delete the Team '${props.teamName}'`}
                  buttons={['Yes', 'Abort']}
                  onClose={props.closeConfirmation} />
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
            <Button bsSize="small" onClick={props.DeleteMember}><Glyphicon glyph="trash" /></Button>
            <Button bsSize="small" onClick={props.EditMember}><Glyphicon glyph="edit" /></Button>
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
