import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import { putTeam, delTeam, postTeam } from '../../api';

export default class TeamPage extends Component {
   constructor(props) {
      super(props);
      this.props.updateTeams(this.props.Prss.id);
   }


   render() {
      return (
      <section className="container">
        <h1>Team Overview</h1>
        <ListGroup>
          {this.props.Teams.map((team, i) => {
            return <TeamItem
              key={i} {...team}
              Leader = {team.ownerId === this.props.Prss.id}/>
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
      {console.log(props)}
      {props.Leader ?
         <Link to="#"><mark>{props.teamName}</mark></Link>
         :
         <Link to="#">{props.teamName}</Link>
      }
         {props.Leader ?
            <div className="pull-right">
               <Button bsSize="small" onClick={props.onDelete}><Glyphicon glyph="trash" /></Button>
               <Button bsSize="small" onClick={props.onEdit}><Glyphicon glyph="edit" /></Button>
            </div>
         : ''}
         <ListGroup>
           {props.Members.map((team, i) => {
             return <TeamItem
               key={i} {...team}
               Leader = {team.ownerId === this.props.Prss.id}/>
           })
           }
         </ListGroup>
      </ListGroupItem>
   )
}
