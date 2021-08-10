//Utility object to reduce repetitiveness of .*SVG.jsx files

import React from "react";

export class SVGUtil{
   // For all SVG creating functions:
   // style is a css module: a dictionary indexed by generic class names 
   // (e.g. heavyLine) with corresponding values of unique css class names like
   // fileName_heavyLine_hash1234 to ensure there are no class name collisions.
   //
   // scale variable is necessary because the scale is different
   // for different competitions and cannot be read from the 
   // module object that is passed

   // Return standard |height|x|width| background rectangle of graph lines in
   // a <g> tag, using |style| to obtain styles graphBkg, heavyLine, and
   // lightLine for the graph background and line markers.  
   // 
   // Optional parameter |options| allows these properties, all optional:
   // 
   // bigGap and smallGap: nums Space between heavy and light lines.  Default is
   // 1/10 and 1/50 of the largest rectangle dimension, respectively.  
   //
   // labels:  Mark x and y axes with numerical labels at bigGaps. Make label
   // bars immediate children of the returned <g> at negative offsets relative
   // to <g> parent, so the graph origin is always at (0.0) relative to returned
   // <g>.
   static getGraphGrid(height, width, style, options) { 
      let svgElms = []; 
      let longDim = Math.max(width, height);
      
      // Adjust for default parameters
      options = options || {};
      let bigGap = options.bigGap || longDim / 10; 
      let smallDiv = options.smallDiv || 5;
      let smallGap = bigGap / smallDiv;
      let origin = options.origin || {x:0, y:0};
      let offs;             // Offset of line (light or heavy)
      let div;              // Initial modulus of light line (0 is heavy)
   
      svgElms.push(<rect key={"gBkg"} x="0"y="0" width={width} height={height}
       className={style.graphBkg}/>);

      offs = origin.x - Math.floor(origin.x / smallGap) * smallGap;
      div = smallDiv - Math.floor(origin.x / smallGap) % smallDiv - 1;

      while (offs < width) {
         svgElms.push(<line key={"VL"+offs} x1={offs} y1="0"
          x2={offs} y2={height} className=
          {div === smallDiv-1 ? style.heavyLine : style.lightLine}/>);
         offs += smallGap;
         div = (div + 1) % smallDiv;
      }
      
      offs = origin.y - Math.floor(origin.y / smallGap) * smallGap;
      div = smallDiv - Math.floor(origin.y / smallGap) % smallDiv - 1;

      while (offs < height) {
         svgElms.push(<line key={"HL"+offs} x1="0" y1={offs}
          x2={width} y2={offs} className=
          {div === smallDiv-1 ? style.heavyLine : style.lightLine}/>);
         offs += smallGap;
         div = (div + 1) % smallDiv;
      }

      return <g key={"gGrid"}>{svgElms}</g>;
    }

    // Return an svg <g> object representing a rectangle of class |cls| with
    // dimensions as indicated by |evt| and with corner coordinates drawn in
    // text form, inside the rectangle if room suffices, otherwise outside.

    // evt must be an object with an id, and coordinates in hiX, loX format
    // pass style as css module (css files must be named as {name}.module.css)
   static makeLabeledRect(evt, cls, yTop, style, textSize){ 
      //textSize is the height of one line
      const minHeight = textSize * 2.1; // Minimum height to fit 2 text lines
      let elms = [];        // SVG elements to add to and return
      let width = evt.hiX - evt.loX;
      let height = evt.hiY - evt.loY;

      // Left and Right coords lengths (not including outer parenthesis)
      //textSize is the height of one line, letter width being ~1/2 its height
      const leftCoordLength = `${evt.loX.toFixed(2)}, ${evt.hiY.toFixed(2)})`
       .length * textSize / 2;
      const rightCoordLength = `(${evt.hiX.toFixed(2)}, ${evt.hiY.toFixed(2)}`
       .length * textSize / 2;
         
      const minWidth = leftCoordLength + rightCoordLength; 
      
      // Values to put text inside or outside the rectangle, in both dimensions
      // If rect is on the edge of view, it will default to place text inside 
      // the rect instead of placing it out of bounds. (assumes xTop = yTop)
      let classLeft = width > minWidth || evt.loX < leftCoordLength 
       ? "text" : "rhsText";
      let classRight = width > minWidth || evt.hiX > yTop - rightCoordLength
       ? "rhsText" : "text";
      let topYAdjust = height > minHeight || evt.hiY > yTop - textSize 
       ? textSize : 0;
      let btmYAdjust = height > minHeight || evt.loY < textSize ? 0 : textSize;

      // Main rectangle
      elms.push(<rect key={"Blk" + evt.id} x={evt.loX} y={yTop - evt.hiY}
       width={width} height={height} className={style[cls]}/>);
      
      // Upper left label showing (loX, hiY)
      elms.push(<text key={"BlkUL" + evt.id} x={evt.loX} 
       y={yTop - evt.hiY + topYAdjust} className={style[classLeft]}>
       {`(${evt.loX.toFixed(2)}, ${evt.hiY.toFixed(2)})`} </text>);

      // Upper right label showing (hiX, hiY)
      elms.push(<text key={"BlkUR" + evt.id} x={evt.hiX}
       y={yTop - evt.hiY + topYAdjust} className={style[classRight]}>
       {`(${evt.hiX.toFixed(2)}, ${evt.hiY.toFixed(2)})`}</text>);

      // Lower left label showing (loX, loY)
      elms.push(<text key={"BlkLL" + evt.id} x={evt.loX} 
       y={yTop - evt.loY + btmYAdjust} className={style[classLeft]}>
       {`(${evt.loX.toFixed(2)}, ${evt.loY.toFixed(2)})`} </text>);

      // Lower right label showing (hiX, loY)
      elms.push(<text key={"BlkLR" + evt.id} x={evt.hiX} 
       y={yTop - evt.loY + btmYAdjust} className={style[classRight]}>
       {`(${evt.hiX.toFixed(2)}, ${evt.loY.toFixed(2)})`} </text>);

      return <g key={"rectangleG" + evt.id}> ...{elms}</g>
   }

   // Circle with coordinates listed in center
   static makeLabeledCircle(evt, cls, yTop, style) {
      if (evt.r == 0)
         return <g key={"emptyG"+evt.id}></g> // if radius == 0 return empty g
      return <g key={"labeledCirc" + evt.id}>
       <circle key={"Circ" + evt.id} cx={evt.x} cy={yTop-evt.y} r={evt.r} 
       className={style[cls]}/>
       <text key={"txt" + evt.id} x={evt.x} y={yTop-evt.y} 
       className={style.LLText}> {`(${evt.x}, ${evt.y})`} </text> </g>
   }

   //Makes a "circle slice" using evt properties
   static makeCircleSlice(evt, cls, yTop, style) {
      return <g key={"CircleSlice" +evt.id}>
       <path key={"Circ" + evt.time} d={`M ${evt.x},${yTop-evt.y} 
       h${evt.r} a${evt.r},${evt.r} 0 ${1 * (evt.angle > Math.PI)},0  
       ${evt.r * Math.cos(evt.angle) - evt.r},${-evt.r * Math.sin(evt.angle)}`}
       className={style[cls]}/>
       <text key={"txt" + evt.time} x={evt.x} y={yTop-evt.y} 
       className={style.LLText}>{`(${evt.x}, ${evt.y})`}</text>
       </g>
    }
}

