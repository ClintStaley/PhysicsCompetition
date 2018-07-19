import React, { Component } from 'react';
import {
  Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';

export default class TeamModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cnvTitle: (this.props.cnv && this.props.cnv.title) || "",
    }
  }

  close = (result) => {
    this.props.onDismiss && this.props.onDismiss({
        status: result,
        cnvTitle: this.state.cnvTitle
      });
  }

  getValidationState = () => {
    if (this.state.cnvTitle) {
      return null
    }
    return "warning";
  }

  handleChange = (e) => {
    this.setState({cnvTitle: e.target.value});
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.showModal) {
      this.setState({cnvTitle: (nextProps.cnv && nextProps.cnv.title) || ""})
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
            e.preventDefault() || this.state.cnvTitle.length ?
            this.close("OK") : this.close("Cancel")}>
        <FormGroup
          controlId="formBasicText"
          validationState={this.getValidationState()}
        >
          <ControlLabel>Team Name</ControlLabel>
          <FormControl
            type="text"
            value={this.state.cnvTitle}
            placeholder="Enter text"
            onChange={this.handleChange}
          />
          <FormControl.Feedback />
          <HelpBlock>Title can not be empty.</HelpBlock>
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
