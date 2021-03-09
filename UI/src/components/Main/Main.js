import React, { Component } from 'react';
import { Register, SignIn, CmpsPage, TeamsPage, CmpPage, SbmPage, ConfDialog,
   InstructionsPage } from '../concentrator'
import { Route, Redirect, Switch } from 'react-router-dom';
import { Navbar, Nav, NavItem, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import './Main.css';

const Home = (
   <div width="100%" height="100%">
     <img  src="PhysicsCompetitionHomePicture.png" alt="PhysicsCompetition" width="100%" height="100%"/>
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
      console.log(this.props);
     var ProtectedRoute = this.ProtectedRoute;

    return (
      <div  className='flex'>
        <div>
              <div className='navigation'>
                {this.signedIn() ?
                  // User is signed in
                  [
                    <span key={3}>
                  {`Signed in as: ${this.props.prs.firstName} ${this.props.prs.lastName}`}
                </span>,
                    <LinkContainer key={0} to="/MyCmpsPage" >
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
                    <LinkContainer key={0} to="/signin">
                      <NavItem>Sign In</NavItem>
                    </LinkContainer>,
                    <LinkContainer key={1} to="/register">
                      <NavItem>Register</NavItem>
                    </LinkContainer>,
                  ]
                }
              <NavItem eventKey={5} onClick = {() => this.openHelp()}>
                Help
              </NavItem>
              {this.signedIn() ?
                <div>
                 <NavItem eventKey={4} onClick = {() => this.refresh()}>
                  Refresh
                </NavItem>
                <NavItem eventKey={3} onClick = {() => this.signOut()}>
                  Sign out
                </NavItem> 
                  </div>
                
               : ''}
              </div>
        </div>
        <Switch>
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
              component={SbmPage} team={this.props.teams[pathProps.match.params.teamId]}/>
          }/>

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
