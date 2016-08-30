"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var through = require("through2");
var ExtFile = require("./ExtFile").default;

exports.default = function (config) {
	return through.obj(function (file, encoding, callback) {
		console.log(file.path);
		var done = false;
		var code = null;
		var extFile = null;

		try {
			extFile = new ExtFile(file);
			code = extFile.convert();
			done = true;
		} catch (e) {
			console.log(e);
		}

		if (done) file.contents = new Buffer(code);

		this.push(file);
		callback();
	});
};