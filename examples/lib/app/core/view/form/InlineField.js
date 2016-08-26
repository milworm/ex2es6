import 'Ext/Component';

/**
 * Defines a component that allows inline editing.
 */
Ext.define('CJ.core.view.form.InlineField', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.core-view-form-inline-field',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-inline-field',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-inline-field-inner',
        /**
         * @cfg {String} value
         */
        value: null,
        /**
         * @cfg {String} placeholder
         */
        placeholder: null,
        /**
         * @cfg {Ext.Template} editTpl
         */
        editTpl: '<input class=\'d-input\' type=\'text\' value=\'{0}\' maxlength=\'{1}\' placeholder=\'{2}\' />',
        /**
         * @cfg {Ext.Template} viewTpl
         */
        viewTpl: '{0}',
        /**
         * @cfg {Boolean} editing
         */
        editing: false,
        /**
         * @cfg {Number} maxLength
         */
        maxLength: 100,
        /**
         * @cfg {String} defaultValue
         */
        defaultValue: null,
        /**
         * @cfg {String} placeHolder
         */
        placeHolder: ''
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
        this.element.on('blur', this.onElementBlur, this, { delegate: 'input' });
        this.element.on('keydown', this.onElementKeyDown, this, { delegate: 'input' });
    },
    /**
     * @param {Boolean} newState
     * @param {Boolean} oldState
     */
    updateEditing(newState, oldState) {
        let tpl, value = this.getValue();
        if (newState) {
            tpl = this.getEditTpl();
        } else {
            tpl = this.getViewTpl();
            if (!value)
                value = this.getDefaultValue();
        }
        this.setHtml(tpl, value);
    },
    /**
     * @param {String} tpl
     * @param {String} value
     */
    setHtml(tpl, value) {
        this.element.setHtml(CJ.tpl(tpl, value || '', this.getMaxLength(), this.getPlaceHolder()));
    },
    /**
     * @return {undefined}
     */
    onElementTap() {
        this.setEditing(true);
        const node = this.element.dom.querySelector('input');
        if (this.getDomValue() == this.getDefaultValue())
            node.value = '';
        node.focus();
        Ext.Viewport.onInputTap(node);
    },
    /**
     * @return {undefined}
     */
    onElementBlur() {
        const value = this.getDomValue();
        if (!Ext.isEmpty(value))
            this.setValue(value);
        this.setEditing(false);
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementKeyDown(e) {
        this.fireEvent('keydown', this, e);
    },
    /**
     * @return {String}
     */
    getDomValue() {
        return Ext.String.trim(this.element.dom.querySelector('input').value);
    },
    /**
     * @param {String} value
     */
    updateValue(value) {
        if (!this.initialized)
            return;
        this.fireEvent('change', this, value);
    },
    /**
     * @return {String}
     */
    getRealValue() {
        const value = this.getValue();
        if (Ext.isEmpty(value))
            return this.getDefaultValue();
        return value;
    }
});