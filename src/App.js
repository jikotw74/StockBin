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
// import { updateAppLastPage } from './actions';
// import LinearProgress from 'material-ui/LinearProgress';
// var request = require('request');
// var rp = require('request-promise');

var ScrollLink   = Scroll.Link;
// var ScrollElement    = Scroll.Element;

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
            articles: []
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
                                $('#allContainer').scrollTop($('#allContainer')[0].scrollHeight);    
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
        for(let stock_id in keywords){
            const re = new RegExp(keywords[stock_id].keys.join('|'));
            const match = str.match(re);
            if(match && keyTags.indexOf(match[0]) === -1){
               keyTags.push(match[0]);
                if(idTags.indexOf(stock_id) === -1){
                    idTags.push(stock_id);
                }
            }
        }    

        // match id
        const re2 = new RegExp(/.*(\d{4}).*/);
        const match2 = str.match(re2);
        if(match2 && idTags.indexOf(match2[1]) === -1){
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

        this.setState({
            infoStatus: 'loading'
        });

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
        validDate = validDate.map(d => (d.getMonth()+1) + '/' + d.getDate());

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
                    console.log('query_id', query_id);
                    this._fetchData(query_id);
                }
            })
        })
    }

    componentWillMount() {
        // this._fetchData();
        // this.props.app._findLastPagePromise()
        // .then(page => {
        //     console.log('last page', page);
        //     this.props.dispatch(updateAppLastPage(page));
        // })
        // this.props.app._findLastPagePromise()
        // .then(page => {
        //     this._init(page);
        // });
    }

    componentDidUpdate(){
        // setTimeout(() => this._attachPoller(), 3000);
    }

    componentDidMount() {
        this.props.app._findLastPagePromise()
        .then(page => {
            this._init(page);
        });
        


        // setTimeout(() => this._attachPoller(), 3000);

        // var options = {
        //     uri: 'http://mis.twse.com.tw/index.jsp?lang=zh_tw&stock=6180',
        //     // transform: function (body) {
        //     //     return cheerio.load(body);
        //     // }
        // };

        // var j = request.jar()

        // var url = 'http://mis.twse.com.tw/stock/';

        // fetch(url,{
        //   method: 'GET',
        //   credentials: "include",
        //   headers: {
        //     'Accept-Language': 'zh-TW',
        //   },
        // })
        // .then( function(response) {
        //     console.log(response);
        //     return response;
        // })

        // return;
        // var j = request.jar()
        // request({url: url, jar: j}, function () {
        //   var cookie_string = j.getCookieString(url); // "key1=value1; key2=value2; ..."
        //   var cookies = j.getCookies(url);
        //   console.log(cookie_string);
        //   console.log(cookies);
        //   // [{key: 'key1', value: 'value1', domain: "www.google.com", ...}, ...]
        // })
        // return;

        // var req = request.defaults({jar: request.jar()})
        // req('http://mis.twse.com.tw/stock/index.jsp', function (err, response, body) {
        //   console.log(response);
        // })
        // return;

        // var options = {
        //   url: 'http://mis.twse.com.tw/stock/index.jsp',
        //   jar: true,
        //   headers: {
        //     'Accept-Language': 'zh-TW',
        //   },
        //   resolveWithFullResponse: true
        // };

        // rp(options)
        // .then(function (response) {
        //     // var cookiejar = rp.jar();
        //     // cookiejar.setCookie(cookie, 'https://api.mydomain.com');
        //     // console.log(j.getCookies('http://mis.twse.com.tw'));
        //     console.log(response);
        //     // console.log(response);
        // })
        // .then(function (response) {
        //     var now = new Date();
        //     var options = {
        //       url: 'http://mis.twse.com.tw/stock/api/getStock.jsp?ch=6180.tw&json=1&_=' + now.getTime(),
        //       // headers: {
        //       //   'Accept-Language': 'zh-TW',
        //       // }
        //     };
        //     return rp(options)
        //     .then(function (response) {
        //         console.log(JSON.parse(response));
        //         var j = JSON.parse(response);
        //         console.log(j.msgArray);
        //         // console.log(response.msgArray[0].key);
        //         var now = new Date();
        //         var url = `http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${j.msgArray[0].key}&json=1&delay=0&_=${now.getTime()}`;
        //         console.log(url);
        //         var options = {
        //           url: url,
        //           credentials: 'include'
        //           // headers: {
        //           //   'Accept-Language': 'zh-TW',
        //           // }
        //         };
        //         return rp(options)
        //         .then(function (response) {
        //             console.log(response);

                    
        //         })

        //     })
        // })
        // .catch(function (err) {
        // });
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
            const tags = this._findTags(msg.content);
            msg.idTags = tags.idTags;
            msg.keyTags = tags.keyTags;
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
                messages: stockMessages.sort((a, b) => this.benchTime(b.ipdatetime) - this.benchTime(a.ipdatetime)),
                targetArticles: this.state.articles.filter( obj => obj.tags.idTags.indexOf(stock_id) !== -1 )
            }
        });

        return allStock.sort((a, b) => b.messages.length - a.messages.length);
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
            const stockChildren = stocks.map( (stock, index) => <StockCard key={index} stock_id={stock.stock_id} messages={stock.messages} targetArticles={stock.targetArticles}/>);

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
                    <div id='allContainer' className='all-msg-list'>
                        {msgChildren}
                    </div>
                </div>
            </div>
        }else if (infoStatus === 'loading') {
            return <div>Loading...</div>;
        }else if (infoStatus === 'error') {
            return <div>Error!!!</div>;
        }else{
            return <div>Nothing!!!</div>;
        }

    }
}

const mapStateToProps = state => {
  return { app: state.app }
}
App = connect(mapStateToProps)(App);
export default App;