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

	applyId: function(id) {
		id = ++ this.id
		return this.callParent([id]);
	},

	applyId2: function(id) {
		var me = this
		id = ++ me.id
		return me.callParent([id]);
	}
})