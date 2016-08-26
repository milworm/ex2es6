import 'app/core/view/Component';

Ext.define('CJ.view.purchase.form.Details', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-form-details',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @property {Boolean} type
         */
        type: 'light',
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Boolean} canSubmit
         */
        canSubmit: null,
        /**
         * @cfg {Object} values
         */
        values: {},
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-purchase-form-details\'>', '<div class=\'d-purchase-form-details-inner\'>', '<div class=\'d-form-title\'>{formTitle}</div>', '<tpl if=\'bundled\'>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{bundlePriceQuantity}</span>', '<span class=\'d-price\'>${bundlePrice}</span>', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{bundleQuantityTitle}</span>', '<span>{bundleQuantity}</span>', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{bundleExpirationTitle}</span>', '<span>{hPeriod}</span>', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{bundleAdditionalItemPrice}</span>', '<span class=\'d-price\'>${unitPrice}</span>', '</div>', '<div class=\'d-field d-hbox d-vcenter\'>', '<span class=\'d-label\'>{bundleAdditionalQuantityTitle}</span>', '<input type=\'text\' class=\'d-input\' name=\'quantity\' placeholder=\'0\'/>', '</div>', '<tpl else>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{priceDuration}</span>', '<span class=\'d-price\'>${unitPrice} / {hPeriod}</span>', '</div>', '<div class=\'d-field d-hbox d-vcenter\'>', '<span class=\'d-label\'>{quantityTitle}</span>', '<input type=\'text\' class=\'d-input\' name=\'quantity\' />', '</div>', '</tpl>', '<div class=\'d-field d-hbox d-vcenter\'>', '<span class=\'d-label\'>{promoCodeTitle}</span>', '<input type=\'text\' class=\'d-input\' name=\'code\' />', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{subtotalTitle}</span>', '<span class=\'d-subtotal\'>${subtotal}</span>', '</div>', '<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>{discountTitle}</span>', '<span class=\'d-discount\'>0%</span>', '</div>', '<div class=\'d-taxes\'>{taxes}</div>', '</div>', '<div class=\'d-button\'>{buy}</div>', '</div>')
    },
    constructor() {
        this.callParent(args);
        this.element.on('input', this.onInput, this, {
            delegate: '[name=quantity], [name=code]',
            buffer: 250
        });
        this.element.on('tap', this.onButtonTap, this, { delegate: '.d-button.d-active' });
    },
    /**
     * @param {Array} taxes
     * @return {String}
     */
    formatTaxes(taxes) {
        const result = [];
        taxes = taxes || [];
        for (let i = 0, tax; tax = taxes[i]; i++)
            result.push('<div class=\'d-field d-hbox\'>', '<span class=\'d-label\'>', CJ.t(`TAX_${ tax.name }`, true), '</span>', '<span class=\'d-taxes\'>$', tax.value, '</span>', '</div>');
        return result.join('');
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        let button = CJ.t('view-purchase-form-details-buy');
        const taxes = this.formatTaxes(data.taxDetails);
        button = CJ.tpl(button, this.getValues().total || 0);
        return Ext.apply(data, {
            formTitle: CJ.t('view-purchase-form-details-form-title'),
            priceDuration: CJ.t('view-purchase-form-details-price-duration'),
            quantityTitle: CJ.t('view-purchase-form-details-quantity'),
            subtotalTitle: CJ.t('view-purchase-form-details-subtotal-title'),
            discountTitle: CJ.t('view-purchase-form-details-discount-title'),
            promoCodeTitle: CJ.t('view-purchase-form-details-promo-code-title'),
            totalTitle: CJ.t('view-purchase-form-details-total-title'),
            bundlePriceQuantity: CJ.t('view-purchase-form-details-bundle-price-quantity'),
            bundleAdditionalItemPrice: CJ.t('view-purchase-form-details-bundle-additional-item-price'),
            bundleExpirationTitle: CJ.t('view-purchase-form-details-bundle-expiration-title'),
            bundleQuantityTitle: CJ.t('view-purchase-form-details-bundle-quantity'),
            bundleAdditionalQuantityTitle: CJ.t('view-purchase-form-details-bundle-additional-quantity'),
            taxes,
            buy: button
        });
    },
    /**
     * @param {Boolean} state
     */
    updateCanSubmit(state) {
        const button = this.element.dom.querySelector('.d-button');
        button.classList[state ? 'add' : 'remove']('d-active');
    },
    /**
     * @param {Ext.Evented} e
     */
    onInput(e) {
        const el = this.element.dom;
        const quantityField = el.querySelector('[name=quantity]');
        const codeField = el.querySelector('[name=code]');
        let quantity = quantityField.value.replace(/[^\d]+/, '');
        const code = codeField.value;
        let values;
        quantityField.value = quantity;
        quantity -= 0;    // can't submit individual license without a quantity specified.
        // can't submit individual license without a quantity specified.
        if (!quantity && !this.isBundle())
            return this.setCanSubmit(false);
        values = this.getValues();
        values.quantity = quantity;
        values.promoCode = code;
        CJ.License.calculatePrice(values.blockId, quantity, code, {
            scope: this,
            success: this.onCalculatePriceSuccess
        });
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onCalculatePriceSuccess(response) {
        const node = this.element.dom, data = response.ret;
        node.querySelector('.d-subtotal').innerHTML = `$${ data.subtotal }`;
        node.querySelector('.d-taxes').innerHTML = this.formatTaxes(data.taxDetails);
        node.querySelector('.d-button').innerHTML = CJ.tpl(CJ.t('view-purchase-form-details-buy'), data.total);
        this.onCalculateDiscount(data.discount);
        this.setCanSubmit(true);
        Ext.apply(this.getValues(), data);
    },
    /**
     * makes code field green/red or neutral and sets discount amount.
     * @param {Object} discount
     * @return {undefined}
     */
    onCalculateDiscount(discount) {
        const node = this.element.dom;
        const codeField = this.element.dom.querySelector('[name=code]');
        let valid = '';
        if (codeField.value)
            valid = !!discount;
        CJ.Utils.setNodeData(codeField, 'valid', valid);
        if (discount)
            node.querySelector('.d-discount').innerHTML = `${ discount.pct }%`;
    },
    /**
     * shows next screen.
     * @return {undefined}
     */
    onButtonTap(e) {
        this.initialConfig.parent.nextStep();
    },
    /**
     * @param {Object} values
     * @return {undefined}
     */
    updateValues(values) {
        this.setData(values);
        if (this.isBundle())
            this.setCanSubmit(true);
    },
    /**
     * @return {Boolean}
     */
    isBundle() {
        return this.getValues().bundled;
    }
});