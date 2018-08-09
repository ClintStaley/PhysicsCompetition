import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import './LandGrab.css'

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
      var sbm = this.props.sbm;
      var hashClass, offs, rect, grid, obstacles, circles;

      // Heavy cross hatches every 10, with light cross hatches between
      grid = [];
      for (offs = 5; offs < 100; offs += 5) {
         hashClass = offs % 10 === 5 ? "graph5" : "graph10";
         grid.push(
          <line x1={offs} y1="0" x2={offs} y2="100" className={hashClass}/>);
         grid.push(
          <line x1="0" y1={offs} x2="100" y2={offs} className={hashClass}/>);
      }

      // Obstacle rectangles
      obstacles = [];
      prms.obstacles.forEach((rect) => {
         obstacles.push(<rect x={rect.loX} y={100-rect.hiY}
          width={rect.hiX - rect.loX} height={rect.hiY - rect.loY}
          className="obstacle"/>);

         obstacles.push(<text x={rect.loX} y={100-rect.hiY+2}
          className="text">{"(" + rect.loX + "," + rect.hiY + ")"}</text>);
         obstacles.push(<text x={rect.hiX} y={100-rect.hiY+2}
          className="rhsText">{"(" + rect.hiX + "," + rect.hiY + ")"}</text>);
         obstacles.push(<text x={rect.loX} y={100-rect.loY}
          className="text">{"(" + rect.loX + "," + rect.loY + ")"}</text>);
         obstacles.push(<text x={rect.hiX} y={100-rect.loY}
          className="rhsText">{"(" + rect.hiX + "," + rect.loY + ")"}</text>);
      });

      circles = [];
      sbm && sbm.content.forEach((crc, i) => {
         var crcClass = !sbm.testResult ?  "openCircle"
          : sbm.testResult.circleStatus[i] ? "goodCircle" : "badCircle";

         circles.push(<circle cx={crc.centerX} cy={100-crc.centerY}
          r={crc.radius} className={crcClass}/>);
         circles.push(<circle cx={crc.centerX} cy={100-crc.centerY} r=".2"/>);
         circles.push(<text x={crc.centerX+1} y={100-crc.centerY}
          className="text">{"(" + crc.centerX + "," + crc.centerY + ")"}</text>);
      });

      return (<section className="container">
         <h2>Problem diagram</h2>
         <svg viewBox="0 0 100 100" width="100%">
            <rect x="0" y="0" width="100" height="100" className="graphBkg"/>
            {grid}
            {obstacles}
            {circles}
         </svg>
      </section>);
   }
}
