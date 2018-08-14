import React, { Component } from 'react';
import { Register, SignIn, CmpsPage, TeamsPage, CmpPage, SbmPage, ConfDialog,
   InstructionsPage } from '../concentrator'
import { Route, Switch } from 'react-router-dom';
import { Navbar, Nav, NavItem, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './Main.css';

const Home = (<h1>Home Page</h1>); // TODO make real home component

class Main extends Component {
   signedIn() {
      return this.props.prs && this.props.prs.id;
   }

   reRoute = (destinationComponent) => {
      if (this.signedIn())
         return destinationComponent;
      else {
         this.props.history.push("/");
         return Home;
      }
   }

   reRouteV2 = (paramaters, renderFunc) => {
      if (this.signedIn())
         return renderFunc(paramaters);
      else {
         this.props.history.push("/");
         return Home;
      }
   }

   signOut(event) {
      this.props.history.push("/");
      this.props.signOut();
   }

   render() {
     var reRoute = this.reRoute;

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
                    <LinkContainer key={0} to="/MyCmpsPage">
                      <NavItem>My Competitions</NavItem>
                    </LinkContainer>,
                    <LinkContainer key={1} to="/AllCmpsPage">
                      <NavItem>Join Competitions</NavItem>
                    </LinkContainer>,
                    <LinkContainer key={2} to="/TeamsPage">
                      <NavItem>Teams</NavItem>
                    </LinkContainer>,
                  ]
                  :
                  [
                    <LinkContainer key={0} to="/signin">
                      <NavItem>Sign In</NavItem>
                    </LinkContainer>,
                    <LinkContainer key={1} to="/register">
                      <NavItem>Register</NavItem>
                    </LinkContainer>,
                  ]
                }
              </Nav>
              {this.signedIn() ?
              <Nav pullRight>
                <NavItem eventKey={2} onClick = {() => this.signOut()}>
                  Sign out
                </NavItem>
              </Nav> : ''
              }
            </Navbar.Collapse>
          </Navbar>
        </div>
        <Switch>
          <Route exact path='/' children={Home} />
          <Route path='/MyCmpsPage'
           render={() => reRoute(<CmpsPage showAll = {false}/>)} />} />
           <Route path='/AllCmpsPage'
           render={() => reRoute(<CmpsPage showAll = {true}/>)} />} />
          <Route path='/TeamsPage' component = {TeamsPage}/>
          <Route path='/signin' render = {() => <SignIn {...this.props} />} />
          <Route path='/register' render = {() => <Register {...this.props} />}/>

          <Route path='/MyCmpPage/:cmpId/'
              render={(pathProps) => {
              return reRoute(<CmpPage cmpId = {pathProps.match.params.cmpId}
              myCmpLink = {true}
              {...this.props} />)}} />

          <Route path='/JoinCmpPage/:cmpId/'
              render={(pathProps) => {
                 return reRoute(<CmpPage cmpId = {pathProps.match.params.cmpId}
              myCmpLink = {false}
              {...this.props} />)}}/>

          <Route path='/Instructions/:cmpId' render = {(pathProps) =>
              reRoute(<InstructionsPage cmpId = {pathProps.match.params.cmpId}
              {...this.props} />)} />

          <Route path='/SbmPage/:teamId'
              render={(pathProps) => {
                 var team = this.props.teams[pathProps.match.params.teamId];
                 if (team) //easiest fix to reload on submit page
                    var cmp = this.props.cmps[team.cmpId];

                 return reRoute(<SbmPage team={team} cmp={cmp}/>);
              }}/>

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
