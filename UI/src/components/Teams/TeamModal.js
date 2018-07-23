import React, { Component } from 'react';
import {
  Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';
import Select from 'react-virtualized-select';
import 'react-select/dist/react-select.css';

export default class TeamModal extends Component {
   constructor(props) {
      super(props);

      var MemberOptions = [];

      for (var property in this.props.team.members) {
         if (this.props.team.members.hasOwnProperty(property)) {
            MemberOptions.push({label: this.props.team.members[property]
             .firstName, value: this.props.team.members[property].id});
         }
      }
      var owner = {};
      owner.value = this.props.team.ownerId;
      owner.label = this.props.team.members[owner.value].firstName;

      this.state = {
       teamName: (this.props.team && this.props.team.teamName) || "",
       members: MemberOptions,
       owner: owner}

       this.handleChangeSelect = this.handleChangeSelect.bind(this);
   }

   close = (result) => {
      var updatedTeam = {}

      if (this.state.teamName !== this.props.team.teamName)
         updatedTeam.teamName = this.state.teamName;

      if (this.state.owner.value !== this.props.team.ownerId)
         updatedTeam.ownerId = this.state.owner.value;

      this.props.onDismiss && this.props.onDismiss({ status: result,
       UpdatedTeam : updatedTeam});
   }

   getValidationState = () => {
      if (this.state.teamName)
         return null

      return "warning";
   }

   handleChange = (e) => {
      this.setState({teamName: e.target.value});
   }

   handleChangeSelect(event) {
      this.setState({owner : event});
   }

//  componentWillReceiveProps = (nextProps) => {
//    if (nextProps.showModal) {
//      this.setState({teamName: (nextProps.cnv && nextProps.cnv.title) || ""})
//    }
//  }

   render() {


      console.log(this.props);
      console.log(this.state.MemberOptions);
      console.log(this.props.showModal);
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
               {console.log(this.state.members)}
               {console.log(this.props.team.ownerId)}
               <Select
               name="Leader"
               options={this.state.members}
               value={this.state.owner}
               onChange={this.handleChangeSelect}/>
             </FormGroup>
           {/*Add dropdown for switching team leader */}
           </form>
         </Modal.Body>
         <Modal.Footer>
           <Button onClick={() => this.close("OK")}>Ok</Button>
           <Button onClick={() => this.close("Cancel")}>Cancel</Button>
         </Modal.Footer>
       </Modal>)
   }
}
