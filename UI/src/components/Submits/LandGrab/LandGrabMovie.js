// LandGrabMovie provides background information on framerate and size of the
// overall background, plus a series of events describing whether the circle is valid
// or not.  Events are each time stamped with a number of second since the start of the movie.

// a number of seconds since the start of the movie.
export class LandGrabMovie {
        static cCircleGrowth = 0;
        static cInvalidCircleGrowth = 1
        static cMakeObstacle = 2;
        static cValidCircle = 3;
        static cInvalidCircle = 4;

    //Constructor with background as indicated, and events drawn from prms and sbm
    constructor(frameRate, prms, sbm) {
        console.log(prms);
        console.log(sbm);
        //declare constants
        const bkgSize = 100.0;
        const validationPause = .25;
        let circlesResults = sbm.testResult.circleData;
        let circleContent = sbm.content;
        this.background = {};
        this.background.frameRate = frameRate;
        this.background.height = bkgSize;
        this.background.width = bkgSize;
        this.evts = [];

        // Barriers numbered from 0
        prms.obstacles.forEach((brr, idx) => 
          this.addMakeObstacleEvt(-1, idx, brr.loX, brr.loY, brr.hiX, brr.hiY));

        let time = 0;
        circlesResults.forEach((circleResult, circleId) => {
            var circle = circleContent[circleId];
            var growthTime = circle.radius * (2/25); // dimensional analysis to convert radius length to growth time. Radius of 25 will take 2 seconds
            var validGrowthTime = growthTime;
            if (circleResult.badRadius)
                validGrowthTime = growthTime * (circleResult.badRadius/circle.radius); 
            
            for (let t = 0; t < validGrowthTime; t += 1.0/frameRate)
                this.addCircleGrowthEvt(time + t, circleId, circle.centerX, circle.centerY, circle.radius*(t/growthTime));
            
            
            for(let t = validGrowthTime; t < growthTime; t += 1.0/frameRate)
                this.addInvalidCircleGrowthEvt(time + t, circleId, circle.centerX, circle.centerY, circle.radius*(t/growthTime));

            time += growthTime;
            
            var validity = circleResult.badRadius ? LandGrabMovie.cInvalidCircle : LandGrabMovie.cValidCircle;

            this.addMakeCircleEvt(time, circleId, circle.centerX, circle.centerY, circle.radius, validity);
                
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