'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var espree = require('espree');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var _ = require('lodash');
var lebab = require('lebab');
var esformatter = require('esformatter');
var esformatterVarEach = require('esformatter-var-each');
var esStripSemicolons = require('es-strip-semicolons');
var esformatterCollapseObjects = require('esformatter-collapse-objects');

/**
 * regexp: \(([^\s]+)(\sundefined\s)([^,\)]+)\)
 * replace: ($1=$3)
 */

var transformsMap = {
	'class': true,
	'template': true,
	'arrow': true,
	'let': true,
	'default-param': true,
	'arg-spread': true,
	'obj-method': true,
	'obj-shorthand': true,
	'no-strict': true,
	'commonjs': true
};

var ExtFile = function () {

	/**
  * @param {File} file
  */
	function ExtFile(file) {
		_classCallCheck(this, ExtFile);

		var es6code = fs.readFileSync(file.path, "utf8");
		// let transformer = new lebab.Transformer(transformsMap)
		// let es6code = transformer.run(es5code)
		var ast = espree.parse(es6code, {
			range: true,
			loc: true,
			attachComment: true,
			tokens: true,
			ecmaVersion: 6,
			sourceType: 'module'
		});

		this._ast = ast;
		this._resultAst = {};
	}

	/**
  * @param {Object} node
  * @return {Object}
  */


	_createClass2(ExtFile, [{
		key: '_extractClassInfo',
		value: function _extractClassInfo(node) {
			var type = node.type;
			var expression = node.expression;


			if (type == 'ExpressionStatement') {
				var callee = expression.callee;

				var _ref = callee || {};

				var _type = _ref.type;
				var object = _ref.object;
				var property = _ref.property;


				if (_type == 'MemberExpression' && object.name == 'Ext' && property.name == 'define') {
					var _expression$arguments = _slicedToArray(expression.arguments, 2);

					var className = _expression$arguments[0];
					var classDefinition = _expression$arguments[1];

					className = className.value;
					classDefinition = classDefinition.properties;

					return {
						className: className,
						classDefinition: classDefinition,
						node: node
					};
				}
			}
		}

		/**
   * transforms all "method: function(){}" to "method(){}"
   * @param {Object} classDefinition
   */

	}, {
		key: '_functionsToMethods',
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
		key: '_extractRequires',
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
		key: '_extractSuperClass',
		value: function _extractSuperClass(classDefinition) {
			var keys = _.keyBy(classDefinition, 'key.name');

			if (!keys.extend) return null;

			var value = keys.extend.value.value;
			// _.remove(classDefinition, keys.extend)

			return value;
		}

		/**
   * @param {String} src
   * @return {Object}
   */

	}, {
		key: '_createImportDeclaration',
		value: function _createImportDeclaration(src) {
			var path = src.replace(/\./g, '/');
			path = path.replace('CJ', 'app');

			return {
				"type": "ImportDeclaration",
				"specifiers": [],
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
		key: '_createImportDeclarations',
		value: function _createImportDeclarations(classDefinition) {
			var _this = this;

			var requires = this._extractRequires(classDefinition);
			var superClass = this._extractSuperClass(classDefinition);

			if (superClass) requires.unshift(superClass);

			return _.map(requires, function (src) {
				return _this._createImportDeclaration(src);
			});
		}

		/**
   * @param {String} className
   * @return {String}
   */

	}, {
		key: '_createExportDefault',
		value: function _createExportDefault(className) {
			return {
				type: "ExportDefaultDeclaration",
				declaration: {
					type: "Identifier",
					name: className
				}
			};
		}

		/**
   * @param {Object} config
   * @param {String} config.className
   * @param {String} config.superClassName
   * @param {Object} config.classDefinition
   * @return {Object}
   */

	}, {
		key: '_createClass',
		value: function _createClass(_ref2) {
			var classDefinition = _ref2.classDefinition;
			var className = _ref2.className;
			var node = _ref2.node;

			this._functionsToMethods(classDefinition);
			var requires = this._createImportDeclarations(classDefinition);
			// let body = [requires]

			// if(requires.length)
			// 	body.push(this._createNewLine())
			var body = [];

			body.push(node);
			body = _.flattenDeep(body);
			this._parseCallParent(classDefinition);
			var ast = this._ast;
			var item = _.findLast(ast.body, function (item) {
				return item.type == 'ImportDeclaration';
			});
			if (item) {
				ast.body.splice(ast.body.indexOf(item) + 1, 0, this._createNewLine());
			}
			this._resultAst = ast;
		}

		/**
   * @param {Object} classDefinition
   */

	}, {
		key: '_parseCallParent',
		value: function _parseCallParent(classDefinition) {
			var _this2 = this;

			var properties = _.keyBy(classDefinition, 'key.name');

			_.each(properties, function (property, method) {
				if (property.value.type != 'FunctionExpression') return;

				var params = property.value.params;

				var newParams = [];
				var newDefaults = [];

				params.forEach(function (param) {
					if (param.type == 'AssignmentPattern') {
						var left = param.left;
						var right = param.right;

						newParams.push(left);
						newDefaults.push(right);
					} else {
						newParams.push(param);
					}
				});

				property.value.params = newParams;
				property.value.defaults = newDefaults;

				estraverse.traverse(property.value, {
					enter: function enter(node, parent) {
						_this2._replaceCallParent(method, node, parent, property.value.params);
					}
				});
			});
		}

		/**
   * @param {String} method
   * @param {Object} node
   * @param {Object} parent
   */

	}, {
		key: '_replaceCallParent',
		value: function _replaceCallParent(method, node, parent, params) {
			if (node.type != 'CallExpression') return;

			var callee = node.callee;


			if (!(callee.property && callee.property.name == 'callParent')) return;

			var object = callee.object;

			var args = node.arguments;

			if (!args.length) return;

			if (params.length < 2) return;

			if (args[0].name == 'args') {
				params = _.filter(params, function (item) {
					return item.name != 'args';
				});
				node.arguments = [{
					type: 'ArrayExpression',
					elements: [].concat(_toConsumableArray(params))
				}];
			}
		}

		/**
   * @return {Object}
   */

	}, {
		key: '_createNewLine',
		value: function _createNewLine() {
			return {
				type: 'Identifier',
				name: '\n'
			};
		}

		/**
   * @return {String} resulting code
   */

	}, {
		key: 'convert',
		value: function convert() {
			var _this3 = this;

			estraverse.traverse(this._ast, {
				enter: function enter(node, parent) {
					var classInfo = _this3._extractClassInfo(node);

					if (classInfo) _this3._createClass(classInfo);
				}
			});

			if (!this._resultAst.type) this._resultAst = this._ast; // not a class

			var code = escodegen.generate(this._resultAst, {
				comment: true,
				format: {
					indent: {
						style: "\t",
						base: 0,
						semicolons: false,
						adjustMultilineComment: true
					}
				}
			});
			esformatter.register(esformatterVarEach);
			esformatter.register(esformatterCollapseObjects);
			esformatter.register({
				transformAfter: esStripSemicolons
			});

			return esformatter.format(code, {
				indent: {
					value: "\t"
				},
				collapseObjects: {
					"ObjectExpression": {
						"maxLineLength": 80,
						"maxKeys": 3,
						"maxDepth": 2,
						"forbidden": ["FunctionExpression"]
					},
					"ArrayExpression": {
						"maxLineLength": 80,
						"maxKeys": 3,
						"maxDepth": 2,
						"forbidden": ["FunctionExpression"]
					}
				}
			});
		}
	}]);

	return ExtFile;
}();

exports.default = ExtFile;