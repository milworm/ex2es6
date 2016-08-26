import 'Ext/Component';

/**
 * Base class for all option's popups
 */
Ext.define('CJ.core.view.popup.Options', {
    extend: 'Ext.Component',
    alias: 'widget.core-view-popup-options',
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-menu-items d-scroll',
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Ext.XTemplate} buttonsTpl
         */
        buttonsTpl: Ext.create('Ext.XTemplate', '<tpl for=\'.\'>', '<div class=\'{cls} {disabledCls}\' data-index=\'{[ xindex - 1 ]}\'>{html}</div>', '</tpl>', { compiled: true }),
        /**
         * @cfg {Array} buttonsData
         */
        buttonsData: []
    },
    initialize() {
        this.callParent(args);
        this.on({
            tap: {
                element: 'element',
                fn: 'onButtonTap',
                delegate: '.d-button'
            }
        });
        this.element.setHtml(this.getButtonsTpl().apply(this.getButtonsData()));
    },
    /**
     * handles tapping on buttons
     * @param {Ext.Evented} e
     * @param {HTMLElement} node
     */
    onButtonTap(e, node) {
        const index = CJ.getNodeData(node, 'index'), config = this.getButtonsData()[index];
        if (config.disabled) {
            if (!CJ.User.isLogged())
                return CJ.view.login.Login.popup();
            return;
        }
        if (config.autoClosePopup)
            this.getPopup().hide();
        if (config.handler)
            config.handler.call(this);
    },
    /**
     * @param {Object} config
     * @param {Object} defaultConfig
     * @return {Ext.Component}
     */
    createButton(config) {
        config = Ext.apply({
            autoClosePopup: true,
            html: CJ.t(config.text),
            disabledCls: config.disabled ? 'x-item-disabled' : ''
        }, config);
        this.getButtonsData().push(config);
        return config;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setButtonsData(null);
        this.callParent(args);
    }
});