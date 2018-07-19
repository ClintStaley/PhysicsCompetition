import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import * as actionCreators from '../../actions/actionCreators';
import { putTeam, delTeam, postTeam } from '../../api';
import TeamModel from './TeamModel'

class TeamPage extends Component {
   constructor(props) {
      super(props);

      //initilize teams, grab all teams for user
      this.state = {
         showConfirmation: false
      }



      this.props.updateTeams(this.props.prss.id);

      console.log("constructor");
   }

   openConfirmation = (cnv) => {
      this.setState({ delCnv: cnv, showConfirmation: true })
   }

   closeConfirmation = (res,  teamNum) => {
      if (res === 'Yes') {
         this.deleteTeam(teamNum);
      }
      this.setState({ showConfirmation: false})
   }
   openConfirmation = (cnv) => {
      this.setState({ delCnv: cnv, showConfirmation: true })
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

   render() {
      return (
      <section className="container">
      {/*shows when the entire page is rendered again*/}
      {/*As of now the entire page rerenders when a team is togled, should change in future*/}
      {console.log("Big Render")}
      {console.log(this.props.teams)}
        <h1>Team Overview</h1>
        <ListGroup>
          {Object.keys(this.props.teams).map((teamNum, i) => {
            var team = this.props.teams[teamNum];

            {/*Creates a team item with all the required knowledge*/}
            return <TeamItem
              key={i} {...team}
              toggleTeam = {() => this.toggleView(teamNum)}
              openConfirmation = {() => this.openConfirmation()}
              showConfirmation = {this.state.showConfirmation}
              deleteTeam = {() => this.deleteTeam(teamNum)}
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
         {props.leader ?
            <div className="pull-right">
               <Button bsSize="small" onClick={props.onEdit}><Glyphicon glyph="edit" /></Button>
                <TeamModel
                   showModal={props.showModal}
                   title={props.editCnv ? "Edit title" : "New Conversation"}
                   cnv={props.editCnv}
                   onDismiss={props.modalDismiss} />
               <Button bsSize="small" onClick={props.openConfirmation}><Glyphicon glyph="trash" /></Button>
                <ConfDialog
                  show={props.showConfirmation}
                  title="Delete conversation"
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
   <Link to="#">{props.firstName}</Link>
      {props.privlige ?
         <div className="pull-right">
            <Button bsSize="small" onClick={props.onDelete}><Glyphicon glyph="trash" /></Button>
            <Button bsSize="small" onClick={props.onEdit}><Glyphicon glyph="edit" /></Button>
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
