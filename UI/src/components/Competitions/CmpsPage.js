import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../actions/actionCreators';
import { ListGroup, ListGroupItem} from 'react-bootstrap';
import { ConfDialog } from '../concentrator';


class CmpsPage extends Component {
   constructor(props) {
      super(props);

      this.state = {
         showDeleteConfirmation: null
      }
   }

   componentDidMount = () => {
      var props = this.props;

      if (!(props.updateTimes && props.updateTimes.myTeams))
         this.props.getTeamsByPrs(this.props.prs.id);

      if (props.showAll) {
         if (!props.updateTimes.cmps)
            this.props.getAllCmps();
      }
      else
         if (!props.updateTimes.myCmps)
            this.props.getCmpsByPrs(this.props.prs.id);
   }

   componentDidUpdate = this.componentDidMount;

   // Thus far the only confirmation is for a delete.
   closeConfirmation = (res, cmpId) => {
      if (res === 'Yes') {
         this.props.deleteCmp(this.props.cmps[cmpId].cmpId, cmpId);
      }
      this.setState({showDeleteConfirmation: null})
   }

   openConfirmation = (cmpId) => {
      this.setState({showDeleteConfirmation: cmpId })
   }

   render() {
      var props = this.props;
      var cmps = props.showAll ? Object.keys(props.cmps) : props.prs.myCmps;

      return (
      <section className="container">
      <ConfDialog
        show={this.state.showDeleteConfirmation  != null }bit
        title="Delete Competition"
        body={`Are you sure you want to delete the Competition
         '${this.state.showDeleteConfirmation}'`}
        buttons={['Yes', 'Abort']}
        onClose={(res) =>
        this.closeConfirmation(res, this.state.showDeleteConfirmation)} />
        <h1>{props.showAll ? 'Join Competition' :  'My Competitions' }</h1>

        {props.showAll ?
           <ListGroup>
              {cmps && cmps.map((cmpId, i) => {
                var cmp = Object.assign({}, props.cmps[cmpId]);

                cmp.link = '/JoinCmpPage/' + cmp.id;
                cmp.joiningCmp = props.showAll;
                cmp.joined = props.prs.myCmps &&
                 props.prs.myCmps.includes(parseInt(cmpId));

                return <CompetitionItem
                  key={i} {...cmp}/>
              })}
           </ListGroup>
          :
          cmps && cmps.length ?
          <ListGroup>
           {cmps.map((cmpId, i) => {
             var cmp = Object.assign({}, props.cmps[cmpId]);

             cmp.link = '/MyCmpPage/' + cmp.id;
             cmp.joiningCmp = props.showAll;
             cmp.joined = false;

             return <CompetitionItem key={i} {...cmp}/>
           })}
           </ListGroup>
           :
           <h4>You are not in any competitions, see Join Competitions to join one</h4>

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
          <div className="pull-right">
            <Link to = {props.link} >See Teams</Link>
          </div>
          : ''}

          {props.joiningCmp ?
          <div>
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
      cmps: state.cmps,
      updateTimes: state.updateTimes
   }
}

function mapDispatchToProps(dispatch) {
   return bindActionCreators(actionCreators, dispatch);
}

//connects CmpsPage to the store
CmpsPage = connect(mapStateToProps, mapDispatchToProps)(CmpsPage)
export default CmpsPage
