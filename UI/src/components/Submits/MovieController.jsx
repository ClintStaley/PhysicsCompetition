import React, {Component} from "react";
import "./MovieController.css";
import "react-rangeslider/lib/index.css"
import Slider from 'react-rangeslider';

// Props are {movie, viewCls}.  Sets up a display of the movie using the 
// specified view class (not view object).  Runs movie up to 
// just prior to offset 0, and enables play/replay/pause buttons if there is 
// more to show in the movie.  (A movie displaying just the initial setup may 
// have nothing more to show.)
export class MovieController extends Component {
   constructor(props) {
      super(props);
      this.state = MovieController.getInitState(props);
   }

   // duration indicates length, and by being nonzero, the need for movie play
   static getInitState(props) {
      return {
         props,
         startTime: null,   // Time at which movie began; null if not playing
         currentOffset: 0,  // Number of seconds into movie play
         playing: false,    // Are we currently playing or stopped?
         duration: props.movie.evts[props.movie.evts.length - 1].time
      }
   }
 
   static getDerivedStateFromProps(newProps, oldState) {
      let rtn = oldState;

      if (newProps.movie !== oldState.props.movie) // Reset for new movie
         rtn = MovieController.getInitState(newProps);

      return rtn;
   }

   // Set state.playing to true, and reset to movie start if we're at end.
   // |rate| is movie seconds per wallclock seconds, e.g. 0.5 for half-speed.
   // In either case start a requestAnimationFrame sequence once state is set.
   play = (rate) => {
      let newState = {playing: true, rate}

      if (this.state.rate !== rate)
         newState.startTime = null;

      if (this.state.currentOffset >= this.state.duration)
         newState.currentOffset = 0;

      this.setState(newState, () => requestAnimationFrame(this.animate));
   };

   // Set state.playing to false, and invalidate startTime so it will be reset
   // on next playing period.
   pause = () => {
      this.setState({playing: false, startTime: null});
   };

   // RequestAnimationFrame is the only source of time.  This provides better
   // consistency than use of window.performance.now().  State.currentOffset
   // is the number of seconds into the movie at the current animation point.
   // State.startTime is the time of the first frame assuming the movie has 
   // been continuously animated to the current point, at the current rate.
   // It gets reset anytime  we pause, scrub, or change rate.  
   //
   // [1] To reset state.startTime, set it null, and the next |animate| call
   // will set it to current wallclock seconds less the number of seconds needed
   // to reach currentOffset at current rate of play.
   animate = (timestamp) => {
      let newState = {};

      if (this.state.playing) {
         timestamp /= 1000;
         
         // Stop animation at end of movie
         if (this.state.currentOffset > this.state.duration) {
            newState = {playing: false, startTime: null}
         }

         // If we are commencing animation, set startTime (see [1])
         if (this.state.startTime === null) 
            newState.startTime
             = timestamp - this.state.currentOffset / this.state.rate;

         // In either event, set currentOffset to reflect time into movie
         newState.currentOffset =
          (timestamp - (this.state.startTime || newState.startTime))
          * this.state.rate;

         this.setState(newState, () => requestAnimationFrame(this.animate));
      }
   };

   render() {
      return (
         <div className="container">
            {this.state.duration > 0 ? 
            (<div>
               <div>
                  <button className="bar-button"
                   onClick={() => this.play(1.0)}>
                     Play
                  </button>
                  <button className="bar-button"
                   onClick={() => this.play(0.1)}>
                     1/10 Speed
                  </button>
                  <button className="bar-button" onClick={this.pause}>
                     Pause
                  </button>
               </div>
               <Slider
                  value={this.state.currentOffset}
                  max={this.state.duration}
                  step={0.001*this.state.duration}
                  tooltip={true}
                  onChange={(value) => {
                     this.setState({
                        currentOffset: value,
                        startTime: null,
                        playing: null
                     })
                  }}
               />
            </div>)
            : ''}

            {React.createElement(this.props.viewCls, {
               movie: this.props.movie,
               offset: this.state.currentOffset || -0.001 // Starting events
            })}
         </div>
      );
   }
}


