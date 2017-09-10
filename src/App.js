import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux'
// import connect from 'react-redux-fetch';
// import { Route } from 'react-router'
// import { Link, Switch, Redirect } from 'react-router-dom'
// import { updateAppSelected, openAppStartEnd, openAppDate, updateAppPickerStartEndValue, updateAppPickerDateValue, updateAppIntro, updateAppOrderTrain, updateBusiTicket } from './actions'

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import htmlToJson from 'html-to-json';
import attachPoller from './utils/bbs.js'
import $ from 'jquery'
import TextField from 'material-ui/TextField';
import MsgContent from './components/TextField';
import StockHeader from './components/StockHeader';
import keywords from './config/keywords';
import Scroll from 'react-scroll';

var ScrollLink   = Scroll.Link;
var ScrollElement    = Scroll.Element;

class App extends Component {
    constructor(props) {
        console.log(props);
        super(props);

        let article = "M.1504830606.A.0D9";
        if(props.match && props.match.params && props.match.params.id){
            article = props.match.params.id;   
        }
        
        this.state = {
            article: article,
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
                            content: $item.find('.push-content').text().substr(1).trim(),
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
        this.props.history.push("/" + event.target.value);
        // this._fetchData(event.target.value);
    }

    parseMessages = messages => {
        var data = [];
        var usedMessages = [];

        const benchTime = time => {
            const arr = time.split(' ')[1].split(":");
            return (arr[0]*60) + (arr[1]*1);
        }

        const sortTime = (a, b) => benchTime(b.ipdatetime) - benchTime(a.ipdatetime);

        const parseStock = (stock, msg) => {
            if(!data[stock]){
                data[stock] = {
                    stock_id: stock,
                    messages: []
                };
            }
            usedMessages.push(msg);
            let relatedMessages = messages.filter(message => {
                if(usedMessages.indexOf(message) === -1 && message.userid === msg.userid){
                    if(Math.abs(benchTime(message.ipdatetime) - benchTime(msg.ipdatetime)) <= 1){
                        usedMessages.push(message);
                        return true;
                    }
                }
                return false;
            });
            relatedMessages.push(msg);
            data[stock].messages.push({
                userid: msg.userid,
                ipdatetime: msg.ipdatetime,
                content: relatedMessages.sort((a, b) => benchTime(a.ipdatetime) - benchTime(b.ipdatetime)).map(item => item.content)
            }); 
        }

        messages.forEach(msg => {
            let matched = false;

            // match keywords
            for(let stock in keywords){
                const re = new RegExp([stock].concat(keywords[stock].keys).join('|'));
                const match = msg.content.match(re);
                if(match){
                    parseStock(stock, msg);
                    matched = true;
                    break;
                }
            }    

            // match others
            if(matched === false){
                const re2 = new RegExp(/.*(\d{4}).*/);
                const match2 = msg.content.match(re2);
                if(match2){
                    parseStock(match2[1], msg);
                    matched = true;
                }
            }
        });
        data.forEach(item => item.messages = item.messages.sort(sortTime));
        return data.sort((a, b) => b.messages.length - a.messages.length);
    }

    createStockElement = (stock, index) => {
        const messages = stock.messages;
        const keys = keywords[stock.stock_id] ? keywords[stock.stock_id].keys : [];

        return <ScrollElement key={index} name={`stock-${stock.stock_id}`}>
            <div className='stock-element'>
                <StockHeader stock_id={stock.stock_id} keys={keys} />
                <div className='stock-element-msg-list'>
                    {messages.map((item, index) => (
                        <div key={index} className='stock-element-msg'>
                            <div className='stock-msg-userid'>{item.userid}</div>
                            <MsgContent className='stock-msg-content' text={item.content}/>
                            <div className='stock-msg-date'>{item.ipdatetime.split(' ')[1]}</div>
                        </div>
                    ))}
                </div>
            </div>
        </ScrollElement>
    }

    render() {
        const { 
          infoStatus 
        } = this.state;

        console.log(this.props.location);

        if (infoStatus === 'loaded') {
            const stocks = this.parseMessages(this.state.messages);
            const polling = this.state.polling;
            const children = stocks.map( (stock, index) => {
                return this.createStockElement(stock, index);
            });

            const totalMessages = stocks.reduce((previousValue, currentValue, index, array) => {
                return previousValue + currentValue.messages.length;
            }, 0);
            const rankChildren = stocks.map( (stock, index) => {
                const keys = keywords[stock.stock_id] ? keywords[stock.stock_id].keys : [];
                return (
                    <ScrollLink 
                        key={index} 
                        activeClass="active" 
                        className='rank-scroll-link'
                        to={`stock-${stock.stock_id}`} 
                        spy={true} 
                        smooth={true} 
                        offset={0}
                        duration={500} 
                        containerId='stockContainer'>
                            <StockHeader 
                                stock_id={stock.stock_id} 
                                comments={stock.messages.length}
                                percentage={Math.floor(stock.messages.length/totalMessages*100)}
                                keys={keys}/>
                    </ScrollLink>
                )
            });

            return <div className='App'>
                <div className='main'>
                    <div className='rank-list'>
                        {rankChildren}
                    </div>
                    <div id='stockContainer' className='stock-list'>
                        {children}
                    </div>
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

    }
}

// App = connect(mapStateToProps)(App);
App = connect()(App);
export default App;