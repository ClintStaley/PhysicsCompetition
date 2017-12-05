


import React, { Component } from 'react';
import {
  Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';

export default class CmpModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cnvTitle: (this.props.cmp && this.props.cmp.title) || "",
    }
  }

  close = (result) => {
    this.props.onDismiss && this.props.onDismiss({
        status: result,
        cnvTitle: this.state.title
      });
  }

  getValidationState = () => {
    if (this.state.title) {
      return null
    }
    return "warning";
  }

  handleChange = (e) => {
    this.setState({title: e.target.value});
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.showModal) {
      this.setState({title: (nextProps.cmp && nextProps.cmp.title) || ""})
    }
  }

  render() {
    return (
    <Modal show={this.props.showModal} onHide={() => this.close("Cancel")}>
      <Modal.Header closeButton>
        <Modal.Title>{this.props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={(e) =>
            e.preventDefault() || this.state.title.length ?
            this.close("OK") : this.close("Cancel")}>
        <FormGroup
          controlId="formBasicText"
          validationState={this.getValidationState()}
        >
          <ControlLabel>Competition Title</ControlLabel>
          <FormControl
           type="text"
           value={this.state.ctpTitle}
           placeholder="Enter name of Competitoin Type"
           onChange={this.handleChange}
          />
          <FormControl
            type="text"
            value={this.state.title}
            placeholder="Enter title of new Competition"
            onChange={this.handleChange}
          />
          <FormControl
           type="Enter Prms"
           value={this.state.prms}
           placeholder="Enter text"
           onChange={this.handleChange}
          />
          <FormControl.Feedback />
          <HelpBlock>No fields can be empty.</HelpBlock>
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
