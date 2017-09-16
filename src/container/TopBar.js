import React, { Component } from 'react';
import './TopBar.css';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import SearchIcon from 'material-ui/svg-icons/action/search';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import htmlToJson from 'html-to-json';

class TopBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openSearchDialog: false,
            searchArticleValue: "",
            optionArticles: []
        };
    }

    _findArticlePromise = (regexp, page) => {
        page = page || "";
        regexp = regexp || new RegExp();

        let promise = fetch(`https://www.ptt.cc/bbs/Stock/index${page}.html`)
        .then( function(response) {
            return response.text();
        })
        .then( function(html) {
            // console.log(html)
            return htmlToJson.parse(html, {
                'articles': function ($doc) {
                    // ex. link would be <a href="/bbs/PublicServan/M.1127742013.A.240.html">Re: [問題] 職等</a>
                    return this.map('.r-ent .title a', function($item, index){
                        return {
                            title: $item.text(),
                            id: $item.attr('href').split('/')[3].replace('.html', ''),
                        };
                    })
                }     
            });
        })
        .then( function(data) {
            // console.log(data);
            return data.articles.filter(article => {
                return article.title.match(regexp);
            });
        })
        .then(results => (results.length > 0 || page === 0) ? results : this._findArticlePromise(regexp, page-1))
        .catch( function(error) {
            console.log(error);
        });

        return promise;
    };

    _fetchLastArticle = () => {
        const main = this;

        // fetch(`http://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=50a34e070dd5c09a99554b57ab7ea7e2`)
        fetch(`https://www.ptt.cc/bbs/Stock/index.html`)
        .then( function(response) {
            return response.text();
        })
        .then( function(html) {
            // console.log(html)
            return htmlToJson.parse(html, {
                // 'articles': function ($doc) {
                //     // ex. link would be <a href="/bbs/PublicServan/M.1127742013.A.240.html">Re: [問題] 職等</a>
                //     return this.map('.r-ent .title a', function($item, index){
                //         return {
                //             title: $item.text(),
                //             id: $item.attr('href').split('/')[3].replace('.html', ''),
                //         };
                //     })
                // },
                'buttons': function ($doc) {
                    return this.map('.btn-group-paging .btn', function($item, index){
                        return {
                            text: $item.text(),
                            href: $item.attr('href')
                        };
                    })
                }          
            });
        })
        .then( function(data) {
            // console.log(data);

            let nowPage = false;
            data.buttons.forEach(btn => {
                if(nowPage){
                    return;
                }
                if(btn.text.indexOf("上頁") !== -1){
                    const match = btn.href.match(/\/bbs\/Stock\/index(\d*)\.html/);
                    if(match){
                        nowPage = match[1]*1 + 1;
                    }
                }
            });    

            if(nowPage){
                
                main._findArticlePromise(/盤中閒聊/, nowPage)
                .then(results => {
                    main.setState({
                        optionArticles: main.state.optionArticles.concat(results)
                    });
                    return main._findArticlePromise(/盤後閒聊/, nowPage)
                    .then(results => {
                        main.setState({
                            optionArticles: main.state.optionArticles.concat(results)
                        });
                    })
                });
            }
        })
        .catch( function(error) {
            console.log(error);
        });
    };

    componentWillMount(){
        this._fetchLastArticle();
    }

    articleChange = event => {
        this.props.history.push("/" + event.target.value);
        // this._fetchData(event.target.value);
    }

    openSearchDialog = () => {
        this.setState({
            openSearchDialog: true
        });
    }

    closeSearchDialog = () => {
        this.setState({
            openSearchDialog: false
        });
    }

    searchArticleValueChange = event => {
        this.setState({
            searchArticleValue: event.target.value
        });
    }

    searchArticle = event => {
        this.props.history.push("/" + this.state.searchArticleValue);
    }

    searchArticleById = id => event => {
        this.props.history.push("/" + id);
    }

    render() {
        let className = "TopBar";

        const ActionsMenu = (props) => {
            const menuItems = this.state.optionArticles.map((item, index) => {
                return <MenuItem key={index} primaryText={item.title} onClick={this.searchArticleById(item.id)}/>
            });
            return <IconMenu
                {...props}
                iconButtonElement={
                    <IconButton><SearchIcon color='white'/></IconButton>
                }
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
            >
                {menuItems} 
                <MenuItem primaryText="搜尋文章ID" onClick={this.openSearchDialog}/>
            </IconMenu>
        }
        ActionsMenu.muiName = 'IconMenu';

        const dialogSearchActions = [
            <FlatButton
                label="取消"
                onTouchTap={this.closeSearchDialog}
            />,
            <FlatButton
                label="完成"
                primary={true}
                onTouchTap={this.searchArticle}
            />,
        ];

        const dialogSearchChildren = (
            <TextField
                id="stock-article"
                className="stock-input"
                value={this.state.searchArticleValue}
                onChange={this.searchArticleValueChange}
                hintText="文章ID"
            />
        );

        return (
            <div className={className}>
                <AppBar
                    title={this.props.title}
                    // iconClassNameRight="material-icons muidocs-icon-navigation-expand-more"
                    // onLeftIconButtonTouchTap={this.openSearchDialog}
                    iconElementLeft={<ActionsMenu />}
                    children={this.props.children}
                />
                <Dialog
                    title={"搜尋文章"}
                    actions={dialogSearchActions}
                    modal={true}
                    open={this.state.openSearchDialog}
                >
                    {dialogSearchChildren}
                </Dialog>
            </div>
        );
    }
}

export default TopBar;
