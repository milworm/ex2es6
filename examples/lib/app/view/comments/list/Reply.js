import 'app/view/comments/list/Base';

/**
 * Class is used to display inline list of comments (under of each block)
 */
Ext.define('CJ.view.comments.list.Reply', {
    alias: 'widget.view-comments-list-reply',
    extend: 'CJ.view.comments.list.Base',
    /**
     * @property {Boolean} isReplyList
     */
    isReplyList: true,
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-comments-list-reply',
        /**
         * @cfg {Boolean} hasTabs
         */
        hasTabs: false,
        /**
         * @cfg {Object} field Always null, as reply-lists don't have fields.
         */
        field: null
    },
    constructor() {
        this.callParent(args);
        this.moreElement.on('tap', this.onMoreElementTap, this);
    },
    /**
     * @return {undefined}
     */
    onMoreElementTap() {
        this.moreElement.setHtml(CJ.app.t('loading'));
        this.loadMore();
    },
    /**
     * method simply loads more comments for current list.
     */
    loadMore() {
        CJ.Comment.loadMoreReplies(this.getDocId(), this.store.last().docId, {
            scope: this,
            success: this.onMoreRepliesLoadSuccess
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onMoreRepliesLoadSuccess(response, request) {
        this.appendItems(response);
        if (response.ret.items.length != CJ.Comment.MAX_REPLY_ITEMS)
            return this.moreElement.hide();
        this.moreElement.setHtml(CJ.app.t('view-comments-load-more-replies'));
    },
    /**
     * @param {Array} items
     */
    prepareItemsToInsert(items) {
        items = this.callParent(args);
        for (let i = 0, item; item = items[i]; i++) {
            item.showArrows = true;
            item.expanded = this.getLevel() < 2;
            this.prepareBottomBarTpl(item);
        }
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [
                {
                    reference: 'innerElement',
                    cls: 'x-inner'
                },
                {
                    reference: 'moreElement',
                    cls: 'd-more-comments-button',
                    html: CJ.app.t('view-comments-load-more-replies'),
                    hidden: true
                }
            ]
        };
    },
    updateComments() {
        this.callParent(args);
        if (this.getComments().total > CJ.Comment.MAX_REPLY_ITEMS)
            this.moreElement.show();
    }
});