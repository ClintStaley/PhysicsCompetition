import React, { PureComponent } from 'react';
import {
   FormGroup, FormControl, HelpBlock, Button, Modal
} from 'react-bootstrap';


/**
 * Properties expected:
 * show: boolean
 * body: string
 * buttons: Array<string>
 */
export default class EntryDialog extends PureComponent {
   constructor(props) {
      super(props);

      this.state = {
         value: ""
      };

      this.handleChange = this.handleChange.bind(this);
   }

   // Allows for enter key to submit
   componentDidMount() {
      document.addEventListener("keydown", this.handleKeyPress, false);
   }
   componentWillUnmount() {
      document.removeEventListener("keydown", this.handleKeyPress, false);
   }

   handleKeyPress = (target) => {
      if (target.keyCode === "\r".charCodeAt(0) && this.props.show) {
         target.preventDefault();
         this.close("OK");
      }
   }

   close = (status) => {
      this.props.onClose({status, entry: this.state.value});
   }

   getValidationState = () => {
      return this.state.value && this.state.value !== "" ?
       "success" : "error";
   }

   // Only possible change is a new team name value
   handleChange = (e) => {
      this.setState({value: e.target.value});
   }

  render() {
     var props = this.props;

     return (
     <Modal show={props.show} onHide={() => this.close("Dismissed")}>
       <Modal.Header closeButton>
         <Modal.Title>{props.title}</Modal.Title>
       </Modal.Header>
       <Modal.Body>
         <FormGroup controlId={"val"}
         validationState={this.getValidationState()}>
           <FormControl.ControlLabel>{props.label}</FormControl.ControlLabel>
           <FormControl type="text" placeholder={`Enter ${props.label}`}
            value = {this.state.value} onChange={this.handleChange}/>

           <FormControl.Feedback />
           {props.help && <HelpBlock>{props.help}</HelpBlock>}
         </FormGroup>
       </Modal.Body>
       <Modal.Footer>
         <Button key={0}  disabled = {this.getValidationState() !== "success"}
          onClick={() => this.close('OK')}>OK</Button>
         <Button key={1} onClick={() => this.close('Cancel')}>Cancel</Button>
       </Modal.Footer>
     </Modal>)
  }
}
