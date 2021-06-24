import React, { Component } from "react";
import { LandGrabMovie } from "./LandGrabMovie";
import {SVGUtil} from './SVGUtil';
import './LandGrab.css';

export class LandGrabSVGView extends React.Component {
    static circleColors = ["goodCircle", "badCircle", "openCircle"];


    constructor(props) {
        super(props);

        this.state = LandGrabMovie.setOffset(
            SVGUtil.getInitState(props.movie), props.offset);
    }

    

    static getLabel() {
        return "Diagram";
    }

    static getDerivedStateFromProps(newProps, oldState) {
        let rtn = oldState;

        if (newProps.movie !== oldState.movie) //Complete reset
            rtn = LandGrabSVGView.getInitState(newProps.move);
        return LandGrabSVGView.setOffset(rtn, newProps.offset);
    }

    // Return an svg <g> object representing a rectangle of class |cls| with 
    // dimensions as indicated by |evt| and with corner coordinates drawn in
    // text form, inside the rectangle if room suffices, otherwise outside.
    static makeLabeledRect(evt, cls, yTop) {
        const textSize = 1.2;  // Minimum width of rect to fit text inside
        const textHeight = .13;  // Height of a text line
        const minHeight = textHeight * 2.1; // Minimum height to fit 2 text lines
    
        let elms = [];        // Returned SVG elements
        let width = evt.hiX - evt.loX;
        let height = evt.hiY - evt.loY;

        // Values to put text inside or outside the rectangle, in both dimensions
        let classLeft = width > textSize ? "text" : "rhsText";
        let classRight = width > textSize ? "rhsText" : "text";
        let topYAdjust = height > minHeight ? textHeight : 0;
        let btmYAdjust = height > minHeight ? 0 : textHeight;

        // Main rectangle
        elms.push(<rect key={"Blk" + evt.id} x={evt.loX} y={yTop - evt.hiY}
        width={width} height={height} className={cls}/>);
        
        // Upper left label showing (loX, hiY)
        elms.push(<text key={"BlkUL" + evt.id} x={evt.loX} 
        y={yTop - evt.hiY + topYAdjust} className={classLeft}>
        {`(${evt.loX.toFixed(2)}, ${evt.hiY.toFixed(2)})`}
        </text>);

        // Upper right label showing (hiX, hiY)
        elms.push(<text key={"BlkUR" + evt.id} x={evt.hiX}
        y={yTop - evt.hiY + topYAdjust} className={classRight}>
        {`(${evt.hiX.toFixed(2)}, ${evt.hiY.toFixed(2)})`}
        </text>);

        // Lower left label showing (loX, loY)
        elms.push(<text key={"BlkLL" + evt.id} x={evt.loX} 
        y={yTop - evt.loY + btmYAdjust} className={classLeft}>
        {`(${evt.loX.toFixed(2)}, ${evt.loY.toFixed(2)})`}
        </text>);

        // Lower right label showing (hiX, loY)
        elms.push(<text key={"BlkLR" + evt.id} x={evt.hiX} 
        y={yTop - evt.loY + btmYAdjust} className={classRight}>
        {`(${evt.hiX.toFixed(2)}, ${evt.loY.toFixed(2)})`}
        </text>);

        return <g>{elms}</g>;
    }

    //return an svg circle object representing the circle
    static makeCircle(evt, yTop) {

    }


    // Advance/retract |state| so that svgElms reflects all and only those events
   // in |movie| with time <= |timeStamp|.  Assume existing |state| was built
   // from |movie| so incremental change is appropriate.  Return adjusted state
    static setOffset(state, timeStamp) {
        let movie = state.movie;
        let evts = movie.evts;
        let {brrEvts, circleEvt, evtIdx, svgElms} = state;
        let yTop = movie.background.height;
        let evt;

        // While the event after evtIdx exists and needs adding to svgElms
        while (evtIdx+1 < evts.length && evts[evtIdx+1].time <= timeStamp) {
            evt = evts[++evtIdx];
            if (evt.type === LandGrabMovie.cMakeBarrier) {
                svgElms.push(LandGrabSVGView.makeLabeledRect(evt, "barrier", yTop));
            }
            else if (evt.type === LandGrabMovie.makeInvalidCircle) {
                evt.color = 
                svgElms.push(LandGrabSVGView.makeCircle(evt, yTop));
            }
        }
    }

}