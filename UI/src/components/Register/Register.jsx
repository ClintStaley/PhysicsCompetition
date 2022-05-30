import React, {Component} from 'react';
import {Form, FormGroup, Alert} from 'react-bootstrap';
import register_illustration from '../../assets/images/register.svg';
import './Register.css';

import {ConfDialog} from '../concentrator'

//FieldGroup item, will hold a field to be entered
function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <Form.Label>{label}</Form.Label>
      <Form.Control {...props} />
      {help && <Form.Control.HelpBlock>{help}</Form.Control.HelpBlock>}
    </FormGroup>
  );
}

class Register extends Component {
   constructor(props) {
      super(props);

      //start with empty values
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

      this.props.register(user, () => this.setState({offerSignin: true}));
   }

   handleSignin(ans) {
      if (ans === 'Yes')
         this.props.signIn(
          {email: this.state.email, password: this.state.password},
          ()=>this.props.history.push("/"));
      this.setState({offerSignin: false});
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

   //just checks that all the fields are filled, and passwords match
   isFormValid() {
      let s = this.state;

      return s.email && s.lastName && s.password && s.password === s.passwordTwo
       && s.termsAccepted;
   }

   openTerms(target) {
      var link = '/Docs/Terms.html';

      window.open(link, "_blank");
      target.preventDefault();
   }

  //renders all of the fields
  render() {
    return (
      <div className="register">
        <ConfDialog
          show={this.state.offerSignin}
          title="Successful registration"
          body="Do you want to log in right now?"
          buttons={['Yes', 'No']}
          onClose={(ans) => this.handleSignin(ans)}/>
        <form>
          <h1 className='register-title'>Register</h1>
          <FieldGroup
            id="email"
            type="email"
            label="Email Address"
            required={true}
            value={this.state.email}
            onChange={this.handleChange}
            style={{ border: 'none' }}
          />
          <FieldGroup
            id="firstName"
            type="text"
            label="First Name"
            value={this.state.firstName}
            onChange={this.handleChange}
            style={{ border: 'none' }}
          />
          <FieldGroup
            id="lastName"
            type="text"
            label="Last Name"
            required={true}
            onChange={this.handleChange}
            value={this.state.lastName}
            style={{ border: 'none' }}
          />
          <FieldGroup
            id="password"
            label="Password"
            type="password"
            required={true}
            onChange={this.handleChange}
            value={this.state.password}
            style={{ border: 'none' }}
          />
          <FieldGroup
            id="passwordTwo"
            label="Repeat Password"
            type="password"
            required={true}
            onChange={this.handleChange}
            value={this.state.passwordTwo}
            style={{ border: 'none' }}
          /> 
          <Form.Check
            id="termsAccepted"
            value={this.state.termsAccepted}
            onChange={this.handleChange}
            label={<span>Do you accept 
             the <a onClick={this.openTerms}>terms and conditions</a>?</span>}
          />
            
          <div className='centered'>
            <div
              type="submit"
              onClick={() => this.submit()}
              disabled={!this.isFormValid()}
              className='submit'
            >Register</div>
          </div>
        </form>
        <div className='errors'>
           {!this.state.email || !this.state.lastName ?
             <Alert bsStyle="warning">Email and last name required.</Alert> : ''}
           {this.state.password !== this.state.passwordTwo ?
             <Alert bsStyle="warning">Passwords do not match.</Alert> : ''}
           {!this.state.termsAccepted ?
             <Alert bsStyle="warning">Must accept terms to register.</Alert> : ''}
        </div>
        <img src={register_illustration} alt="Sign In"></img>
      </div>
    )
  }
}

export default Register;
