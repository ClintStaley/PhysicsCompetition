import React, { Component } from "react";
import "./MovieBarController.css";
import { Bounce3DView } from "./Bounce3DView";

export class MovieController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentViewIdx: 0,
      currentFrame: 0,
      playing: false,
    };
    this.currentView = props.views[this.state.currentViewIdx];
    this.jsonMovie = props.jsonMovie;
  }

  play = () => {
    this.setState({ playing: true }, this.animate);
  };

  pause = () => {
    this.setState({ playing: false });
  };

  replay = () => {
    this.setState({ playing: true, currentFrame: 0 }, this.animate);
  };

  animate = (timestamp) => {
    if (this.state.playing) {
      this.setState({ currentOffset: timestamp }, () => {
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
          currentFrame: this.state.currentFrame,
          jsonMovie: this.jsonMovie,
        })}

        {/* try React.createElement(this.currentView, {})
            // reference: https://reactjs.org/docs/jsx-in-depth.html */}
      </div>
    );
  }
}
