import React, { Component } from 'react';
import './App.css';
// import { connect } from 'react-redux'
import connect from 'react-redux-fetch';
// import { Route } from 'react-router'
// import { Link, Switch, Redirect } from 'react-router-dom'
// import { updateAppSelected, openAppStartEnd, openAppDate, updateAppPickerStartEndValue, updateAppPickerDateValue, updateAppIntro, updateAppOrderTrain, updateBusiTicket } from './actions'
// import MyPage from './components/MyPage';
// import AppTicket from './container/AppTicket';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const DATASET = {
    '6180':{
        keys: ['橘子', '6180']
    },
    '2327':{
        keys: ['國巨', '2327']
    },
    '1256':{
        keys: ['鮮活', '1256', '果汁', '鮮活果汁']
    },
    '2888':{
        keys: ['西瓜', '2888', '新光金']
    },
    '6116':{
        keys: ['彩晶', '6116']
    },
    '3019':{
        keys: ['亞光', '3019']
    }
}

class App extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         home: true,
    //         selected: false,
    //     };
    // }

    componentWillMount() {
        this.props.dispatchDbGet();
    }

    parseMessages = messages => {
        let data = [];

        messages.forEach(msg => {
            for(let stock in DATASET){
                var re = new RegExp(DATASET[stock].keys.join('|'));

                const match = msg.push_content.match(re);
                if(match){
                    if(!data[stock]){
                        data[stock] = {
                            stock_id: stock,
                            messages: []
                        };
                    }
                    data[stock].messages.push(msg); 
                }
            }    
        });
        // data.forEach(item => item.messages = item.messages.sort((a, b) => { b.push_ipdatetime - a.push_ipdatetime}));
        return data.sort((a, b) => b.messages.length - a.messages.length);
    }

    createStockElement = (stock, index) => {
        const messages = stock.messages.sort((a, b) => b.id - a.id);
        return <div key={index} className='stock-element'>
            <div className='stock-element-header'>
                <div className='stock-element-name'>{"#"+stock.stock_id}</div>
                <div className='stock-element-keys'>
                    {DATASET[stock.stock_id].keys.map( (name, index) => <div key={index} className='stock-element-key'>{name}</div>)}
                </div>
            </div>
            <div className='stock-element-msg-list'>
                {messages.map(item => (
                    <div key={item.id} className='stock-element-msg'>
                        <div className='stock-msg-date'>{item.push_ipdatetime.split(' ')[1]}</div>
                        <div className='stock-msg-content'>{item.push_content}</div>
                    </div>
                ))}
            </div>
        </div>
    }

    render() {
        const {dbFetch} = this.props;
        console.log(dbFetch);
        let className = 'App';

        if (dbFetch.rejected) {
            return <div>Oops... Could not fetch!</div>
        }
 
        if (dbFetch.fulfilled) {
            const messages = dbFetch.value.messages;
            const polling = dbFetch.value.polling;
            const stocks = this.parseMessages(messages);
            const children = stocks.map( (stock, index) => {
                return this.createStockElement(stock, index);
            });

            return <div className={className}>
                <div className='stock-list'>
                    {children}
                </div>
                <div id="article-polling" data-offset={polling['data-offset']} data-longpollurl={polling['data-longpollurl']} data-pollurl={polling['data-pollurl']}/>
            </div>
        }

        return <div>Loading...</div>;
    }
}

// App = connect(mapStateToProps)(App);
// // App = connect()(App);
// export default App;


export default connect([{
    resource: 'db',
    request: {
        // url: 'http://localhost:8082/messages/'
        url: 'db.json'
    }
}])(App);