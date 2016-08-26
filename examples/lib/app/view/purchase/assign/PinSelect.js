import 'app/core/view/Component';

/**
 * Defines a component that allows a person who purchased many licenses to print pin-codes which will be used by
 * students to access paid content.
 */
Ext.define('CJ.view.purchase.assign.PinSelect', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-assign-pin-select',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config) {
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-pin-select-popup',
                closeOnTapSelectors: '.d-popup-inner',
                title: '',
                content: { xtype: this.xtype }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} type
         */
        type: 'light',
        /**
         * @cfg {String} cls
         */
        cls: 'd-purchase-assign-pin-select d-scroll',
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-print-button\'>{print}</div>', '<div class=\'d-title\'>{title}</div>', '<div class=\'d-url\'>{url}</div>', '<span class=\'d-purchased\'>{purchasedTitle} {purchasedDate}</span>', '<span class=\'d-point\'>&bull;</span>', '<span class=\'d-expires\'>{expiresTitle} {expiresDate}</span>', '<div class=\'d-items\'>', '<tpl for=\'pins\'>', '<tpl if=\'(xindex-1) % 2 == 0\'>', '<tpl if=\'xindex != 1\'></div></tpl>', '<div class=\'d-row d-hbox\'>', '</tpl>', '<div class=\'d-item\'>', '<span class=\'d-index\'>{[xindex]}</span>', '<span class=\'d-code\'>{pin}</span>', '<tpl if=\'licensee\'>', '<span class=\'d-user\'>{licensee.name}</span>', '<span class=\'d-tag\'>{licensee.username}</span>', '</tpl>', '</div>', '</tpl>', '</div>', '</div>')
    },
    constructor() {
        this.callParent(args);
        this.load();
        this.element.on('tap', this.print, this, { delegate: '.d-print-button' });
    },
    /**
     * prints pin codes as PDF file.
     * @return {undefined}
     */
    print() {
        CJ.PdfPrinter.print('pins', this.getData());
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        const purchased = Ext.Date.parse(data.purchased, 'Y-m-d h:i:s'), expires = Ext.Date.parse(data.expires, 'Y-m-d h:i:s');
        return Ext.apply(data, {
            purchasedTitle: CJ.t('view-purchase-assign-pin-select-purchased'),
            expiresTitle: CJ.t('view-purchase-assign-pin-select-expires'),
            purchasedDate: Ext.Date.format(purchased, 'Y/d/m'),
            expiresDate: Ext.Date.format(expires, 'Y/d/m'),
            print: CJ.t('view-purchase-assign-pin-select-print')
        });
    },
    /**
     * @param {Boolean} state
     */
    updateLoading(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-loading');
    },
    /**
     * @return {undefined}
     */
    load() {
        const id = CJ.License.getLicense().id;
        this.setLoading(true);
        CJ.License.loadPins(id, {
            scope: this,
            success: this.onLoadPinsSuccess,
            callback: this.onLoadPinsCallback
        });
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onLoadPinsSuccess(response) {
        this.setData(response.ret);
    },
    /**
     * @return {undefined}
     */
    onLoadPinsCallback() {
        this.setLoading(false);
    }
});