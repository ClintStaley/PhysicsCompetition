import React, { Component } from 'react';
import { Register, SignIn, CmpsPage, TeamsPage, CmpPage }
 from '../concentrator'
import { Route, Switch } from 'react-router-dom';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './Main.css';

const Home = (<h1>Home Page</h1>); // TODO make real home component

class Main extends Component {
   signedIn() {
      return Object.keys(this.props.prss).length !== 0;
   }

   signOut(event) {
      console.log(this);
      this.props.signOut(() => { this.props.history.push("/") });
   }

   render() {
    return (
      <div>
        <div>
          <Navbar>
            <Navbar.Toggle />
            {this.signedIn() ?
                <Navbar.Text key={1}>
                    {`Signed in as: ${this.props.prss.firstName} ${this.props.prss.lastName}`}
                </Navbar.Text>
              : ''
              }
            <Navbar.Collapse>
              <Nav>
                {this.signedIn() ?
                  // User is signed in
                  [
                    <LinkContainer key={0} to="/CmpsPage">
                      <NavItem>
                        Competition
                      </NavItem>
                    </LinkContainer>,
                    <LinkContainer key={1} to="/Teams">
                      <NavItem>
                       Teams
                      </NavItem>
                    </LinkContainer>,
                  ]
                  :
                  [
                    <LinkContainer key={0} to="/signin">
                      <NavItem>
                        Sign In
                      </NavItem>
                    </LinkContainer>,
                    <LinkContainer key={1} to="/register">
                      <NavItem>
                        Register
                      </NavItem>
                    </LinkContainer>,
                  ]
                }
              </Nav>
              {this.signedIn() ?
              <Nav pullRight>
                <NavItem eventKey={2} onClick = {() => this.signOut()}>Sign out</NavItem>
              </Nav> : ''
              }
            </Navbar.Collapse>
          </Navbar>
        </div>
        <Switch>
          <Route exact path='/' children={Home} />
          <Route path='/CmpsPage' render={() => <CmpsPage {...this.props} />} />
          <Route path='/Teams' render={() => <TeamsPage {...this.props}/>}/>
          <Route path='/signin' render={() => <SignIn {...this.props} />} />
          <Route path='/register' render={() => <Register {...this.props} />} />
          <Route path='/CmpPage/:cmpId'
           render={(props) => {
             return <CmpPage cmpId = {props.match.params.cmpId}
              {...this.props} />}} />
        </Switch>
      </div>
    )
   }
}

export default Main
