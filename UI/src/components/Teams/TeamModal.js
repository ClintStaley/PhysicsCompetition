import React, { Component } from 'react';
import {
  Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';
import Select from 'react-virtualized-select';
import 'react-select/dist/react-select.css';

export default class TeamModal extends Component {
   constructor(props) {
      super(props);

      var members = [];
      var leader;
      var team = this.props.team

      for (var key in Object.keys(team.members)) {
         members.push({label: team.members[key].firstName, value: key});
         if (team.leaderId === key)
            leader = {value: key, label: team.members[key].firstName};
      }

      this.state = {
         teamName: team.teamName || "",
         members: members,
         leader: leader
      };

      this.handleChangeSelect = this.handleChangeSelect.bind(this);
   }

   close = (result) => {this.props.onDismiss({
      status: result,
      updatedTeam : {teamName: this.state.teamName}});
   }

   getValidationState = () => {
      return this.state.teamName ? null : "warning";
   }

   // Only possible change is a new team name value
   handleChange = (e) => {
      this.setState({teamName: e.target.value});
   }

   // Only possible select is a new choice of first name for team lead
   handleChangeSelect(event) {
      this.setState({leader : event});
   }

   render() {
      return (
       <Modal show={this.props.showModal != null} onHide={() => this.close("Cancel")}>
         <Modal.Header closeButton>
           <Modal.Title>{this.props.title}</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           <form onSubmit={(e) =>
           e.preventDefault() || this.state.teamName.length ?
           this.close("OK") : this.close("Cancel")}>
             <FormGroup
             controlId="formBasicText"
             validationState={this.getValidationState()}>

               <ControlLabel>Team Name</ControlLabel>
               <FormControl
               type="text"
               value={this.state.teamName}
               placeholder="Enter text"
               onChange={this.handleChange}/>

               <FormControl.Feedback />
               <HelpBlock>There must be a team name.</HelpBlock>

               <ControlLabel>Team Leader</ControlLabel>
               <Select
               name="Leader"
               options={this.state.members}
               value={this.state.leader}
               onChange={this.handleChangeSelect}/>
             </FormGroup>
           </form>
         </Modal.Body>
         <Modal.Footer>
           <Button onClick={() => this.close("OK")}>Ok</Button>
           <Button onClick={() => this.close("Cancel")}>Cancel</Button>
         </Modal.Footer>
       </Modal>)
   }
}
