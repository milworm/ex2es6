import 'Ext/Component';

/**
 * Defines a component that allows users to configure fga-options for a course.
 */
Ext.define('CJ.view.publish.FgaOptions', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-fga-options',
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
        disabledCls: null,
        carousel: null,
        /**
         * @cfg {Number} totalHours
         */
        totalHours: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} cls
         */
        cls: 'd-fga-options',
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<span class=\'d-title\'>{title}</span>', '<div class=\'d-total-hours-field d-hbox\'>', '<label class=\'d-label\' for=\'totalHours\'>{totalHoursLabel}</label>', '<input class=\'d-input d-total-hours-input\' id=\'totalHours\' value=\'{totalHours}\' />', '</div>', { compiled: true })
    },
    /**
     * @return {undefined}
     */
    initElement() {
        this.callParent(args);
        this.element.on('input', this.validate, this, { delegate: 'input' });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        data = Ext.apply({
            title: CJ.t('view-publish-fga-options-title'),
            totalHoursLabel: CJ.t('view-publish-fga-options-total-hours-label'),
            totalHours: this.getTotalHours()
        });
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @return {Ext.Component}
     */
    applyChanges() {
        const totalHours = this.getValueFor('#totalHours') - 0;
        this._totalHours = totalHours || null;
        return this;
    },
    /**
     * @return {Boolean}
     */
    validate() {
        return true;
    },
    /**
     * returns value of HTMLElement found with selector.
     * @param {String} selector
     * @return {String}
     */
    getValueFor(selector) {
        return this.element.dom.querySelector(selector).value;
    }
});