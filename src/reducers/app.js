let initState = {
    selected: false,
};

const app = (state = initState, action) => {
    switch (action.type) {
        case 'UPDATE_APP_SELECTED':
            return {
                ...state, 
                selected: action.selected
            }
        default:
            return state
    }
}

export default app