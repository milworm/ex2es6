import 'Ext/Component';

/**
 * Defines a simple answer's menu component.
 */
Ext.define('CJ.view.tool.Menu', {
    extend: 'Ext.Component',
    alias: 'widget.view-tool-menu',
    /**
     * @property {Boolean} isMenu
     */
    isMenu: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-hbox d-menu',
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div data-command=\'edit\' class=\'d-item d-edit\'>{edit}</div>', '<div data-command=\'options\' class=\'d-item d-options\'>{options}</div>', '<div data-command=\'delete\' class=\'d-item d-delete\'>{remove}</div>', { compiled: true }),
        /**
         * @param {Object} data
         */
        data: {},
        /**
         * @cfg {Object} listeners
         */
        listeners: {
            tap: {
                fn: 'onMenuItemTap',
                delegate: '.d-item',
                element: 'element'
            }
        }
    },
    /**
     * @param {Ext.Evented} e
     */
    onMenuItemTap(e) {
        const command = CJ.Utils.getNodeData(e.target, 'command');
        this.getParent().fireEvent(CJ.tpl('menu.{0}', command), this);
    },
    /**
     * @param {Object} newData
     */
    updateData(newData) {
        newData = Ext.apply({
            edit: CJ.t('view-answers-base-menu-edit'),
            options: CJ.t('view-answers-base-menu-options'),
            remove: CJ.t('view-answers-base-menu-delete')
        }, newData);
        this.element.setHtml(this.getTpl().apply(newData));
    },
    /**
     * @return {undefined}
     */
    destroy() {
        delete this.parent;
        this.callParent(args);
    }
});