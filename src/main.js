const through = require("through2");
const ExtFile = require("./ExtFile").default;

export default (config) => {
    return through.obj(function(file, encoding, callback) {
        let extFile = new ExtFile(file)
        let code = extFile.convert()

        file.contents = new Buffer(code)
        this.push(file)
        callback()
    });
};