import 'app/core/view/list/Base';
import 'app/view/playlist/review/Block';

/**
 * The class provides component that display items a playlist in the review mode.
 */
Ext.define('CJ.view.playlist.review.List', {
    extend: 'CJ.core.view.list.Base',
    xtype: 'view-playlist-review-list',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-block-list playlist-review',
        /**
         * @inheritdoc
         */
        scrollable: null,
        /**
         * @config {CJ.view.playlist.Block} block
         */
        block: null,
        /**
         * @config {Array} playlistItems
         * Array of the playlist items.
         */
        playlistItems: null,
        /**
         * @config {Number} activeItemIndex
         * Index of the active item.
         */
        activeItemIndex: 0,
        /**
         * @config {Number} itemWidth
         * Width of the playlist item block.
         */
        itemWidth: 290,
        /**
         * @config {Ext.util.Translatable} translator
         */
        translator: {}
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        const block = this.getBlock(), playlistItems = block.getPlaylist(), listItems = Ext.clone(playlistItems);
        this.renderItems(listItems);
    },
    applyTranslator(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        return Ext.factory(config, Ext.util.Translatable);
    },
    updateTranslator(translator) {
        if (translator)
            translator.setElement(this.innerElement);
    },
    beforeRenderItems(items) {
        Ext.each(items, item => {
            item.xtype = 'view-playlist-review-block';
        });
    },
    afterRenderItems(items) {
        this.callParent(args);
        this.setListActiveItem();
    },
    /**
     * Applies and sets active item index.
     * @param {Number} [index]
     * @returns {Number}
     */
    setListActiveItem(index) {
        index = Ext.isNumber(index) ? index : this.getActiveItemIndex();
        const itemWidth = this.getItemWidth(), offset = (itemWidth * (index + 1) - itemWidth * 0.5) * -1 + 3, currActiveItem = this.getAt(this.getActiveItemIndex()), destActiveItem = this.getAt(index);
        if (currActiveItem) {
            currActiveItem.removeCls('active');
            currActiveItem.scrollToTop();
        }
        if (destActiveItem) {
            destActiveItem.addCls('active');
        }
        this.getTranslator().translate(offset);
        this.setActiveItemIndex(index);
    },
    /**
     * Moves the item block from 'fromIndex' to 'toIndex' position.
     * @param {Number} fromIndex
     * @param {Number} toIndex
     */
    moveItem(fromIndex, toIndex) {
        this.insert(toIndex, this.getAt(fromIndex));
    }
});