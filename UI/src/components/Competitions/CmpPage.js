import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';

export default class cmpPage extends Component {
   constructor(props) {
      super(props);

      //attempt to remove a bug in
      if (!this.props.updateTimes.cmps)
         this.props.getCmps();
   }

   render() {
      var cmpId = this.props.cmpId;

      return (
      <section className="container">
        <h1>{this.props.cmps[cmpId].title}</h1>
      </section>
      )
   }

}
