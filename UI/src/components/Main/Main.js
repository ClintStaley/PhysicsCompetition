import React, { Component } from 'react';
import { Register, SignIn, CmpsPage, TeamsPage, CmpPage, SbmPage, ConfDialog,
   InstructionsPage} from '../concentrator'
import { Route, Redirect, Switch } from 'react-router-dom';
import { Navbar, Nav, NavItem, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './Main.css';
import {Sampler3JS} from '../Util/Sampler3JS';
import {MovieController} from '../Submits/MovieController';

const Home = (
   <div width="100%" height="100%">
      <img  src="PhysicsCompetitionHomePicture.png" alt="PhysicsCompetition"
       width="100%" height="100%"/>
  </div>); // TODO make real home component

class Main extends Component {
   signedIn() {
      return this.props.prs && this.props.prs.id;
   }

   ProtectedRoute = ({component: Cmp, path, ...rest }) => {
      return (<Route path={path} render={(props) => {
         return this.signedIn() ?
           <Cmp {...rest}/> : <Redirect to='/signin'/>;
      }}/>);
   }

   signOut(event) {
      this.props.history.push("/");
      this.props.signOut();
   }

   refresh() {
      this.props.getTeamsByPrs(this.props.prs.id);
   }

   openHelp() {
      var link = '/Docs/Instructions.html';

      window.open(link, "_blank");
   }

   // render={(pathProps) => {
   // return reRoute(<CmpPage cmpId = {pathProps.match.params.cmpId}
   // myCmpLink = {true}
   // {...this.props} />)}} />

   render() {
     var ProtectedRoute = this.ProtectedRoute;

    // Navbar notes.  
    // For sidebar, you need a surrounding div to tell the overall layout that
    // your Switch goes to the side of the navbar.  You also need expand="false"
    // or the style navbar-expand is auto-attached to Navbar, forcing a row
    // orientation on the navbar, when a columnar is desired.  (Apparently
    // expandability is only a row-based concept in Navbar.)
    return (<div className="flex-main">
      <Navbar className='navbar-col' expand="false" bg="primary" variant="dark">
        <Nav>
          {this.signedIn() ?
            [
              <LinkContainer key={0} to="/MyCmpsPage" >
                <Nav.Link>My Competitions</Nav.Link>
              </LinkContainer>,
              <LinkContainer key={1} to="/AllCmpsPage">
                <Nav.Link>Join Competitions</Nav.Link>
              </LinkContainer>,
              <LinkContainer key={2} to="/TeamsPage">
                <Nav.Link>Teams</Nav.Link>
              </LinkContainer>,
            ]
            :
            [
              <LinkContainer key={0} to="/signin">
                <Nav.Link>Sign In</Nav.Link>
              </LinkContainer>,
              <LinkContainer key={1} to="/register">
                <Nav.Link>Register</Nav.Link>
              </LinkContainer>,
            ]
          }
          <Nav.Link onClick = {() => this.openHelp()}>Help</Nav.Link>
          {this.signedIn() ?
            <div>
              <Nav.Link onClick = {() => this.refresh()}>
                Refresh
              </Nav.Link>
              <Nav.Link onClick = {() => this.signOut()}>
                Sign out
              </Nav.Link> 
            </div>
            : ''}
        </Nav>
      </Navbar>

      <Switch className='page-col'>
        <Route exact path='/' children={Home} />

        <ProtectedRoute path='/MyCmpsPage' {...this.props}
         component = {CmpsPage} showAll = {false}/>

        <ProtectedRoute path='/AllCmpsPage' {...this.props}
         component = {CmpsPage} showAll = {true}/>

        <ProtectedRoute path='/TeamsPage' {...this.props} component = {TeamsPage}/>

        <Route path='/signin' render={() => <SignIn {...this.props} />}/>
        <Route path='/register' render = {() => <Register {...this.props}/>}/>

        <Route path='/MyCmpPage/:cmpId/' render={pathProps =>
          <ProtectedRoute path='/MyCmpPage/:cmpId' {...this.props}
          component={CmpPage} myCmpLink = {true}
          cmpId = {pathProps.match.params.cmpId}/>
        }/>

        <Route path='/JoinCmpPage/:cmpId/' render={pathProps =>
           <ProtectedRoute path='/JoinCmpPage/:cmpId/' {...this.props}
            component = {CmpPage}   myCmpLink = {false}
            cmpId = {pathProps.match.params.cmpId}/>
        }/>

        <Route path='/Instructions/:cmpId' render = {pathProps =>
           <ProtectedRoute path='/Instructions/:cmpId' {...this.props}
            component = {InstructionsPage} cmpId = {pathProps.match.params.cmpId}/>
        }/>

        <Route path='/SbmPage/:teamId' render={pathProps =>
           <ProtectedRoute path='/SbmPage/:teamId' {...this.props}
            component={SbmPage}
            team={this.props.teams[pathProps.match.params.teamId]}/>
        }/>

      </Switch>
      <Sampler3JS/>
    </div>);
  }
}

export default Main
