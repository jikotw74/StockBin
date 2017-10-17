import React, { Component } from 'react';
import './StockHeader.css';
import Badge from 'material-ui/Badge';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import AnnouncementIcon from 'material-ui/svg-icons/action/announcement';
import ChatIcon from 'material-ui/svg-icons/communication/chat-bubble-outline';

const StockInfo = (props) => {
    const nowPrice = props.nowPrice || 0;
    const lastPrice = props.lastPrice || 0;
    const diffPrice = Number(nowPrice - lastPrice).toFixed(2);
    let flag = 'is-flat';
    if(diffPrice > 0){
        flag = 'is-up';
    }else if(diffPrice < 0){
        flag = 'is-down';
    }

    const diffPercentage = Number(diffPrice / lastPrice * 100).toFixed(2);
    const priceStr = nowPrice === 0 ? '' : nowPrice;
    const diffStr = nowPrice === 0 ? '' : `${diffPrice} (${diffPercentage}%)`;
    return <div className={'StockHeader-price ' + flag}>
        <div className='StockHeader-price-price'>{priceStr}</div>
        <div className='StockHeader-price-diff'>{diffStr}</div>
    </div>
}

const TargetArticles = (props) => {
    const openArticle = href => event => {
        window.open("http://www.ptt.cc" + href, "_blank");
    }

    const menuItems = props.articles.map((item, index) => {
        return <MenuItem key={index} primaryText={item.article.date + " " + item.article.title} onClick={openArticle(item.article.href)}/>
    });

    return ( 
        <div className="TargetArticles">
            <Badge
                badgeContent={props.articles.length}
                secondary={true}
                badgeStyle={{top: 18, right: 18}}
            >
            <IconMenu
                iconButtonElement={
                    <IconButton tooltip="三日內文章"><AnnouncementIcon/></IconButton>
                }
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
                {menuItems} 
            </IconMenu>
            </Badge>
        </div>
    )
};

class StockHeader extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         stock_id: props.stock_id,
    //         stock_ex_id: false,
    //         stock_now_price: false,
    //         stock_now_percentage: false,
    //     };
    // }

    render() {
        let className = "StockHeader";
        if(this.props.selected)className += " selected";
        const percentage = this.props.percentage || 0;
        const comments = this.props.comments;
        const targetArticles = this.props.targetArticles || [];

        // const rankStyle = {
        //     width: percentage + '%'
        // };

        return (
            <div className={className} onClick={this.props.click}>
                <div className='StockHeader-header'>
                    <div className='StockHeader-name'>
                        <div className='StockHeader-name-name'>{this.props.name}</div>
                        <div className='StockHeader-name-id'>{`#${this.props.stock_id}`}</div>
                    </div>
                    {
                        this.props.info && <StockInfo {...this.props.info}/>
                    }
                    {
                        comments && (<div className='StockHeader-rank'>
                            <div className='StockHeader-rank-percentage'><ChatIcon/></div>
                            <div className='StockHeader-rank-comments'>{comments + "則"}</div>
                        </div>)
                    }
                </div>
                {
                    this.props.keys && <div className='StockHeader-keys'>
                        {this.props.keys.map( (name, index) => <div key={index} className='StockHeader-key'>{name}</div>)}
                    </div>
                }
                {targetArticles.length > 0 && <TargetArticles articles={targetArticles}/>}
            </div>
        );
    }
}

export default StockHeader;
