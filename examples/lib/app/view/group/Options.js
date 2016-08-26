import 'app/view/block/options/Base';

/**
 * Defines a component to show set of options for group-block only.
 */
Ext.define('CJ.view.group.Options', {
    extend: 'CJ.view.block.options.Base',
    alias: 'widget.view-group-options',
    statics: {
        /**
         * simply shows current options-panel in a popup
         * @param {Object} config
         * @param {CJ.view.group.Block} config.block
         */
        popup(config) {
            Ext.factory({
                xtype: 'core-view-popup',
                title: 'view-group-options-title',
                cls: 'd-menu-popup',
                layout: 'light',
                content: {
                    xtype: this.xtype,
                    block: config.block
                }
            });
        }
    },
    config: {
        /**
         * @cfg {String} deleteConfirmationText
         */
        deleteConfirmationText: 'view-group-options-confirm-text',
        /**
         * @cfg {Ext.Button} linkButton
         */
        linkButton: true,
        /**
         * @cfg {Object|Boolean} pinToPortalButton
         */
        pinToPortalButton: true,
        /**
         * @cfg {Object|Boolean} unpinFromPortalButton
         */
        unpinFromPortalButton: true
    },
    onDeleteButtonTap() {
        Ext.factory({
            xtype: 'core-view-confirmation',
            title: 'view-group-remove-confirmation-title',
            description: 'view-group-remove-confirmation-description',
            attention: true,
            content: {
                data: {
                    buttons: [{
                            action: 'confirm',
                            text: 'view-group-remove-confirmation-button-text'
                        }]
                }
            },
            listeners: { confirm: this.deleteBlock.bind(this) }
        });
    },
    deleteBlock() {
        CJ.Group.destroy(this.getBlock().getDocId(), {
            scope: this,
            success: this.onDeleteBlockSuccess
        });
    },
    onDeleteBlockSuccess() {
        this.callParent(args);
        CJ.app.fireEvent('group.destroy', this.getBlock());
    }
});