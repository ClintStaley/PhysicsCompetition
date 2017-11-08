import React, { Component } from 'react';
import { Form, FormGroup, Col, FormControl, Button, ControlLabel } from 'react-bootstrap';
//import './SignIn.css';

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: 'EmailA@domainA',
      password: 'PasswordA'
    }

    // bind 'this' to the correct context
    this.handleChange = this.handleChange.bind(this);
    this.signIn = this.signIn.bind(this);
  }

  signIn(event) {
    console.log("Click");
    console.log(this.state);
    this.props.signIn(this.state, () => {
      console.log("Callback");
      this.props.history.push("/")
    });

    event.preventDefault()
  }

  handleChange(event) {
    const newState = {}
    newState[event.target.name] = event.target.value;
    this.setState(newState);
  }

  render() {
    return (
      <section className="container">
        <Col smOffset={2}>
          <h1>Sign in</h1>
        </Col>
        <Form horizontal>
          <FormGroup controlId="formHorizontalEmail">
            <Col componentClass={ControlLabel} sm={2}>
              Email
            </Col>
            <Col sm={8}>
              <FormControl
                type="email"
                name="email"
                placeholder="Email"
                value={this.state.email}
                onChange={this.handleChange}
              />
            </Col>
          </FormGroup>
          <FormGroup controlId="formHorizontalPassword">
            <Col componentClass={ControlLabel} sm={2}>
              Password
            </Col>
            <Col sm={8}>
              <FormControl
                type="password"
                name="password"
                placeholder="Password"
                value={this.state.password}
                onChange={this.handleChange}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col smOffset={2} sm={8}>
              <Button type="submit" onClick={this.signIn}>
                Sign in
        </Button>
            </Col>
          </FormGroup>
        </Form>
      </section>
    )
  }
}

export default SignIn;
