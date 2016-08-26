import 'Ext/Component';

/**
 * Defines search component.
 */
Ext.define('CJ.core.view.SearchField', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.core-view-search-field',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-search-field',
        /**
         * @cfg {String} value
         */
        value: ''
    },
    constructor() {
        this.callParent(args);
        this.on({
            input: {
                element: 'element',
                delegate: 'input',
                fn: this.onInput
            }
        });
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: ['x-unsized'],
            children: [{
                    reference: 'inputElement',
                    placeHolder: CJ.app.t('core-view-search-field-place-holder', true),
                    tag: 'input',
                    cls: 'd-input',
                    value: this.initialConfig.value || ''
                }]
        };
    },
    /**
     * @param {String} value
     */
    updateValue(value) {
        if (!this.initialized)
            return;
        this.inputElement.dom.value = value;
    },
    /**
     * simply fires an input even on component itself.
     */
    onInput() {
        this._value = this.inputElement.dom.value;
        clearTimeout(this.onInputTimeout);
        this.onInputTimeout = Ext.defer(function () {
            this.fireEvent('input', this, this.getValue());
        }, 250, this);
    }
});