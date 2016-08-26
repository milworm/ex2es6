import 'app/core/view/popup/Options';

/**
 * Defines a component to show repost-popup content.
 */
Ext.define('CJ.view.block.Repost', {
    extend: 'CJ.core.view.popup.Options',
    alias: 'widget.view-block-repost',
    statics: {
        /**
         * @param {Object} contentConfig
         */
        popup(contentConfig) {
            if (!CJ.User.isLogged())
                return CJ.view.login.Login.popup();
            Ext.factory({
                title: 'view-block-repost-title',
                xtype: 'core-view-popup',
                cls: 'd-menu-popup',
                content: Ext.apply({ xtype: 'view-block-repost' }, contentConfig)
            });
        }
    },
    config: {
        /**
         * @cfg {Object} repostToGroupButton
         */
        assignToGroupButton: {},
        /**
         * @cfg {Object} addToPlaylistButton
         */
        addToPlaylistButton: {},
        /**
         * @cfg {Object} assignToGroupsButton
         */
        saveToMyFeedButton: {},
        /**
         * @cfg {Object} copyButton
         */
        copyButton: {}
    },
    /**
     * @param {Object} config
     */
    applySaveToMyFeedButton(config) {
        if (!config)
            return false;
        const block = this.getBlock();
        if (block.isCourse)
            return;    // @TODO need to confirm with Ilian that this is a correct check
        // @TODO need to confirm with Ilian that this is a correct check
        if (CJ.User.isMineTags(block.getTags()))
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-repost-feed',
            cls: 'd-button d-icon-bookmark',
            handler: this.onSaveToMyFeedButtonTap
        }, config));
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyAssignToGroupButton(config) {
        const block = this.getBlock();
        if (block.isCourse) {
            if (!CJ.User.isMine(block))
                return false;
        }
        return this.createButton(Ext.apply({
            text: 'view-block-repost-group',
            cls: 'd-button d-icon-reuse',
            handler: this.onAssignToGroupButtonTap
        }, config));
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyAddToPlaylistButton(config) {
        if (this.getBlock().isCourse)
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-repost-playlist',
            cls: 'd-button d-icon-addtoplaylist',
            handler: this.onAddToPlaylistButtonTap
        }, config));
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    applyCopyButton(config) {
        const block = this.getBlock();
        if (!block.isCourse)
            return false;
        const link = block.getUrl(), button = this.createButton(Ext.apply({
                text: 'view-block-popup-repost-copy',
                cls: 'd-button d-icon-link'
            }, config));
        CJ.Clipboard.copy({
            cmp: this,
            delegate: '.d-icon-link',
            text: link
        });
        return button;
    },
    /**
     * opens assign popup
     */
    onAssignToGroupButtonTap() {
        CJ.view.block.Assign.popup({ block: this.getBlock() });
    },
    /**
     * opens addToPlaylist popup
     */
    onAddToPlaylistButtonTap() {
        Ext.factory({
            xtype: 'view-playlist-add-popup',
            block: this.getBlock()
        });
    },
    /**
     * opens SaveToMyFeed popup
     */
    onSaveToMyFeedButtonTap() {
        const tags = [CJ.User.get('user')];
        this.getBlock().assign(null, tags);
    }
});