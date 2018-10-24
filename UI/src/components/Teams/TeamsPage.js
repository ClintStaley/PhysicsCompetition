import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ListGroup, ListGroupItem, Button, Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap';
import { ConfDialog, EntryDialog } from '../concentrator';
import * as actionCreators from '../../actions/actionCreators';
import TeamModal from './TeamModal'

class TeamsPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         delConfirmTeamId: null,   // ID of team to confirm for deletion
         editTeamId: null,         // ID of team to edit
         addMmbFunc: null,         // Function to add member to team
         delMmbFunc: null,         // Function to do deletion of member
         expanded: {}              // expanded state, per teamId
      }
   }

    componentDidMount = () => {
      var props = this.props;

      if (!(props.updateTimes && props.updateTimes.myTeams))
         this.props.getTeamsByPrs(this.props.prs.id);

      if (!(props.updateTimes && props.updateTimes.cmps))
         this.props.getAllCmps();
    }

   openDelConfirm = (teamId) => {
      this.setState({delConfirmTeamId: teamId,
       delConfirmTeamName: this.props.teams[teamId].name});
   }

   // Thus far the only confirmation is for a delete.
   closeDelConfirm = (res, teamId) => {
      if (res === 'Yes') {
         this.props.delTeam(this.props.teams[teamId].cmpId, teamId);
      }
      this.setState({delConfirmTeamId: null})
   }

   openEdit = (teamId) => {
      if (Object.keys(this.props.teams[teamId].mmbs).length === 0) {
         this.props.getMmbs(this.props.teams[teamId].cmpId, teamId,
          () => this.setState({editTeamId: teamId}));
      }
      else {
         this.setState({editTeamId: teamId});
      }
   }

   closeEdit = (teamId, result) => {
      if (result.status === "OK") {
         this.props.putTeam(this.props.teams[teamId].cmpId, teamId,
          result.updatedTeam);
      }
      this.setState({editTeamId: null});
   }

   toggleView = (teamId) => {
      var expanded = this.state.expanded;
      expanded[teamId] = !expanded[teamId];

      //check for membership data, only update when no membership data is available
      console.log("Toggling " + JSON.stringify(this.props.teams[teamId]));
      if (Object.keys(this.props.teams[teamId].mmbs).length === 0) {
         this.props.getMmbs(this.props.teams[teamId].cmpId, teamId,
          () => this.setState(expanded));
      }
      else
         this.setState({expanded});
   }

   openAddMmb = (teamId) => {
      var props = this.props;

      this.setState({addMmbFunc: (mmbEmail) => props.addMmb(mmbEmail,
       props.teams[teamId].cmpId, teamId)});
   }

   closeAddMmb = (result) => {
      if (result.status === "OK")
         this.state.addMmbFunc(result.entry)
      this.setState({addMmbFunc: null});
   }

   openDelMmbConfirm = (teamId, prsId) => {
      var team = this.props.teams[teamId];

      this.setState({
         delMmbName: team.mmbs[prsId].firstName,
         delMmbFunc: () => this.props.delMmb(team.cmpId, teamId, prsId)
      });
   }

   closeDelMmbConfirm = (res) => {
      if (res === 'Yes')
         this.state.delMmbFunc();
      this.setState({delMmbFunc: null});
   }

   render() {
      var props = this.props;
      console.log(props);

      console.log("Team Render");
      return (
      <section className="container">

        {this.state.editTeamId ?
        <TeamModal
          showModal={this.state.editTeamId}
          title={"Edit Team"}
          team = {props.teams[this.state.editTeamId]}
          onDismiss={(teamData) => this.closeEdit(this.state.editTeamId, teamData)} />
        : ''}

        <ConfDialog
          show={this.state.delConfirmTeamId !== null }
          title="Delete Team"
          body={this.state.delConfirmTeamId ?
           `Delete ${props.teams[this.state.delConfirmTeamId].teamName}` : ''}
          buttons={['Yes', 'No']}
          onClose={(res) => this.closeDelConfirm(res,
           this.state.delConfirmTeamId)} />

        <ConfDialog
          show={this.state.delMmbFunc !== null }
          title="Delete Member"
          body={this.state.delMmbFunc ?
           `Delete ${this.state.delMmbName}?` : ''}
          buttons={['Yes', 'No']}
          onClose={(res) => this.closeDelMmbConfirm(res)} />

         <EntryDialog
            show={this.state.addMmbFunc !== null }
            title="Add Team Member"
            label="New member's Email:"
            onClose={(res) => this.closeAddMmb(res)} />

        <h1>Team Overview</h1>
        <ListGroup>
          {props.prs.myTeams && props.prs.myTeams.map((teamId, i) => {
            var team = props.teams[teamId];

            return <TeamLine
              key={i}
              prsId = {props.prs.id}
              mmbs = {team.mmbs}
              teamId = {team.id}
              leaderId = {team.leaderId}
              teamName = {team.teamName}
              cmpName = {this.props.cmps[team.cmpId].title}
              expanded = {this.state.expanded[teamId]}
              toggle = {() => this.toggleView(teamId)}
              addMmb = {() => this.openAddMmb(teamId)}
              edit = {() => this.openEdit(teamId)}
              del = {() => this.openDelConfirm(teamId)}
              delMmb = {(prsId) => this.openDelMmbConfirm(teamId, prsId)}/>
          })}
        </ListGroup>
      </section>
      )
   }
}

