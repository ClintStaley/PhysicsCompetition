import React, { Component } from "react";
import "./MovieBarController.css";
import { Bounce3DView } from "./Bounce3DView";

export class MovieController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentViewIdx: 0,
      currentOffset: 0,
      playing: false,
    };
    this.firstTimestamp = 0;
    this.currentView = props.views[this.state.currentViewIdx];
  }

  play = () => {
    this.setState({ playing: true }, this.animate);
  };

  pause = () => {
    this.setState({ playing: false });
  };

  replay = () => {
    this.setState({ playing: true, currentOffset: 0 }, this.animate);
  };

  animate = (timestamp) => {
    if (this.state.playing) {
      this.setState({ currentOffset: timestamp-this.firstTimestamp }, () => {
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

      </div>
    );
  }
}
