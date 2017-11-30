import React, { Component } from 'react';
import {
  FormGroup, ControlLabel, FormControl, HelpBlock,
  Checkbox, Button, Alert
} from 'react-bootstrap';
import { registerUser, errorTranslate } from '../../api';
//import './Register.css';

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

class Register extends Component {
   constructor(props) {
      super(props);
      this.state = {
         firstName: '',
         lastName: '',
         email: '',
         password: '',
         passwordTwo: '',
         termsAccepted: false,
         role: 0
      }

      this.handleChange = this.handleChange.bind(this);
   }

   submit() {
      let { // Make a copy of the relevant values in current state
         firstName,
         lastName,
         email,
         password,
         termsAccepted,
         role
      } = this.state;
      const user = {
         firstName,
         lastName,
         email,
         password,
         termsAccepted,
         role
      };
      registerUser(user)
         .then((res) => {
            if (res.ok)
               return // TODO show log in dialog
            return res.json()
         })
         .then((err) => {
            if (err) {
               this.setState({ registerStatus: "error", err })
            } else {
               this.setState({ registerStatus: "success", err: undefined });
            }
         })
   }

   handleChange(ev) {
      let newState = {};
      switch (ev.target.type) {
         case 'checkbox':
            newState[ev.target.id] = ev.target.checked;
            break;
         default:
            newState[ev.target.id] = ev.target.value;
      }
      this.setState(newState);
   }

   formValid() {
      let s = this.state;
      return s.email && s.lastName && s.password && s.password === s.passwordTwo &&
         s.termsAccepted;
   }

   registerResult(status = "") {
    if (status === "error")
      return (
        <Alert bsStyle="danger">
          <h2>Oh no!</h2>
          <strong>Registration had the following warnings:</strong>
          {this.state.err.map((err, i) => <p key={i}>{errorTranslate(err.tag)}</p>)}
        </Alert>
      )
    else if (status === "success")
      return (
        <Alert bsStyle="success">
          <h2>Registration successfull!</h2>
          <p>Do you want to sign in straight away?</p>
          <Button onClick={() =>
            this.props.signIn({ email: this.state.email, password: this.state.password },
              () => this.props.history.push("/"))
          }>
            Sign in
      </Button>
        </Alert>
      )
  }

  render() {
    return (
      <div className="container">
        {this.registerResult(this.state.registerStatus)}
        <form>
          <FieldGroup
            id="email"
            type="email"
            label="Email Address"
            placeholder="Enter email"
            required={true}
            value={this.state.email}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="firstName"
            type="text"
            label="First Name"
            placeholder="Enter first name"
            value={this.state.firstName}
            onChange={this.handleChange}
          />
          <FieldGroup
            id="lastName"
            type="text"
            label="Last Name"
            placeholder="Enter last name"
            required={true}
            onChange={this.handleChange}
            value={this.state.lastName}
          />
          <FieldGroup
            id="password"
            label="Password"
            type="password"
            required={true}
            onChange={this.handleChange}
            value={this.state.password}
          />
          <FieldGroup
            id="passwordTwo"
            label="Repeat Password"
            type="password"
            required={true}
            onChange={this.handleChange}
            value={this.state.passwordTwo}
          />
          <Checkbox
            value={this.state.termsAccepted}
            onChange={this.handleChange}
            id="termsAccepted"
          >
            Do you accept the terms and conditions?
          </Checkbox>
        </form>
        {this.state.password !== this.state.passwordTwo ?
          <Alert bsStyle="warning">
            <strong>Holy guacamole!</strong> Yo passwords don not seem to match up.
        </Alert> : ''}

        <Button
          bsStyle="primary"
          onClick={() => this.submit()}
          disabled={!this.formValid()}
        >
          Submit
        </Button>
      </div>
    )
  }
}

export default Register;