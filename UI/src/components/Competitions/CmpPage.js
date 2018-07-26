import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';

export default class CmpPage extends Component {
   constructor(props) {
      super(props);

      this.props.getTeamsByCmp(this.props.cmpId);

      //attempt to remove a bug in
      if (!this.props.updateTimes.cmps)
         this.props.getAllCmps();

      this.state = {
         toggledTeams: {},
         modalTeamId: null
      }
   }

   toggleView = (teamId) => {
      //check for membership data, only update when no membership data is available
      if (this.props.teams[teamId].mmbs &&
       Object.keys(this.props.teams[teamId].mmbs).length  === 0){
         this.props.getMmbs(this.props.cmpId ,teamId);
      }
      //toggle team toggles the member list on the screen
      this.setState({toggledTeams: Object.assign(this.state.toggledTeams,
       {[teamId]: !this.state.toggledTeams[teamId]})});
   }

   render() {
      var cmpId = this.props.cmpId;
      var toggled = {};

      if (!this.props.cmps[cmpId])
         return (<h1>Error loading Competition</h1>)

      console.log(this.state.toggledTeams);
      return (
      <section className="container">
        <h1>{this.props.cmps[cmpId].title}</h1>

        <h5>Competiton Teams</h5>

        <ListGroup>
          {this.props.cmps[cmpId].cmpTeams.map((teamId, i) => {
            if (!this.props.teams[teamId])
              return null;

            var team = this.props.teams[teamId];
            team.toggled = this.state.toggledTeams[teamId];

            return <TeamLine key={i} {...team}
            toggleTeam = {() => this.toggleView(teamId)}/>
         })}
        </ListGroup>

        <div className="pull-right">
           <Button>Create Team</Button>
        </div>
      </section>
      );
   }
}

const TeamLine = function (props) {
   return (
   <ListGroupItem className="clearfix">
   {console.log(props)}
     <Button onClick={props.toggleTeam}>{props.teamName}</Button>

     {props.toggled ?
     <ListGroup>
       {Object.keys(props.mmbs).map((memNum, i) => {
         var mmb = props.mmbs[memNum];

         mmb.leader = props.leaderId === mmb.id;

         return <MemberItem key={i} {...mmb}/>
       })}
     </ListGroup>
     : ''}
   </ListGroupItem>
   )
}

const MemberItem = function (props) {
   return (
   <ListGroupItem className="clearfix">
     {props.leader ?
     <Link to="#"><mark>{props.firstName}</mark></Link>
     :
     <Link to="#">{props.firstName}</Link>}
   </ListGroupItem>
   );
}