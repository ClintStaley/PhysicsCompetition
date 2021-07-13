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
      console.log("Movie controller!");
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

      if (newProps !== oldState.props) // Reset for new movie
         rtn = MovieController.getInitState(newProps);
   
      return rtn;
   }

   play = () => {
      if (this.state.currentOffset < this.state.duration)
         this.setState({playing: true}, 
          () => requestAnimationFrame(this.animate));
   };

   pause = () => {
      this.setState({playing: false, startTime: null});
   };

   replay = () => {
      this.setState({playing: true, startTime: null, currentOffset: 0},
         () => requestAnimationFrame(this.animate));
   };

   // RequestAnimationFrame is the only source of time.  This provides better
   // consistency than use of window.performance.now().  State.currentOffset
   // is the number of seconds into the movie at the current animation point.
   // State.startTime is the time of the first frame assuming the movie has 
   // been continuously animated to the current point.  It gets reset anytime 
   // we pause or scrub.  To reset state.startTime, set it null, and the next
   // |animate| will reassign it appropriately.
   animate = (timestamp) => {
      if (this.state.playing) {
         timestamp /= 1000;

         // Set startTime if we are commencing animation
         if (this.state.startTime === null) 
            this.state.startTime = timestamp - this.state.currentOffset;

         // Stop animation at end of movie
         if (this.state.currentOffset > this.state.duration) {
            this.pause();
         }

         this.setState({currentOffset: timestamp - this.state.startTime}, 
            () => requestAnimationFrame(this.animate));
      }
   };

   render() {
      return (
         <div className="container">
            {this.state.duration > 0 ? 
            (<div>
               <div>
                  <button className="bar-button" onClick={this.play}>
                     Play
                  </button>
                  <button className="bar-button" onClick={this.pause}>
                     Pause
                  </button>
                  <button className="bar-button" onClick={this.replay}>
                     Replay
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
                        startTime: null
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


