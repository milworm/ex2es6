import 'app/core/view/Popup';

/**
 * Defines a popup that allows users to change an id of feedback block.
 */
Ext.define('CJ.view.feedback.IdPopup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-feedback-id-popup',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         */
        show(config) {
            return Ext.factory(Ext.apply({
                xtype: this.xtype,
                title: CJ.t('view-feedback-id-popup'),
                actionButton: { text: CJ.t('view-feedback-id-popup-submit') }
            }, config));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} blockUser
         */
        blockUser: null,
        /**
         * @cfg {Number} blockId
         */
        blockId: null,
        /**
         * @cfg {Number} requestId
         */
        requestId: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-feedback-id-popup',
        /**
         * @cfg {Object} content
         */
        content: {
            xtype: 'core-view-component',
            type: 'light',
            html: '<input type=\'text\' autofocus=\'autofocus\' class=\'d-input\' />'
        }
    },
    constructor() {
        this.callParent(args);
        this.element.on('input', this.onChange, this, {
            delegate: '.d-input',
            buffer: 250
        });
    },
    /**
     * @param {Number} id
     */
    updateBlockId(id) {
        if (this.initialized)
            return;
        this.element.dom.querySelector('.d-input').value = id;
    },
    /**
     * @param {Ext.Evented} e
     */
    onChange(e) {
        this.setBlockId(null);
        if (!this.validate())
            return this.abort();
        const value = this.getRealValue();
        let request;
        request = CJ.Block.load(value, {
            scope: this,
            success: this.onRequestSuccess,
            callback: this.onRequestCallback
        });
        this.setRequestId(request.id);
        this.setLoading(true);
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onRequestSuccess(response) {
        response = response.ret;
        const xtype = response.xtype, xtypes = [
                CJ.view.block.DefaultBlock.xtype,
                CJ.view.feedback.block.Block.xtype
            ];
        if (xtypes.indexOf(xtype) == -1)
            return CJ.feedback('view-feedback-id-popup-wrong-id');
        this.setBlockId(this.getRealValue());
        this.setBlockUser(response.userInfo.user);
    },
    /**
     * @return {undefined}
     */
    onRequestCallback() {
        this.setLoading(false);
    },
    /**
     * @return {Boolean}
     */
    validate() {
        const result = !Ext.isEmpty(this.getRealValue());
        this.element[result ? 'removeCls' : 'addCls']('d-invalid');
        return result;
    },
    /**
     * @param {Number} requestId
     */
    abort() {
        this.setLoading(false);
        CJ.Ajax.abort(this.getRequestId());
    },
    /**
     * @return {String}
     */
    getRealValue() {
        return this.element.dom.querySelector('.d-input').value;
    },
    /**
     * docId and user-tag
     * @return {Object}
     */
    getValues() {
        let docId = this.getBlockId(), user = this.getBlockUser();
        if (!docId) {
            docId = this.initialConfig.docId;
            user = this.initialConfig.user;
        }
        if (!docId)
            return null;
        return {
            docId,
            user
        };
    }
});