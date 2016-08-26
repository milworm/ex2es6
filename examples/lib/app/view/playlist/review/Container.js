import 'Ext/Container';

/**
 * The class provides component that display a playlist in the review mode.
 */
Ext.define('CJ.view.playlist.review.Container', {
    extend: 'Ext.Container',
    xtype: 'view-playlist-review-container',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-playlist-review',
        /**
         * @inheritdoc
         */
        layout: {
            type: 'vbox',
            align: 'center'
        },
        /**
         * @config {CJ.core.view.Popup} popup
         * Instance of the popup thar wraps this component.
         */
        popup: null,
        /**
         * @config {} block
         */
        block: null,
        /**
         * @config {Number} activeItemIndex
         * Index of the active item.
         */
        activeItemIndex: 0,
        /**
         * @config {Ext.Button} backButton
         * Instance of the back button.
         */
        backButton: false,
        /**
         * @config {CJ.view.playlist.review.Navi} navi
         * Instance of the navi component.
         */
        navi: true,
        /**
         * @config {CJ.view.playlist.review.List} list
         * Instance of the list component.
         */
        list: true,
        /**
         * @inheritdoc
         */
        control: {
            '[isPlaylistReviewBlock]': {
                blocktap: 'onBlockTap',
                blockedit: 'onBlockEdit',
                blockremove: 'onBlockRemove'
            }
        }
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        this.getPopup().on('actionbuttontap', this.onPublish, this);
    },
    /**
     * Applies and initializes the back button.
     * @param {Boolean/Object} config
     * @returns {Ext.Button}
     */
    applyBackButton(config, button) {
        if (button && button.isComponent)
            button.destroy();
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            cls: 'back-button',
            text: 'popup-back-button',
            scope: this,
            handler: this.onBackButtonTap,
            renderTo: this.getPopup().getTitleBar().element
        });
        return Ext.factory(config, null, this.getBackButton());
    },
    /**
     * Applies and initializes the navigation component.
     * @param {Boolean/Object} config
     * @returns {CJ.view.playlist.review.Navi}
     */
    applyNavi(config) {
        if (config == false)
            return false;
        if (config == true)
            config = {};
        Ext.applyIf(config, {
            xtype: 'view-playlist-review-navi',
            block: this.getBlock(),
            listeners: {
                tap: this.setActiveItemIndex,
                moveitem: this.onMoveItem,
                add: this.onAddItem,
                scope: this
            }
        });
        return Ext.factory(config, null, this.getNavi());
    },
    /**
     * Updates the navigation component.
     */
    updateNavi: Ext.Component.processUpdateComponent,
    /**
     * Applies and initializes the list component.
     * @param {Boolean/Object} config
     * @returns {CJ.view.playlist.review.List}
     */
    applyList(config) {
        if (config == false)
            return false;
        if (config == true)
            config = {};
        Ext.applyIf(config, {
            xtype: 'view-playlist-review-list',
            flex: 1,
            block: this.getBlock()
        });
        return Ext.factory(config, null, this.getList());
    },
    /**
     * Updates the list component.
     */
    updateList: Ext.Component.processUpdateComponent,
    /**
     * Applies and sets active item index.
     * @param {Number} index
     * @returns {Number}
     */
    applyActiveItemIndex(index) {
        if (this.rendered) {
            this.getNavi().setNaviActiveItem(index);
            this.getList().setListActiveItem(index);
        }
        return index;
    },
    /**
     * Handler of the event 'blocktap'.
     * Navigates to the target block.
     * @param {Number} index
     */
    onBlockTap(index) {
        if (index != this.getActiveItemIndex()) {
            this.setActiveItemIndex(index);
        }
    },
    onBlockEdit(index) {
        const block = this.getBlock();
        block.setPendingIndex(index);
        block.setState('edit');
    },
    /**
     * Handler of the event 'blockremove' of the list component.
     * @param {Number} index
     */
    onBlockRemove(index) {
        const block = this.getBlock();
        const items = block.getPlaylist();
        const list = this.getList();
        let activeItemIndex = this.getActiveItemIndex();
        const isCurrentIndex = index == activeItemIndex;
        const isLastIndex = index == items.length - 1;
        items.splice(index, 1);
        list.removeAt(index);
        this.getNavi().setData({ items });
        if (items.length == 0)
            return;
        if (index < activeItemIndex || isCurrentIndex && isLastIndex) {
            --activeItemIndex;
        }
        this.setActiveItemIndex(activeItemIndex);
    },
    /**
     * Handler of the event 'moveitem' of the navigation component.
     * @param {Number} fromIndex
     * @param {Number} toIndex
     */
    onMoveItem(fromIndex, toIndex) {
        const block = this.getBlock(), items = block.getPlaylist(), activeItemIndex = this.getActiveItemIndex(), activeItem = items[activeItemIndex], sourceItem = items[fromIndex];
        items.splice(fromIndex, 1);
        items.splice(toIndex, 0, sourceItem);
        this.getList().moveItem(fromIndex, toIndex);
        this.setActiveItemIndex(items.indexOf(activeItem));
    },
    onAddItem(index) {
        var block = this.getBlock();
        if (Ext.isNumber(index))
            block.insertItem(index);
        var block = this.getBlock();
        block.setPendingIndex(index);
        block.setState('edit');
    },
    onBackButtonTap() {
        const block = this.getBlock();
        if (block.getLength() == 1)
            block.setPendingIndex(0);
        block.setState('edit');
    },
    /**
     * Handler on the event 'actionbuttontap' of the popup component.
     * Opens the publish popup component.
     */
    onPublish() {
        this.getBlock().publish();
        return false;
    }
});