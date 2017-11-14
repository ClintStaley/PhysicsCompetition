import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';
import { ConfDialog } from '../concentrator';
import { putCmp, delCmp, postCmp } from '../../api';
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
/*
//#######################################################################
  openModal = (cnv) => {
    const newState = { showModal: true };
    if (cnv)
      newState['editCnv'] = cnv;
    this.setState(newState);
  }
//#################################################################
  modalDismiss = (result) => {
    if (result.status === "OK") {
      if (this.state.editCnv)
        this.updateCnv(result);
      else
        this.newCnv(result);
    }
    this.setState({ showModal: false, editCnv: null });
  }
//#################################################################
  updateCnv(result) {
    putCnv(this.state.editCnv.id, {title: result.cnvTitle})
        .then((res) => {
          if (res.ok) {
            this.props.updateCnvs();
          } else {
            return res.json()
          }
        })
        .then((err) => {
          if (err)
            console.log(err)
        })
  }
//#################################################################
  newCnv(result) {
    postCnv({title: result.cnvTitle})
      .then( res => res.ok ? this.props.updateCnvs() : "Error posting conversation")
      .then( err => err ? console.log(err) : '')
  }*/
//#################################################################
  openConfirmation = (cmp) => {
    this.setState({ delCmp: cmp, showConfirmation: true })
  }
//##################################################################
  closeConfirmation = (res) => {
    if (res === 'Yes') {
      console.log("DEL COMP")
      delCmp(this.state.delCmp.id)
        .then( res => res.ok ? this.props.updateCmps() : "Delete failed")
        .then( err => err ? console.log(err):'');
    }
    this.setState({ showConfirmation: false , delCmp: null})
  }
  //##############################################################33

  render() {
    return (
      <section className="container">
        <h1>Competition Overview</h1>
        <ListGroup>
          {this.props.Cmps.map((cnv, i) => {
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
