const through = require("through2");
const ExtFile = require("./ExtFile").default;

export default (config) => {
	let code = null

	return through.obj(function(file, encoding, callback) {
		console.log(`processing: ${file.path}`)

		try {
			code = new ExtFile(file).convert()
			file.contents = new Buffer(code)
		} catch(e) {
			console.log(e)
		}			

		this.push(file)
		callback()
	});
};