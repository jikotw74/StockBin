import React, { Component } from 'react';
import './StockHeader.css';
import Badge from 'material-ui/Badge';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import AnnouncementIcon from 'material-ui/svg-icons/action/announcement';

const TargetArticles = (props) => {
    const openArticle = href => event => {
        window.open("http://www.ptt.cc" + href, "_blank");
    }

    const menuItems = props.articles.map((item, index) => {
        return <MenuItem key={index} primaryText={item.date + " " + item.title} onClick={openArticle(item.href)}/>
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
                    <IconButton tooltip="標的文"><AnnouncementIcon/></IconButton>
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
    constructor(props) {
        super(props);
        this.state = {
            stock_id: props.stock_id,
            stock_ex_id: false,
            stock_now_price: false,
            stock_now_percentage: false,
        };
    }

    render() {
        let className = "StockHeader";
        if(this.props.selected)className += " selected";
        const percentage = this.props.percentage || 0;
        const comments = this.props.comments;
        const targetArticles = this.props.targetArticles || [];

        const rankStyle = {
            width: percentage + '%'
        };

        return (
            <div className={className} onClick={this.props.click}>
                <div className='StockHeader-header'>
                    <div className='StockHeader-name'>{"#"+this.props.stock_id}</div>
                    {
                        comments && (<div className='StockHeader-rank'>
                            <div className='StockHeader-rank-percentage' style={rankStyle}/>
                            <div className='StockHeader-rank-comments'>{comments + "則"}</div>
                        </div>)
                    }
                    {
                        this.state.stock_now_price && (<div className='StockHeader-price'>
                            <div className='StockHeader-price-price'>{this.state.stock_now_price}</div>
                            <div className='StockHeader-price-percentage'>{this.state.stock_now_percentage}</div>
                        </div>)
                    }
                </div>
                <div className='StockHeader-keys'>
                    {this.props.keys && this.props.keys.map( (name, index) => <div key={index} className='StockHeader-key'>{name}</div>)}
                </div>
                {targetArticles.length > 0 && <TargetArticles articles={targetArticles}/>}  
            </div>
        );
    }
}

export default StockHeader;
