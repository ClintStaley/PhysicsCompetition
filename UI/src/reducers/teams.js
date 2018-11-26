import update from 'immutability-helper';

export default function teams(state = {}, action) {
   var data, team, prs;

   switch (action.type) {
      case 'GET_CMP_TEAMS':
      case 'GET_PRS_TEAMS': // Replace previous team
         return Object.assign({}, state, action.teams);
      case 'GET_TEAM_MMBS':
         // Add membership data to a team
         return Object.assign({}, state,
          {[action.teamData.teamId]: Object.assign({},
          state[action.teamData.teamId] , {mmbs: action.teamData.mmbs})});
      case 'PUT_TEAM':
         data = action.newTeamData;
         // Overwrite only actually-changed elements in the team
         return Object.assign({}, state, {[data.id]:
          Object.assign({}, state[data.id], data)});
      case 'ADD_TEAM':
      case 'GET_TEAM':
         var teamId = action.newTeamData.id;
         return Object.assign({}, state, {[teamId]: action.newTeamData});
      case 'DEL_TEAM':
         return update(state, {$unset: [action.teamId]});
      //ADD_MMB, only adds members to teams whose member data already is present
      case 'ADD_MMB':
         prs = action.prs;
         team = Object.assign({}, state[action.teamId]);

         //if there are no members in store, do not add new member to store
         if (!Object.keys(team.mmbs).length)
            return state;

         team.mmbs = Object.assign({}, team.mmbs, {[prs.id]: {email: prs.email, firstName: prs.firstName, lastName: prs.lastName}});
         return Object.assign({}, state, {[action.teamId]: team});
      case 'DEL_MMB':
         team = Object.assign({}, state[action.teamId]);

         team.mmbs = Object.assign({}, team.mmbs);
         delete team.mmbs[action.prsId];
         return Object.assign({}, state, {[action.teamId]: team});
      case 'SIGN_OUT':
         return {};
      default:
         return state;
   }
}
