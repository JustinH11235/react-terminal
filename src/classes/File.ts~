import FSObject from "./FSObject";
import Directory from "./Directory";

class File extends FSObject {
    constructor(aName: string, aParent: Directory) {
        super(aName, aParent);

        if (this.constructor === File) {
            throw new Error(
                "Class 'File' is abstract and cannot be instantiated."
            );
        }
    }

    open() {
        throw new Error("Method open() must be implemented.");
    }
}

export default File;
