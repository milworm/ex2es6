import 'Ext/Container';

Ext.define('CJ.view.viewport.LanguageSelect', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Container',
    alias: 'widget.view-viewport-language-select',
    /**
     * @property {String} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @param {Object} config.listeners
         */
        popup(config) {
            return Ext.factory(Ext.apply({
                xtype: 'core-view-popup',
                cls: 'd-menu-popup',
                title: 'page-profilesettings-form-languages',
                content: { xtype: this.xtype }
            }, config));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-menu-items',
        /**
         * @cfg {Object} defaults
         */
        defaults: {
            xtype: 'core-view-component',
            type: 'light',
            cls: 'd-button'
        },
        /**
         * @cfg {Array} items
         */
        items: []
    },
    /**
     * @param {Array} items
     */
    applyItems(items) {
        items = [
            {
                html: CJ.app.t('fr'),
                value: 'fr'
            },
            {
                html: CJ.app.t('en'),
                value: 'en'
            }
        ];
        return this.callParent(args);
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this, { delegate: '.d-button' });
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        const id = e.getTarget().id, component = Ext.getCmp(id), popup = this.up('[isPopup]');
        popup.fireEvent('selected', component.config.value);
        popup.hide();
    }
});