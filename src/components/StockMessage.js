import React, { Component } from 'react';
import './StockMessage.css';
import TextField from './TextField';

class StockMessage extends Component {
  // constructor(props) {
  //       super(props);
  //       this.state = {
  //           home: true
  //       };
  //   }

  render() {
    let className = "StockMessage";

    const hasIdTags = this.props.idTags instanceof Array && this.props.idTags.length > 0;
    const hasKeyTags = this.props.keyTags instanceof Array && this.props.keyTags.length > 0;
    const hasTags = hasIdTags || hasKeyTags;

    if(hasTags){
        className += ' has-tags';
    }

    return (
        <div className={className}>
            {this.props.userid && <div className='StockMessage-userid'>{this.props.userid}</div>}
            {this.props.content && <TextField className='StockMessage-content' text={this.props.content}/>}
            {this.props.ipdatetime && <div className='StockMessage-date'>{this.props.ipdatetime}</div>}
            {hasTags && <div className='StockMessage-tags'>
                {hasIdTags && <div className='StockMessage-idTags'>
                    {this.props.idTags.map((tag, index) => <div key={index} className='StockMessage-idTag'>{tag}</div>)}
                </div>}
                {hasKeyTags && <div className='StockMessage-keyTags'>
                    {this.props.keyTags.map((tag, index) => <div key={index} className='StockMessage-keyTag'>{tag}</div>)}
                </div>}
            </div>}
        </div>
    );
  }
}

export default StockMessage;
