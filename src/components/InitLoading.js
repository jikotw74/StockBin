import React, { Component } from 'react';
import './InitLoading.css';
import mottos from '../config/mottos';
import LinearProgress from 'material-ui/LinearProgress';

class InitLoading extends Component {
  // constructor(props) {
  //       super(props);
  //       this.state = {
  //           home: true
  //       };
  //   }

  render() {
    let className = "InitLoading";

    const now = new Date();
    const index = now.getSeconds() % mottos.length;

    return (
        <div className={className}>
            <LinearProgress/>
            <div className='InitLoading-motto'>{mottos[index]}</div>
            <div className='InitLoading-message'>{this.props.message}</div>
        </div>
    );
  }
}

export default InitLoading;
