import React, {Component} from "react";

// Props are {
//    movie,     Movie to display
//    viewSpecs,   Array of  {
//       label: <label for button>
//       viewMaker: movie => Component function to generate correct view
//    }
// }
// Use one of the viewFncs to generate a view displaying the movie.
export class ViewChooser extends Component {
   constructor(props) {
      super(props);
      this.state = {currentViewIdx: 0, props};
   }
 
   static getDerivedStateFromProps(newProps, oldState) {
      if (newProps.movie !== oldState.props.movie || newProps.viewSpecs !==
       oldState.props.viewSpecs)
          return {currentViewIdx: 0, props: newProps}

      return oldState;
   }

   render() {
      return (
         <div className="container">
            {this.props.viewSpecs.map((spec, idx) => (
               <button
                  key={idx}
                  onClick={() => this.setState({currentViewIdx: idx})}
               >
                  {spec.label}
               </button>
            ))}
            {this.props.viewSpecs[this.state.currentViewIdx]
             .viewMaker(this.props.movie)}
         </div>
      );
   }
}


