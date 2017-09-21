import React, { Component } from 'react';
import './StockCard.css';
import { connect } from 'react-redux';
import StockMessage from '../components/StockMessage';
import StockHeader from '../components/StockHeader';
import keywords from '../config/keywords';
import Scroll from 'react-scroll';

// var ScrollLink   = Scroll.Link;
var ScrollElement    = Scroll.Element;

class StockCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            targetArticles: [],
        };
    }

    componentWillMount(){
        // if(keywords[this.props.stock_id]){
        //     const reg = new RegExp("^\\[標的\\].*" + this.props.stock_id + '.*');
            
        //     this.props.app._findArticlePromise(reg, {
        //         pageFrom: this.props.app.lastPage,
        //         inDays: 5
        //     })
        //     .then(response => this.setState({
        //         targetArticles: this.state.targetArticles.concat(response)
        //     }));    
        // }
    }

    render() {
        let className = "StockCard";
        const stock_id = this.props.stock_id
        const messages = this.props.messages || [];
        const keys = keywords[stock_id] ? keywords[stock_id].keys : [];

        // console.log(this.props.app._findArticlePromise);

        return <ScrollElement name={`stock-${stock_id}`}>
            <div className={className}>
                <StockHeader stock_id={stock_id} keys={keys} targetArticles={this.props.targetArticles}/>
                <div className='StockCard-msg-list'>
                    {messages.map((item, index) => (
                        <StockMessage
                            key={index}
                            userid={item.userid}
                            content={item.content}
                            ipdatetime={item.ipdatetime.split(' ')[1]}
                        >
                        </StockMessage>
                    ))}
                </div>
            </div>
        </ScrollElement>
    }
}

const mapStateToProps = state => {
  return { app: state.app }
}
StockCard = connect(mapStateToProps)(StockCard);
export default StockCard;
