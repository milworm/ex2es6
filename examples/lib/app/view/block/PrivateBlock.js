import 'app/view/block/DefaultBlock';

/**
 * Defines private block.
 */
Ext.define('CJ.view.block.PrivateBlock', {
    extend: 'CJ.view.block.DefaultBlock',
    alias: 'widget.view-block-private-block',
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
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-empty-icon d-private\'>', '{label}', '</div>', { compiled: true })
    },
    /**
     * @param {Object} data
     */
    applyData(data) {
        let label = 'view-block-private-block-default-label';
        switch (this.getNodeCls().toLowerCase()) {
        case 'course':
            label = 'view-block-private-block-course-label';
            break;
        case 'playlist':
            label = 'view-block-private-block-playlist-label';
            break;
        }
        return { label: CJ.t(label) };
    }
});