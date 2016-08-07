/**
 * @class CJ.core.ui.View
 */
Ext.define('CJ.core.ui.View', {
	extend: 'Ext.Component',
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