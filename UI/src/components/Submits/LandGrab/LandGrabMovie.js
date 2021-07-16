// LandGrabMovie provides background information on framerate and size of the
// overall background, plus a series of events describing growth of each circle,
// when each collision may occur measured by its radius, and whether the circle is 
// valid or invalid. Events are each time stamped with a number of second since the start of the movie.

// a number of seconds since the start of the movie.
export class LandGrabMovie {
        static cCircleGrowth = 0;
        static cInvalidCircleGrowth = 1
        static cMakeObstacle = 2;
        static cValidCircle = 3;
        static cInvalidCircle = 4;

    //Constructor with background as indicated, and events drawn from prms and sbm
    // optional sbm.  (Generate only obstacle creation events w/o sbm)
    constructor(frameRate, prms, sbm) {
        //declare constants
        const bkgSize = 100.0;
        const validationPause = .25;

        //contains Results of circle collisions and radii of collisions
        //has content only if EVC has returned result
        let circlesResults = sbm && sbm.testResult ? 
        sbm.testResult.circleData : [];
        //contains location and order of circles
        let circleContent =  sbm && sbm.content ? sbm.content : [];

        this.background = {};
        this.background.frameRate = frameRate;
        this.background.height = bkgSize;
        this.background.width = bkgSize;
        this.evts = [];



        // obstacles numbered from 0
        prms.obstacles.forEach((brr, idx) => 
          this.addMakeObstacleEvt(-1, idx, brr.loX, brr.loY, brr.hiX, brr.hiY));

        let time = 0;
        circlesResults.forEach((circleResult, circleId) => {
            var circle = circleContent[circleId];

            // Get total growth time (based on radius length) and
            // valid growth time for when the circle may turn red
            var growthRate = 2/25; //set standard growth rate to : a circle with radius 25 will take 2 seconds to expand (time/length)
            var growthTime = circle.radius * growthRate; // radius times rate -> length * time/length  //CAS: No magic numbers
            
            /*
            Valid growth time is "shortened" only when the badRadius exists 
            (which means it is invalid) and validGrowthTime is the proportional
            to badRadius/Radius (as any radius length before badRadius is valid)
            */
            var validGrowthTime = growthTime;
            if (circleResult.badRadius)
                validGrowthTime = growthTime * (circleResult.badRadius/circle.radius); 

            // Grow steadily from center as valid circle.
            for (let t = 0; t < validGrowthTime; t += 1.0/frameRate)
                this.addCircleGrowthEvt(time + t, circleId, circle.centerX,
                 circle.centerY, circle.radius*(t/growthTime));            
            
            // Finish growth to full size as invalid circle if relevant
            for(let t = validGrowthTime; t < growthTime; t += 1.0/frameRate)
                this.addInvalidCircleGrowthEvt(time + t, circleId, circle.centerX, 
                 circle.centerY, circle.radius*(t/growthTime));

            time += growthTime;
            
            var validity = circleResult.badRadius ? 
             LandGrabMovie.cInvalidCircle : LandGrabMovie.cValidCircle;

            this.addMakeCircleEvt(time, circleId, circle.centerX,
             circle.centerY, circle.radius, validity);
                
            time += validationPause;
        });
    }

    addCircleGrowthEvt(time, circleNumber, x, y, r){
        this.evts.push(
         {type: LandGrabMovie.cCircleGrowth, time, circleNumber, x, y, r});
    }

    addInvalidCircleGrowthEvt(time, circleNumber, x, y, r){
        this.evts.push(
         {type: LandGrabMovie.cInvalidCircleGrowth, time, circleNumber, x, y, r});
    }

    addMakeObstacleEvt(time, id, loX, loY, hiX, hiY) {
        this.evts.push(
         {type: LandGrabMovie.cMakeObstacle, time, id, loX, loY, hiX, hiY});
    }

    addMakeCircleEvt(time, id, x, y, r, circleType) {
        this.evts.push(
         {type: circleType, time, id, x, y, r});
    }
}