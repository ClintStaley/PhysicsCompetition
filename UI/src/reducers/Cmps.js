
export default function Cmps(state = [], action) {
    console.log("Cmps reducer");
    switch(action.type) {
        case 'UPDATE_CMPS': // Replace previous cnvs
            return action.cnvs;
        default:
            return state;
    }
}
