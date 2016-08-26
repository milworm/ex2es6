import 'app/core/view/Component';

/**
 * Represents a simple list of my groups.
 */
Ext.define('CJ.view.group.Select', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-group-select',
    /**
     * @property {Boolean} isGroupSelect
     */
    isGroupSelect: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Number} requestId
         */
        requestId: null,
        /**
         * @cfg {String} type
         */
        type: 'light',
        /**
         * @cfg {String} cls
         */
        cls: 'd-group-select',
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<tpl for=\'.\'>', '<div class="d-item d-hbox d-vcenter" data-index="{[xindex]}">', '<div class="d-user-icon" style="{[ CJ.Utils.makeIcon(values.smallIcon) ]}"></div>', '<div class="d-title">{name}</div>', '</div>', '</tpl>')
    },
    constructor(config undefined {}) {
        this.callParent(args);
        this.load(config.loadParams);
    },
    /**
     * @param {Object} config
     * @param {String} config.filter
     * @return {undefined}
     */
    load(config) {
        this.setLoading(true);
        const config = config || {}, params = {};
        if (config.filter)
            params.filter = config.filter;
        const request = CJ.Group.listOwned({
            params,
            scope: this,
            success: this.onLoadSuccess,
            callback: this.onLoadCallback
        });
        this.setRequestId(request.id);
    },
    /**
     * @return {undefined}
     */
    abort() {
        CJ.Ajax.abort(this.getRequestId());
    },
    /**
     * @param {Object} response
     */
    onLoadSuccess(response) {
        this.setData(response.ret.items);
    },
    /**
     * @return {undefined}
     */
    onLoadCallback() {
        this.setLoading(false);
    }
});