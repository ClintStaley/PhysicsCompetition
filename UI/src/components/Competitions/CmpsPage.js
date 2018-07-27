import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';


export default class CmpsPage extends Component {
   constructor(props) {
      super(props);

      //get all cmps from database
      //as of now will reget all cmps from database every time page is loaded
      if (!this.props.updateTimes.cmps)
         this.props.getAllCmps();

      console.log("reconstruct cmpsPage");

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
      <ConfDialog
        show={this.state.showConfirmation  != null }
        title="Delete Competition"
        body={`Are you sure you want to delete the Competition '${this.state.showConfirmation}'`}
        buttons={['Yes', 'Abort']}
        onClose={(res) => this.closeConfirmation(res, this.state.showConfirmation)} />
        <h1>Current Competition Overview</h1>
        {/*List all of the cmps by name for now*/}
        {/*only will show the cmps that person is a part of*/}
        <ListGroup>
          {Object.keys(this.props.cmps).map((cmpId, i) => {
            var cmp = this.props.cmps[cmpId];

            return <CompetitionItem
              key={i} {...cmp}/>
          })
          }
        </ListGroup>
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
