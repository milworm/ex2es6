/*
	view/edit mode functionality common across components
*/
Ext.define('CJ.view.mixins.Editable', {
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} editing
         */
        editing: null
    },
    /**
     * updates visible value using original value
     * must be overriden in sub-class
     */
    resetChanges: Ext.emptyFn,
    /**
     * saves changes
     * must be overriden in sub-class
     */
    applyChanges: Ext.emptyFn,
    /**
     * @return {Object}
     */
    serialize() {
        return {};
    }
});