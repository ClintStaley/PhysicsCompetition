import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';

// Expected props are:
//  prms -- the parameters for the displayed competition
//  sbm -- the submission to display
export default class LandGrab extends Component {
   constructor(props) {
      super(props);

      this.state = {
         sbmConfirm: null, // Function to post current submission
		}
   }

   render() {
      var prms = this.props.prms;
      var sbm = this.state.sbms[0];
      var hashClass, offs, rect, grid, obstacles, circles;

      // Heavy cross hatches every 10, with light cross hatches between
      grid = [];
      for (offs = 5; offs < 100; offs += 5) {
         hashClass = offs % 10 === 5 ? "graph5" : "graph10";
         grid.push(
          <line x1="{offs}" y1="0" x2="{offs}" y2="100" class="{hashClass}"/>);
         grid.push(
          <line x1="0" y1="{offs}" x2="100" y2="{offs}" class="{hashClass}"/>);
      }

      // Obstacle rectangles
      obstacles = [];
      for (rect in prms.obstacles) {
         obstacles.push(<rect x="{rect.loX}" y="{rect.loY}"
          width="{rect.hiX - rect.loX}" height="{rect.hiY - rect.loY}"
          class="obstacle"/>);

         obstacles.push(<text x="{rect.loX}" y="{100-rect.hiY+2}" class="text">
          {"(" + rect.loX + "'" + rect.hiY + ")"}</text>);
         obstacles.push(<text x="{rect.hiX}" y="{100-rect.hiY+2}" class="text">
          {"(" + rect.hiX + "'" + rect.hiY + ")"}</text>);
         obstacles.push(<text x="{rect.loX}" y="{100-rect.loY}" class="text">
          {"(" + rect.loX + "'" + rect.loY + ")"}</text>);
         obstacles.push(<text x="{rect.hiX}" y="{100-rect.loY}" class="text">
          {"(" + rect.hiX + "'" + rect.loY + ")"}</text>);
      }

      circles = [];
      sbm && sbm.content.forEach((crc, i) => {
         var crcClass = !sbm.response ?  "openCircle"
          : sbm.response[i] ? "goodCircle" : "badCircle";

         circles.push(<circle cx="{crc.centerX}" cy="{crc.centerY}"
          r="{crc.radius}" class="{crcClass}"/>);
         circles.push(<text x="{crc.centerX+1}" y="{crc.centerY}" class="text">
          {"(" + crc.centerX + "," + crc.centerY + ")"}</text>);
      });

      return (<section className="container">
         <h1>Problem diagram</h1>
         <svg viewBox="0 0 100 100" width="50%">
            <rect x="0" y="0" width="100" height="100" class="graphBkg"/>
            {grid}
            {obstacles}
            {circles}
         </svg>
      </section>);
   }
}
