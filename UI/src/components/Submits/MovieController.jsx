import React, { Component } from "react";
import "./MovieBarController.css";
import { Bounce3DView } from "./Bounce3DView";
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
    this.duration = this.props.jsonMovie.evts[this.props.jsonMovie.evts.length-2].time;
    this.firstTimeStamp;
    this.currentView = props.views[this.state.currentViewIdx];
  }

  updateEventIdx(eventIdx) {
    this.setState({ childEventIdx: eventIdx });
  }

  play = () => {
    this.setState({ playing: true }, this.animate);
  };

  pause = () => {
    this.setState({ playing: false });
  };

  replay = () => {
    this.firstTimeStamp = undefined;
    this.setState({ playing: true }, this.animate);
  };

  animate = (timestamp) => {
    if (this.state.playing) {
      if (!this.firstTimeStamp) {
        this.firstTimeStamp = timestamp
      }
      this.setState({ currentOffset: timestamp - this.firstTimeStamp }, () => {
        requestAnimationFrame(this.animate);
      });
    }
  };

  render() {
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
            onClick={() => this.setState({ currentViewIdx: idx })}
          >
            {new view().getLabel()}
          </button>
        ))}
        {React.createElement(Bounce3DView, {
          currentOffset: this.state.currentOffset,
          movie: this.props.jsonMovie,
        })}
        <Slider
          value={this.state.currentOffset}
           max={this.duration}
          onChange={(value) => {
            this.setState({ currentOffset: value })
          }}
        />

      </div>
    );
  }
}
