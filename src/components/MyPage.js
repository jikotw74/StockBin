import React, { Component } from 'react';
import './MyPage.css';
import { connect } from 'react-redux'
// import { Route } from 'react-router'
// import { } from './actions'

class MyPage extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         home: true,
    //         selected: false,
    //     };
    // }

    render() {
        let className = 'MyPage';
        if(this.props.className){
            className += ' ' + this.props.className;
        }
        return (
            <div className={className} style={this.props.style}>
                {this.props.children}
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
MyPage = connect()(MyPage);
export default MyPage;
