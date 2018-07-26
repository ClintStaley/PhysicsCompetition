import React, { Component } from 'react';
import {
  Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';

export default class TeamModal extends Component {
   constructor(props) {
      super(props);

      this.state = {
         teamName: ""
      };
   }

   close = (result) => {this.props.onDismiss({
      status: result,
      newTeam : {teamName: this.state.teamName}});
   }

   getValidationState = () => {
      return this.state.teamName ? null : "error";
   }

   // Only possible change is a new team name value
   handleChange = (e) => {
      this.setState({teamName: e.target.value});
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
