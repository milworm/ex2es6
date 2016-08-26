import 'app/view/stream/list/Base';

/**
 * Defines a base class that we use to display list of items in stream-container.
 */
Ext.define('CJ.view.stream.list.User', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.stream.list.Base',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-stream-list-user',
    /**
     * @inheritdoc
     */
    renderNoContent() {
    }    // @TODO
,
    /**
     * @param {Array} items
     * @return {undefined}
     */
    prepareUserBlocks(items) {
        Ext.each(items, item => {
            Ext.apply(item, {
                xtype: 'view-block-user',
                docId: item.id,
                id: null
            });
        });
    },
    /**
     * @param {Array} items
     * @return {undefined}
     */
    beforeRenderItems(items) {
        this.callParent(args);
        this.prepareUserBlocks(items);
    },
    adjustContaining: Ext.emptyFN
});