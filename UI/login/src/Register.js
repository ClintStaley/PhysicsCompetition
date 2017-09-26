import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import axios from 'axios';
import Login from './Login';

class Register extends Component {
   constructor(props){
      super(props);
      this.state={
         first_name:'',
         last_name:'',
         email:'',
         password:'',
         confirmPassword:''
      }
   }
   render() {
      return (
         <div>
            <MuiThemeProvider>
               <div>
                  <AppBar
                     title="Register"
                  />
                  <TextField
                     hintText="Enter your First Name"
                     floatingLabelText="First Name"
                     onChange = {(event,newValue) => this.setState({first_name:newValue})}
                  />
                  <br/>
                  <TextField
                     hintText="Enter your Last Name"
                     floatingLabelText="Last Name"
                     onChange = {(event,newValue) => this.setState({last_name:newValue})}
                  />
                  <br/>
                  <TextField
                     hintText="Enter your Email"
                     type="email"
                     floatingLabelText="Email"
                     onChange = {(event,newValue) => this.setState({email:newValue})}
                  />
                  <br/>
                  <TextField
                     type = "password"
                     hintText="Enter your Password"
                     floatingLabelText="Password"
                     onChange = {(event,newValue) => this.setState({password:newValue})}
                  />
                  <br/>
                  <TextField
                     type = "password"
                     hintText="Confirm your Password"
                     floatingLabelText="Confirm Password"
                     onChange = {(event,newValue) => this.setState({confirmPassword:newValue})}
                  />
                  <br/>
                  <RaisedButton label="Submit" primary={true} style={style} onClick={(event) => this.handleClick(event)}/>
               </div>
            </MuiThemeProvider>
         </div>
      );
   }
   
   handleClick(event){
      var apiBaseUrl = "http://localhost:3000/";
      console.log("values",this.state.first_name,this.state.last_name,this.state.email,this.state.password,this.state.confirmPassword);
      //To be done:check for empty values before hitting submit
      var self = this;
      if (this.state.password !== this.state.confirmPassword) {
         console.log("passwords do not match");
         alert("passwords do not match");
      }
      else {
         var payload = {
            "firstName": this.state.first_name,
            "lastName": this.state.last_name,
            "email": this.state.email,
            "password": this.state.password,
            "termsAccepted": true,
            "role": 0
         };
         axios.post(apiBaseUrl + 'Prss', payload)
            .then(function (response) {
               console.log(response);
               if (response.status === 200) {
                  //console.log("registration successfull");
                  var loginscreen = [];
                  loginscreen.push(<Login parentContext={this}/>);
                  var loginmessage = "Not Registered yet.Go to registration";
                  self.props.parentContext.setState({
                     loginscreen: loginscreen,
                     loginmessage: loginmessage,
                     buttonLabel: "Register",
                     isLogin: true
                  });
               }
            })
            .catch(function (error) {
               console.log(error.message);
               console.log(error.code); // Not always specified
               console.log(error.config); // The config that was used to make the request
               console.log(error.response); // Only available if response was received from the server
            });
      }
   }

}
const style = {
   margin: 15,
};
export default Register;