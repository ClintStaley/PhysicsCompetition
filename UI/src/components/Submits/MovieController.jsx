import React, {Component} from "react";
import "./MovieBarController.css";
import {Bounce3DView}  from "./Bounce3DView";
import {BounceSVGView} from "./BounceSVGView";
import Slider from 'react-rangeslider';

export class MovieController extends Component {
   constructor(props) {
      super(props);
      this.state = {
         currentViewIdx: 0,
         currentOffset: 0,
         playing: false,
         childEventIdx: 0
      };
      this.duration = this.props.jsonMovie.evts
       [this.props.jsonMovie.evts.length - 2].time;
      this.currentView = props.views[this.state.currentViewIdx];
   }

   // CAS FIX: Are this method and the childEventIdx even used?  Pls remove
   // them unless they're needed.
   updateEventIdx(eventIdx) {
      this.setState({childEventIdx: eventIdx});
   }

   play = () => {
      this.setState({playing: true}, this.animate);
   };

   pause = () => {
      //console.log()
      this.setState({playing: false});
   };

   replay = () => {
      this.firstTimeStamp = undefined;
      this.setState({playing: true}, this.animate);
   };

   animate = (timestamp) => {
      timestamp /= 1000;
      if (this.state.playing) {
         if (!this.firstTimeStamp) {
            this.firstTimeStamp = timestamp
         }
         if (this.state.currentOffset > this.duration) {
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
      console.log("Rendering MC with props ", this.props, this.state);
      return (
         <div>
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
            {this.props.views.map((view, idx) => (
               <button
                  key={idx}
                  onClick={() => this.setState({currentViewIdx: idx})}
               >
                  {view.getLabel()}
               </button>
            ))}
            {React.createElement(BounceSVGView, {
               offset: this.state.currentOffset || 0,
               movie: this.props.jsonMovie,
            })}
            <Slider
               value={this.state.currentOffset}
               max={this.duration}
               step={0.001*this.duration}
               tooltip={false}
               onChange={(value) => {
                  this.setState({currentOffset: value})
               }}
            />
         </div>
      );
   }
}
