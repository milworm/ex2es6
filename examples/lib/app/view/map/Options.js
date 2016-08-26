import 'app/view/block/options/Default';
import 'app/view/block/Assign';

Ext.define('CJ.view.map.Options', {
    extend: 'CJ.view.block.options.Default',
    xtype: 'view-map-options',
    config: {
        addToPlaylistButton: false,
        /**
         * @cfg {Boolean} editButton
         */
        editButton: !Ext.os.is.Phone,
        /**
         * @cfg {Object|Boolean} buyMoreLicensesButton
         */
        buyMoreLicensesButton: true
    },
    onEditButtonTapped() {
        this.getBlock().setState('edit');
    }
});