/**
 * @class CJ.core.ui.View
 */
Ext.define('CJ.core.ui.View', {
	extend: 'Ext.Component',

	/**
	 * @return {Object}
	 */
	getElementConfig: function() {
		return this.callParent(arguments)
	}
})