import React, { Component } from 'react';
import {
  Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export default class TeamModal extends Component {
   constructor(props) {
      super(props);

      var mmbs = [];
      var leader;
      var team = this.props.team

      Object.keys(team.mmbs).forEach((key) => {
         var option = {
          label: `${team.mmbs[key].email} (${team.mmbs[key].firstName})`,
          value: team.mmbs[key].id
         }
         mmbs.push(option);
         if (team.leaderId === team.mmbs[key].id) {
            leader = option;
         }
      });

      this.state = {teamName: (team && team.teamName) || "", mmbs, leader};

      this.handleChangeSelect = this.handleChangeSelect.bind(this);
   }

   close = (result) => {this.props.onDismiss({
      status: result,
      updatedTeam : {teamName: this.state.teamName,
       leaderId: this.state.leader.value}});
   }

   getValidationState = () => {
      return this.state.teamName ? null : "error";
   }

   // Only possible change is a new team name value
   handleChange = (e) => {
      this.setState({teamName: e.target.value});
   }

   // Only possible select is a new choice of first name for team lead
   handleChangeSelect(event) {
      console.log("New leader " + JSON.stringify(event));
      this.setState({leader : event});
   }

   render() {
      return (
       <Modal show={this.props.showModal != null} keyboard = {false} onHide={() => this.close("Cancel")}>
         <Modal.Header closeButton>
           <Modal.Title>{this.props.title}</Modal.Title>
         </Modal.Header>
         <Modal.Body>
           <form onSubmit={(e) =>
           this.state.teamName.length ?
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
               options={this.state.mmbs}
               value={this.state.leader}
               onChange={this.handleChangeSelect}/>
             </FormGroup>
           </form>
         </Modal.Body>
         <Modal.Footer>
           <Button type="submit" onClick={() => this.close("OK")}>Ok</Button>
           <Button onClick={() => this.close("Cancel")}>Cancel</Button>
         </Modal.Footer>
       </Modal>)
   }
}
