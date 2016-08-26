import 'app/view/block/edit/defaults/Popup';
import 'app/view/course/edit/section/block/BottomBar';

/**
 * Defines a class that allows us to edit/create block in course section.
 */
Ext.define('CJ.view.course.edit.section.block.EditPopup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.edit.defaults.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-block-edit-popup',
    /**
     * @return {undefined}
     */
    refreshLabels() {
        if (this.getBlock().isPlaylist)
            this.refreshPlaylistLabels();
        else
            this.refreshDefaultBlockLabels();
    },
    /**
     * @return {undefined}
     */
    updateBlock() {
        this.callParent(args);
        this.addSavePlaylistButton();
    },
    /**
     * @return {undefined}
     */
    refreshPlaylistLabels() {
        let title = 'view-course-edit-section-block-edit-popup-title-create';
        const button = 'view-course-edit-section-block-edit-popup-button-save-many';
        if (!this.getBlock().isPhantom())
            title = 'view-course-edit-section-block-edit-popup-title-update';
        this.setTitle(CJ.t(title));
        this.getActionContainer().down('[isCreateButton]').setText(CJ.t(button));
    },
    /**
     * @return {undefined}
     */
    refreshDefaultBlockLabels() {
        let title = 'view-course-edit-section-block-edit-popup-title-create';
        const button = 'view-course-edit-section-block-edit-popup-button-save';
        const block = this.getBlock();
        if (block.isInstance && !block.isPhantom())
            title = 'view-course-edit-section-block-edit-popup-title-update';
        this.setTitle(CJ.t(title));
        this.getActionContainer().down('[isCreateButton]').setText(CJ.t(button));
    },
    /**
     * method adds new editor to current popup.
     * @return {CJ.view.playlist.edit.Editor}
     */
    addEditor() {
        this.setContent({
            xtype: 'view-block-edit-defaults-editor',
            editing: true,
            list: {
                xtype: 'core-view-list-editor',
                items: { xtype: 'view-tool-text' }
            },
            question: {}
        });
        return this.getContent();
    },
    /**
     * @return {CJ.view.block.playlist.Block}
     */
    createPlaylistBlock() {
        const originalBlock = this.getBlock();
        let block;
        if (originalBlock.isDefaultBlock) {
            block = this.convertBlockToPlaylist();
            block.setOriginalBlockDocId(originalBlock.getDocId());
        } else {
            block = this.convertDataToPlaylist();
            block.insertItem();
        }
        this.setBlock(block);
        return block;
    },
    /**
     * @return {CJ.view.playlist.Block}
     */
    convertBlockToPlaylist() {
        let block = this.getBlock();
        const data = block.serialize();
        let editor;    // user changed non-phantom default-block to playlist,
                       // so we need to keep all changes (locally).
                       // because, as it's a part of playlist, server will update it as 
                       // playlist item.
        // user changed non-phantom default-block to playlist,
        // so we need to keep all changes (locally).
        // because, as it's a part of playlist, server will update it as 
        // playlist item.
        block.setEditing(false);    // @TODO remove this in order to use the same editor.
        // @TODO remove this in order to use the same editor.
        editor = this.addEditor();
        block = {
            tags: data.tags,
            userInfo: data.userInfo,
            playlist: [data],
            xtype: 'view-course-edit-section-block-playlist-block',
            state: 'edit',
            editor,
            stateContainer: this
        };
        return Ext.factory(block);
    },
    /**
     * @return {CJ.view.playlist.Block}
     */
    convertDataToPlaylist() {
        const block = this.getBlock();
        Ext.apply(block, {
            xtype: 'view-course-edit-section-block-playlist-block',
            state: 'edit',
            editor: this.getContent(),
            stateContainer: this
        });
        return Ext.factory(block);
    },
    /**
     * @param {Object} config
     * @return {CJ.view.block.ContentBlock}
     */
    createDefaultBlock(config) {
        return Ext.factory(Ext.apply(config, {
            xtype: 'view-course-edit-section-block-default-block',
            editor: this.getContent(),
            editing: true
        }, config));
    },
    /**
     * @param {Ext.Button} button
     * @return {undefined}
     */
    onCreateTap(button) {
        if (!this.isActionAccessible())
            return;
        let block = this.getBlock();
        if (block.isPlaylist) {
            // save playlist as list of blocks.
            CJ.PublishCarousel.popup({
                block,
                tags: block.initialConfig.tags,
                staticTags: [CJ.User.get('user')],
                listeners: {
                    scope: this,
                    complete: this.publishManyBlocks
                }
            });
        } else {
            block = block.isBlock ? block : this.createDefaultBlock(block);
            block.publish();
        }
    },
    /**
     * @param {Object} values
     * @param {CJ.view.publish.Carousel} component
     */
    publishManyBlocks(values) {
        this.getContent().applyItemChanges(this.getActiveItemIndex());
        let block = this.getBlock();
        const categories = values.categories;
        const tags = values.tags;
        const initialBlock = this.initialConfig.block;
        const initialBlockDocId = initialBlock.isInstance && initialBlock.getDocId();
        let ref;
        Ext.each(block.getPlaylist(), item => {
            // user created many blocks from 1 single block.
            // so need to publish initialBlock and not the data.
            if (initialBlockDocId == item.docId) {
                block = initialBlock;
            } else {
                block = Ext.factory(Ext.apply(item, {
                    xtype: 'view-course-edit-section-block-default-block',
                    tags,
                    categories
                }));
            }
            block.ref = ref;
            ref = block.getDocId();
            CJ.fire('course.block.publish', block);
        }, this);
        this.hide();
    },
    /**
     * method will be called when popup changes it's editor.
     */
    onAnimateSlideEnd() {
        this.callParent(args);
        this.addSavePlaylistButton();
    },
    /**
     * @return {undefined}
     */
    addSavePlaylistButton() {
        const buttons = this.getActionContainer(), block = this.getBlock(), button = buttons.down('[isSavePlaylistButton]');
        if (!block.isPlaylist) {
            if (button)
                button.destroy();
            return;
        }
        if (button)
            return;
        buttons.add({
            xtype: 'button',
            flex: 1,
            text: CJ.t('view-course-edit-section-block-edit-popup-save-playlist'),
            isSavePlaylistButton: true,
            handler: this.onSavePlaylistButtonTap,
            scope: this
        });
    },
    /**
     * saves an editor as playlist.
     * @param {Ext.Button} button
     * @return {undefined}
     */
    onSavePlaylistButtonTap(button) {
        if (!this.isActionAccessible())
            return;
        this.getContent().applyItemChanges(this.getActiveItemIndex());
        this.getBlock().setState('review');
    }
});