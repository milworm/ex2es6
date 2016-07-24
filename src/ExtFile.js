const fs = require('fs')
const esprima = require("esprima")
const estraverse = require("estraverse")
const escodegen = require("escodegen")
const _ = require('lodash')
const lebab = require('lebab')

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
		this._ast = esprima.parse(es6code, {
			comment: true,
			range: true,
			tokens: true
		})
		this._ast = escodegen.attachComments(this._ast, this._ast.comments, this._ast.tokens)
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
			return 'Ext.Base'

		let {value} = keys.extend.value
		_.remove(classDefinition, keys.extend)
		return value
	}

	/**
	 * @return {Object}
	 */
	_createClassDeclaration({className, classDefinition}) {
		this._functionsToMethods(classDefinition)
		let superClassName = this._extractSuperClass(classDefinition)

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
        }
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
		return _.map(requires, src => this._createImportDeclaration(src))
	}

	/**
	 * @param {String} className
	 * @return {String}
	 */
	_createExportDefault(className) {
		return {
			"type": "ExportDefaultDeclaration",
            "declaration": {
                "type": "Identifier",
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
	_createClass(config) {
		let {classDefinition, className, node} = config

		// this._functionsToMethods(classDefinition)
		let requires = this._createImportDeclarations(classDefinition)
		let body = [requires]

		if(requires.length)
			body.push(this._createNewLine())

		body.push(node)
		body = _.flattenDeep(body)

        this._resultAst = {
        	"type": "Program",
		    "body": body,
		    "sourceType": "module"
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

        return escodegen.generate(this._resultAst)
	}
}