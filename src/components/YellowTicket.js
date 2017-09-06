import React, { Component } from 'react';
import './YellowTicket.css';
import { connect } from 'react-redux'
// import { Route } from 'react-router'
// import { } from './actions'

class YellowTicket extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         home: true,
    //         selected: false,
    //     };
    // }

    render() {
        let className = 'YellowTicket';
        if(this.props.className){
            className += ' ' + this.props.className;
        }
        return (
            <div className={className}>
                <div className="YellowTicket-row">
                    <div className="YellowTicket-date">{window.yyyymmdd(this.props.date, '/')}</div>
                    <div className="YellowTicket-train-no">{"車次 " + this.props.train}</div>
                </div>
                <div className="YellowTicket-row">
                    <div className="YellowTicket-station-wrapper">
                        <div className="YellowTicket-station-start">{this.props.start}</div>
                        <div className="YellowTicket-station-start-time">{this.props.startTime}</div>
                    </div>
                    <div className="YellowTicket-station-wrapper">
                        <div className="YellowTicket-station-end">{this.props.end}</div>
                        <div className="YellowTicket-station-end-time">{this.props.endTime}</div>
                    </div>
                </div>
            </div>
        );
    }
}

// const mapStateToProps = (state) => ({
//     app: state.app,
//     body: state.body,
//     dialog: state.dialog
// });
// App = connect(mapStateToProps)(App);
YellowTicket = connect()(YellowTicket);
export default YellowTicket;
