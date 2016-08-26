import 'Ext/Container';
import 'app/view/tool/formula/Form';
import 'app/view/tool/formula/Example';

/**
 * Defines a component that allows to edit tool's information: 
 * value and preview.
 */
Ext.define('CJ.view.tool.formula.Editing', {
    extend: 'Ext.Container',
    alias: 'widget.view-tool-formula-editing',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-scroll',
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Object} scrollable
         */
        scrollable: CJ.Utils.getScrollable()
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        popup.on({
            scope: this,
            actionbuttontap: this.onPopupActionButtonTap,
            order: 'before'
        });
    },
    applyItems(items) {
        items = [
            {
                ref: 'form',
                xtype: 'view-tool-formula-form'
            },
            {
                ref: 'examples',
                flex: 1,
                xtype: 'view-tool-formula-example',
                listeners: {
                    scope: this,
                    selected: this.onExampleSelected
                }
            }
        ];
        return this.callParent(args);
    },
    /**
     * @param {Ext.data.Model} record
     */
    onExampleSelected(record) {
        this.setValues({ formula: record.get('value') });
    },
    /**
     * @return {Ext.Component}
     */
    getForm() {
        return this.down('[ref=form]');
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.callParent(args);
        config = config || {};
        if (config)
            this.setValues(config.values);
    },
    setValues(values) {
        this.getForm().setValues(values);
    },
    getValues() {
        return this.getForm().getValues();
    },
    /**
     * @return {undefined}
     */
    onPopupActionButtonTap() {
        const form = this.getForm();
        if (form.isEmpty() || form.getIsLoading())
            return false;
    }
});