import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../actions/actionCreators';
import { ListGroup, ListGroupItem, Button, Glyphicon, Tabs, Tab} from 'react-bootstrap';
import { ConfDialog } from '../concentrator';


class CmpsPage extends Component {
   constructor(props) {
      super(props);

      //get all cmps from database
      //as of now will reget all cmps from database every time page is loaded
      if (!this.props.updateTimes.cmps)
         this.props.getAllCmps();

      this.props.getMyCmps(this.props.prs.id);

      this.state = {
         showConfirmation: null
      }
   }

   componentWillUnmount

   // Thus far the only confirmation is for a delete.
   closeConfirmation = (res, cmpId) => {
      if (res === 'Yes') {
         this.props.deleteCmp(this.props.cmps[cmpId].cmpId, cmpId);
      }
      this.setState({showConfirmation: null})
   }

   openConfirmation = (cmpId) => {
      this.setState({showConfirmation: cmpId })
   }

   render() {
      return (
      <section className="container">
      {console.log(this.props)}
      <ConfDialog
        show={this.state.showConfirmation  != null }
        title="Delete Competition"
        body={`Are you sure you want to delete the Competition '${this.state.showConfirmation}'`}
        buttons={['Yes', 'Abort']}
        onClose={(res) => this.closeConfirmation(res, this.state.showConfirmation)} />
        <h1>Competition Overview</h1>
        {/*List all of the cmps by name for now*/}
        {/*for now just spits out two lists with, clean up UI later*/}

        <Tabs>
          <Tab eventKey={1} title="My Competitions">
          <ListGroup>
            {this.props.prs.myCmps && this.props.prs.myCmps.map((cmpId, i) => {
             var cmp = this.props.cmps[cmpId];

             return <CompetitionItem
                key={i} {...cmp}/>
            })}
          </ListGroup>
          </Tab>
          <Tab eventKey={2} title="All Competitions">
          <ListGroup>
              {Object.keys(this.props.cmps).map((cmpId, i) => {
                var cmp = this.props.cmps[cmpId];

                return <CompetitionItem
                  key={i} {...cmp}/>
              })}

          </ListGroup>
          </Tab>
        </Tabs>
      </section>
      )
  }
}

// A conversation list item
const CompetitionItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
         <Link to = {'/CmpPage/' + props.id} >{props.title}</Link>

         {/*ShowControlls is not used now will be used later*/}
         {props.showControlls ?
            <div className="pull-right">
               <Button bsSize="small" onClick={props.onDelete}><Glyphicon glyph="trash" /></Button>
               <Button bsSize="small" onClick={props.onEdit}><Glyphicon glyph="edit" /></Button>
            </div>
         : ''}
      </ListGroupItem>
   )
}

//makes CmpsPage a container componet, rather than a presentational componet
function mapStateToProps(state) {
   return {
      prs: state.prs,
      teams: state.teams,
      cmps: state.cmps,
      updateTimes: state.updateTimes
   }
}

function mapDispatchToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

//connects CmpsPage to the store
CmpsPage = connect(mapStateToProps, mapDispatchToProps)(CmpsPage)
export default CmpsPage
