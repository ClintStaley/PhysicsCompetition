import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';

export default class CmpPage extends Component {
   constructor(props) {
      super(props);

      //attempt to remove a bug in
      if (!this.props.updateTimes.cmps)
         this.props.getAllCmps();
   }

   render() {
      var cmpId = this.props.cmpId;

      return (
      <section className="container">
        <h1>{this.props.cmps[cmpId].title}</h1>
        <ListGroup>
          {this.props.cmps[cmpId].cmpTeams.map((teamId, i) => {
            if (!this.props.teams[teamId])
              return null;

            var team = this.props.teams[teamId];
            return <TeamLine key={i} {...team}/>
         })}
        </ListGroup>
      </section>
      );
   }
}

const TeamLine = function (props) {
   return (
     <ListGroupItem className="clearfix">
       <ListGroup>
         {Object.keys(props.members).map((memNum, i) => {
           var member = props.members[memNum];

           return <MemberItem key={i} {...member}/>
         })}
       </ListGroup>
     </ListGroupItem>
   )
}

const MemberItem = function (props) {
   return (
     <ListGroupItem className="clearfix">
        <Link to="#">{props.firstName}</Link>
     </ListGroupItem>
   );
}
