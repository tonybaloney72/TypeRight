import React, { Component } from 'react'
import TypingContainer from "../typing/typing_container"

export default class Test extends Component {
    constructor(props) {
        super(props)
        this.state = {loaded: false};
    }
    componentDidMount(){
        const testId = this.props.match.params.testId;
        if(this.props.tests && this.props.tests[testId]){
            this.props.selectTest(testId)
                .then(() => {this.setState({loaded: true})})
        } else {
            this.props.fetchTest(testId)
                .then(() => {this.setState({loaded: true})})
        }
    }
    render() {
        return (
            <div>
                {this.state.loaded && <TypingContainer/>}
                <section className="bottom-section">
                    <div>Leadboard placeholder</div>
                    <div>Stats placeholder</div>
                </section>
            </div>
        )
    }
}