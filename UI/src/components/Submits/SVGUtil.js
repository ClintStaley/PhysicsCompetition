//Utility object to reduce repetitiveness of .*SVG.jsx files




export class SVGUtil{
    

    static getInitState(movie) { //no need for bkgElms because it starts as empty
        let bkgElms = []; 
        let width = movie.background.width;
        let height = movie.background.height;
        let longDim = Math.max(width, height);
        let bigGap = longDim/10;  // Gap between heavy graph lines
        let smallGap = bigGap/5;  // Gap between light graph lines
    
        bkgElms.push(<rect x="0" y="0" width={width} height={height}
        className="graphBkg"/>);

        // Vertical lines
        for (var bigOffset = 0; bigOffset <= width; bigOffset += bigGap) {

            bkgElms.push(<line key={"VL" + bigOffset} x1={bigOffset} y1="0"
            x2={bigOffset} y2={height} className="heavyLine"/>);

            for (var smallOffset = bigOffset + smallGap;
            smallOffset < bigOffset + bigGap; smallOffset += smallGap)
                bkgElms.push(<line key={"VL" + smallOffset} x1={smallOffset} y1="0"
                x2={smallOffset} y2={height} className="lightLine" />);
        }
    
        // Horizontal lines
        for (var bigOffset = 0; bigOffset <= height; bigOffset += bigGap) {

            bkgElms.push(<line key={"HL" + bigOffset} x1="0" y1={bigOffset}
                x2={width} y2={bigOffset} className="heavyLine" />);

            for (var smallOffset = bigOffset + smallGap;
            smallOffset < bigOffset + bigGap; smallOffset += smallGap)
                bkgElms.push(<line key={"HL" + smallOffset} x1="0" y1={smallOffset}
                x2={width} y2={smallOffset} className="lightLine" />);
        }
    
        return {
            trgEvts: [],      // Target creation events (each w/index into svgElms)
            ballEvt: null,    // Most recent ball position or hit event
            evtIdx: -1,       // Index within movie of last event shown in svgElms
            svgElms: bkgElms, // SVG elements to render at this point
            movie             // Pointer to current movie
         }
    
    }

    // Return an svg <g> object representing a rectangle of class |cls| with
    // dimensions as indicated by |evt| and with corner coordinates drawn in
    // text form, inside the rectangle if room suffices, otherwise outside.

    //evt must be an object with an id, and coordinates
    static makeLabeledRect(evt, cls, yTop){
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

    //simple circle with text set to center, might need changing later
    static makeLabeledCircle(evt, cls, yTop) {
        return <g>
            <circle key={"Circ" + evt.id} cx={evt.x} cy={yTop-evt.y} r={evt.r} className={cls}/>
            <text key={"txt" + evt.id} x={evt.x} y={yTop-evt.y} className="LLText">
              {`(${evt.x}, ${evt.y})`}
            </text>
        </g>
    }

}

