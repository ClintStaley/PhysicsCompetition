import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class CmpPage extends Component {
   constructor(props) {
      super(props);


   }

   render() {
      var props = this.props;
      var cmpId = props.cmpId;

      return (
        <div>
          <h1>{props.cmps[cmpId].title}</h1>
        </div>


      );
   }
}
