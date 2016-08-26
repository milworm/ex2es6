import 'app/core/view/popup/Options';

Ext.define('CJ.view.group.RequestAccess', {
    extend: 'CJ.core.view.popup.Options',
    alias: 'widget.view-group-request-access',
    statics: {
        /**
         * @param {Object} contentConfig
         * @param {CJ.view.group.Block} contentConfig.block
         * @return {CJ.core.view.Popup}
         */
        popup(contentConfig) {
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'group-request-access',
                title: 'view-group-request-access-title',
                description: CJ.app.t('view-group-request-access-description'),
                content: Ext.apply({ xtype: 'view-group-request-access' }, contentConfig)
            });
        }
    },
    config: {
        /**
         * @cfg {Object} requestAccessButton
         */
        requestAccessButton: true
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyRequestAccessButton(config) {
        if (!config)
            return false;
        return this.createButton(Ext.apply({
            text: 'view-group-request-access-button',
            cls: 'd-button ',
            autoClosePopup: false,
            handler: this.onRequestAccessButtonTap
        }, config));
    },
    /**
     * @return {undefined}
     */
    onRequestAccessButtonTap() {
        CJ.request({
            rpc: {
                model: 'Group',
                method: 'join_group',
                id: this.getBlock().getDocId()
            },
            success: this.onRequestAccessSuccess,
            scope: this
        });
    },
    onRequestAccessSuccess() {
        this.fireEvent('success', this);
        this.getPopup().hide();
    }
});