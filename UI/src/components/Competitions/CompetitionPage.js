import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import { putCmp, delCmp, postCmp } from '../../api';
import CmpModal from './CmpModal';
//import './ConversationsOverview.css';
export default class CompetitionPage extends Component {
   constructor(props) {
      super(props);
      this.props.updateCmps(this.props.Prss.id);
      this.state = {
         showModal: false,
         showConfirmation: false,
      }
   }


   render() {
      return (
      <section className="container">
        <h1>Competition Overview</h1>
        <ListGroup>
          {this.props.Cmps.map((cmp, i) => {
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
         {props.showControlls ?
            <div className="pull-right">
               <Button bsSize="small" onClick={props.onDelete}><Glyphicon glyph="trash" /></Button>
               <Button bsSize="small" onClick={props.onEdit}><Glyphicon glyph="edit" /></Button>
            </div>
         : ''}
      </ListGroupItem>
   )
}
