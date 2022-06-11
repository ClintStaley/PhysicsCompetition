// Add |team| to |st|, returning a modified st.  Assume |team| must be added,
// but check before adding the related cmp.
var addTeamToState = (st, team) => {
   var cmpId = team.cmpId;

   return Object.assign({}, st, {
      myTeams: st.myTeams.concat([team.id]),
      myCmps: st.myCmps.includes(cmpId) ? st.myCmps : st.myCmps.concat([cmpId])
   });
}

// Drop |teamId| from |st|, also dropping |cmpId| *if* it is not also
// represented by one of the retained teams in |st|.  Both params strings.
var delTeamFromState = (st, teamId, cmpId, teamInfo) => {
   var newTeams = st.myTeams.filter(id => id !== teamId);
   var cmpOk = false;

   newTeams.forEach(id =>
      cmpOk = cmpOk || (teamInfo[id].cmpId === cmpId));

   return Object.assign({}, st, {myTeams: newTeams, myCmps: cmpOk ?
    st.myCmps : st.myCmps.filter(id => id !== cmpId)});
}

export default function prs(state = {}, action) {
   switch (action.type) {
      case 'SIGN_IN':
         return Object.assign(action.user, {myTeams: [], myCmps: []});
      case 'SIGN_OUT':
         return {} // Clear user state
      case 'GET_PRS_TEAMS':
         var newState = state;

         // Clear myTeams and myCmps in case they have been deleted
         newState.myTeams = [];
         newState.myCmps = [];

         for (let id in action.teams)
            newState = addTeamToState(newState, action.teams[id]);
         return newState;

      case 'DEL_TEAM':
         if (state.myTeams.includes(action.teamId))
            return delTeamFromState(state, action.teamId, action.cmpId,
             action.teamInfo);
         else
            return state;

      case 'ADD_TEAM':
         // Add the newly created team to my teams
         return addTeamToState(state, action.team);
      case 'GET_TEAM_MMBS':
         if (action.mmbs.includes(state.id)
          && !state.myTeams.includes(action.teamId))
            return addTeamToState(state, action.teamData);

         return state;
      case 'DEL_MMB':
         return Number(action.prsId) !== state.id ? state :
          delTeamFromState(state, action.teamId, action.cmpId, action.teamInfo)
      default:
         return state;
   }
}
