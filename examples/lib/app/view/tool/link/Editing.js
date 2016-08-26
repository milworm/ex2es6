import 'Ext/Container';

/**
 * Defines an interface to create/edit a link-tool.
 */
Ext.define('CJ.view.tool.link.Editing', {
    extend: 'Ext.Container',
    alias: 'widget.view-tool-link-editing',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-link-editing',
        /**
         * @cfg {CJ.core.view.Base} popup
         */
        popup: null,
        /**
         * @cfg {Array} items
         */
        items: [{
                xtype: 'urlfield',
                cls: 'x-urlfield',
                clearIcon: false,
                name: 'url',
                placeHolder: 'tool-view-edit-url'
            }],
        /**
         * @cfg {Object} values
         */
        values: {}
    },
    /**
     * @param {Object} values
     */
    applyValues(values undefined {}) {
        if (values.cfg)
            values.url = values.cfg.url || values['code'];
        return this.mixins.formable.applyValues.call(this, values);
    }
});