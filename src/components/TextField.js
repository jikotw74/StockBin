import React, { Component } from 'react';
import './TextField.css';

class TextField extends Component {
  // constructor(props) {
  //       super(props);
  //       this.state = {
  //           home: true
  //       };
  //   }

  render() {
    let className = "TextField";
    if(this.props.className){
        className += ' ' + this.props.className;
    }
    const content = [].concat(this.props.text).map((item, index) => <div className="TextField-p" key={index}>{item}</div>);

    return (
        <div className={className}>
            {content}
        </div>
    );
  }
}

export default TextField;
