import React, { Component } from 'react'
import TestItem from './test_item'
import './library.scss'

export default class Library extends Component {
    constructor(props){
        super(props)
    }
    componentDidMount(){
        this.props.fetchTests(this.props.currentUser);
    }
    // componentDidUpdate(){
    //     this.props.fetchLatestTests();

    // }
    render() {
        if (!this.props.tests || Object.values(this.props.tests).filter(ele => (ele.uploader === this.props.currentUser)).length === 0) return null;

        return (
            <div className="library-container">
                <h3>{this.props.header}</h3>
                <div className="page-card library">
                    {(this.props.tests ? 
                        this.props.header === "Explore Our Latest Test Submissions" ? 
                            this.props.tests : 
                            Object.values(this.props.tests).filter(ele => (ele.uploader === this.props.currentUser)).map(test => test._id) 
                        : []
                    ).map( (test, idx) => (
                        <TestItem key={idx} test={test} editable={this.props.editable}/>
                    ))}
                    <div className="filling-empty-space-childs"></div>
                    <div className="filling-empty-space-childs"></div>
                    <div className="filling-empty-space-childs"></div>
                </div>
            </div>
        )
    }
}
