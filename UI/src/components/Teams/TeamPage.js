import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import * as actionCreators from '../../actions/actionCreators';
import { putTeam, delTeam, postTeam } from '../../api';

class TeamPage extends Component {
   constructor(props) {
      super(props);

      //initilize teams, grab all teams for user

         this.props.updateTeams(this.props.prss.id);

      console.log("constructor");
   }


   toggleView = (teamId) => {
      //check for membership data, only update when no membership data is available
      //if (Object.keys(this.props.teams[teamId].members).length  === 0)
         //this.props.updateMembers(this.props.teams[teamId].cmpId ,teamId);

      console.log(this.props.teams[teamId]);

      //toggle team toggles the member list on the screen
      this.props.toggleTeam(this.props.teams[teamId].cmpId ,teamId);
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
