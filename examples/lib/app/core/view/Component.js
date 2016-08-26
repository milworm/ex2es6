import 'Ext/Component';

Ext.define('CJ.core.view.Component', {
    extend: 'Ext.Component',
    xtype: 'core-view-component',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {Number} requestId
         * Will be user to save an active request id, in case when a component is able to request a data.
         */
        requestId: null
    },
    updateHtml(html) {
        let element;
        if (this.initialConfig.type == 'light' || this.config.type == 'light') {
            element = this.element;
        } else
            element = this.getInnerHtmlElement();
        if (Ext.isElement(html)) {
            element.setHtml('');
            element.append(html);
        } else {
            element.setHtml(html);
        }
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.setHtml(this.getTpl().apply(data));
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
    abort() {
        CJ.Ajax.abort(this.getRequestId());
    }
});