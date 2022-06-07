import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { EntryDialog } from '../concentrator';
import './cmp.css'

// Props include the actionCreators plus
// cmpId -- ID of cmp to specifically display
// cmps -- cmp collection from redux store
// teams -- teams collection from redux store
// myCmpLink -- boolean indicating whether to show cmp as one I already am in
export default class CmpPage extends Component { // CAS Fix: Rename
   constructor(props) {
      super(props);

      this.state = {
         toggledTeams: {},
         createTeamFunc: null
      }
   }

   componentDidMount = () => {
      var props = this.props;

      if (props.cmps[props.cmpId]) // CAS Fix: drop this.
         //if (!(props.updateTimes && props.updateTimes.myTeams))
         //   props.getTeamsByPrs(props.prs.id);
         
         // Update teams for cmpId, and get full members if I'm joining.
         if (props.myCmpLink)
            props.getTeamsByCmp(props.cmpId);
         else
            props.getTeamsByCmp(props.cmpId, this.getAllTeamMmbs);
   }

   getAllTeamMmbs = () => {
      var props = this.props;

      props.cmps[props.cmpId].cmpTeams.forEach((teamId, i) => {
         if (this.props.teams[teamId] && this.props.teams[teamId].mmbs &&
          this.props.teams[teamId].mmbs.length === 0)
            props.getTeamMmbs(props.cmpId, teamId);
      })
   }

   openCreateDialog = () => {
      this.setState({ createTeamFunc: (newTeamName) => {
         this.props.postTeam(this.props.cmpId,
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
      // Check for membership data, update iff none available
      if (this.props.teams[teamId].mmbs &&
       Object.keys(this.props.teams[teamId].mmbs).length  === 0){
         this.props.getTeamMmbs(this.props.cmpId, teamId);
      }
      //toggle team toggles the member list on the screen
      this.setState({toggledTeams: Object.assign(this.state.toggledTeams,
       {[teamId]: !this.state.toggledTeams[teamId]})});
   }

   orderTeamsByScore = (teams) => {
      console.log(teams, this.props);
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

   openInstructions = () => {
     var props = this.props;
     var ctpId = props.cmps[props.cmpId].ctpId-1;
     var ctpType = props.ctps[ctpId].codeName;
     var link
      = `${process.env.PUBLIC_URL}/Docs/Cmps/${ctpType}/Instructions.html`;

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
            <a onClick = {this.openInstructions}>
              Full Instructions
            </a>
          </div>

          <div className="cmpDescription-body">
             {props.cmps[cmpId].description}
          </div>
        </div>


        <div className = "cmpDescription">
          <div className = "cmpDescription-header">Competing Teams</div>
          
          {myCmpLink ?
            ''
          :
            <div className = "cmpDescription-body">
               To join one of the existing
               teams, contact the team lead who can
               add you via their Teams tab. Or, you may start a new team with
               yourself as leader.</div>
          }

          { props.cmps[cmpId].cmpTeams.length > 0 && props.teams.length > 0 ?
          <ListGroup>
            {this.orderTeamsByScore(
             props.cmps[cmpId].cmpTeams).map((teamId, i) => {
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
   console.log("TL", props);
   return (
   <ListGroupItem className="clearfix">
     <Button onClick = {props.toggleTeam}>{props.teamName}</Button>

     {props.isMember ?
      ' (Your team) '
      : ''}

     <div className="float-right">
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
      (props.mmbs && props.mmbs.length  ?
       `Team Leader: ${props.mmbs[props.leaderId].firstName}
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
     {props.firstName}
      {props.isLeader ? ` -- lead (${props.email})` : ''}
   </ListGroupItem>
   );
}
