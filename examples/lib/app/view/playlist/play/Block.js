import 'app/view/block/DefaultBlock';
import 'app/view/playlist/play/BlockOptions';

Ext.define('CJ.view.playlist.play.Block', {
    extend: 'CJ.view.block.DefaultBlock',
    xtype: 'view-playlist-play-block',
    /**
     * @property {Boolean} isPlaylistPlayBlock
     */
    isPlaylistPlayBlock: true,
    config: { playlist: null },
    showOptions() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-popup-options-title',
            cls: 'd-menu-popup',
            layout: 'light',
            content: {
                xtype: 'view-playlist-play-block-options',
                block: this
            }
        });
    },
    onContentUpdatedIconTap(e) {
        e.stopEvent();
        Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-menu-popup',
            title: 'block-popup-reuse-updated-title',
            description: CJ.app.t('block-popup-reuse-updated-description'),
            content: {
                xtype: 'view-reuse-updated-options',
                block: this
            }
        });
    },
    onAssignSuccess() {
        this.callParent(args);
        CJ.StreamHelper.adjustContaining(this.clone());
    },
    /**
     * @param {String} mode
     * @return {Object}
     */
    serialize() {
        const config = this.callParent(args);
        config.xtype = 'view-block-default-block';
        return config;
    },
    /**
     * @return {undefined}
     */
    onContentTap: Ext.emptyFn
});