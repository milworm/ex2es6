# ex2es6
ExtJS to ES6 code transformation

## Before
```js
/**
 * @class CJ.core.ui.View
 */
Ext.define('CJ.core.ui.View', {
	extend: 'Ext.Component',

	/**
	 * @property {Array} requires
	 */
	requires: [
		'Ext.dom.Element'
	],

	/**
	 * @return {Object}
	 */
	getElementConfig: function() {
		this.callParent(arguments)
	},
	/**
	 * @param {Number} id
	 * @return {Number}
	 */
	applyId: function(id) {
		id = ++ this.id
		return this.callParent([id]);
	},
	/**
	 * @param {String} param
	 * @return {String}
	 */
	applyId2: function(param) {
		var me = this
		return me.callParent([param]);
	},

	/**
	 * @param {Object} config
	 * @param {String} config.firstName
	 * @param {String} config.lastName
	 * @return {undefined}
	 */
	sayHello: function(config) {
		var firstName = config.firstName;
		var lastName = config.lastName;

		alert(firstName + ' ' + lastName + '!');
	}
});
```

## After
```js
import 'Ext/Component';
import 'Ext/dom/Element';

/**
 * @class CJ.core.ui.View
 */
Ext.define('CJ.core.ui.View', {
    extend: 'Ext.Component',
    /**
	 * @return {Object}
	 */
    getElementConfig(...args) {
        this.superclass.getElementConfig.apply(this, args);
    },
    /**
	 * @param {Number} id
	 * @return {Number}
	 */
    applyId(id) {
        id = ++this.id;
        return this.superclass.applyId.apply(this, [id]);
    },
    /**
	 * @param {String} param
	 * @return {String}
	 */
    applyId2(param) {
        const me = this;
        return me.superclass.applyId2.apply(me, [param]);
    },
    /**
	 * @param {Object} config
	 * @param {String} config.firstName
	 * @param {String} config.lastName
	 * @return {undefined}
	 */
    sayHello(config) {
        const firstName = config.firstName;
        const lastName = config.lastName;
        alert(`${ firstName } ${ lastName }!`);
    }
});
```
