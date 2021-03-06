"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var esprima = require("esprima");
var estraverse = require("estraverse");
var escodegen = require("escodegen");
var _ = require('lodash');

var ExtFile = function () {

	/**
  * @param {File} file
  */
	function ExtFile(file) {
		_classCallCheck(this, ExtFile);

		var code = fs.readFileSync(file.path, "utf8");
		this._ast = esprima.parse(code);
		this._resultAst = {};
	}

	/**
  * @param {Object} node
  * @return {Object}
  */


	_createClass2(ExtFile, [{
		key: "_extractClassInfo",
		value: function _extractClassInfo(node) {
			var type = node.type;
			var expression = node.expression;


			if (type == 'ExpressionStatement') {
				var callee = expression.callee;
				var _type = callee.type;
				var object = callee.object;
				var property = callee.property;


				if (_type == 'MemberExpression' && object.name == 'Ext' && property.name == 'define') {
					var _expression$arguments = _slicedToArray(expression.arguments, 2);

					var className = _expression$arguments[0];
					var classDefinition = _expression$arguments[1];

					className = className.value;
					classDefinition = classDefinition.properties;

					return {
						className: className,
						classDefinition: classDefinition
					};
				}
			}
		}

		/**
   * transforms all "method: function(){}" to "method(){}"
   * @param {Object} classDefinition
   */

	}, {
		key: "_functionsToMethods",
		value: function _functionsToMethods(classDefinition) {
			var keys = _.keyBy(classDefinition, 'key.name');

			_.each(keys, function (value, key) {
				if (value.value.type == 'FunctionExpression') value.type = 'MethodDefinition';
			});
		}

		/**
   * @param {Object} classDefinition
   * @return {Array}
   */

	}, {
		key: "_extractRequires",
		value: function _extractRequires(classDefinition) {
			var keys = _.keyBy(classDefinition, 'key.name');

			if (!keys.requires) return [];

			var value = keys.requires.value;

			var items = value.elements.map(function (item) {
				return item.value;
			});
			_.remove(classDefinition, keys.requires);
			return items;
		}

		/**
   * @param {Object} classDefinition
   * @return {String}
   */

	}, {
		key: "_extractSuperClass",
		value: function _extractSuperClass(classDefinition) {
			var keys = _.keyBy(classDefinition, 'key.name');

			if (!keys.extend) return 'Ext.Base';

			var value = keys.extend.value.value;

			_.remove(classDefinition, keys.extend);
			return value;
		}

		/**
   * @return {Object}
   */

	}, {
		key: "_createClassDeclaration",
		value: function _createClassDeclaration(_ref) {
			var className = _ref.className;
			var classDefinition = _ref.classDefinition;

			this._functionsToMethods(classDefinition);
			var superClassName = this._extractSuperClass(classDefinition);

			return {
				"type": "ExportDefaultDeclaration",
				"declaration": {
					"type": "ClassDeclaration",
					"id": {
						"name": className.split('.').pop()
					},
					"superClass": {
						"type": "Identifier",
						"name": superClassName
					},
					"body": {
						"type": "ClassBody",
						"body": classDefinition
					}
				}
			};
		}

		/**
   * @param {String} src
   * @return {Object}
   */

	}, {
		key: "_createImportDeclaration",
		value: function _createImportDeclaration(src) {
			var path = src.replace(/\./g, '/');
			path = path.replace('CJ', 'app');

			return {
				"type": "ImportDeclaration",
				"specifiers": [{
					"type": "ImportDefaultSpecifier",
					"local": {
						"type": "Identifier",
						"name": src
					}
				}],
				"source": {
					"type": "Literal",
					"value": path
				}
			};
		}

		/**
   * @param {Object} classDefinition
   * @return {Array}
   */

	}, {
		key: "_createImportDeclarations",
		value: function _createImportDeclarations(classDefinition) {
			var _this = this;

			var requires = this._extractRequires(classDefinition);
			return _.map(requires, function (src) {
				return _this._createImportDeclaration(src);
			});
		}

		/**
   * @param {Object} config
   * @param {String} config.className
   * @param {String} config.superClassName
   * @param {Object} config.classDefinition
   * @return {Object}
   */

	}, {
		key: "_createClass",
		value: function _createClass(config) {
			var classDefinition = config.classDefinition;

			var cls = this._createClassDeclaration(config);
			var requires = this._createImportDeclarations(classDefinition);
			var body = _.flattenDeep([requires, cls]);

			this._resultAst = {
				"type": "Program",
				"body": body,
				"sourceType": "module"
			};
		}

		/**
   * @return {String} resulting code
   */

	}, {
		key: "convert",
		value: function convert() {
			var _this2 = this;

			estraverse.traverse(this._ast, {
				enter: function enter(node, parent) {
					var classInfo = _this2._extractClassInfo(node);

					if (classInfo) _this2._createClass(classInfo);
				}
			});

			return escodegen.generate(this._resultAst);
		}
	}]);

	return ExtFile;
}();

exports.default = ExtFile;