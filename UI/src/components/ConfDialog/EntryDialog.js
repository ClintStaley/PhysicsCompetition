import React, { PureComponent } from 'react';
import {
   FormGroup, ControlLabel, FormControl, HelpBlock, Button, Alert, Modal
} from 'react-bootstrap';


/**
 * Properties expected:
 * show: boolean
 * body: string
 * buttons: Array<string>
 */
export default class EntryDialog extends PureComponent {
   close = (status) => {
      this.props.onClose({status, entry: this.ref.value});
   }

  render() {
     var props = this.props;

     return (
     <Modal show={props.show} onHide={() => this.close("Dismissed")}>
       <Modal.Header closeButton>
         <Modal.Title>{props.title}</Modal.Title>
       </Modal.Header>
       <Modal.Body>
         <FormGroup controlId={"val"}>
           <ControlLabel>{props.label}</ControlLabel>
           <FormControl type="text" placeholder={`Enter ${props.label}`}
            value = {props.initValue} required={true}
            inputRef={ref => this.ref = ref}/>
           {props.help && <HelpBlock>{props.help}</HelpBlock>}
         </FormGroup>
       </Modal.Body>
       <Modal.Footer>
         <Button key={0} onClick={() => this.close('OK')}>OK</Button>
         <Button key={1} onClick={() => this.close('Cancel')}>Cancel</Button>
       </Modal.Footer>
     </Modal>)
  }
}
