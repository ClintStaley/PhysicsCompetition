import React, {Component} from "react";
import "./MovieController.css";
import "react-rangeslider/lib/index.css"
import Slider from 'react-rangeslider';

// Props are {movie, views}.  Sets up a display of the movie, allowing choice
// of one of the views.  Runs movie up to just prior to offset 0, and enables
// play/replay/pause buttons if there is more to show in the movie.  (A movie
// displaying just the initial setup may have nothing more to show.)
export class MovieController extends Component {
   constructor(props) {
      super(props);
      this.state = MovieController.getInitState(props);
   }

   // duration indicates length, and by being nonzero, the need for movie play
   static getInitState(props) {
      return {
         props,
         currentViewIdx: 0, // Selected type of view
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
   // In either case start a requestAnimatinoFrame sequence once state is set.
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
   // It gets reset anytime  we pause, scrub, or change rate.  To reset 
   // state.startTime, set it null, and the next |animate| will reassign it 
   // appropriately.
   animate = (timestamp) => {
      let newState = {};

      if (this.state.playing) {
         timestamp /= 1000;
         
         // Stop animation at end of movie
         if (this.state.currentOffset > this.state.duration) {
            newState = {playing: false, startTime: null}
         }

         // Set startTime if we are commencing animation
         if (this.state.startTime === null) 
            newState.startTime
             = timestamp - this.state.currentOffset / this.state.rate;

         // In either event, set currentOffset to reflect time.
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

            {this.props.views.map((view, idx) => (
               <button
                  key={idx}
                  onClick={() => this.setState({currentViewIdx: idx})}
               >
                  {view.getLabel()}
               </button>
            ))}
            {React.createElement(this.props.views[this.state.currentViewIdx], {
               movie: this.props.movie,
               offset: this.state.currentOffset || 0.001
            })}
         </div>
      );
   }
}


