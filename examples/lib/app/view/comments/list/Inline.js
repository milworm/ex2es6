import 'app/view/comments/list/Base';

/**
 * Class is used to display inline list of comments (under of each block)
 */
Ext.define('CJ.view.comments.list.Inline', {
    alias: 'widget.view-comments-list-inline',
    extend: 'CJ.view.comments.list.Base',
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-comments-list-inline',
        /**
         * @cfg {Boolean} hasTabs
         */
        hasTabs: false
    },
    constructor() {
        this.callParent(args);
        this.moreElement.on('tap', this.onInnerElementTapHandler, this);
        if (this.getBlock().getCommentsCount() == 0)
            return this.scrollToField();
        this.load();
    },
    /**
     * loads current comments list.
     */
    load() {
        this.mask();
        CJ.Comment.loadInlineItems(this.getBlock().getDocId(), {
            scope: this,
            success: this.onLoadSuccess
        });
    },
    /**
     * method will be called when comments will be loaded.
     */
    onLoadSuccess(response) {
        this.unmask();
        this.setComments(response.ret);
        this.onChange();
    },
    /**
     * @param {Array} items
     */
    prepareItemsToInsert(items) {
        items = this.callParent(args);
        for (let i = 0, item; item = items[i]; i++) {
            item.showArrows = false;
            item.expanded = true;
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
                    reference: 'moreElement',
                    cls: 'd-more-comments-button',
                    html: CJ.app.t('view-comments-load-more-comments'),
                    hidden: true
                },
                {
                    reference: 'innerElement',
                    cls: 'x-inner'
                },
                {
                    reference: 'fieldElement',
                    cls: 'd-field-container'
                }
            ]
        };
    },
    /**
     * processes tap-event on the whole list
     */
    onInnerElementTapHandler(e) {
        const block = this.getBlock();
        block.fireEvent('inlinecommentstap', block);
    },
    /**
     * adds showMoreButton in case when there are more then 
     * CJ.Comment.MAX_INLINE_ITEMS
     * @return {Boolean} true in case when showMoreButton was added
     */
    onChange() {
        if (this.getCount() > CJ.Comment.MAX_INLINE_ITEMS)
            this.moreElement.show();
        else
            this.moreElement.hide();
        this.scrollToField();
    },
    /**
     * @param {Number} position
     * @param {Object} comment
     * @return {undefined}
     */
    insertComment(position, comment) {
        this.setCount(this.getCount() + 1);
        this.prepareItemsToInsert(comment);
        this.store.insert(position, comment);
        this.getItemsElement().insertFirst(this.renderItemTpl(comment).firstChild);
        if (this.getCount() > CJ.Comment.MAX_INLINE_ITEMS) {
            const lastComment = this.store.last();
            this.destroyElement(this.getItemNodeByDocId(lastComment.docId));
            this.store.remove(lastComment);
        }
        this.onChange();
    },
    /**
     * @param {Ext.Component} newField
     * @param {Ext.Component} oldField
     */
    updateField(newField, oldField) {
        if (oldField)
            oldField.destroy();
        if (newField)
            newField.renderTo(this.fieldElement);
    },
    setRendered(rendered) {
        this.callParent(args);
        this.getField().onPainted();
    }
});