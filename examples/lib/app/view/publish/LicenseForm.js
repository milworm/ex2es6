import 'Ext/Component';
import 'app/view/promoCodes/Select';

/**
 * Defines "priced"-tab in visibility-select carousel-item.
 */
Ext.define('CJ.view.publish.LicenseForm', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-license-form',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Ext.Component} visibilitySelect
         */
        visibilitySelect: null,
        /**
         * @cfg {Boolean} bundled
         */
        bundled: false,
        /**
         * @cfg {Number} bundleQuantity
         */
        bundleQuantity: null,
        /**
         * @cfg {Number} bundlePrice
         */
        bundlePrice: null,
        /**
         * @cfg {Number} period
         * Duration in months.
         */
        period: null,
        /**
         * @cfg {Number} price
         * Float number.
         */
        price: null,
        /**
         * @cfg {Object} preview
         */
        preview: null,
        /**
         * @cfg {Array} vouchers
         */
        vouchers: null,
        /**
         * @cfg {String} activeTab
         */
        activeTab: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-license-form d-vbox',
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-form-title d-label\'>', '<span>{formTitle}</span>', '</div>', '<div class=\'d-tab-bar\'>', '<span class=\'d-title\' data-type=\'bundle\'>{sellBundle}</span>', '<span class=\'d-title\' data-type=\'individual\'>{sellIndividual}</span>', '</div>', '<div class=\'d-tab-content\'>', '<div class=\'d-tab d-tab-bundle\' data-type=\'bundle\'>', '<label class=\'d-label d-input-field d-hbox\' for=\'bundleQuantity\'>', '<span>{bundleQuantityTitle}</span>', '<input type=\'text\' class=\'d-input\' name=\'bundleQuantity\' id=\'bundleQuantity\' value=\'{bundleQuantity}\' maxlength=\'7\' />', '</label>', '<label class=\'d-label d-input-field d-hbox\' for=\'bundlePrice\'>', '<span>{bundlePriceTitle}</span>', '<input type=\'text\' class=\'d-input\' name=\'bundlePrice\' id=\'bundlePrice\' value=\'{bundlePrice}\' maxlength=\'7\' />', '</label>', '<label class=\'d-label d-input-field d-hbox\' for=\'additionalLicensePrice\'>', '<span>{additionalLicensePriceTitle}</span>', '<input type=\'text\' class=\'d-input\' name=\'additionalLicensePrice\' id=\'additionalLicensePrice\' value=\'{price}\' maxlength=\'7\' />', '</label>', '</div>', '<div class=\'d-tab d-tab-individual\' data-type=\'individual\'>', '<label class=\'d-label d-input-field d-price-field d-hbox\' for=\'price\'>', '<span>{priceTitle}</span>', '<input type=\'text\' class=\'d-input\' name=\'price\' id=\'price\' value=\'{price}\' maxlength=\'7\' />', '</label>', '</div>', '<div class=\'d-label d-duration-field\'>', '<span>{durationTitle}</span>', '<div class=\'d-duration-placeholder\'></div>', '</div>', '<div class=\'d-label d-description-field\'>', '<span>{descriptionTitle}</span>', '<div class=\'d-description-container\'>', '<div class=\'d-button d-edit-button\'>{editButton}</div>', '<div class=\'d-button d-create-button\'>{createButton}</div>', '<div class=\'d-button d-preview-button\'>{previewButton}</div>', '</div>', '</div>', '<div class=\'d-label d-promo-codes-field\'>', '<span>{promoCodesTitle}</span>', '<div class=\'d-button d-promo-codes-button\'>{promoCodesButton}</div>', '</div>', '</div>', { compiled: true }),
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {CJ.core.view.LightSegmentedButton} durationSelect
         */
        durationSelect: {}
    },
    constructor(config) {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
        this.element.on('input', this.formatPriceField, this, { delegate: '#price, #bundlePrice, #additionalLicensePrice' });
        this.element.on('input', this.validate, this, { delegate: 'input' });
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateBundled(state) {
        this.setActiveTab(state ? 'bundle' : 'individual');
    },
    /**
     * @param {String} newTab
     * @param {String} oldTab
     */
    updateActiveTab(newTab, oldTab) {
        if (oldTab)
            this.element.removeCls(`d-active-tab-${ oldTab }`);
        if (newTab)
            this.element.addCls(`d-active-tab-${ newTab }`);
    },
    /**
     * @return {Boolean} true if there is atleast one non-empty input-field.
     */
    isDirty() {
        const inputs = this.element.dom.querySelectorAll('[name]');
        for (let i = 0, input; input = inputs[i]; i++)
            if (+input.value != 0)
                return true;
    },
    /**
     * @return {undefined}
     */
    validate() {
        if (!this.isDirty())
            return this.hideErrors();
        if (this.getPreview())
            return this.hideErrors();
        const carousel = this.getCarousel();
        carousel.allowSubmit(false);
        carousel.setFocusOn(this);
        this.element.dom.querySelector('.d-create-button').classList.add('d-error');
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    formatPriceField(e) {
        const field = e.target, index = field.selectionStart, value = CJ.Utils.formatPrice(field.value);
        field.value = value;
        field.setSelectionRange(index, index);
        this.getCarousel().setFocusOn(this);
    },
    /**
     * @return {undefined}
     */
    hideErrors() {
        this.getCarousel().allowSubmit(true);
        this.element.dom.querySelector('.d-create-button').classList.remove('d-error');
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-edit-button, .d-create-button', 1))
            return this.openPreviewEditor();
        else if (e.getTarget('.d-preview-button', 1))
            return this.openPreviewBlock();
        else if (e.getTarget('.d-tab-bar .d-title', 1))
            return this.onTabBarTabTitleTap(e);
        else if (e.getTarget('.d-promo-codes-button', 1))
            return this.openPromoCodesPopup();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onTabBarTabTitleTap(e) {
        this.setActiveTab(CJ.getNodeData(e.target, 'type'));
    },
    /**
     * renders a popup to display promo codes for current block.
     * @return {undefined}
     */
    openPromoCodesPopup() {
        CJ.view.promoCodes.Select.popup({
            codes: this.getVouchers(),
            listeners: {
                scope: this,
                destroy: this.onPromoCodesSelectDestroy
            }
        });
    },
    /**
     * @param {CJ.view.promoCodes.Select} component
     * @return {undefined}
     */
    onPromoCodesSelectDestroy(component) {
        this.setVouchers(component.getRealCodes());
    },
    /**
     * will be called when user taps on write-description-button. Epens an editor that allows user to create a preview
     * content for their license-container (course, map, block).
     * @return {undefined}
     */
    openPreviewEditor() {
        if (this.getPreview())
            this.editPreview();
        else
            this.createPreview();
    },
    /**
     * opens preview-block.
     * @return {undefined}
     */
    openPreviewBlock() {
        const preview = this.getPreview();
        let block;
        let carousel;
        if (!preview)
            return;
        carousel = this.getCarousel();
        block = carousel.getBlock();
        if (block.isLicensedBlock)
            return block.preview();
        const data = block.serialize();
        let licensedBlock;
        Ext.apply(data, carousel.getValues());
        data.xtype = 'view-purchase-licensed-block';
        data.licensingOptions = this.getValues();    // @TODO count property is missing here.
        // @TODO count property is missing here.
        CJ.LoadBar.run();
        CJ.Block.load(preview.docId, {
            scope: this,
            success(response) {
                Ext.factory(data).showPreview(response.ret, { isUrlLessHistoryMemeber: true });
            },
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    /**
     * loads preview-block and shows it in editor.
     * @return {undefined}
     */
    editPreview() {
        const docId = this.getPreview().docId;
        CJ.LoadBar.run();
        CJ.Block.load(docId, {
            scope: this,
            success: this.onLoadPreviewSuccess,
            callback: this.onLoadPreviewCallback
        });
    },
    /**
     * opens an light-editor to edit preview-block.
     * @param {Object} response
     * @return {undefined}
     */
    onLoadPreviewSuccess(response) {
        const block = response.ret;
        block.xtype = 'view-purchase-preview-block';
        Ext.factory(block).setEditing(true);
    },
    /**
     * @return {undefined}
     */
    onLoadPreviewCallback() {
        CJ.LoadBar.finish();
    },
    /**
     * opens an editor to create preview-block for license container.
     * @return {undefined}
     */
    createPreview() {
        Ext.factory({
            xtype: 'view-block-edit-defaults-light-popup',
            block: {
                xtype: 'view-purchase-preview-block',
                userInfo: CJ.User.getInfo(),
                docVisibility: 'public',
                listeners: {
                    saved: this.onPreviewSaved,
                    scope: this
                }
            }
        });
    },
    /**
     * @param {CJ.core.view.BaseBlock} block
     * @return {undefined}
     */
    onPreviewSaved(block) {
        this.setPreview({ docId: block.getDocId() });
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        return Ext.apply({
            formTitle: CJ.t('view-publish-license-form-title'),
            priceTitle: CJ.t('view-publish-license-price-title'),
            durationTitle: CJ.t('view-publish-license-duration-title'),
            descriptionTitle: CJ.t('view-publish-license-description-title'),
            previewButton: CJ.t('view-publish-license-preview-button'),
            editButton: CJ.t('view-publish-license-edit-button'),
            createButton: CJ.t('view-publish-license-create-button'),
            price: CJ.Utils.formatPrice(this.getPrice() || ''),
            bundled: this.getBundled(),
            bundlePrice: CJ.Utils.formatPrice(this.getBundlePrice() || ''),
            bundleQuantity: this.getBundleQuantity(),
            sellBundle: CJ.t('view-purchase-license-sell-bundle'),
            sellIndividual: CJ.t('view-purchase-license-sell-individual'),
            bundleQuantityTitle: CJ.t('view-purchase-license-sell-bundle-quantity-title'),
            bundlePriceTitle: CJ.t('view-purchase-license-sell-bundle-price-title'),
            additionalLicensePriceTitle: CJ.t('view-purchase-license-sell-additional-price'),
            promoCodesTitle: CJ.t('view-purchase-license-promo-codes-title'),
            promoCodesButton: CJ.t('view-purchase-license-promo-codes-button')
        }, data);
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {Object} config
     * @param {CJ.core.view.LightSegmentedButton} oldSelect
     * @return {CJ.core.view.LightSegmentedButton}
     */
    applyDurationSelect(config, oldSelect) {
        if (oldSelect)
            oldSelect.destroy();
        if (!config)
            return;
        this.getData();
        return Ext.factory(Ext.apply({
            renderTo: this.element.dom.querySelector('.d-duration-placeholder'),
            xtype: 'view-light-segmented-button',
            cls: 'd-duration-select',
            pressed: this.getPeriod() || 6,
            buttons: [
                {
                    text: CJ.t('view-publish-license-form-duration-6-months'),
                    value: 6
                },
                {
                    text: CJ.t('view-publish-license-form-duration-1-year'),
                    value: 12
                }
            ]
        }, config));
    },
    /**
     * @param {Object} preview
     */
    updatePreview(preview) {
        this.element.swapCls('d-has-preview', null, !!preview);
        if (!preview)
            return;    // carouse doesn't exist on creation.
        // carouse doesn't exist on creation.
        fastdom.write(this.validate, this);
    },
    /**
     * @return {Object}
     */
    getValues() {
        const node = this.element.dom;
        let values;
        values = {
            price: +node.querySelector('#price').value,
            period: this.getDurationSelect().getValue(),
            preview: this.getPreview(),
            vouchers: this.getVouchers() || []
        };
        if (this.getActiveTab() == 'bundle')
            Ext.apply(values, {
                bundled: true,
                bundlePrice: +node.querySelector('#bundlePrice').value,
                bundleQuantity: +node.querySelector('#bundleQuantity').value,
                price: +node.querySelector('#additionalLicensePrice').value
            });
        return values;
    },
    /**
     * @return {Ext.Component}
     */
    getCarousel() {
        return this.getVisibilitySelect().getCarousel();
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setDurationSelect(null);
        this.setVisibilitySelect(null);
    }
});