import React, { Component } from 'react';
import { Form, FormGroup, Col, FormControl, Button, ControlLabel } from 'react-bootstrap';

class SignIn extends Component {
   constructor(props) {
      super(props);

      //makes loggin in east, temp
      //has admin loggin info already filled out upon load
      this.state = {
         email: 'adm@11.com',
         password: 'password'
      };

      // bind event handlers to the correct context
      this.handleChange = this.handleChange.bind(this);
      this.signIn = this.signIn.bind(this);
   }

   //calls signIn updates history
   signIn(event) {
      this.props.signIn(this.state, () => {
        if (Object.keys(this.props.prs).length !== 0)
           this.props.history.push("/MyCmpsPage");
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
