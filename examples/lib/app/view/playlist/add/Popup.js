import 'app/core/view/Popup';
import 'app/view/playlist/add/ToExisting';
import 'app/view/playlist/add/ToNew';

/**
 * The class provides popup for adding blocks to playlists.
 */
Ext.define('CJ.view.playlist.add.Popup', {
    /**
     * @inheritdoc
     */
    extend: 'CJ.core.view.Popup',
    /**
     * @inheritdoc
     */
    xtype: 'view-playlist-add-popup',
    /**
     * @constant {Number} CONTENT_MAX_HEIGHT 
     */
    CONTENT_MAX_HEIGHT: 500,
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-playlist-add-popup',
        /**
         * @inheritdoc
         */
        title: 'add-to-playlist-popup-title',
        /**
         * @inheritdoc
         */
        actionButton: true,
        /**
         * @cgf {Boolean} addToExisting
         * If true, the block will be added to existing playlists,
         * to new playlist otherwise.
         */
        addToExisting: null,
        /**
         * @cfg {CJ.view.block.DefaultBlock} block
         * The block that will be added to playlists.
         */
        block: null
    },
    constructor() {
        this.callParent(args);
        this.setContent({
            maxHeight: this.CONTENT_MAX_HEIGHT,
            xtype: 'view-playlist-add-to-existing',
            block: this.getBlock()
        });
        this.getActionButton().setHtml(CJ.app.t('add-to-playlist-popup-submit-text-add'));
    },
    /**
     * Applies adding method.
     * @param {Boolean} config
     */
    applyAddToExisting(config) {
        let contentXType, actionButtonText;
        if (config) {
            contentXType = 'view-playlist-add-to-existing';
            actionButtonText = CJ.t('add-to-playlist-popup-submit-text-add');
        } else {
            contentXType = 'view-playlist-add-to-new';
            actionButtonText = CJ.t('add-to-playlist-popup-submit-text-create');
        }
        this.animateSwitch(function () {
            this.setContent({
                maxHeight: 0,
                xtype: contentXType,
                block: this.getBlock()
            });
            this.getActionButton().setHtml(actionButtonText);
            Ext.defer(function () {
                this.getContent().setMaxHeight(this.CONTENT_MAX_HEIGHT);
            }, 1, this);
        });
    },
    /**
     * Animates the switching between adding methods.
     * Runs callback function when the content wrapper is collapsed.
     * @param {Function} callback
     */
    animateSwitch(callback) {
        const content = this.getContent();
        if (content)
            content.setMaxHeight(0);
        Ext.defer(callback, 400, this);    // 500 is animation time
    }
});