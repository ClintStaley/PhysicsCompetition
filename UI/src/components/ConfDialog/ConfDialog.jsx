import React, { PureComponent } from 'react';
import { Modal, Button } from 'react-bootstrap';


/**
 * Properties expected:
 * show: boolean
 * body: string
 * buttons: Array<string>
 */
export default class ConfDialog extends PureComponent {

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
         this.close("Yes");
      }
   }

   close = (result) => {
      this.props.onClose(result)
   }

  render() {
    return (
    <Modal show={this.props.show} onHide={() => this.close("Dismissed")}>
      <Modal.Header closeButton>
        <Modal.Title>{this.props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {this.props.body}
      </Modal.Body>
      <Modal.Footer>
        {this.props.buttons.map((btn, i) => <Button key={i} onClick={() => this.close(btn)}>{btn}</Button>)}
      </Modal.Footer>
    </Modal>)
  }
}
