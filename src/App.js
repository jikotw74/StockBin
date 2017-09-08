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
import htmlToJson from 'html-to-json';
import attachPoller from './utils/bbs.js'
import $ from 'jquery'
import TextField from 'material-ui/TextField';

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
    },
    '2317':{
        keys: ['鴻海', '2317', '公公', '海公公', '海公']
    },
    '3105':{
        keys: ['穩懋', '3105', '穩套']
    },
    '2474':{
        keys: ['可成', '2474']
    },
    '2337':{
        keys: ['旺宏', '2337']
    },
    '3580':{
        keys: ['友威科', '3580', '友威']
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            article: "M.1504830606.A.0D9",
            messages: undefined,
            polling: undefined,
        };
    };

    _fetchData = (article) => {
        const main = this;
        let query = null;

        main.setState({
            infoStatus: 'loading'
        });

        if (!article || article === '') {
            query = this.state.article;
        } else {
            query = article;
        }

        // fetch(`http://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=50a34e070dd5c09a99554b57ab7ea7e2`)
        fetch(`https://www.ptt.cc/bbs/Stock/${query}.html`)
        .then( function(response) {
            return response.text();
        })
        .then( function(html) {
            return htmlToJson.parse(html, {
                'messages': function ($doc) {
                    return this.map('.push', function($item, index){
                        return {
                            tag: $item.find('.push-tag').text(),
                            userid: $item.find('.push-userid').text(),
                            content: $item.find('.push-content').text(),
                            ipdatetime: $item.find('.push-ipdatetime').text().trim()
                        };
                    })
                },
                'polling': function ($doc) {
                    return $doc.find('#article-polling');
                }
            });
        })
        .then( function(data) {
            console.log(data);
            setTimeout( function() {
                main.setState({
                    article: query,
                    infoStatus: 'loaded',
                    messages: data.messages,
                    polling: data.polling[0].attribs
                });
            }, 300);
        })
        .catch( function() {
            main.setState({
                infoStatus: 'error'
            });
        })
    };

    componentWillMount() {
        this._fetchData();
    }

    componentDidUpdate(){
        setTimeout(() => attachPoller($('#article-polling'), (content) => console.log(content)), 3000);
    }

    componentDidMount() {
        setTimeout(() => attachPoller($('#article-polling'), (content) => console.log(content)), 3000);
    }

    articleChange = event => {
        this._fetchData(event.target.value);
    }

    parseMessages = messages => {
        let data = [];

        messages.forEach(msg => {
            for(let stock in DATASET){
                var re = new RegExp(DATASET[stock].keys.join('|'));

                const match = msg.content.match(re);
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
        data.forEach(item => item.messages = item.messages.sort((a, b) => { 
            const bench = s => {
                const sArray = s.split(' ')[1].split(":");
                return (sArray[0]*60) + (sArray[1]*1);
            }
            return bench(b.ipdatetime) - bench(a.ipdatetime)
        }));
        return data.sort((a, b) => b.messages.length - a.messages.length);
    }

    createStockElement = (stock, index) => {
        const messages = stock.messages;
        return <div key={index} className='stock-element'>
            <div className='stock-element-header'>
                <div className='stock-element-name'>{"#"+stock.stock_id}</div>
                <div className='stock-element-keys'>
                    {DATASET[stock.stock_id].keys.map( (name, index) => <div key={index} className='stock-element-key'>{name}</div>)}
                </div>
            </div>
            <div className='stock-element-msg-list'>
                {messages.map((item, index) => (
                    <div key={index} className='stock-element-msg'>
                        <div className='stock-msg-userid'>{item.userid}</div>
                        <div className='stock-msg-content'>{item.content.substr(1)}</div>
                        <div className='stock-msg-date'>{item.ipdatetime.split(' ')[1]}</div>
                    </div>
                ))}
            </div>
        </div>
    }

    render() {
        const { 
          infoStatus 
        } = this.state;

        if (infoStatus === 'loaded') {
            const stocks = this.parseMessages(this.state.messages);
            const polling = this.state.polling;
            const children = stocks.map( (stock, index) => {
                return this.createStockElement(stock, index);
            });

            return <div className='App'>
                <div className='stock-list'>
                    {children}
                </div>
                <div className='footer'>
                    <TextField
                      id="stock-article"
                      className="stock-input"
                      value={this.state.article}
                      onChange={this.articleChange}
                      hintText="文章ID"
                    />
                    <div id="article-polling" data-offset={polling['data-offset']} data-longpollurl={polling['data-longpollurl']} data-pollurl={polling['data-pollurl']}/>
                </div>
            </div>
        }else if (infoStatus === 'loading') {
            return <div>Loading...</div>;
        }else if (infoStatus === 'error') {
            return <div>Loading...</div>;
        }

        // const {dbFetch} = this.props;
        // console.log(dbFetch);
        // let className = 'App';

        // if (dbFetch.rejected) {
        //     return <div>Oops... Could not fetch!</div>
        // }
 
        // if (dbFetch.fulfilled) {
            // const messages = dbFetch.value.messages;
            // const polling = dbFetch.value.polling;
            // const stocks = this.parseMessages(messages);
            // const children = stocks.map( (stock, index) => {
            //     return this.createStockElement(stock, index);
            // });

            // return <div className={className}>
            //     <div className='stock-list'>
            //         {children}
            //     </div>
            //     <div id="article-polling" data-offset={polling['data-offset']} data-longpollurl={polling['data-longpollurl']} data-pollurl={polling['data-pollurl']}/>
            // </div>
        // }

        // return <div>Loading...</div>;
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