import React, { Component } from 'react';
import './StockHeader.css';
// var rp = require('request-promise');
// var cheerio = require('cheerio'); // Basically jQuery for node.js

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

    // _fetchStock = () => {
    //     const main = this;
    //     const now = new Date();

    //     var options = {
    //         uri: 'http://mis.twse.com.tw/stock/api/getStockInfo.jsp',
    //         qs: {
    //             // access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
    //             ex_ch: 'tse_6116.tw',
    //             json: '1',
    //             delay: '0',
    //             _: now.getTime()
    //         },
    //         headers: {
    //             'User-Agent': 'Request-Promise'
    //         },
    //         json: true // Automatically parses the JSON string in the response
    //     };

    //     rp(options)
    //         .then(function (response) {
    //             console.log(response);
    //             // Process html like you would with jQuery...
    //         })
    //         .catch(function (err) {
    //             // Crawling failed or Cheerio choked...
    //         });

    //     // fetch(`http://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=50a34e070dd5c09a99554b57ab7ea7e2`)
    //     // fetch(`http://mis.twse.com.tw/stock/api/getStock.jsp?ch=${this.state.stock_id}.tw&json=1&delay=0`)
    //     // .then( function(response) {
    //     //     return response.json()
    //     // })
    //     // .then( function(response) {
    //     //     // console.log(1, response);

    //     //     let data = false;
    //     //     if(response.msgArray){
    //     //         data = response.msgArray[0]
    //     //     }

    //     //     if(data.n){
    //     //         main.setState({
    //     //             stock_ex_id: data.key
    //     //         }, () => {
    //     //             setTimeout( () => {
    //     //                 main._fetchStockInfo();
    //     //             }, 300);
    //     //         });
    //     //     }
    //     // })
    //     // .catch( function(error) {
    //     //     console.log(error);
    //     // });
    // };

    //  _fetchStockInfo = () => {
    //     if(!this.state.stock_ex_id){
    //         return;
    //     }
    //     const main = this;
    //     const now = new Date();

    //     // fetch(`http://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=50a34e070dd5c09a99554b57ab7ea7e2`)
    //     console.log(this.state.stock_ex_id);
    //     fetch(`http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${this.state.stock_ex_id}&json=1&delay=0&_=${now.getTime()}`)
    //     .then( function(response) {
    //         console.log(2, response);
    //         return response.json()
    //     })
    //     .then( function(response) {
    //         // console.log(2, response);

    //         let data = false;
    //         if(response.msgArray){
    //             data = response.msgArray[0]
    //         }
            
    //         if(data && data.n){
    //             main.setState({
    //                 stock_now_price: data.z,
    //                 stock_now_percentage: ((data.z - data.y) / data.y * 100).toFixed(2)
    //             });
    //         }
    //     })
    //     .catch( function(error) {
    //         console.log(error);
    //     });
    // };

    // componentDidMount(){
    //     // setTimeout(() => this._fetchStock(), 500);
    // }

    render() {
        let className = "StockHeader";
        if(this.props.selected)className += " selected";
        const percentage = this.props.percentage || 0;
        const comments = this.props.comments;

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
            </div>
        );
    }
}

export default StockHeader;
