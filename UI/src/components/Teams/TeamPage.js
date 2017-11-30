import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import { putTeam, delTeam, postTeam } from '../../api';

export default class TeamPage extends Component {
   constructor(props) {
      super(props);
      this.props.updateTeams(this.props.Prss.id);
      this.props.updateMembers(1,1);
   }

   updateTeams = (id) => {
      if (this.props.Teams === undefined)
         this.props.updateTeams(this.props.Prss.id);
   }

   toggleView = (teamId) => {
      this.props.toggleTeam(teamId);
   }

   render() {
      return (
      <section className="container">
      {this.updateTeams(this.props.Prss.id)}
        <h1>Team Overview</h1>
        <ListGroup>
          {Object.keys(this.props.Teams).map((teamNum, i) => {
            var team = this.props.Teams[teamNum];

            return <TeamItem
              key={i} {...team}
              toggleTeam = {() => this.toggleView(team.teamId)}
              leader = {team.ownerId === this.props.Prss.id}/>
          })
          }
        </ListGroup>
      </section>
      )
  }
}

// A conversation list item
const TeamItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
      {props.leader ?
         <Button onclick={props.toggleTeam}><mark>{props.teamName}</mark></Button>
         :
         <Button onclick={props.toggleTeam}>{props.teamName}</Button>
      }
         {props.leader ?
            <div className="pull-right">
               <Button bsSize="small" onClick={props.onDelete}><Glyphicon glyph="trash" /></Button>
               <Button bsSize="small" onClick={props.onEdit}><Glyphicon glyph="edit" /></Button>
            </div>
         : ''}
         {props.toggled ?
         <ListGroup>
          {Object.keys(props.members).map((MemNum, i) => {
             var member = props.members[MemNum];

             return <MemberItem
               key={i} {...member}
               leader = {props.leader}/>
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
      {props.leader ?
         <div className="pull-right">
            <Button bsSize="small" onClick={props.onDelete}><Glyphicon glyph="trash" /></Button>
            <Button bsSize="small" onClick={props.onEdit}><Glyphicon glyph="edit" /></Button>
         </div>
      : ''}
   </ListGroupItem>
   )
}
