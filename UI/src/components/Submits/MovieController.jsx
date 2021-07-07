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

   static getInitState(props) {
      return {
         props,
         currentViewIdx: 0,
         currentOffset: 0,
         playing: false,
         scrubbing: false,
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
      this.setState({playing: true}, this.animate);
   };

   pause = () => {
      this.setState({playing: false});
      this.timeAtPause = this.state.currentOffset + this.firstTimeStamp;
   };

   replay = () => {
      this.firstTimeStamp = undefined;
      this.setState({playing: true}, this.animate);
   };

   animate = (timestamp) => { // timestamp DNE until requestAnimationFrame calls it
      timestamp /= 1000;
      
      if (this.state.playing) {
         if (this.timeAtPause && timestamp){ //firstTime stamp is shifted forward for paused time
            this.firstTimeStamp += timestamp - this.timeAtPause;
            this.timeAtPause = null;
         }
         if (!this.firstTimeStamp) {
            this.firstTimeStamp = timestamp; 
         }
         if (this.state.currentOffset > this.state.duration) {
            this.firstTimeStamp = undefined;
            this.pause();
         }
         this.setState({ currentOffset: timestamp - this.firstTimeStamp }, 
            () => {
            requestAnimationFrame(this.animate);
         });
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
                  tooltip={false}
                  onChange={(value) => {
                     this.setState({
                        scrubbing: value < this.state.currentOffset,
                        currentOffset: value,
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
               offset: this.state.currentOffset || 0.01,
               scrubbing: this.state.scrubbing
            })}
         </div>
      );
   }
}


