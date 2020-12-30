import FSObject from "./FSObject";

type FileTreeRep = {
    name: string;
    children: Array<FileTreeRep>;
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
        if (this.children.some(elem => elem.name === name)) {
            return null;
        }
        const newDir = new Directory(name, this, []);
        this.children = this.children.concat([newDir]);
        return newDir;
    }

    addDirByRep(tree: FileTreeRep): Directory | null {
        const newDir = this.addDirByName(tree.name);
        if (newDir === null) {
            return null;
        }
        tree.children.forEach((child) => {
            newDir.addDirByRep(child);
        });
        return newDir;
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
                if (obj instanceof Directory) {
                    return obj.findFSObjectByPath(nextPath);
                } else {
                    // is a File
                    if (pathArr.length === 1) {
                        // last part of path
                        return obj;
                    } else {
                        // a File cannot have children
                        return null;
                    }
                }
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
}

export default Directory;