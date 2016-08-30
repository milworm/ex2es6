const fs = require('fs')
const espree = require('espree')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const _ = require('lodash')
const lebab = require('lebab')
const esformatter = require('esformatter')
const esformatterVarEach = require('esformatter-var-each')
const esStripSemicolons = require('es-strip-semicolons')
const esformatterCollapseObjects = require('esformatter-collapse-objects')


// label makes mistakes with default-values, 
// so the following regexps should be used to find all dangerous places

/**
 * regexp: \(([^\s]+)(\sundefined\s)([^,\)]+)\)
 * replace: ($1=$3)
 */

/** 
 * [a-zA-Z]+\(.*\s\=\s[^\)\{\s]+\)\s\{
 */

const transformsMap = {
	'class': true,
	'template': true,
	'arrow': true,
	'let': true,
	'default-param': true,
	'arg-spread': true,
	'obj-method': true,
	'obj-shorthand': true,
	'no-strict': true,
	'commonjs': true,
}

export default class ExtFile {

	/**
	 * @param {File} file
	 */
	constructor(file) {
		let es5code = fs.readFileSync(file.path, "utf8")
		let transformer = new lebab.Transformer(transformsMap)
		let es6code = transformer.run(es5code)
		let ast = espree.parse(es6code, {
			range: true,
			loc: true,
			attachComment: true,
			tokens: true,
			ecmaVersion: 6,
			sourceType: 'module'
		})

		this._ast = ast
		this._resultAst = {}
	}

	/**
	 * @param {Object} node
	 * @return {Object}
	 */
	_extractClassInfo(node) {
		let {type, expression} = node

		if(type == 'ExpressionStatement') {
			let {callee} = expression
			let {type, object, property} = callee || {}

			if(type == 'MemberExpression' && object.name == 'Ext' && property.name == 'define') {
				let [className, classDefinition] = expression.arguments
				className = className.value
				classDefinition = classDefinition.properties

				return {
					className,
					classDefinition,
					node
				}
			}
		}
	}

	/**
	 * transforms all "method: function(){}" to "method(){}"
	 * @param {Object} classDefinition
	 */
	_functionsToMethods(classDefinition) {
		let keys = _.keyBy(classDefinition, 'key.name')

		_.each(keys, (value, key) => {
			if(value.value.type == 'FunctionExpression')
				value.type = 'MethodDefinition'
		})
	}

	/**
	 * @param {Object} classDefinition
	 * @return {Array}
	 */
	_extractRequires(classDefinition) {
		let keys = _.keyBy(classDefinition, 'key.name')

		if(! keys.requires) 
			return []

		let {value} = keys.requires
		let items = value.elements.map(item => item.value)
		_.remove(classDefinition, keys.requires)
		return items
	}

	/**
	 * @param {Object} classDefinition
	 * @return {String}
	 */
	_extractSuperClass(classDefinition) {
		let keys = _.keyBy(classDefinition, 'key.name')

		if(! keys.extend)
			return null

		let {value} = keys.extend.value
		// _.remove(classDefinition, keys.extend)
		return value
	}

	/**
	 * @param {String} src
	 * @return {Object}
	 */
	_createImportDeclaration(src) {
		let path = src.replace(/\./g, '/')
		path = path.replace('CJ', 'app')

		return {
			"type": "ImportDeclaration",
			"specifiers": [],
			"source": {
				"type": "Literal",
				"value": path
			}
		}
	}

	/**
	 * @param {Object} classDefinition
	 * @return {Array}
	 */
	_createImportDeclarations(classDefinition) {
		let requires = this._extractRequires(classDefinition)
		let superClass = this._extractSuperClass(classDefinition)

		if(superClass)
			requires.unshift(superClass)

		return _.map(requires, src => this._createImportDeclaration(src))
	}

	/**
	 * @param {String} className
	 * @return {String}
	 */
	_createExportDefault(className) {
		return {
			type: "ExportDefaultDeclaration",
			declaration: {
				type: "Identifier",
				name: className
			}
		}
	}

	/**
	 * @param {Object} config
	 * @param {String} config.className
	 * @param {String} config.superClassName
	 * @param {Object} config.classDefinition
	 * @return {Object}
	 */
	_createClass({classDefinition, className, node}) {
		this._functionsToMethods(classDefinition)

		let ast = this._ast
		let item = _.findLast(ast.body, ({type}) => type == 'ImportDeclaration')

		if(item) {
			// it's already converted class, so we don't need to parse requires-property
			ast.body.splice(ast.body.indexOf(item) + 1, 0, this._createNewLine())
			this._resultAst = ast
		} else {
			let requires = this._createImportDeclarations(classDefinition)
			let body = [requires]

			if(requires.length)
				body.push(this._createNewLine())

			body.push(node)
			body = _.flattenDeep(body)
			this._parseCallParent(classDefinition)
		}
	}

	/**
	 * @param {Object} classDefinition
	 */
	_parseCallParent(classDefinition) {
		let properties = _.keyBy(classDefinition, 'key.name')

		_.each(properties, (property, method) => {
			if(property.value.type != 'FunctionExpression')
				return

			let {params} = property.value
			let newParams = []
			let newDefaults = []

			params.forEach(param => {
				if(param.type == 'AssignmentPattern') {
					let {left, right} = param
					newParams.push(left)
					newDefaults.push(right)
				} else {
					newParams.push(param)
				}
			})

			property.value.params = newParams
			property.value.defaults = newDefaults

			estraverse.traverse(property.value, {
				enter: (node, parent) => {
					this._replaceCallParent(method, node, parent, property.value.params)
				}
			})
		})
	}

	/**
	 * @param {String} method
	 * @param {Object} node
	 * @param {Object} parent
	 */
	_replaceCallParent(method, node, parent, params) {
		if(node.type != 'CallExpression')
			return

		let {callee} = node

		if(! (callee.property && callee.property.name == 'callParent'))
			return

		let {object} = callee
		let args = node.arguments

		if(! args.length)
			return 

		if(params.length < 2)
			return 

		if(args[0].name == 'args') {
			params = _.filter(params, item => item.name != 'args')
			node.arguments = [{
				type: 'ArrayExpression',
				elements: [...params]
			}]
		}
	}

	/**
	 * @return {Object}
	 */
	_createNewLine() {
		return {
			type: 'Identifier',
			name: '\n'
		}
	}

	/**
	 * @return {String} resulting code
	 */
	convert() {
		estraverse.traverse(this._ast, {
			enter: (node, parent) => {
				let classInfo = this._extractClassInfo(node)

				if(classInfo)
					this._createClass(classInfo)
			}
		})

		if(! this._resultAst.type)
			this._resultAst = this._ast // not a class

		let code = escodegen.generate(this._resultAst, {
			comment: true,
			format: {
				indent: {
					style: "\t",
					base: 0,
					semicolons: false,
					adjustMultilineComment: true
				}
			}
		})

		esformatter.register(esformatterVarEach)
		esformatter.register(esformatterCollapseObjects)
		esformatter.register({
			transformAfter: esStripSemicolons
		})

		return esformatter.format(code, {
			indent: {
				value: "\t"
			},
			collapseObjects: {
				 "ObjectExpression": {
			      "maxLineLength": 80,
			      "maxKeys": 3,
			      "maxDepth": 2,
			      "forbidden": [
			        "FunctionExpression"
			      ]
			    },
			    "ArrayExpression": {
			      "maxLineLength": 80,
			      "maxKeys": 3,
			      "maxDepth": 2,
			      "forbidden": [
			        "FunctionExpression"
			      ]
			    }
			}
		})
	}
}