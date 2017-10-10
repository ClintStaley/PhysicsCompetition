import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class UploadScreen extends React.Component {
   render() {
      return (
         <button className="square">
            {this.props.value}
         </button>
      );
   }
}
export default UploadScreen;