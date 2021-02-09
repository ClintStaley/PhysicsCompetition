import React, { Component } from 'react';
import {
   Form, FormGroup, FormControl, ControlLabel, Row
} from 'react-bootstrap';
import './SignIn.css';

import signin_illustration from '../../images/signin.png';

class SignIn extends Component {
   constructor(props) {
      super(props);

      //makes loggin in east, temp
      //has admin loggin info already filled out upon load
      this.state = {
         email: '',
         password: ''
      };

      // bind event handlers to the correct context
      this.handleChange = this.handleChange.bind(this);
      this.signIn = this.signIn.bind(this);
   }

   //calls signIn updates history
   signIn(event) {
      this.props.signIn(this.state, () => {
        if (Object.keys(this.props.prs).length !== 0){
           this.props.getTeamsByPrs(this.props.prs.id);
           this.props.history.push("/MyCmpsPage");
        }
      });

      event.preventDefault(); //otherwise parent will respond
   }

   handleChange(event) {
      const newState = {};

      // Update form state and rerender
      newState[event.target.name] = event.target.value;
      this.setState(newState);
   }

   render() {
      return (
         <section className="container signin">
            <Row>

               <Form className='form'>
                  <h1 className='signin-title'>Sign in</h1>
                  <FormGroup controlId="formHorizontalEmail">
                     <ControlLabel>
                        Email:
                     </ControlLabel>
                     <FormControl
                        type="email"
                        name="email"
                        value={this.state.email}
                        onChange={this.handleChange}
                        style={{border: 'none'}}
                     />
                  </FormGroup>
                  <FormGroup controlId="formHorizontalPassword">
                     <ControlLabel>
                        Password:
                     </ControlLabel>
                     <FormControl
                        type="password"
                        name="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                        style={this.formControlStyles}
                     />
                  </FormGroup>
                  <div className='centered'>
                     <div
                        type="submit"
                        onClick={this.signIn}
                        className='submit'
                        >
                        Sign in
                     </div>
                  </div>
               </Form>
               <img src={signin_illustration} alt="Sign In"></img>
            </Row>
         </section>
      )
   }
}

export default SignIn;
