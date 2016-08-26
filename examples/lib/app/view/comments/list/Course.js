import 'app/view/comments/list/Full';

/**
 * Class is used to display list of comments inside of course's viewer.
 */
Ext.define('CJ.view.comments.list.Course', {
    extend: 'CJ.view.comments.list.Full',
    alias: 'widget.view-comments-list-course',
    config: {
        /**
         * @cfg {Boolean} empty
         */
        empty: true,
        /**
         * @cfg {Boolean} hasTabs
         */
        hasTabs: false,
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
        cls: 'd-comments-list-modal d-comments-list-course'
    },
    constructor() {
        this.callParent(args);
        this.load();
    },
    /**
     * loads comments list.
     * @return {undefined}
     */
    load() {
        const blockId = this.getBlock().getDocId();
        Promise.resolve().then(() => CJ.Comment.loadItems(blockId)).then((response, request) => {
            response.ret.request = request;
            this.setComments(response.ret);
        });
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
                    reference: 'fieldElement',
                    cls: 'd-field-container'
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
        this.getField()[method]();
    }
});