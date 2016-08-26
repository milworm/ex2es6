import 'app/view/comments/list/Full';

/**
 * Class is used to display list of comments inside of block's modal popup.
 */
Ext.define('CJ.view.comments.list.Modal', {
    extend: 'CJ.view.comments.list.Full',
    alias: 'widget.view-comments-list-modal',
    config: {
        /**
         * @inheritdoc
         */
        payAttention: true,
        /**
         * @cfg {Boolean} empty
         */
        empty: true,
        /**
         * @cfg {Object} field
         */
        field: {
            minFieldHeight: 140,
            maxFieldHeight: 212
        },
        /**
         * @cfg {String} cls
         */
        cls: 'd-comments-list-modal'
    },
    constructor() {
        this.callParent(args);
        if (!CJ.Comment.hasContext())
            return;
        this.element.addCls('d-context-list');
        this.element.on('tap', this.onShowDiscussionButtonTap, this, { delegate: '.d-show-discussion-button' });
    },
    /**
     * redirects user to block's comments.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onShowDiscussionButtonTap(e) {
        const id = CJ.app.getRouteParam('id'), url = CJ.tpl('!m/{0}/c', id);
        CJ.app.redirectTo(url);
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
                    reference: 'tabBarElement',
                    cls: 'd-tab-bar-element'
                },
                {
                    cls: 'd-scroll d-tab-content-element',
                    children: [
                        {
                            reference: 'fieldElement',
                            cls: 'd-field-container'
                        },
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
                            html: CJ.t('view-comments-list-empty')
                        }
                    ]
                }
            ]
        };
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
    /**
     * hides/shows all components inside of this list that are static ones
     * like toolbars or some others that shouldn't be connected to displaying
     * items in the list.
     * @param {String} method valid values are: [show, hide]
     */
    changeStaticItemsDisplay(method) {
        if (Ext.os.is.Phone)
            this.getBlock()[method]();
        else
            this.getField()[method]();
    }
});