import React, { Component } from 'react';
import './StockCard.css';
import { connect } from 'react-redux';
import StockMessage from '../components/StockMessage';
import StockHeader from '../components/StockHeader';
import Scroll from 'react-scroll';

var ScrollLink   = Scroll.Link;
var ScrollElement    = Scroll.Element;

class StockCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            targetArticles: [],
        };
    }

    render() {
        let className = "StockCard";
        const stock_id = this.props.stock_id
        const messages = this.props.messages || [];
        const keys = this.props.app.DB[stock_id] ? this.props.app.DB[stock_id].keys : [];
        const info = this.props.stockInfo[stock_id] ? this.props.stockInfo[stock_id] : false;

        return <ScrollElement name={`stock-${stock_id}`}>
            <div className={className}>
                <StockHeader stock_id={stock_id} keys={keys} targetArticles={this.props.targetArticles} info={info}/>
                <div className='StockCard-msg-list'>
                    {messages.map((item, index) => (
                        <ScrollLink 
                            key={'stock-msg-'+index} 
                            activeClass="active" 
                            // className='rank-scroll-link'
                            to={`msg-${item.message_id}`} 
                            // spy={true} 
                            smooth={true} 
                            offset={0}
                            duration={500} 
                            containerId='msgContainer'>
                                <StockMessage
                                    key={index}
                                    index={item.message_id}
                                    userid={item.userid}
                                    content={item.content}
                                    ipdatetime={item.ipdatetime.split(' ')[1]}
                                >
                                </StockMessage>
                        </ScrollLink>
                    ))}
                </div>
            </div>
        </ScrollElement>
    }
}

const mapStateToProps = state => {
    return { 
        app: state.app,
        stockInfo: state.stockInfo,
    }
}
StockCard = connect(mapStateToProps)(StockCard);
export default StockCard;
