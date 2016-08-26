import 'app/view/comments/list/Modal';

/**
 * Class is used to display list of comments inside of block's modal popup.
 */
Ext.define('CJ.view.tablet.comments.list.Modal', {
    extend: 'CJ.view.comments.list.Modal',
    alias: 'widget.view-tablet-comments-list-modal',
    config: {
        /**
         * @cfg {Object} field
         */
        field: {
            minFieldHeight: 38,
            maxFieldHeight: 74
        }
    },
    /**
     * method will be called when comments will be loaded.
     */
    onLoadSuccess(response) {
        this.unmask();
        this.setComments(response.ret);
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
                    reference: 'toDiscussionButton',
                    cls: 'd-show-discussion-button',
                    html: CJ.t('view-comments-see-conversation')
                },
                {
                    reference: 'innerElement',
                    cls: 'x-inner'
                },
                {
                    reference: 'emptyElement',
                    cls: 'd-empty-text',
                    html: CJ.app.t('view-comments-list-empty')
                },
                {
                    reference: 'fieldElement',
                    cls: 'd-field-container'
                }
            ]
        };
    },
    changeStaticItemsDisplay: Ext.emptyFn,
    /**
     * @inheritdoc
     */
    getScrollEl() {
        return this.innerElement;
    }
});