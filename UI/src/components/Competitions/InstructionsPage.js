import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class CmpPage extends Component {
   constructor(props) {
      super(props);
   }

   componentDidMount = () => {
      var props = this.props;

      if (!props.updateTimes.myCmps)
         props.getCtp(props.cmps[props.cmpId].ctpId);
   }


   render() {
      var props = this.props;
      var cmpId = props.cmpId;
      var ctpId = props.cmps[cmpId].ctpId

      return (
        <section className="container">
          <Link to = {'/MyCmpPage/' + cmpId}>  Back </Link>

          <h1>{props.cmps[cmpId].title} Instructions</h1>

          <div>{props.ctps[ctpId] && props.ctps[ctpId].tutorial}</div>
        </section>


      );
   }
}
