"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var through = require("through2");
var ExtFile = require("./ExtFile").default;

exports.default = function (config) {
	return through.obj(function (file, encoding, callback) {
		var extFile = new ExtFile(file);
		var code = extFile.convert();

		file.contents = new Buffer(code);
		this.push(file);
		callback();
	});
};