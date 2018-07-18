import update from 'immutability-helper';

export default function teams(state = {}, action) {
   switch (action.type) {
      case 'UPDATE_TEAM': // Replace previous team
         return action.teams;
      case 'TOGGLE_TEAM':
         //update allows adding new data to the object while remaining immutable
         //will change the team.toggled state

         console.log(action.memberData.members);

         if (Object.keys(state[action.memberData.teamId].members).length  === 0){


            return update(update(state, {[action.memberData.teamId]:{members:{$set :action.memberData.members}}}), {[action.memberData.teamId]:{toggled:{$set :!state[action.memberData.teamId].toggled}}});
         }
         return update(state, {[action.memberData.teamId]:{toggled:{$set :!state[action.memberData.teamId].toggled}}});
      case 'POPULATE_TEAM':
      //will add member data to the object
         return update(state, {[action.memberData.teamId]:{members:{$set :action.memberData.members}}});
      case 'DELETE_TEAM':
         console.log(state);
         return update(state, {$unset : [action.teamId]});
      case 'SIGN_OUT':
         return {};
      default:
         return state;
   }
}
