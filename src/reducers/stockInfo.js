let initState = {
};

const stockInfo = (state = initState, action) => {
    switch (action.type) {
        case 'UPDATE_STOCK_INFO':
            const stocks = [].concat(action.stocks);
            let newState = {
                ...state
            }
            stocks.forEach(stock => {
                newState[stock.id] = stock;
            });
            return newState
        default:
            return state
    }
}

export default stockInfo