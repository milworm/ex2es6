import 'Ext/Component';

Ext.define('CJ.view.publish.CategorySelect', {
    extend: 'Ext.Component',
    xtype: 'view-publish-category-select',
    /**
     * @property {Object} eventedConfig
     */
    eventedConfig: null,
    /**
     * @property {Object} config
     */
    config: {
        floatingCls: null,
        hiddenCls: null,
        styleHtmlCls: null,
        tplWriteMode: null,
        disabledCls: null,
        carousel: null,
        /**
         * @inheritdoc
         */
        cls: [
            'd-category-select',
            'd-scroll'
        ],
        /**
         * @cfg {Array} values
         * Array of the categories hashId
         */
        categories: null,
        /**
         * @cfg {Ext.Template} itemTpl
         */
        tpl: Ext.create('Ext.XTemplate', '<tpl for=\'items\'>', '<div class=\'d-item d-hbox d-vcenter {[ parent.selected.indexOf(values.hashId) == -1 ? \'\' : \'d-selected\' ]}\' data-hash-id=\'{hashId}\'>', '<div class="d-icon" style="background-image: url({smallIcon})"></div>', '<div class="d-name">{name}</div>', '</div>', '</tpl>', { compiled: true }),
        /**
         * @cfg {Object} data
         */
        data: {}
    },
    initElement() {
        this.callParent(args);
        this.element.on('tap', this.onItemTap, this, { delegate: '.d-item' });
    },
    /**
     * @param {Array} categories
     * @return {Array}
     */
    applyCategories(categories) {
        return categories || [];
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        data.items = CJ.User.get('portalCategories');
        data.selected = this.getCategories();
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @return {Ext.Component}
     */
    applyChanges() {
        return this;
    },
    /**
     * @param {Ext.Evented} e
     * @param {HTMLElement} target
     * @return {undefined}
     */
    onItemTap(e) {
        const target = e.getTarget('.d-item'), hashId = CJ.getNodeData(target, 'hashId');
        if (target.classList.contains('d-selected')) {
            target.classList.remove('d-selected');
            Ext.Array.remove(this.getCategories(), hashId);
        } else {
            target.classList.add('d-selected');
            this.getCategories().push(hashId);
        }
    }
});