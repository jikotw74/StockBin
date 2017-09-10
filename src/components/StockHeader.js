import React, { Component } from 'react';
import './StockHeader.css';

class StockHeader extends Component {
  // constructor(props) {
  //       super(props);
  //       this.state = {
  //           home: true
  //       };
  //   }

  render() {
    let className = "StockHeader";
    if(this.props.selected)className += " selected";
    const stock = this.props.stock;
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
            </div>
            <div className='StockHeader-keys'>
                {this.props.keys && this.props.keys.map( (name, index) => <div key={index} className='StockHeader-key'>{name}</div>)}
            </div>  
        </div>
    );
  }
}

export default StockHeader;
