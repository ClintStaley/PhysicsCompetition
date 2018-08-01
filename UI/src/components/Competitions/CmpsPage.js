import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../actions/actionCreators';
import { ListGroup, ListGroupItem, Button, Glyphicon, Tabs, Tab} from 'react-bootstrap';
import { ConfDialog } from '../concentrator';


class CmpsPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         showConfirmation: null
      }
   }

   componentDidMount() {
      var props = this.props;

      //cannot only load one based on teh page, because component did mount
      // will only run once, because they are the same component
      if (!props.updateTimes.cmps)
         this.props.getAllCmps();

      if (!props.updateTimes.myCmps)
         this.props.getMyCmps(this.props.prs.id);

   }

   // Thus far the only confirmation is for a delete.
   closeConfirmation = (res, cmpId) => {
      if (res === 'Yes') {
         this.props.deleteCmp(this.props.cmps[cmpId].cmpId, cmpId);
      }
      this.setState({showConfirmation: null})
   }

   openConfirmation = (cmpId) => {
      this.setState({showConfirmation: cmpId })
   }

   render() {
      var props = this.props;
      var cmps = props.showAll ? Object.keys(props.cmps) : props.prs.myCmps;

      return (
      <section className="container">
      {console.log(props)}
      <ConfDialog
        show={this.state.showConfirmation  != null }bit
        title="Delete Competition"
        body={`Are you sure you want to delete the Competition '${this.state.showConfirmation}'`}
        buttons={['Yes', 'Abort']}
        onClose={(res) => this.closeConfirmation(res, this.state.showConfirmation)} />
        <h1>{props.showAll ? 'My Competitions' : 'Join Competition'}</h1>

        {props.showAll ?
           <ListGroup>
              {cmps.map((cmpId, i) => {
                var cmp = props.cmps[cmpId];

                cmp.link = '/CmpPage2/' + cmp.id;
                cmp.joiningCmp = props.showAll;
                cmp.joined = props.prs.myCmps.includes(cmpId);

                return <CompetitionItem
                  key={i} {...cmp}/>
              })}
           </ListGroup>
          :
          cmps.length ?
          <ListGroup>
           {cmps.map((cmpId, i) => {
             var cmp = props.cmps[cmpId];

             cmp.link = '/CmpPage1/' + cmp.id;
             cmp.joiningCmp = props.showAll;
             cmp.joined = false;

             return <CompetitionItem
               key={i} {...cmp}/>
           })}
           </ListGroup>
           :
           <h4>You are not in any competitions</h4>

       }
      </section>
      )
  }
}

const CompetitionItem = function (props) {
   return (
      <ListGroupItem className="clearfix">
         <Link to = {props.link} >{props.title}</Link>
          {props.joined ? '(already joined)' : ''}

          {props.joiningCmp ?
          <div>
           <h5>Competition Description</h5>

           <div>{props.description}</div>
         </div>
         : ''}
      </ListGroupItem>
   )
}

//makes CmpsPage a container componet, rather than a presentational componet
function mapStateToProps(state) {
   return {
      prs: state.prs,
      teams: state.teams,
      cmps: state.cmps,
      updateTimes: state.updateTimes,
      ctps: state.ctps
   }
}

function mapDispatchToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

//connects CmpsPage to the store
CmpsPage = connect(mapStateToProps, mapDispatchToProps)(CmpsPage)
export default CmpsPage
