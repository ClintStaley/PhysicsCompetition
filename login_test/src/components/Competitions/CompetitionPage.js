import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import { putCnv, delCnv, postCnv } from '../../api';
//import './ConversationsOverview.css';

export default class CompetitionPage extends Component {
  constructor(props) {
    super(props);
    this.props.getCmps();
    this.state = {
      showModal: false,
      showConfirmation: false,
    }
  }

/*
  updateCnv(result) {
    putCnv(this.state.editCnv.id, {title: result.cnvTitle})
        .then((res) => {
          if (res.ok) {
            this.props.getCnvs();
          } else {
            return res.json()
          }
        })
        .then((err) => {
          if (err)
            console.log(err)
        })
  }
*/
  render() {
    return (
      <section className="container">
        <h1>Competition Overview</h1>
        <ListGroup>
          {this.props.Cnvs.map((cnv, i) => {
            return <CompetitionItem
              key={i} {...cnv}
              showControlls={cnv.ownerId === this.props.Prss.id}
              onDelete={() => this.openConfirmation(cnv)}
              onEdit={() => this.openModal(cnv)} />
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
