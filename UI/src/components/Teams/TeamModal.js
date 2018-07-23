import React, { Component } from 'react';
import {
  Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';
import Select from 'react-select';

export default class TeamModal extends Component {
   constructor(props) {
      super(props);
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({ status: result,
       UpdatedTeam : {teamName: this.state.teamName}});
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
      this.setState({leader : event.target.value});
   }

//  componentWillReceiveProps = (nextProps) => {
//    if (nextProps.showModal) {
//      this.setState({teamName: (nextProps.cnv && nextProps.cnv.title) || ""})
//    }
//  }

   render() {
      this.state = {
       teamName: (this.props.team && this.props.team.teamName) || ""}

      var MemberOptions = [];

      for (var property in this.props.team.members) {
         if (this.props.team.members.hasOwnProperty(property)) {
            MemberOptions.push({label: this.props.team.members[property]
             .firstName, value: this.props.team.members[property].firstName});
         }
      }
      console.log(this.props);
      console.log(MemberOptions);
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
               <div>
                 <Select options={MemberOptions}/>
               </div>
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
