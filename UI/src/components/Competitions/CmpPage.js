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
        <ListGroup>
         {Object.keys(this.props.teams).map((teamId, i) => {
           if (this.props.teams[teamId].cmpId !== cmpId)
               return null;

           var cmp = this.props.cmps[cmpId];

           return <TeamLine
             key={i} {...cmp}/>
         })
         }
      </ListGroup>
      </section>
      )
   }

   const TeamLine = function (props) {
      return (
      <ListGroupItem className="clearfix">
        <ListGroup>
          {Object.keys(props.members).map((memNum, i) => {
            var member = props.members[memNum];
            return <MemberItem
              key={i} {...member}
            })
          }
        </ListGroup>
      </ListGroupItem>
      )
   }

   const MemberItem = function (props) {
      return (
      <ListGroupItem className="clearfix">
        <Link to="#">{props.firstName}</Link>
      </ListGroupItem>
      )
   }
}
