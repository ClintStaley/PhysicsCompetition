import React, { Component } from 'react';
import './MovieBarController.css';

export class MovieController extends Component {

   constructor (props) {
      super(props);
      this.state = {
         currentViewIdx : 0,
         frame : 0
      };
   }

   render() {

      var currentView = new this.props.views[this.state.currentViewIdx].type;
      //var CurrentViewComponent = this.props.views[0];
      return (
         <div>
            <div>
               <button className='bar-button' onClick={currentView.play}>Play</button>
               <button className='bar-button' onClick={this.props.pause}>Pause</button>
               <button className='bar-button' onClick={this.props.replay}>Replay</button>
            </div>
            {
               this.props.views.map((view, idx) => 
               
                  <button
                     key={idx}
                     onClick={()=>this.setState({currentViewIdx: idx})}
                  >
                     {(new view.type).getLabel()} 
                  </button>
               )
            }
            {this.props.views[0]}
         </div>

         );
   }
}