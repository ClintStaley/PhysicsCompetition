import React, { Component } from 'react';
import {
   Form, FormGroup, FormControl, Row
} from 'react-bootstrap';
import './SignIn.css';

import signin_illustration from '../../images/signin.png';

class SignIn extends Component {
   constructor(props) {
      super(props);
      console.log(props)

      //makes loggin in easy, temp
      //has admin loggin info already filled out upon load
      this.state = {
         email: 'admin@softwareinventions.com',
         password: 'password'
      };

      // bind event handlers to the correct context
      this.handleChange = this.handleChange.bind(this);
      this.signIn = this.signIn.bind(this);
   }

   //calls signIn updates history
   signIn(event) {
      this.props.getAllCtps();
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
                     <Form.Label>
                        Email:
                     </Form.Label>
                     <FormControl
                        type="email"
                        name="email"
                        value={this.state.email}
                        onChange={this.handleChange}
                        style={{border: 'none'}}
                     />
                  </FormGroup>
                  <FormGroup controlId="formHorizontalPassword">
                     <Form.Label>
                        Password:
                     </Form.Label>
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
