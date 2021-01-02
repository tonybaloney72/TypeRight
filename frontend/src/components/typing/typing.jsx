import React, {Component} from 'react';

export default class typing extends Component {
    constructor(props){
        super(props);

        this.state = {
            wordObjs: null,
            letterIdx: 0,
            wordIdx: 0,
            startedAt: null,
        }

        this.skipCodes = [16, 17, 18, 20, 9, 27, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 44, 46, 33, 34, 35, 36, 37, 38, 39, 40, 224];
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount(){
        this.props.fetchRandomTest()
            .then(() => this.setState({
                wordObjs: this.props.test.content.split(' ').map(word => ({
                    complete: false,
                    letterObjs: word.split('').map(letter => ({
                        letter
                    }))
                }))
            }));
    }

    keySpace(e) {
        e.preventDefault();
        if (this.state.letterIdx !== 0) {
            const newWords = this.state.wordObjs.splice(0);
            newWords[this.state.wordIdx].complete = true;
            const newWordIdx = this.state.wordIdx + 1;

            this.setState({
                wordObjs: newWords,
                letterIdx: 0,
                wordIdx: newWordIdx,
            })

            if (newWordIdx === newWords.length) {
                this.finishTest(newWords);
            }
        }
    }

    keyBackspace(e) {
        e.preventDefault();
        
        if (this.state.letterIdx === 0) {
            
            if (this.state.wordIdx !== 0) {
                const newWords = this.state.wordObjs.splice(0);
                const newWordIdx = this.state.wordIdx - 1;
                let newLetterIdx = newWords[newWordIdx].letterObjs.findIndex(letterObj => !letterObj.complete);
                if (newLetterIdx === -1) newLetterIdx = newWords[newWordIdx].letterObjs.length;
                newWords[newWordIdx].complete = false;
                
                this.setState({
                    wordObjs: newWords,
                    wordIdx: newWordIdx,
                    letterIdx: newLetterIdx,
                })
            }
        } else {
            const newWords = this.state.wordObjs.splice(0);
            const newLetterIdx = this.state.letterIdx - 1;
            if (newWords[this.state.wordIdx].letterObjs[newLetterIdx].extra) {
                newWords[this.state.wordIdx].letterObjs.pop();
                
                this.setState({
                    wordObjs: newWords,
                    letterIdx: newLetterIdx
                })
            } else {
                Object.assign(newWords[this.state.wordIdx].letterObjs[newLetterIdx], {
                    complete: false,
                    correct: null,
                    error: false
                })
                
                this.setState({
                    wordObjs: newWords,
                    letterIdx: newLetterIdx
                })
            }
        }
    }

    keyLetter(e) {
        if (!this.state.startedAt) {
            this.setState({
                startedAt: Date.now()
            })
        }
        if (this.state.letterIdx >= this.state.wordObjs[this.state.wordIdx].letterObjs.length) {
            this.extraLetter(e);
        } else if (e.key === this.state.wordObjs[this.state.wordIdx].letterObjs[this.state.letterIdx].letter) {
            this.correctLetter(e);
        } else if (e.key !== this.state.wordObjs[this.state.wordIdx].letterObjs[this.state.letterIdx].letter) {
            this.incorrectLetter(e);
        }
    }

    extraLetter(e) {
        e.preventDefault();
        const newWords = this.state.wordObjs.splice(0);
        newWords[this.state.wordIdx].letterObjs.push({
            letter: e.key,
            complete: true,
            correct: false,
            extra: true,
        })
        this.setState({
            letterIdx: this.state.letterIdx + 1,
            wordObjs: newWords,
        })
    }

    correctLetter(e) {
        e.preventDefault();
        const newWords = this.state.wordObjs.splice(0);
        const newLetterIdx = this.state.letterIdx + 1
        Object.assign(newWords[this.state.wordIdx].letterObjs[this.state.letterIdx],
            {
                complete: true,
                correct: true
            });

        this.setState({
            letterIdx: newLetterIdx,
            wordObjs: newWords,
        })

        if (this.state.wordIdx === newWords.length - 1 && 
            newWords[this.state.wordIdx].letterObjs.length === newLetterIdx &&
            newWords[this.state.wordIdx].letterObjs.every(letterObj => letterObj.correct)
        ) {
            this.finishTest(newWords);
        }
    }

    incorrectLetter(e) {
        e.preventDefault();
        const newWords = this.state.wordObjs.splice(0);
        Object.assign(newWords[this.state.wordIdx].letterObjs[this.state.letterIdx],
            {
                complete: true,
                correct: false
            });

        this.setState({
            letterIdx: this.state.letterIdx + 1,
            wordObjs: newWords,
        })
    }

    handleKeyPress(e){
        if (e.ctrlKey || e.metaKey || e.altKey || this.skipCodes.includes(e.keyCode)) {

        } else if ( e.keyCode === 32 ) {
            this.keySpace(e);
        } else if ( e.keyCode === 8 ) {
            this.keyBackspace(e);
        } else {
            this.keyLetter(e);
        }
    }
    
    letterClass (letterObj) {
        if (letterObj.complete) {
            if (letterObj.extra) {
                return 'letter incorrect extra';
            } else if (letterObj.correct) {
                return 'letter correct';
            } else {
                return 'letter incorrect';
            }
        } else {
            return 'letter';
        }
    }

    finishTest (wordObjs) {
        const totalChars = wordObjs.reduce((acc, wordObj) => 
            acc + wordObj.letterObjs.length,
            0
        ) + wordObjs.length -1;
        
        const time = Date.now() - this.state.startedAt;
        const rawWpm = totalChars / (time / 1000 / 60) / 5;

        const incompleteWords = wordObjs.filter(wordObj =>
            !wordObj.letterObjs[wordObj.letterObjs.length-1].complete
        ).length;

        const incorrectLetters = wordObjs.reduce((acc, wordObj) => 
            acc + wordObj.letterObjs.filter(letterObj =>
                letterObj.complete && !letterObj.correct
            ).length,
            0
        );

        const typos = incompleteWords + incorrectLetters;
        const accuracy = (totalChars - typos) / totalChars;
        const adjustedWpm = rawWpm * accuracy;
        
        this.props.createAttempt({
            time: time,
            wpm: adjustedWpm,
            typos: typos,
            test: this.props.test._id,
            accuracy: accuracy
        });
    }

    render() {
        if(!this.state.wordObjs) return null;

        return (
            <div className="type-container page-card" onKeyDown={this.handleKeyPress} tabindex="-1" >
                {this.state.wordObjs.map( (wordObj, idx) => 
                    <span
                        className={!wordObj.complete || wordObj.letterObjs.every(letterObj => letterObj.correct) ? 'word' : 'word error'}
                        key={idx}
                    >
                        {wordObj.letterObjs.map((letterObj, idx) => (
                            <span
                                key={idx}
                                className={this.letterClass(letterObj)}
                            >
                                {letterObj.letter}
                            </span>
                        ))}
                    </span>
                )}
            </div>
        )
    }
}