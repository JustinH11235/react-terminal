import Directory from "./Directory";

class FSObject {
    name: string;
    parent: Directory | null;

    constructor(aName: string, aParent: Directory | null) {
        if (this.constructor === FSObject) {
            throw new Error(
                "Class 'FSObject' is abstract and cannot be instantiated."
            );
        }
        this.name = aName;
        this.parent = aParent;
    }

    get path(): Array<string> {
        return this.parent!.path.concat(this.name);
    }

    toString(): string {
        return this.name;
    }

    findFSObjectByPath(pathArr: Array<string>): FSObject | null {
        throw new Error("Method findFSObjectByPath() must be implemented.");
    }
}

export default FSObject;
