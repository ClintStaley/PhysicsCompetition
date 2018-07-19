import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import { putCmp, delCmp, postCmp } from '../../api';


export default class CompetitionPage extends Component {
   constructor(props) {
      super(props);

      //get all cmps from database
      //as of now will reget all cmps from database every time page is loaded
      this.props.updateCmps(this.props.prss.id);

   }


   render() {
      return (
      <section className="container">
        <h1>Current Competition Overview</h1>
        {/*List all of the cmps by name for now*/}
        {/*only will show the cmps that person is a part of*/}
        <ListGroup>

          {this.props.cmps.map((cmp, i) => {
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
         <Link to="#">{props.title}</Link>
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