const TeamLine = function(props) {
   const addTip = (
      <Popover id="TeamsPage-addTip">Add a new team member</Popover>
   )
   const delTip = (
      <Popover id="TeamsPage-delTip">Remove this team</Popover>
   )
   var isLeader = props.leaderId === props.prsId;
   return (

   <ListGroupItem className="clearfix">
     {isLeader ?
       <Button onClick={props.toggle}><mark>{props.teamName}</mark></Button>
       :
       <Button onClick={props.toggle}>{props.teamName}</Button>
     }
       {' -- ' + props.cmpName}

     {isLeader ?
       <div className="pull-right">
         <OverlayTrigger trigger={["focus", "hover"]}
         placement="bottom" overlay={addTip}>
           <Button bsSize="small" onClick={props.addMmb}>
             <Glyphicon glyph="plus" />
           </Button>
         </OverlayTrigger>

         <Button bsSize="small" onClick={props.edit}>
           <Glyphicon glyph="edit" />
         </Button>

         <OverlayTrigger trigger={["focus", "hover"]}
         placement="bottom" overlay={delTip}>
           <Button bsSize="small" onClick={props.del}>
             <Glyphicon glyph="trash" />
           </Button>
         </OverlayTrigger>
       </div>
       : ''
    }
    {props.expanded ?
    <ListGroup>
      {Object.keys(props.mmbs).map((mmbId, i) => {
         var mmb = props.mmbs[mmbId];
         var weAreLeader = props.prsId === props.leaderId;

         return <MmbItem
           key={i}
           name={mmb.firstName}
           contact={mmb.email}
           isLeader = {mmb.id === props.leaderId}
           del = {
             // If it's us, or we are leader, and if we're not dropping leader..
             (weAreLeader || mmb.id === props.prsId) && mmb.id !== props.leaderId ? () => props.delMmb(mmbId) : null
           }
         />
       })}
     </ListGroup>
     : ''}
   </ListGroupItem>
   )
}

//A member list item
const MmbItem = function (props) {
   const delTip = (
      <Popover id="TeamsPage-delTip">Remove this member</Popover>
   )

   return (
   <ListGroupItem className="clearfix">
     <Link to="#">{props.name}</Link>
     {props.isLeader ? ` -- lead (${props.contact})` : ''}
     {props.del ?
        <div className="pull-right">
          <OverlayTrigger trigger={["focus", "hover"]}
          placement="bottom" overlay={delTip}>
            <Button bsSize="small" onClick={props.del}>
              <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
        </div>
      : ''}
   </ListGroupItem>
   )
}

//makes TeamsPage a container componet, rather than a presentational componet
function mapStateToProps(state) {
   return {
      prs: state.prs,
      teams: state.teams,
      cmps: state.cmps,
      updateTimes: state.updateTimes
   }
}

function mapDispatchToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

//connects TeamsPage to the store
TeamsPage = connect(mapStateToProps, mapDispatchToProps)(TeamsPage)
export default TeamsPage
