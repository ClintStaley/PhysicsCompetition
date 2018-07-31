import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { EntryDialog } from '../concentrator';

export default class CmpPage extends Component {
   constructor(props) {
      super(props);

      this.props.getCtp(this.props.cmps[this.props.cmpId].ctpId);
      this.props.getTeamsByCmp(this.props.cmpId);
      this.props.getTeamsByPrs(this.props.prs.id);

      this.state = {
         toggledTeams: {},
         createDialog: null
      }
   }

   openCreateDialog = () => {
      this.setState({ createDialog: true });
   }

   closeCreateDialog = (result) => {
      console.log(result);
      if (result.status === "OK") {
         var newTeam = {};
         newTeam.leaderId = this.props.prs.id;
         newTeam.teamName = result.entry

         this.props.postTeam(parseInt(this.props.cmpId, 10), newTeam);
      }
      this.setState({createDialog: false});
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
      var props = this.props;
      var cmpId = props.cmpId;
      var ctpId = props.cmps[cmpId].ctpId;

      if (!this.props.cmps[cmpId])
         return (<h1>Error loading Competition</h1>)

      return (
      <section className="container">
        <EntryDialog
        show={ this.state.createDialog }
        title={"Create Your Team"}
        label="Team name"
        onClose={(teamData) =>
        this.closeCreateDialog(teamData)} />

        <h1>{props.cmps[cmpId].title}</h1>

        <h4>Competiton Instructions (Make this a link to a separate page)</h4>

        <h4>Competiton Teams</h4>

        { props.cmps[cmpId].cmpTeams.length > 0 ?
        <ListGroup>
          {props.cmps[cmpId].cmpTeams.map((teamId, i) => {
            if (!this.props.teams[teamId])
              return null;

            var team = props.teams[teamId];
            team.toggled = this.state.toggledTeams[teamId];
            team.isMember = props.prs.myTeams.includes(teamId);

            return <TeamLine key={i} {...team}
            toggleTeam = {() => this.toggleView(teamId)}/>
         })}
        </ListGroup>
        : ''}

        <div className="pull-right">
           <Button onClick={this.openCreateDialog} >Create Team</Button>
        </div>
      </section>
      );
   }
}

const TeamLine = function (props) {
   return (
   <ListGroupItem className="clearfix">
     <Button onClick={props.toggleTeam}>{props.teamName}</Button>

     <div className="pull-right">
       {props.isMember ?
       <Button disabled = {!props.canSubmit}> Submit </Button>
         : '' }
       <label>Last Score: {props.lastSubmit ? props.lastSubmit : "N/A"}</label>
     </div>

     {props.toggled ?
     <ListGroup>
       {Object.keys(props.mmbs).map((memNum, i) => {
         var mmb = props.mmbs[memNum];

         mmb.isLeader = props.leaderId === mmb.id;

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
     <Link to="#">{props.firstName}</Link>
      {props.isLeader ? ` -- lead (${props.email})` : ''}
   </ListGroupItem>
   );
}
