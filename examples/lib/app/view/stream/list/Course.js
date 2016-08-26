import 'app/view/stream/list/Base';

/**
 * Defines a base class that we use to display list of items in stream-container.
 */
Ext.define('CJ.view.stream.list.Course', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.stream.list.Base',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-stream-list-course',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-course-list'
    },
    /**
     * @param {Object} config
     */
    constructor() {
        this.callParent(args);
        if (CJ.User.isFgaStudent())
            this.element.addCls('d-student');
    },
    /**
     * @inheritdoc
     */
    renderNoContent() {
        this.renderItems({
            xtype: 'view-noresult-content',
            data: { title: 'view-noresult-content-courses-title' }
        });
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    adjustContaining(block) {
        if (!block.isCourse)
            return;
        this.callParent(args);
    },
    /**
     * @param {Array} items List of Objects
     */
    beforeRenderItems(items) {
        for (let i = 0, item; item = items[i]; i++) {
            CJ.Ajax.patchDocumentXtype(item);
            Ext.apply(item, {
                multicolumn: true,
                showCompleteness: true,
                bottomBar: { xtype: 'view-block-toolbar-multicolumn-bottom-bar' }
            });
        }
    }
});