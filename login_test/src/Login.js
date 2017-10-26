import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import React from 'react';
import axios from 'axios';
import Uploadscreen from './UploadScreen';

class Login extends React.Component {
   constructor(props){
      super(props);
      this.state={
         username:'',
         password:''
      }
   }
   render() {
      return (
         <div>
            <MuiThemeProvider>
               <div>
                  <AppBar
                     title="Login"
                  />
                  <TextField
                     hintText="Enter your Username"
                     floatingLabelText="Username"
                     onChange = {(event,newValue) =>
                        this.setState({username:newValue})}
                  />
                  <br/>
                  <TextField
                     type="password"
                     hintText="Enter your Password"
                     floatingLabelText="Password"
                     onChange = {(event,newValue) =>
                        this.setState({password:newValue})}
                  />
                  <br/>
                  <RaisedButton
                     label="Submit"
                     primary={true}
                     style={style}
                     onClick={(event) => this.handleClick(event)}
                  />
               </div>
            </MuiThemeProvider>
         </div>
      );
   }
   
   handleClick(event){
      var apiBaseUrl = "http://localhost:3000/";
      var self = this;
      var payload={
         "email":this.state.username,
         "password":this.state.password
      }
      axios.post(apiBaseUrl+'Ssns', payload)
         .then(function (response) {
            console.log(response);
            if(response.status === 200){
               console.log("Login successful");
               var uploadScreen=[];
               uploadScreen.push
                  (<Uploadscreen appContext={self.props.appContext}/>);
               self.props.appContext.setState
                  ({uploadScreen:uploadScreen, loginPage:[]});
            }
            else if(response.status === 204){
               console.log("Username password do not match");
               alert("username password do not match");
            }
            else{
               console.log("Username does not exists");
               alert("Username does not exist");
            }
         })
         .catch(function (error) {
            console.log(error);
         });
   }
}
const style = {
   margin: 15,
};
export default Login;