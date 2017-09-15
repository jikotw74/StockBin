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
            last_article_title: false,
            last_article_id: false
        };
    }

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
                'articles': function ($doc) {
                    // ex. link would be <a href="/bbs/PublicServan/M.1127742013.A.240.html">Re: [問題] 職等</a>
                    return this.map('.r-ent .title a', function($item, index){
                        return {
                            title: $item.text(),
                            id: $item.attr('href').split('/')[3].replace('.html', ''),
                        };
                    })
                },             
            });
        })
        .then( function(data) {
            // console.log(data);
            const last = data.articles[data.articles.length-1];
            if(last)setTimeout( function() {
                main.setState({
                    last_article_title: last.title,
                    last_article_id: last.id
                });
            }, 300);
        })
        .catch( function(error) {
            console.log(error);
        });
    };

    componentDidMount(){
        setTimeout(() => this._fetchLastArticle(), 1000);
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

        const ActionsMenu = (props) => (
            <IconMenu
                {...props}
                iconButtonElement={
                    <IconButton><SearchIcon color='white'/></IconButton>
                }
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
            >
                {this.state.last_article_title && <MenuItem primaryText={this.state.last_article_title} onClick={this.searchArticleById(this.state.last_article_id)}/>} 
                <MenuItem primaryText="搜尋文章ID" onClick={this.openSearchDialog}/>
            </IconMenu>
        );
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
