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
import Scroll from 'react-scroll';
import { updateStocks } from './actions';
import InitLoading from './components/InitLoading';

import io from 'socket.io-client';
const stockMaUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://damp-garden-50966.herokuapp.com';
// const stockMaUrl = 'https://damp-garden-50966.herokuapp.com';
const socket = io(stockMaUrl);
var ScrollLink   = Scroll.Link;
var ScrollElement    = Scroll.Element;

class App extends Component {
    constructor(props) {
        super(props);

        // let article = "M.1505435457.A.858";
        // if(props.match && props.match.params && props.match.params.id){
        //     article = props.match.params.id;   
        // }
        
        this.state = {
            article: false,
            messages: undefined,
            polling: undefined,
            $polling: false,
            openSearchDialog: false,
            searchArticleValue: "",
            validDate: [],
            articles: [],
            infoStatus: 'loading',
            registedStocks: false
        };
    }

    _attachPoller = () => {
        if(this.state.$polling === false){
            let main = this;
            const $polling = $('#article-polling');
            if($polling.html() === undefined){
                return;
            }
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
                                $('#msgContainer').scrollTop($('#msgContainer')[0].scrollHeight);    
                            }, 1500);
                        });
                    });
                });
            });
        }
    }

    _fetchData = (article) => {
        const main = this;
        let query = null;

        // main.setState({
        //     infoStatus: 'loading'
        // });

        if (!article || article === '') {
            query = this.state.article;
        } else {
            query = article;
        }

        console.log('query', query);
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
            main.setState({
                article: query,
                infoStatus: 'loaded',
                messages: data.messages,
                polling: data.polling[0].attribs,
                article_title: data.meta[1].children[1].children[0].data
            }, () => {
                setTimeout(() => main._attachPoller(), 3000);
            });
        })
        .catch( function() {
            main.setState({
                infoStatus: 'error'
            });
        })
    }

    _findTags = str => {
        let idTags = [];
        let keyTags = [];
        let typeTags = [];

        // match type
        const chatRegExp = new RegExp('^\\[閒聊\\].+盤.+閒聊');
        if(str.match(chatRegExp)){
            typeTags.push('chat');
        }

        // match keywords
        for(let stock_id in this.props.app.DB){
            const keys = this.props.app.DB[stock_id].keys;
            if(keys.length == 0){
                continue;
            }
            const re = new RegExp(this.props.app.DB[stock_id].keys.join('|'));
            const match = str.match(re);
            if(match && match[0].length > 0 && keyTags.indexOf(match[0]) === -1){
               keyTags.push(match[0]);
                if(idTags.indexOf(stock_id) === -1){
                    idTags.push(stock_id);
                }
            }
        }    

        // match id
        const re2 = new RegExp(/.*(\d{4}).*/);
        const match2 = str.match(re2);
        if(match2 && this.props.app.DB[match2[1]] && idTags.indexOf(match2[1]) === -1){
            idTags.push(match2[1]);
        }

        return {
            idTags,
            keyTags,
            typeTags
        }
    }

    _parseArticles = (articles) => {
        articles = articles.map(article => {
            return {
                article: article,
                tags: this._findTags(article.title)
            }
        });

        this.setState({
            articles: this.state.articles.concat(articles)
        })
    }

    _fetchArticles = (page, callback) => {
        // console.log('page', page);

        // this.setState({
        //     infoStatus: 'loading'
        // });

        const promise = fetch(`https://www.ptt.cc/bbs/Stock/index${page}.html`)
        .then( response => {
            return response.text();
        })
        .then( html => {
            return htmlToJson.parse(html, {
                'articles': function ($doc) {
                // ex. link would be <a href="/bbs/PublicServan/M.1127742013.A.240.html">Re: [問題] 職等</a>
                return this.map('.r-ent', function($item, index){
                    const $titleA = $item.find('.title a');
                    const href = $titleA.attr('href');
                    return {
                        title: $titleA.text(),
                        id: href ? href.split('/')[3].replace('.html', '') : false,
                        href: href,
                        date: $item.find('.meta .date').text().trim(),
                        mark: $item.find('.mark').text().trim(),
                    };
                })
            }            
            });
        })
        .then( data => {
            console.log('_fetchArticles', data);
            let done = false;

            const articles = data.articles.reverse().filter((article, index) => {
                let result = true;
                if(!article.id || article.mark === '!'){
                    result = false;
                }
                if(result && this.state.validDate.length > 0){

                    if(this.state.validDate.indexOf(article.date) === -1){
                        result = false;
                        done = true;
                    }
                }
                return result;
            })
            if(callback instanceof Function){
                // console.log(articles);
                callback(articles);
            }
            if(!done){
                return this._fetchArticles(page-1, callback);
            }
        })
        .catch( error => {
            // console.log(error);
            this.setState({
                infoStatus: 'error'
            });
        })

        return promise;
    }

    _init = (startPage) => {
        startPage = startPage || "";
        const validDays = 3;

        // create valid date array
        let validDate = [];
        let now = new Date();
        validDate.push(now);
        for(let i = 1 ; i <= validDays ; i++){
            let d = new Date();
            d.setDate(now.getDate() - i);
            validDate.push(d);
        }
        validDate = validDate.map(d => {
            let dateStr = d.getDate();
            if(dateStr < 10){
                dateStr = '0' + dateStr;
            }
            return (d.getMonth()+1) + '/' + dateStr
        });

        this.setState({
            validDate: validDate
        }, () => {
            this._fetchArticles(startPage, articles => this._parseArticles(articles))
            .then( () => {                
                const chatArticles = this.state.articles.filter(obj => obj.tags.typeTags.indexOf('chat') !== -1);
                const match = this.props.match;
                let query_id = false;
                if(match && match.params && match.params.id){
                    query_id = match.params.id;   
                }else if(chatArticles.length > 0){
                    query_id = chatArticles[0].article.id;
                }

                if(query_id){
                    this._fetchData(query_id);
                }
            })
        })
    }

    componentWillMount() {
        socket.on('updateStocks', data =>{
            console.log('updateStocks', data);
            let stocks = Object.keys(data).map(key => data[key]);
            this.props.dispatch(updateStocks(stocks));
        });
    }

    componentDidUpdate(){
        let article = false;
        const match = this.props.match;
        if(match && match.params && match.params.id){
            article = match.params.id;   
        }
        if(article && (article !== this.state.article) && (this.state.infoStatus === 'loaded')){
            this._fetchData(article);
        }
    }

    componentDidMount() {
        this.props.app._findLastPagePromise()
        .then(page => {
            this._init(page);
        });
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
        messages.forEach((msg, index) => {
            const tags = this._findTags(msg.content);
            msg.idTags = tags.idTags;
            msg.keyTags = tags.keyTags;
            msg.message_id = index+1;
        });

        let allStockIds = [];
        messages.forEach(msg => {
            msg.idTags.forEach(id => {
                if(allStockIds.indexOf(id) === -1){
                    allStockIds.push(id);
                }
            })
        });

        //
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
                    message_id: msg.message_id,
                    userid: msg.userid,
                    ipdatetime: msg.ipdatetime,
                    content: relatedMessages.sort((a, b) => this.benchTime(a.ipdatetime) - this.benchTime(b.ipdatetime)).map(item => item.content)
                }
            });

            const name = this.props.app.DB[stock_id] ? this.props.app.DB[stock_id].name : "";

            // stock data obj
            return {
                stock_id: stock_id,
                name: name,
                messages: stockMessages.sort((a, b) => this.benchTime(b.ipdatetime) - this.benchTime(a.ipdatetime)),
                targetArticles: this.state.articles.filter( obj => obj.tags.idTags.indexOf(stock_id) !== -1 )
            }
        });

        const result = allStock.sort((a, b) => b.messages.length - a.messages.length);

        //
        const registedStocks = result.map(stock => stock.stock_id);
        if(!this.state.registedStocks || (this.state.registedStocks.length !== registedStocks.length)){
            this.setState({
               registedStocks: registedStocks 
            }, () => {
                console.log('emit registStocks');
                socket.emit('registStocks', registedStocks);
            });
        }

        return result;
    }

    render() {
        const { 
          infoStatus 
        } = this.state;

        // if (infoStatus === 'loaded' && this.props.app.lastPage) {
        if (infoStatus === 'loaded') {
            // return <div>loaded...</div>;

            const messages = this.state.messages.filter(msg => msg.userid !== "");
            const stocks = this.parseMessages(messages);
            const polling = this.state.polling;
            const stockChildren = stocks.map( (stock, index) => <StockCard key={stock.stock_id} stock_id={stock.stock_id} messages={stock.messages} targetArticles={stock.targetArticles}/>);

            let totalMessages = 0;
            stocks.forEach(stock => {
                const l = stock.messages.length;
                if(l > totalMessages) {
                    totalMessages = l;
                }
            });
            const rankChildren = stocks.map( (stock, index) => {
                const keys = this.props.app.DB[stock.stock_id] ? this.props.app.DB[stock.stock_id].keys : [];
                const info = this.props.stockInfo[stock.stock_id] ? this.props.stockInfo[stock.stock_id] : false;
                return (
                    <ScrollLink 
                        key={stock.stock_id} 
                        activeClass="active" 
                        className='rank-scroll-link'
                        to={`stock-${stock.stock_id}`} 
                        // spy={true} 
                        smooth={true} 
                        offset={0}
                        duration={500} 
                        containerId='stockContainer'>
                            <StockHeader 
                                name={stock.name}
                                stock_id={stock.stock_id} 
                                comments={stock.messages.length}
                                // percentage={Math.floor(stock.messages.length/totalMessages*70)}
                                info={info}
                            />
                    </ScrollLink>
                )
            });

            // const allMessages = this.state.messages.sort((a, b) => this.benchTime(b.ipdatetime) - this.benchTime(a.ipdatetime))
            const msgChildren = messages.map( (msg, index) => {
                return (
                    <ScrollLink 
                        key={msg.message_id} 
                        // activeClass="active" 
                        // className='rank-scroll-link'
                        to={`stock-${msg.idTags[0]}`} 
                        // spy={true} 
                        smooth={true} 
                        offset={0}
                        duration={500} 
                        isDynamic={true}
                        containerId='stockContainer'>
                            <ScrollElement name={`msg-${msg.message_id}`}>
                                <StockMessage
                                    index={msg.message_id}
                                    userid={msg.userid}
                                    content={msg.content}
                                    ipdatetime={msg.ipdatetime.split(' ')[1]}
                                    idTags={msg.idTags}
                                    keyTags={msg.keyTags}
                                >
                                </StockMessage>
                            </ScrollElement>
                    </ScrollLink>
                )
            });

            const chatArticles = this.state.articles.filter( obj => obj.tags.typeTags.indexOf('chat') !== -1 );
            let topChatArticles = [];
            chatArticles.forEach( obj => {
                for( let i = 0 ; i < topChatArticles.length ; i++ ){
                    if(topChatArticles[i].article.title === obj.article.title){
                        return;
                    }
                }
                topChatArticles.push(obj);
            })
            topChatArticles = topChatArticles.filter((obj, index) => index < 4);

            return <div className='App'>
                <TopBar {...this.props} className="TopBar" title={this.state.article_title} chatArticles={topChatArticles}>
                    <div id="article-polling" data-offset={polling['data-offset']} data-longpollurl={polling['data-longpollurl']} data-pollurl={polling['data-pollurl']}/>
                </TopBar>
                <div className='main'>
                    <div className='rank-list'>
                        {rankChildren}
                    </div>
                    <div id='stockContainer' className='stock-list'>
                        {stockChildren}
                    </div>
                    <div id='msgContainer' className='all-msg-list'>
                        {msgChildren}
                    </div>
                </div>
            </div>
        }else if (infoStatus === 'loading') {
            return <InitLoading message="Loading..."/>
        }else if (infoStatus === 'error') {
            return <InitLoading message="Error!!!"/>
        }else{
            return <InitLoading message="Nothing!!!"/>
        }

    }
}

const mapStateToProps = state => {
    return { 
        app: state.app,
        stockInfo: state.stockInfo,
    }
}
App = connect(mapStateToProps)(App);
export default App;