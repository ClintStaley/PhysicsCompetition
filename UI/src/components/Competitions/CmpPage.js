import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';

export default class Competition extends Component {
   constructor(props) {
      super(props);


   }

   render() {
      var cmpId = this.props.cmpId;

      return (
      <section className="container">
      {console.log(this.props)}
        <h1>{this.props.cmps[cmpId].title}</h1>
      </section>
      )
   }
}
