import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux'
// import connect from 'react-redux-fetch';
// import { Route } from 'react-router'
// import { Link, Switch, Redirect } from 'react-router-dom'

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import htmlToJson from 'html-to-json';
import attachPoller from './utils/bbs.js'
import $ from 'jquery'
import StockMessage from './components/StockMessage';
import StockHeader from './components/StockHeader';
import TopBar from './container/TopBar';
import StockCard from './container/StockCard';
import keywords from './config/keywords';
import Scroll from 'react-scroll';
import { updateAppLastPage } from './actions';
// import LinearProgress from 'material-ui/LinearProgress';

var ScrollLink   = Scroll.Link;
// var ScrollElement    = Scroll.Element;

class App extends Component {
    constructor(props) {
        super(props);

        let article = "M.1505435457.A.858";
        if(props.match && props.match.params && props.match.params.id){
            article = props.match.params.id;   
        }
        
        this.state = {
            article: article,
            messages: undefined,
            polling: undefined,
            $polling: false,
            openSearchDialog: false,
            searchArticleValue: "",
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
                },
                'meta': function ($doc) {
                    return $doc.find('.article-metaline');
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
                    polling: data.polling[0].attribs,
                    article_title: data.meta[1].children[1].children[0].data
                });
            }, 300);
        })
        .catch( function() {
            main.setState({
                infoStatus: 'error'
            });
        })
    };

    _attachPoller = () => {
        if(this.state.$polling === false){
            let main = this;
            const $polling = $('#article-polling');
            this.setState({
                $polling: $polling
            }, () => {
                attachPoller(this.state.$polling, (content) => {
                    htmlToJson.parse(content, {
                        'messages': function ($doc) {
                            // console.log(this);
                            return this.map('.push', function($item, index){
                                return {
                                    tag: $item.find('.push-tag').text(),
                                    userid: $item.find('.push-userid').text(),
                                    content: $item.find('.push-content').text().substr(1).trim(),
                                    ipdatetime: $item.find('.push-ipdatetime').text().trim()
                                };
                            })
                        }
                    })
                    .then(function(data){
                        main.setState({
                            messages: main.state.messages.concat(data.messages)
                        }, () => {
                            setTimeout( () => {
                                $('#allContainer').scrollTop($('#allContainer')[0].scrollHeight);    
                            }, 1500);
                        });
                    });
                });
            });
        }
    }

    componentWillMount() {
        this._fetchData();
        this.props.app._findLastPagePromise()
        .then(page => {
            console.log('last page', page);
            this.props.dispatch(updateAppLastPage(page));
        })
    }

    componentDidUpdate(){
        setTimeout(() => this._attachPoller(), 3000);
    }

    componentDidMount() {
        setTimeout(() => this._attachPoller(), 3000);
    }

    benchTime = time => {
        if(time.length === 0){
            console.warn('benchTime is empty', time);
            time = "00/00 00:00";
        }
        const arr = time.split(' ')[1].split(":");
        return (arr[0]*60) + (arr[1]*1);
    }

    parseMessages = messages => {
        // set tags
        // messages = messages.sort((a, b) => this.benchTime(a.ipdatetime) - this.benchTime(b.ipdatetime));
        messages.forEach(msg => {
            msg.idTags = [];
            msg.keyTags = [];

            // match keywords
            for(let stock_id in keywords){
                const re = new RegExp(keywords[stock_id].keys.join('|'));
                const match = msg.content.match(re);
                if(match && msg.keyTags.indexOf(match[0]) === -1){
                    msg.keyTags.push(match[0]);
                    if(msg.idTags.indexOf(stock_id) === -1){
                        msg.idTags.push(stock_id);
                    }
                }
            }    

            // match id
            const re2 = new RegExp(/.*(\d{4}).*/);
            const match2 = msg.content.match(re2);
            if(match2 && msg.idTags.indexOf(match2[1]) === -1){
                msg.idTags.push(match2[1]);
            }
        });

        let allStockIds = [];
        messages.forEach(msg => {
            msg.idTags.forEach(id => {
                if(allStockIds.indexOf(id) === -1){
                    allStockIds.push(id);
                }
            })
        });

        let allStock = allStockIds.map(stock_id => {
            let stockMessages = messages.filter(msg => msg.idTags.indexOf(stock_id) !== -1);
            stockMessages = stockMessages.map(msg => {
                let relatedMessages = messages.filter(message => {
                    if(message.userid === msg.userid){
                        if(Math.abs(this.benchTime(message.ipdatetime) - this.benchTime(msg.ipdatetime)) <= 1){
                            return true;
                        }
                    }
                    return false;
                });

                // stock msg obj
                return {
                    userid: msg.userid,
                    ipdatetime: msg.ipdatetime,
                    content: relatedMessages.sort((a, b) => this.benchTime(a.ipdatetime) - this.benchTime(b.ipdatetime)).map(item => item.content)
                }
            });

            // stock data obj
            return {
                stock_id: stock_id,
                messages: stockMessages.sort((a, b) => this.benchTime(b.ipdatetime) - this.benchTime(a.ipdatetime))
            }
        });

        return allStock.sort((a, b) => b.messages.length - a.messages.length);
    }

    render() {
        const { 
          infoStatus 
        } = this.state;

        if (infoStatus === 'loaded' && this.props.app.lastPage) {
            const messages = this.state.messages.filter(msg => msg.userid !== "");
            const stocks = this.parseMessages(messages);
            const polling = this.state.polling;
            const stockChildren = stocks.map( (stock, index) => <StockCard key={index} stock_id={stock.stock_id} stock={stock.messages}/>);

            let totalMessages = 0;
            stocks.forEach(stock => {
                const l = stock.messages.length;
                if(l > totalMessages) {
                    totalMessages = l;
                }
            });
            const rankChildren = stocks.map( (stock, index) => {
                const keys = keywords[stock.stock_id] ? keywords[stock.stock_id].keys : [];
                return (
                    <ScrollLink 
                        key={'rank-'+index} 
                        activeClass="active" 
                        className='rank-scroll-link'
                        to={`stock-${stock.stock_id}`} 
                        // spy={true} 
                        smooth={true} 
                        offset={0}
                        duration={500} 
                        containerId='stockContainer'>
                            <StockHeader 
                                stock_id={stock.stock_id} 
                                comments={stock.messages.length}
                                percentage={Math.floor(stock.messages.length/totalMessages*70)}
                                keys={keys}
                            />
                    </ScrollLink>
                )
            });

            // const allMessages = this.state.messages.sort((a, b) => this.benchTime(b.ipdatetime) - this.benchTime(a.ipdatetime))
            const msgChildren = messages.sort((a, b) => this.benchTime(a.ipdatetime) - this.benchTime(b.ipdatetime))
                .map( (msg, index) => {
                return (
                    <ScrollLink 
                        key={'msg-'+index} 
                        // activeClass="active" 
                        // className='rank-scroll-link'
                        to={`stock-${msg.idTags[0]}`} 
                        // spy={true} 
                        smooth={true} 
                        offset={0}
                        duration={500} 
                        containerId='stockContainer'>
                            <StockMessage
                                index={index+1}
                                userid={msg.userid}
                                content={msg.content}
                                ipdatetime={msg.ipdatetime.split(' ')[1]}
                                idTags={msg.idTags}
                                keyTags={msg.keyTags}
                            >
                            </StockMessage>
                    </ScrollLink>
                )
            });

            return <div className='App'>
                <TopBar {...this.props} className="TopBar" title={this.state.article_title}>
                    <div id="article-polling" data-offset={polling['data-offset']} data-longpollurl={polling['data-longpollurl']} data-pollurl={polling['data-pollurl']}/>
                </TopBar>
                <div className='main'>
                    <div className='rank-list'>
                        {rankChildren}
                    </div>
                    <div id='stockContainer' className='stock-list'>
                        {stockChildren}
                    </div>
                    <div id='allContainer' className='all-msg-list'>
                        {msgChildren}
                    </div>
                </div>
            </div>
        }else if (infoStatus === 'loading') {
            return <div>Loading...</div>;
        }else if (infoStatus === 'error') {
            return <div>Error!!!</div>;
        }

    }
}

const mapStateToProps = state => {
  return { app: state.app }
}
App = connect(mapStateToProps)(App);
export default App;