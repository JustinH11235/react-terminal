import React from 'react';
import InputLine from './InputLine';

import FSObject from './classes/FSObject';
import RootDirectory from './classes/RootDirectory';
import Directory from './classes/Directory';
import File from './classes/File';

import './Terminal.css';

type MyProps = {}
type MyState = {
    outputText: Array<Array<string>>,
    commandHistory: Array<string>,
    historyIndex: number,
    user: string,
    fileSystem: RootDirectory,
    currentDirectory: Directory,
    needsHelp: boolean,
};
class Terminal extends React.Component<MyProps, MyState> {
    constructor(props: MyProps) {
        super(props);
        const rootDir = RootDirectory.createRootDir({
            name: '', children: [{
                name: 'home', children: [{
                    name: 'justin', children: [{
                        name: 'Desktop', children: [{
                            name: 'GT_Scheduler', url: 'https://github.com/JustinH11235/GT-Scheduling-App#readme'
                        }, {
                            name: 'HPictionary', url: 'http://hpictionary.herokuapp.com/'
                        }, {
                            name: 'MGH_Stocks', url: 'https://mgh-stocks.herokuapp.com/'
                        }, {
                            name: 'QLearning_Snake', url: 'https://q-learning-snake.herokuapp.com/'
                        }, {
                            name: 'Multiplayer_Snake', url: 'https://test-multiplayer-snake.herokuapp.com/'
                        }]
                    }]
                }]
            }, {
                name: 'etc', children: []
            }, {
                name: 'bin', children: []
            }]
        });
        const initialUser = 'justin';
        this.state = {
            outputText: [],
            commandHistory: [''],
            historyIndex: 0,
            user: initialUser,
            fileSystem: rootDir,
            currentDirectory: rootDir.getHome(initialUser) as Directory,
            needsHelp: false,
        };
        this.processCommand = this.processCommand.bind(this);
        this.updateHistory = this.updateHistory.bind(this);
        this.autocomplete = this.autocomplete.bind(this);
    }

    getHomeDir(): Directory {
        return this.state.fileSystem.getHome(this.state.user); 
    }

    getFullPath(): string {
        var curPath = this.state.currentDirectory.path;
        if (curPath.length === 1) {
            curPath = ['/'];
        }
        return curPath.join('/');
    }
    
    getPath(): string {
        var curPath = this.state.currentDirectory.path;
        if (curPath.length === 1) {
            curPath = ['/'];
        } else if (curPath[0] === '' && curPath[1] === 'home' && curPath[2] === this.state.user) {
            curPath.splice(0, 3, '~');
        }
        return curPath.join('/');
    }

    getPrompt(): string {
        return `${this.state.user}@mygaminghut:${this.getPath()}$ `;
    }

    findDirByDirtyPathArr(dirPath: Array<string>): Directory | null {
        var startDir;
        if (dirPath[0] === '') {
            // Start from root
            startDir = this.state.fileSystem;
        } else if (dirPath[0] === '~') {
            // Start from home
            startDir = this.state.fileSystem;
            dirPath.splice(0, 1, 'home', this.state.user);
        } else {
            startDir = this.state.currentDirectory;
        } 

        return startDir.findDirByPath(dirPath);
    }

    findDirByDirtyPath(path: string): Directory | null {
        return this.findDirByDirtyPathArr(path.split(/\/+/));
    }

    findFileByDirtyPathArr(filePath: Array<string>): File | null {
        var startDir;
        if (filePath[0] === '') {
            // Start from root
            startDir = this.state.fileSystem;
        } else if (filePath[0] === '~') {
            // Start from home
            startDir = this.state.fileSystem;
            filePath.splice(0, 1, 'home', this.state.user);
        } else {
            startDir = this.state.currentDirectory;
        } 

        return startDir.findFileByPath(filePath);
    }

    findFileByDirtyPath(path: string): File | null {
        return this.findFileByDirtyPathArr(path.split(/\/+/));
    }

    printChildren(outputText: Array<Array<string>>, children: Array<FSObject>) {
        children.forEach(child => {
            outputText.push([child.toString(), (child instanceof Directory ? ' directory' : ' file')]);
        }); 
    }

    commandLs(outputText: Array<Array<string>>): void {
        const children = this.state.currentDirectory.children;
        this.printChildren(outputText, children);
    }

