import 'app/view/comments/list/Course';

/**
 * Class is used to display list of comments inside of course's viewer.
 */
Ext.define('CJ.view.tablet.comments.list.Course', {
    extend: 'CJ.view.comments.list.Course',
    alias: 'widget.view-tablet-comments-list-course',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} collapsed
         */
        collapsed: true,
        /**
         * @cfg {Object} field
         */
        field: {
            minFieldHeight: 38,
            maxFieldHeight: 74
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
                    reference: 'openButton',
                    cls: 'd-open-button'
                },
                {
                    reference: 'outerElement',
                    cls: 'd-outer-element',
                    children: [
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
                },
                {
                    reference: 'fieldElement',
                    cls: 'd-field-element'
                }
            ]
        };
    },
    constructor() {
        this.callParent(args);
        this.openButton.on('tap', this.toggle, this);
    },
    updateBlock(block) {
        if (!block)
            return;
        this.onCommentCreate(block.getCommentsCount());
        block.on('commentcreate', 'onCommentCreate', this);
    },
    /**
     * @param {Number} count
     * @return {undefined}
     */
    onCommentCreate(count) {
        this.openButton.setHtml(CJ.Comment.createTitleFromCount(count));
    },
    /**
     * @param {Boolean} collapsed
     */
    updateCollapsed(collapsed) {
        this[collapsed ? 'addCls' : 'removeCls']('d-collapsed');
    },
    /**
     * Toggles #collapsed state.
     * @return {undefined}
     */
    toggle() {
        this.setCollapsed(!this.getCollapsed());
    }
});