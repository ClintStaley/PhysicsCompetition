import React, { Component } from 'react';
import {
  Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';
import Select from 'react-select';

export default class TeamModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      TeamName: (this.props.team && this.props.team.teamName) || "",
    }
  }

  close = (result) => {
    this.props.onDismiss && this.props.onDismiss({
        status: result,
        UpdatedTeam : {teamName: this.state.TeamName}
      });
  }

  getValidationState = () => {
    if (this.state.TeamName) {
      return null
    }
    return "warning";
  }

  handleChange = (e) => {
    this.setState({TeamName: e.target.value});
  }

  handleChangeSelect(event) {
    this.setState({leader : event.target.value});
  }

//  componentWillReceiveProps = (nextProps) => {
//    if (nextProps.showModal) {
//      this.setState({TeamName: (nextProps.cnv && nextProps.cnv.title) || ""})
//    }
//  }

  render() {
    var MemberOptions = [];

    for (var property in this.props.team.members) {
       if (this.props.team.members.hasOwnProperty(property)) {
          MemberOptions.push(this.props.team.members[property].firstName);
       }
    }
    console.log(this.props);
    console.log(MemberOptions);

    return (
    <Modal show={this.props.showModal} onHide={() => this.close("Cancel")}>
      <Modal.Header closeButton>
        <Modal.Title>{this.props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={(e) =>
            e.preventDefault() || this.state.TeamName.length ?
            this.close("OK") : this.close("Cancel")}>
        <FormGroup
          controlId="formBasicText"
          validationState={this.getValidationState()}>
          <ControlLabel>Team Name</ControlLabel>
          <FormControl
            type="text"
            value={this.state.TeamName}
            placeholder="Enter text"
            onChange={this.handleChange}
          />
          <FormControl.Feedback />
          <HelpBlock>There must be a team name.</HelpBlock>

          <div>
          <Select
            options={['hello','test']}
            />
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
