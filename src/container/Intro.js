import React, { Component } from 'react';
import { connect } from 'react-redux'
import { updateAppIntro } from '../actions'
import { Link } from 'react-router-dom'

// const data = window.data.index;
class Intro extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         home: true,
    //         selected: false,
    //     };
    // }

    closeIntro = (event) => {
        this.props.dispatch(updateAppIntro(0));
    }

    render() {
        let className = 'Intro';
        let children = [];

        switch (this.props.app.intro) {
            case 1:
                children = <div className='Intro-child Intro-child-1'/>        
                break;
            case 2:
                children = <div className='Intro-child Intro-child-2'/>        
                break;
            case 3:
                children = <div className='Intro-child Intro-child-3'/>        
                break;
            case 4:
                children = <div className='Intro-child Intro-child-4'/>        
                break;
            case 5:
                children = (
                    <div className='Intro-child Intro-child-5'>
                        <Link className='appLink toTime' to="/order/time" />
                    </div>
                );
                break;
            case 6:
                children = (
                    <div className='Intro-child Intro-child-6'>
                        <Link className='appLink toTrainConfirm' to="/order/trainconfirm" />
                    </div>
                );
                break;
            case 8:
                children = (
                    <div className='Intro-child Intro-child-8'>
                        <div className='appLink open-intro-9' onClick={event => {
                            event.stopPropagation();
                            this.props.dispatch(updateAppIntro(9));
                        }}/>
                    </div>
                );
                break;
            case 9:
                children = (
                    <div className='Intro-child Intro-child-9'>
                        <Link className='appLink new-ticket' to="/order/newticket" />
                    </div>
                );
                break;
            default:
                className = 'Intro is-hidden';
        }

        return (
            <div className={className} onClick={this.closeIntro}>
                {children}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    app: state.app,
});
Intro = connect(mapStateToProps)(Intro);
export default Intro;
