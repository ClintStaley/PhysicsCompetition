import React, { Component } from 'react';
import './MovieBarController.css';

export class MovieController extends Component {

   constructor (props) {
      super(props);
      this.state = {
         currentView : 0
      };
   }

   render() {
      console.log('view', this.props.views)
      return (
         <div>
            <div>
               <button className='bar-button' onClick={this.props.play}>Play</button>
               <button className='bar-button' onClick={this.props.pause}>Pause</button>
               <button className='bar-button' onClick={this.props.replay}>Replay</button>
            </div>
            {
               this.props.views.map((view, idx) => 
               
                  <button
                     onClick={()=>this.setState({currentView: idx})}
                  >
                     {view.getLabel()} 
                  </button>
               )
            }
            {this.props.views[this.state.currentView]}

         </div>

         );
   }
}