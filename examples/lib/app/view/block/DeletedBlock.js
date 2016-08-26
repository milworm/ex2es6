import 'app/view/block/DefaultBlock';

/**
 * Defines deleted block.
 */
Ext.define('CJ.view.block.DeletedBlock', {
    extend: 'CJ.view.block.DefaultBlock',
    alias: 'widget.view-block-deleted-block',
    /**
     * @property {Boolean} isDeletedBlock
     */
    isDeletedBlock: true,
    config: {
        cls: 'd-default d-empty',
        list: false,
        canDelete: false,
        /**
         * @cfg {String} nodeCls
         */
        nodeCls: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-empty-icon d-deleted\'>', '{label}', '</div>', { compiled: true })
    },
    /**
     * @BTODO when activity is deleted, question should be deleted also.
     * for now we just return false to prevent rendering question component.
     */
    applyQuestion() {
        return false;
    },
    /**
     * @param {Object} data
     */
    applyData(data) {
        let label = 'view-block-deleted-block-default-label';
        switch (this.getNodeCls().toLowerCase()) {
        case 'course':
            label = 'view-block-deleted-block-course-label';
            break;
        case 'playlist':
            label = 'view-block-deleted-block-playlist-label';
            break;
        }
        return { label: CJ.t(label) };
    }
});