// LandGrabMovie provides background information on framerate and size of the
// overall background, plus a series of events describing whether the circle is valid
// or not.  Events are each time stamped with a number of second since the start of the movie.

// a number of seconds since the start of the movie.
export class LandGrabMovie {
        static cCircleGrowth = 0;
        static cMakeObstacle = 1;
        static cValidCircle = 2;
        static cInvalidCircle = 3;

    //Constructor with background as indicated, and events drawn from prms and sbm
    constructor(frameRate, prms, sbm) {
        //declare constants
        const bkgSize = 100.0;
        const growthTime = 2;
        const validationPause = .25;
        let tracks = sbm.testResult.events;

        this.background = {};
        this.background.frameRate = frameRate;
        this.background.height = bkgSize;
        this.background.width = bkgSize;
        this.evts = [];

        // Barriers numbered from 0
        prms.barriers.forEach((brr, idx) => 
          this.addMakeObstacleEvt(-1, idx, brr.loX, brr.loY, brr.hiX, brr.hiY));

        let time = 0;
        tracks.forEach((trk, circleId) => {         // One track per circle
            //this.addMakeCircleEvt(time, circleId, trk.x, trk.y, 1) //trk.r);

            for(let trackTime = 0; trackTime < growthTime; trackTime += 1.0/frameRate){
                this.addCircleGrowthEvt(time + trackTime, circleId, trk.x, trk.y, trk.r*(trackTime/growthTime))
            }
            time += growthTime;
            
            //not sure if this properly references each circle
            if (trk.validity)
                this.addValidCircleEvt(time, circleId, trk.x, trk.y, trk.r);            
            else
                this.addMakeInvalidCircleEvt(time, circleId, trk.x, trk.y, trk.r);

            time += validationPause;
        })

        
    }

    addCircleGrowthEvt(time, circleNumber, x, y, r, validity){
        this.evts.push(
         {type: LandGrabMovie.cCircleGrowth, time, circleNumber, x, y, r, validity});
    }

    addMakeInvalidCircleEvt(time, id, x, y, r, validity) {
        this.evts.push(
         {type: LandGrabMovie.cInvalidCircle, time, id, x, y, r, validity});
    }

    addMakeObstacleEvt(time, id, loX, loY, hiX, hiY) {
        this.evts.push(
         {type: LandGrabMovie.cMakeObstacle, time, id, loX, loY, hiX, hiY});
    }

    addMakeValidCircleEvt(time, id, x, y, r) {
        this.evts.push(
         {type: LandGrabMovie.cValidCircle, time, id, x, y, r});
    }

    
}