import 'app/view/block/options/Default';
import 'app/view/playlist/AmtHistory';

Ext.define('CJ.view.playlist.Options', {
    extend: 'CJ.view.block.options.Default',
    xtype: 'view-playlist-options',
    config: {
        /**
         * @cfg {Object|Boolean} addToCourseButton
         */
        addToCourseButton: true,
        /**
         * @cfg {Boolean} amtButton
         */
        amtButton: true,
        /**
         * @cfg {Object|Boolean} buyMoreLicensesButton
         */
        buyMoreLicensesButton: true
    },
    /**
     * @param {Object|Button} config
     * @return {Object}
     */
    applyAmtButton(config) {
        if (!config || !CJ.User.isAmtPortalAdmin())
            return false;
        return this.createButton(Ext.apply({
            text: 'playlist-popup-options-amt-button',
            cls: 'd-button d-icon-amt',
            handler: this.onAmtButtonTap
        }, config));
    },
    onEditButtonTapped() {
        this.getBlock().setState('review');
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    onAmtButtonTap() {
        CJ.view.playlist.AmtHistory.popup({ playlistId: this.getBlock().getDocId() });
    }
});