    processCommand(commandStr: string, doNothing: boolean = false) {
        var newOutputText: Array<Array<string>> = this.state.outputText.concat([[this.getPrompt() + commandStr, ' input-text']]);
        const [command, ...args] = commandStr.trim().split(/\s+/);
        var newCurrentDirectory = this.state.currentDirectory;

        if (!doNothing) {
            switch (command) {
                case 'exit':
                    break; // Not sure what this would do
                case '':
                    break;
                case 'clear':
                    newOutputText = [];     
                    break;
                case 'help':
                    newOutputText.push(
                        ['React Terminal, version 1.0.0 (browser)', ''],
                        ['\u00a0', ''],
                        ['help            display the list of all commands', ''],
                        ['clear           clear the terminal', ''],
                        ['ls              list contents of current directory', ''],
                        ['cd              change current directory', ''],
                        ['pwd             print working directory', ''],
                        ['mkdir [...DIRS] create a new directory', ''],
                    
                    ); 
                    break;
                case 'pwd':
                    newOutputText.push([this.getFullPath(), '']);
                    break;
                case 'ls':
                    this.commandLs(newOutputText);
                    break;
                case 'cd':
                    if (args.length === 0) {
                        newCurrentDirectory = this.getHomeDir();
                        break;
                    } else if (args.length > 1) {
                        newOutputText.push([`${command}: too many arguments`, '']);
                        break;
                    } 

                    const foundDir = this.findDirByDirtyPath(args[0]);
                    if (foundDir === null) {
                        newOutputText.push([`${command}: ${args[0]}: No such file or directory`, '']);
                        break;
                    }

                    newCurrentDirectory = foundDir;

                    break;
                case 'mkdir':
                    for (const dirName of args) {
                        var dirPath = dirName.split(/\/+/);
                        if (dirPath[dirPath.length - 1] === '') {
                            dirPath.splice(-1, 1);
                        }

                        const parentDirPath = dirPath.slice(0, -1);
                        const newDirName = dirPath[dirPath.length - 1];

                        const parentDir = this.findDirByDirtyPathArr(parentDirPath);
                        if (parentDir === null) {
                            newOutputText.push([`${command}: cannot create directory '${dirName}': No such file or directory`, '']);
                            continue;
                        }
                        const res = parentDir!.addDirByName(newDirName);
                        if (res === null) {
                            newOutputText.push([`${command}: cannot create directory '${dirName}': File exists`, '']);
                            continue;
                        }    
                    }
                    break;
                case 'open':
                    const foundFile = this.findFileByDirtyPath(args[0]);
                    if (foundFile === null) {
                        newOutputText.push([`${command}: ${args[0]}: No such file or directory`, '']);
                        break;
                    }
                    foundFile.open();
                    break;
                default:
                    newOutputText.push([`${command}: command not found`, '']);
                    break;
            } 
        }

        const newCommandHistory = this.state.commandHistory.slice();
        newCommandHistory.splice(-1, 0, commandStr);

        this.setState({
            outputText: newOutputText,
            commandHistory: newCommandHistory, 
            historyIndex: newCommandHistory.length - 1,
            currentDirectory: newCurrentDirectory,
        }); 
    }

    updateHistory(inc: number, newInput: string): void {
        const newHistoryIndex = this.state.historyIndex + inc;
        if (newHistoryIndex >= this.state.commandHistory.length || newHistoryIndex < 0) {
            return;
        }

        const newCommandHistory = this.state.commandHistory.slice();
        newCommandHistory[this.state.historyIndex] = newInput;

        this.setState({
            commandHistory: newCommandHistory,
            historyIndex: newHistoryIndex,
        });
    }

    autocomplete(commandStr: string): void {
        const [command, ...args] = commandStr.trim().split(/\s+/);

        if (true) {
            const dirName = args[0] || '';
            var dirPath = dirName.split(/\/+/);

            const parentDirPath = dirPath.slice(0, -1);
            const currentName = dirPath[dirPath.length - 1];

            const parentDir = this.findDirByDirtyPathArr(parentDirPath);
            if (parentDir === null) return;

            const possibleMatches = parentDir.children.filter(child => child.name.startsWith(currentName));
            if (possibleMatches.length === 0) return;

            var ind = currentName.length;
            if (!possibleMatches.every(match => ind < match.name.length && match.name.charAt(ind) === possibleMatches[0].name.charAt(ind))) {
                const newCommandHistory = this.state.commandHistory.slice();
                newCommandHistory[this.state.historyIndex] = commandStr;
                if (this.state.needsHelp) {
                    const newOutputText = this.state.outputText.concat([[this.getPrompt() + commandStr, ' input-text']]);
                    this.printChildren(newOutputText, possibleMatches);

                    this.setState({
                        commandHistory: newCommandHistory,
                        outputText: newOutputText,
                    });
                } else {
                    this.setState({
                        commandHistory: newCommandHistory,
                        needsHelp: true,
                    });
                }
                return;
            }

            while (possibleMatches.every(match => ind < match.name.length && match.name.charAt(ind) === possibleMatches[0].name.charAt(ind))) {
                ind++;
            }
            const endOfName = possibleMatches[0].name.substring(currentName.length, ind);
            const newCommandHistory = this.state.commandHistory.slice();
            newCommandHistory[this.state.historyIndex] = `${commandStr}${endOfName}`;

            this.setState({
                commandHistory: newCommandHistory,
                needsHelp: false,
            });
        }
         
    }

    render() {
        const outputTextElems: Array<JSX.Element> = this.state.outputText.map(([text, classes]: Array<string>, index: number) => {
            return <div key={index} className={"output-line" + classes}>{text}</div>;
        });
        
        return (
            <div className="Terminal">
                <div className="lines-container">
                    <div className="output-lines">
                        {outputTextElems}
                    </div>
                    <InputLine
                        prompt={this.getPrompt()}
                        initialInput={this.state.commandHistory[this.state.historyIndex]}
                        onReturn={this.processCommand}
                        updateHistory={this.updateHistory}
                        autocomplete={this.autocomplete}
                    />
                </div>
            </div>
        );
    }
}

export default Terminal;
