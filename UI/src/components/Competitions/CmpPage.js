import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { EntryDialog } from '../concentrator';
import './cmp.css'

export default class CmpPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         toggledTeams: {},
         createTeamFunc: null
      }
   }

   componentDidMount = () => {
      var props = this.props;

      if (props.cmps[props.cmpId])
         props.getCtp(props.cmps[props.cmpId].ctpId);
      if (!(props.updateTimes && props.updateTimes.myTeams))
         props.getTeamsByPrs(props.prs.id);

      //get all mmbs if linked to join cmps, so that i can display the team
      //leader and email
      if (props.myCmpLink)
         props.getTeamsByCmp(props.cmpId);
      else
         props.getTeamsByCmp(props.cmpId, this.getAllTeamMmbs);
   }

   getAllTeamMmbs = () => {
      var props = this.props;

      props.cmps[props.cmpId].cmpTeams.forEach((teamId, i) => {
         if (this.props.teams[teamId] && this.props.teams[teamId].mmbs &&
          Object.keys(this.props.teams[teamId].mmbs).length  === 0)
            props.getTeamMmbs(props.cmpId, teamId);
      })
   }

   openCreateDialog = () => {
      this.setState({ createTeamFunc: (newTeamName) => {
         this.props.postTeam(parseInt(this.props.cmpId, 10),
         { leaderId : this.props.prs.id, teamName: newTeamName});
      }});
   }

   closeCreateDialog = (result) => {
      if (result.status === "OK") {
         this.state.createTeamFunc(result.entry);
      }
      this.setState({createTeamFunc: null});
   }

   toggleView = (teamId) => {
      //check for membership data, only update when no membership data is available
      if (this.props.teams[teamId].mmbs &&
       Object.keys(this.props.teams[teamId].mmbs).length  === 0){
         this.props.getTeamMmbs(this.props.cmpId ,teamId);
      }
      //toggle team toggles the member list on the screen
      this.setState({toggledTeams: Object.assign(this.state.toggledTeams,
       {[teamId]: !this.state.toggledTeams[teamId]})});
   }

   orderTeamsByScore = (teams) => {
      //expect an array of team Ids
      return teams.sort(this.compareTeamsByScore);
   }

   compareTeamsByScore = (team1, team2) => {
      var teams = this.props.teams;

      return teams[team2].bestScore - teams[team1].bestScore;
   }

   doSubmit = (team) => {
      this.props.history.push(`/SbmPage/${team.id}`);
   }

   openInstrictions = () => {
     var props = this.props;
     var link = '/Docs/Cmps/';
     var ctpId = props.cmps[props.cmpId].ctpId;
     var ctpType = props.ctps[ctpId].codeName;

     link = link.concat(ctpType + '/Instructions.html');

     window.open(link, "_blank");
   }

   render() {
      var props = this.props;
      var cmpId = props.cmpId;

      if (!props.cmps[cmpId])
         return (<h1>Error loading Competition</h1>)

      var myCmpLink = this.props.myCmpLink;

      return (
      <section className="container">
        <EntryDialog
        show={ this.state.createTeamFunc !== null }
        title={"Create Your Team"}
        label="Team name"
        onClose={(teamData) =>
        this.closeCreateDialog(teamData)} />

        <div className = "cmpHeader">{props.cmps[cmpId].title}</div>

        <div className = "cmpDescription">
          <div className = "instructionLink">
            <a onClick = {this.openInstrictions}>
              Full Instructions
            </a>
          </div>

          <div className="cmpDescription-body">{props.cmps[cmpId].description}</div>
        </div>

          {myCmpLink ?
          ''
          :
          <div className = "cmpDescription">
            <div className = "cmpDescription-header">Want to Join?</div>

            <div className = "cmpDescription-body">To join one of the existing
            teams, contact the team lead who can
            add you via their Teams tab. Or, you may start a new team with
            yourself as leader.</div>
           </div>
           }

        <div className = "cmpDescription">
          <div className = "cmpDescription-header">Competing Teams</div>

          { props.cmps[cmpId].cmpTeams.length > 0 ?
          <ListGroup>
            {this.orderTeamsByScore(props.cmps[cmpId].cmpTeams).map((teamId, i) => {
              if (!this.props.teams[teamId])
                return null;

              var team = props.teams[teamId];
              team.toggled = this.state.toggledTeams[teamId];
              team.isMember = props.prs.myTeams.includes(teamId);
              team.myTeamLink = myCmpLink;

              return <TeamLine key={i} {...team}
                  toggleTeam = {() => this.toggleView(teamId)}
                  doSubmit = {() => this.doSubmit(team)}/>
           })}
          </ListGroup>
          :
          <h4>This competition has no competing teams</h4>
           }

          {!myCmpLink ?
          <div className = "rightButton">
             <Button onClick={this.openCreateDialog} >Create Team</Button>
          </div>
          : ''}

        </div>
      </section>
      );
   }
}

const TeamLine = function (props) {
   return (
   <ListGroupItem className="clearfix">
     <Button onClick = {props.toggleTeam}>{props.teamName}</Button>

     {props.isMember ?
      ' (Your team) '
      : ''}

     <div className="pull-right">
     { props.myTeamLink ?
        <div>
       <label className = "scoreLabel">
         Last Score:{props.bestScore !== -1 ? props.bestScore : "N/A"}
       </label>
       {props.isMember ?
       <Button onClick = {props.doSubmit}>
         Submit/Check</Button>  : ''}
       </div>
     :
      (props.mmbs && Object.keys(props.mmbs).length  ?
       `TeamLeader: ${props.mmbs[props.leaderId].firstName}
       (${props.mmbs[props.leaderId].email})`
       : 'loading')
     }
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
