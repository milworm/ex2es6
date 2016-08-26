import 'app/core/view/Popup';

Ext.define('CJ.view.publish.Popup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-popup',
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
        /**
         * @cfg {String} layout
         */
        layout: 'light',
        /**
         * @cfg {Boolean} fitMode
         */
        fitMode: true,
        /**
         * @cfg {Boolean} actionButton
         */
        actionButton: false,
        /**
         * @cfg {Number} showAnimationTime
         */
        showAnimationTime: 1000,
        /**
         * @cfg {String} cls
         */
        cls: 'd-popup d-publish-popup',
        /**
         * @cfg {Ext.XTemplate} titleBarTpl
         */
        titleBarTpl: Ext.create('Ext.Template', '<div class=\'d-counter\'>', '<span class=\'d-index\'>{index}</span> / <span class=\'d-total\'>{total}</span>', '</div>', '<div class=\'title\'>{title}</div>', '<div class=\'d-popup-close-button\'></div>', { compiled: true })
    },
    /**
     * Initialize title bar container.
     * @param {Object/Boolean} config
     * @returns {Ext.Toolbar/Boolean}
     */
    applyTitleBar(config) {
        if (!config)
            return false;
        config = Ext.apply({
            xtype: 'core-view-component',
            cls: 'd-title-bar d-title-bar-standart',
            type: 'light',
            tpl: this.getTitleBarTpl()
        }, config);
        return Ext.factory(config);
    },
    /**
     * @param {Ext.Component} newBar
     * @param {Ext.Component} oldBar
     * @return {undefined}
     */
    updateTitleBar(newBar, oldBar) {
        if (oldBar)
            oldBar.destroy();
        if (newBar)
            this.insert(0, newBar);
    },
    /**
     * @param {Object} data
     * @param {Number} data.index
     * @param {String} data.title
     */
    changeTitleBar(newData) {
        const component = this.getTitleBar(), oldData = component.getData() || {};
        component.setData(Ext.apply(oldData, newData));
    }
});