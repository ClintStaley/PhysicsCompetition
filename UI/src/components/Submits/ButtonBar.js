import React, {Component} from 'react';
import './Button.css';

export class ButtonBar extends Component {

    render(){
        return (
        <div>
            <button className='bar-button' onClick={this.props.play}>Play</button>
            <button className='bar-button'onClick={this.props.pause}>Pause</button>
            <button className='bar-button'onClick={this.props.replay}>Replay</button>
            
        
        </div>);
    }
}