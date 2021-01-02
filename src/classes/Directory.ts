import FSObject from "./FSObject";
import File from "./File";
import LinkFile from "./LinkFile";

type FileTreeRep = {
    name: string,
    children?: Array<FileTreeRep>,
    url?: string,
};
class Directory extends FSObject {
    children: Array<FSObject>;

    constructor(
        aName: string,
        aParent: Directory | null,
        aChildren: Array<FSObject>
    ) {
        super(aName, aParent);

        if (this.constructor === Directory && aParent === null) {
            throw new Error(
                "Class 'Directory' cannot be instantiated with a null parent."
            );
        }

        this.children = aChildren;
    }

    addDirByName(name: string): Directory | null {
        // Directory by this name exists
        if (this.children.some((elem) => elem.name === name)) return null;

        const newDir = new Directory(name, this, []);
        this.children = this.children.concat([newDir]);
        return newDir;
    }

    addDirByRep(tree: FileTreeRep): Directory | null {
        const newDir = this.addDirByName(tree.name);
        // Directory by this name exists
        if (newDir === null) return null;

        tree.children!.forEach((child) => {
            if ('children' in child) {
                newDir.addDirByRep(child);
            } else {
                newDir.addFileByRep(child);
            }
        });
        return newDir;
    }

    addFileByRep(tree: FileTreeRep): File | null {
        // File by this name exists
        if (this.children.some((elem) => elem.name === tree.name)) return null;

        const newFile = new LinkFile(tree.name, this, tree.url!);
        this.children = this.children.concat([newFile]);
        return newFile;
    }

    findChildByName(aName: string): FSObject | null {
        var foundObj = null;
        for (const obj of this.children) {
            if (obj.name === aName) {
                foundObj = obj;
                break;
            }
        }
        return foundObj;
    }

    findFSObjectByPath(pathArr: Array<string>): FSObject | null {
        const nextPath = pathArr.slice(1);
        if (pathArr.length === 0) {
            return this;
        } else if (pathArr[0] === '') {
            return this.findFSObjectByPath(nextPath);
        } else if (pathArr[0] === ".") {
            return this.findFSObjectByPath(nextPath);
        } else if (pathArr[0] === "..") {
            if (this.parent === null) {
                return this.findFSObjectByPath(nextPath);
            } else {
                return this.parent!.findFSObjectByPath(nextPath);
            }
        }

        for (const obj of this.children) {
            if (obj.name === pathArr[0]) {
                return obj.findFSObjectByPath(nextPath);
            }
        }
        return null;
    }

    findDirByPath(pathArr: Array<string>): Directory | null {
        const fsObj = this.findFSObjectByPath(pathArr);
        if (fsObj !== null && fsObj instanceof Directory) {
            return fsObj;
        } else {
            return null;
        }
    }

    findFileByPath(pathArr: Array<string>): File | null {
        const fsObj = this.findFSObjectByPath(pathArr);
        if (fsObj !== null && fsObj instanceof File) {
            return fsObj;
        } else {
            return null;
        }
    }
}

export default Directory;
