import 'app/view/stream/list/Base';

/**
 * Defines a base class that we use to display list of items in stream-container.
 */
Ext.define('CJ.view.stream.list.Group', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.stream.list.Base',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-stream-list-group',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {String} tags
         * @param {Object} config
         * @return {undefined}
         */
        load(tags, config) {
            tags = tags.split(' ');
            const params = {};
            let userTag;
            for (let i = 0, tag; tag = tags[i]; i++) {
                if (CJ.Utils.getTagType(tag) == 'user') {
                    userTag = tag;
                    tags.splice(i--, 1);
                }
            }
            params.owner = userTag;
            params.member = userTag;
            params.tags = tags.join(' ');
            params.limit = CJ.StreamList.getPageSize();
            if (params.refMode != 'midpoint')
                params.limit *= 2;
            return CJ.Ajax.request(Ext.apply({
                rpc: {
                    model: 'Group',
                    method: 'search'
                },
                params
            }, config));
        }
    },
    /**
     * @param {CJ.view.group.Block} group
     * @return {undefined}
     */
    adjustContaining(group) {
        if (!group.isGroup)
            return;
        this.callParent(args);
    },
    /**
     * @inheritdoc
     */
    renderNoContent() {
        this.renderItems({
            xtype: 'view-noresult-content',
            data: { title: 'view-noresult-content-groups-title' }
        });
    }
});