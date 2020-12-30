import React from 'react';
import './InputLine.css';

type MyProps = {
    prompt: string,
    initialInput: string,
    onReturn: (command: string) => void,
    updateHistory: (increment: number, newInput: string) => void,
};
type MyState = {
    currentInput: string,
    cursorIndex: number,
};
class InputLine extends React.Component<MyProps, MyState> {
    inputLine: React.RefObject<HTMLDivElement>;

    constructor(props: MyProps) {
        super(props);
        this.state = {
            currentInput: this.props.initialInput,
            cursorIndex: this.props.initialInput.length,
        };
        this.inputLine = React.createRef();

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    addAtIndex(original: string, index: number, toAdd: string): string {
        return original.substring(0, index) + toAdd + original.substring(index);
    }

    removeAtIndex(original: string, index: number): string {
        return original.substring(0, index) + original.substring(index + 1);
    }

    // Detects all normal input
    handleKeyPress(e: KeyboardEvent): void {
        e.preventDefault();
        const key: number = e.charCode || e.keyCode || e.which;
        const keyStr: string = String.fromCharCode(key);

        const newInput: string = this.addAtIndex(this.state.currentInput, this.state.cursorIndex, keyStr);
        const newCursor: number = this.state.cursorIndex + 1;

        this.setState({
            currentInput: newInput,
            cursorIndex: newCursor,
        });
    }

    // Needed to detect special input like tab, ctrl, etc.
    handleKeyDown(e: KeyboardEvent): void {
        const key: number = e.charCode || e.keyCode || e.which;
        const keyStr: string = String.fromCharCode(key);
        var newInput: string;
        var newCursor: number;

        if (key === 13) { // Return key
            e.preventDefault();
            newInput = '';
            newCursor = 0;
            this.props.onReturn(this.state.currentInput);
        } else if (key === 9) { // Tab key
            e.preventDefault(); // TODO
            // Do something... bool var 
            return;
        } else if (key === 32) { // Spacebar key
            e.preventDefault();
            newInput = this.addAtIndex(this.state.currentInput, this.state.cursorIndex, '\u00A0');
            newCursor = this.state.cursorIndex + 1;
        } else if (key === 8) { // Backspace key
            e.preventDefault();    
            newInput = this.removeAtIndex(this.state.currentInput, this.state.cursorIndex - 1);
            newCursor = Math.max(0, this.state.cursorIndex - 1);
        } else if (key === 46) { // Delete key
            e.preventDefault();
            newInput = this.removeAtIndex(this.state.currentInput, this.state.cursorIndex);
            newCursor = this.state.cursorIndex;
        } else if (e.ctrlKey && key >= 65 && key <= 90) { // Any Ctrl + key
            e.preventDefault(); 
            newInput = this.addAtIndex(this.state.currentInput, this.state.cursorIndex, '^' + keyStr);
            newCursor = this.state.cursorIndex + 2;
        } else if (key === 37) { // Left Arrow key
            e.preventDefault(); 
            newInput = this.state.currentInput;
            newCursor = Math.max(0, this.state.cursorIndex - 1);
        } else if (key === 39) { // Right Arrow key
            e.preventDefault(); 
            newInput = this.state.currentInput;
            newCursor = Math.min(this.state.currentInput.length, this.state.cursorIndex + 1);
        } else if (key === 38) { // Up Arrow key
            e.preventDefault(); 
            this.props.updateHistory(-1, this.state.currentInput);
            return; 
        } else if (key === 40) { // Down Arrow key
            e.preventDefault(); 
            this.props.updateHistory(1, this.state.currentInput);
            return; 
        } else {
            return; // Give control over to handleKeyPress()
        }
        
        this.setState({
            currentInput: newInput,
            cursorIndex: newCursor,
        });
    }

    scrollToBottom() {
        if (this.inputLine.current) {
            this.inputLine.current.scrollIntoView();
        }
    }

    componentDidMount() {
        document.addEventListener('keypress', this.handleKeyPress, false);
        document.addEventListener('keydown', this.handleKeyDown, false);
        this.scrollToBottom();
    }

    componentWillReceiveProps(newProps: MyProps) {
        this.setState({
            currentInput: newProps.initialInput,
            cursorIndex: newProps.initialInput.length,
        });
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.handleKeyPress, false);
        document.removeEventListener('keydown', this.handleKeyDown, false);
    }
    
    render() {
        const currentInputElems: Array<JSX.Element> = this.state.currentInput.split('').concat('').map((char: string, index: number) => {
            return (
                <span
                    key={index}
                    className={'input-char' + (index === this.state.cursorIndex ? ' cursor' : '')}
                >
                    {char}
                </span>
            );
        });

        return (
            <div className="input-line" ref={this.inputLine}>
                <span className="prompt">{this.props.prompt}</span>
                <span className="input-text">{currentInputElems}</span>
            </div>
        );
    }
}

export default InputLine;
