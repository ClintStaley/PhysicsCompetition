import React, { Component } from 'react';
import { Register, SignIn, CmpsPage, TeamsPage, CmpPage, ConfDialog }
 from '../concentrator'
import { Route, Switch } from 'react-router-dom';
import { Navbar, Nav, NavItem, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './Main.css';

const Home = (<h1>Home Page</h1>); // TODO make real home component

class Main extends Component {
   signedIn() {
      return Object.keys(this.props.prs).length !== 0;
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
                    {`Signed in as: ${this.props.prs.firstName} ${this.props.prs.lastName}`}
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
                        Competitions
                      </NavItem>
                    </LinkContainer>,
                    <LinkContainer key={1} to="/TeamsPage">
                      <NavItem>Teams</NavItem>
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
                <NavItem eventKey={2}
                 onClick = {() => this.signOut()}>Sign out</NavItem>
              </Nav> : ''
              }
            </Navbar.Collapse>
          </Navbar>
        </div>
        <Switch>
          <Route exact path='/' children={Home} />
          <Route path='/CmpsPage' component={CmpsPage} />} />
          <Route path='/TeamsPage' component={TeamsPage}/>
          <Route path='/signin' render={() => <SignIn {...this.props} />} />
          <Route path='/register' render={() => <Register {...this.props} />} />
          <Route path='/CmpPage/:cmpId'
           render={(props) => {
             return <CmpPage cmpId = {props.match.params.cmpId}
              {...this.props} />}} />
        </Switch>

        {/*Error popup dialog*/}
        <ConfDialog
           show={this.props.errs.length > 0}
           title="Error Notice"
           body={<ListGroup>
             {this.props.errs.map((err, i) =>
               <ListGroupItem key={i} bsStyle="danger">
                 {err}
               </ListGroupItem>
             )}
           </ListGroup>}
           buttons={['OK']}
           onClose={() => {this.props.clearErrors()}}
        />
      </div>
    )
   }
}

export default Main
