import 'Ext/Component';

/**
 * Defines a component that allows user to select a visibility-property of an acquired block [licensed, private].
 */
Ext.define('CJ.view.publish.PurchasedVisibilitySelect', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-purchased-visibility-select',
    /**
     * @property {Object} eventedConfig
     */
    eventedConfig: null,
    /**
     * @property {Object} config
     */
    config: {
        floatingCls: null,
        hiddenCls: null,
        styleHtmlCls: null,
        tplWriteMode: null,
        disabledCls: 'd-disabled',
        carousel: null,
        /**
         * @cfg {String} cls
         * @TODO to be investigated: https://redmine.iqria.com/issues/10054
         */
        cls: [
            'd-visibility-select',
            'd-vbox'
        ],
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-visibility-select-inner\'>', '<div class=\'d-tab-content\'>', '<div class=\'d-tab d-tab-shared d-active\'></div>', '</div>', '</div>', { compiled: true }),
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} visibility
         */
        visibility: null,
        /**
         * @cfg {Ext.Component} visibilityField
         */
        visibilityField: {}
    },
    /**
     * @param {Object} config
     * @return {CJ.core.view.LightSegmentedField}
     */
    applyVisibilityField(config) {
        if (!config)
            return false;
        config = Ext.apply({
            xtype: 'view-light-segmented-button',
            cls: 'd-visibility-form',
            name: 'visibility',
            pressed: this.getVisibility(),
            fieldLabel: CJ.t('view-publish-purchased-visibility-select-title'),
            buttons: [
                {
                    text: CJ.t('view-publish-purchased-visibility-select-public'),
                    value: 'licensed',
                    cls: 'd-public'
                },
                {
                    text: CJ.t('view-publish-purchased-visibility-select-private'),
                    value: 'private',
                    cls: 'd-private'
                }
            ]
        }, config);
        return Ext.factory(config);
    },
    /**
     * @param {CJ.core.view.LightSegmentedField} newField
     * @param {CJ.core.view.LightSegmentedField} oldField
     */
    updateVisibilityField(newField, oldField) {
        if (oldField)
            oldField.destroy();
        if (newField)
            newField.renderTo(this.element.dom.querySelector('.d-tab-shared'));
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @return {undefined}
     */
    applyChanges() {
        this._visibility = this.getVisibilityField().getValue();
        return this;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setVisibilityField(null);
    }
});