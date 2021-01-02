import FSObject from "./FSObject";
import Directory from "./Directory";

class RootDirectory extends Directory {
    constructor(aChildren: Array<FSObject>) {
        super("", null, aChildren);
    }

    get path(): Array<string> {
        return [this.name];
    }

    static createRootDir(tree: FileTreeRep): RootDirectory {
        const newRoot = new RootDirectory([]);
        tree.children!.forEach((child) => {
            if ('children' in child) {
                newRoot.addDirByRep(child);
            } else {
                newRoot.addFileByRep(child);
            }
        });
        return newRoot;
    }

    getHome(userHome: string): Directory {
        const homeDir = this.findChildByName("home");
        if (homeDir === null || !(homeDir instanceof Directory)) {
            return this;
        }
        const userDir = homeDir.findChildByName(userHome);
        if (userDir === null || !(userDir instanceof Directory)) {
            return this;
        }
        return userDir;
    }
}

export default RootDirectory;
