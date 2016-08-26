import 'app/core/view/Component';

Ext.define('CJ.view.purchase.form.Review', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-form-review',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @property {Boolean} type
         */
        type: 'light',
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Object} values
         */
        values: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-purchase-form-review\'>', '<div class=\'d-form-title\'>{invoiceTitle}</div>', '<div class=\'d-block-title\'>{license.title}</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{priceAndDuration}</span>', '<span class=\'d-value\'>${license.unitPrice} / {license.hPeriod}</span>', '</div>', '<div class=\'d-field d-hbox d-vcenter\'>', '<span class=\'d-label\'>{quantityTitle}</span>', '<span class=\'d-value\'>{license.qty}</span>', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{subtotalTitle}</span>', '<span class=\'d-value\'>${license.subtotal}</span>', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{taxesTitle}</span>', '<span class=\'d-value\'>${license.taxes}</span>', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{totalTitle}</span>', '<span class=\'d-value\'>${license.total}</span>', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{purchasedTitle}</span>', '<span class=\'d-value\'>{purchased}</span>', '</div>', '<div class=\'d-button\'>{button}</div>', '</div>')
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onButtonTap, this, { delegate: '.d-button' });
    },
    /**
     * @return {undefined}
     */
    onButtonTap() {
        CJ.PopupManager.hideActive();
        if (CJ.License.getLicense().left > 0)
            CJ.view.purchase.assign.Options.popup();
    },
    /**
     * @param {Object} values
     * @return {undefined}
     */
    updateValues(values) {
        this.setData(values);
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        let button = 'view-purchase-form-review-';
        const license = CJ.License.getLicense();
        button += license.left > 0 ? 'assign' : 'open';
        button = CJ.tpl(CJ.t(button), license.left);
        return {
            invoiceTitle: CJ.t('view-purchase-form-review-invoice'),
            purchasedTitle: CJ.t('view-purchase-form-review-purchased'),
            totalTitle: CJ.t('view-purchase-form-review-total'),
            priceAndDuration: CJ.t('view-purchase-form-review-price-and-duration'),
            subtotalTitle: CJ.t('view-purchase-form-review-subtotal'),
            quantityTitle: CJ.t('view-purchase-form-review-quantity'),
            taxesTitle: CJ.t('view-purchase-form-review-taxes'),
            button,
            license
        };
    }
});