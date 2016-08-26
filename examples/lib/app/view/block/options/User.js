import 'app/view/block/options/Base';

Ext.define('CJ.view.block.options.User', {
    extend: 'CJ.view.block.options.Base',
    xtype: 'view-block-options-user',
    config: {
        editButton: false,
        deleteButton: false,
        permissionsButton: false
    }
});