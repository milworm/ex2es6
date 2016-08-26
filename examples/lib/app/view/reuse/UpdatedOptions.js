import 'Ext/Container';

Ext.define('CJ.view.reuse.UpdatedOptions', {
    extend: 'Ext.Container',
    alias: 'widget.view-reuse-updated-options',
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-menu-items',
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {Ext.Component} block
         */
        block: null,
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null
    },
    /**
     * @param {Array} items
     */
    applyItems(items) {
        items = [{
                cls: 'd-button',
                html: CJ.t('view-block-popup-reuse-updated-update'),
                type: 'light',
                xtype: 'core-view-component',
                listeners: {
                    tap: {
                        scope: this,
                        fn: this.onUpdateButtonTap,
                        element: 'element'
                    }
                }
            }];
        return this.callParent(args);
    },
    /**
     * will be called when user taps on update-button
     */
    onUpdateButtonTap() {
        if (!this.getBlock().isQuestionChanged())
            return this.doBlockUpdate();
        const title = 'view-block-popup-reuse-update-confirm-title', message = 'view-block-popup-reuse-update-confirm-body';
        CJ.confirm(title, message, function (result) {
            this.getPopup().hide();
            if (result == 'yes')
                this.doBlockUpdate();
        }, this);
    },
    /**
     * updates current block with updated content made by block's creator
     */
    doBlockUpdate() {
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'reuse_update',
                id: this.getBlock().getDocId()
            },
            success: this.onReuseUpdateSuccess,
            failure: this.onReuseUpdateFailure,
            scope: this
        });
    },
    /**
     * @param {Object} response
     */
    onReuseUpdateSuccess(response) {
        CJ.feedback();
        let data = response.ret;
        this.getBlock().each(block => {
            data = Ext.applyIf(data, {
                question: null,
                // don't have question, when user removed it. 
                listeners: block.initialConfig.listeners
            });
            block.reinit(data);
        });
        this.fireEvent('update');
        this.getPopup().hide();
    },
    /**
     * 
     */
    onReuseUpdateFailure() {
        CJ.feedback(CJ.t('msg-feedback-failure'));
    }
});