import File from "./File";
import Directory from "./Directory";

class LinkFile extends File {
    url: string;

    constructor(aName: string, aParent: Directory, aUrl: string) {
        super(aName, aParent);
        this.url = aUrl;
    }

    open() {
        window.location.href = this.url;
    }
}

export default LinkFile;
