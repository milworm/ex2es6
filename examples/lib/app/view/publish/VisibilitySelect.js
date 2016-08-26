import 'Ext/Component';
import 'app/view/publish/LicenseForm';

/**
 * Defines a component that allows user to select the visibility-property of a block [public, private, portal] or
 * setup a price.
 */
Ext.define('CJ.view.publish.VisibilitySelect', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-visibility-select',
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
         * @cfg {CJ.core.view.BaseBlock} block
         */
        block: null,
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
        tpl: Ext.create('Ext.Template', '<div class=\'d-visibility-select-inner\'>', '<div class=\'d-visibility-tab-bar d-tab-bar\'>', '<span class=\'d-title\' data-type=\'priced\'>{forSale}</span>', '<span class=\'d-title\' data-type=\'shared\'>{shared}</span>', '</div>', '<div class=\'d-tab-content\'>', '<div class=\'d-tab d-tab-priced\' data-type=\'priced\'></div>', '<div class=\'d-tab d-tab-shared\' data-type=\'shared\'></div>', '</div>', '</div>', { compiled: true }),
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} visibility
         */
        visibility: null,
        /**
         * @cfg {Object} licensingOptions
         */
        licensingOptions: null,
        /**
         * @cfg {HTMLElement} activeTab
         */
        activeTab: null,
        /**
         * @cfg {Ext.Component} visibilityField
         */
        visibilityField: {},
        /**
         * @cfg {Ext.Component} licenseForm
         */
        licenseForm: {}
    },
    constructor() {
        this.callParent(args);
        if (!this.getBlock().canChangePermissions())
            this.setDisabled(true);
        else if (!CJ.User.hasLicensedDocVisibility())
            this.element.addCls('d-tab-bar-hidden');
    },
    /**
     * @param {String} visibility
     * @return {String}
     */
    applyVisibility(visibility) {
        return visibility || CJ.User.get('defaultDocVisibility');
    },
    /**
     * @param {String} visibility
     */
    updateVisibility(visibility) {
        if (visibility == 'licensed')
            this.setActiveTab('priced');
        else
            this.setActiveTab('shared');
    },
    initElement() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Object} config
     * @return {CJ.core.view.LightSegmentedField}
     */
    applyVisibilityField(config) {
        if (!config)
            return false;
        const visibilities = CJ.User.getAllowedDocumentVisibilities();
        config = Ext.apply({
            xtype: 'view-light-segmented-button',
            cls: 'd-visibility-form',
            name: 'visibility',
            pressed: this.getVisibility(),
            fieldLabel: CJ.t('view-block-visibility-select-title'),
            buttons: [
                {
                    text: CJ.t('block-shareid-public'),
                    value: 'public',
                    cls: 'd-public',
                    hidden: !visibilities['public']
                },
                {
                    text: CJ.t('block-shareid-portal'),
                    value: 'portal',
                    cls: 'd-portal',
                    hidden: !visibilities['portal']
                },
                {
                    text: CJ.t('block-shareid-private'),
                    value: 'private',
                    cls: 'd-private',
                    hidden: !visibilities['private']
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
     * @param {Object} config
     * @param {Object|Ext.Component} oldLicenseForm
     * @return {Ext.Component}
     */
    applyLicenseForm(config, oldLicenseForm) {
        if (oldLicenseForm)
            oldLicenseForm.destroy();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-publish-license-form',
            renderTo: this.element.dom.querySelector('.d-tab-priced'),
            visibilitySelect: this
        }, config, this.getLicensingOptions()));
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        data = Ext.apply({
            forSale: CJ.t('view-publish-visibility-select-for-sale'),
            shared: CJ.t('view-publish-visibility-select-shared')
        }, data);
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        const title = e.getTarget('.d-visibility-tab-bar .d-title', 5);
        if (title)
            this.setActiveTab(CJ.getNodeData(title, 'type'));
    },
    /**
     * @param {String} newTab
     * @param {String} oldTab
     * @return {undefined}
     */
    updateActiveTab(newTab, oldTab) {
        const element = this.element.dom;
        if (oldTab) {
            element.querySelector('.d-tab-bar .d-title.d-active').classList.remove('d-active');
            element.querySelector('.d-tab-content .d-tab.d-active').classList.remove('d-active');
        }
        if (newTab) {
            const titleSelector = CJ.tpl('.d-tab-bar .d-title[data-type=\'{0}\']', newTab), contentSelector = CJ.tpl('.d-tab-content .d-tab[data-type=\'{0}\']', newTab);
            element.querySelector(titleSelector).classList.add('d-active');
            element.querySelector(contentSelector).classList.add('d-active');
        }
        if (this.initialized)
            fastdom.write(this.onActiveTabChanged, this);
    },
    /**
     * @return {undefined}
     */
    onActiveTabChanged() {
        if (this.getActiveTab() == 'priced')
            this.getLicenseForm().validate();
        else
            this.getCarousel().allowSubmit(true);
    },
    /**
     * @return {undefined}
     */
    applyChanges() {
        if (this.getDisabled())
            return;
        this._visibility = this.getVisibilityField().getValue();
        this._licensingOptions = this.getLicenseForm().getValues();
        if (this.getActiveTab() == 'priced') {
            if (this._licensingOptions.price > 0) {
                this._visibility = 'licensed';
            } else {
                this._visibility = CJ.User.getDefaultDocVisibility();
            }
        }
        return this;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setVisibilityField(null);
        this.setLicenseForm(null);
    }
});