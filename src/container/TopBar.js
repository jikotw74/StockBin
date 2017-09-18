import React, { Component } from 'react';
import './TopBar.css';
import { connect } from 'react-redux'
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import SearchIcon from 'material-ui/svg-icons/action/search';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
// import htmlToJson from 'html-to-json';

class TopBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openSearchDialog: false,
            searchArticleValue: "",
            optionArticles: []
        };
    }

    _fetchLastArticle = () => {
        const _findArticlePromise = this.props.app._findArticlePromise;

        if(this.props.app.lastPage){
            this.setState({
                optionArticles: []
            }, () => {
                _findArticlePromise(/盤中閒聊/, {
                    pageFrom: this.props.app.lastPage,
                    inDays: 2,
                })
                .then(results => {
                    this.setState({
                        optionArticles: this.state.optionArticles.concat(results)
                    });
                    return _findArticlePromise(/盤後閒聊/, {
                        pageFrom: this.props.app.lastPage,
                        inDays: 2,
                    })
                    .then(results => {
                        this.setState({
                            optionArticles: this.state.optionArticles.concat(results)
                        });
                    })
                })
                .catch( function(error) {
                    console.log(error);
                });
            });
            
        }
    };

    componentWillMount(){
        this._fetchLastArticle();
    }

    articleChange = event => {
        this.props.history.push("/" + event.target.value);
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

const mapStateToProps = state => {
  return { app: state.app }
}
TopBar = connect(mapStateToProps)(TopBar);
export default TopBar;
