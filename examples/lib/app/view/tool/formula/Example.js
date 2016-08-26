import 'Ext/Container';
import 'app/view/tool/formula/ExampleList';

/**
 * Defines a component that is used to show examples how to use 
 * formula-tool.
 */
Ext.define('CJ.view.tool.formula.Example', {
    xtype: 'view-tool-formula-example',
    extend: 'Ext.Container',
    alias: 'widget.view-tool-formula-example',
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-formula-example',
        /**
         * @cfg {Array} items
         */
        items: []
    },
    /**
     * @param {Array} items
     */
    applyItems(items) {
        items = [
            this.getSelectFieldConfig(),
            this.getExamplesViewConfig()
        ];
        return this.callParent(args);
    },
    /**
     * @cfg {Object}
     */
    getSelectFieldConfig() {
        return {
            xtype: 'component',
            cls: 'd-formula-select',
            ref: 'select',
            data: {
                title: CJ.app.t('tool-formula-example-function'),
                value: 'Functions',
                label: CJ.app.t('tool-formula-example-tips')
            },
            tpl: [
                '<span class=\'d-label\'>{label}</span>',
                '<span class=\'d-title\'>{title}</span>'
            ],
            listeners: {
                tap: {
                    scope: this,
                    element: 'element',
                    fn: this.showCategories
                }
            }
        };
    },
    /**
     * @return {undefined}
     */
    showCategories() {
        if (!this.getCategoriesList())
            this.add(this.getCategoriesViewConfig());
        this.getExampleList().hide();
        this.getCategoriesList().show();
        this.getSelectField().addCls('d-active');
    },
    /**
     * @return {undefined}
     */
    hideCategories() {
        this.getCategoriesList().destroy();
        this.getExampleList().show();
        this.getSelectField().removeCls('d-active');
    },
    /**
     * @return {Object}
     */
    getExamplesViewConfig() {
        return {
            xtype: 'view-tool-formula-example-list',
            ref: 'examples',
            listeners: {
                scope: this,
                itemtap: this.onItemTap
            }
        };
    },
    /**
     * @return {Object}
     */
    getCategoriesViewConfig() {
        return {
            xtype: 'component',
            ref: 'categories',
            cls: 'd-formula-categories',
            tpl: [
                '<tpl for=\'items\'>',
                '<div class=\'d-item {[ parent.selected == values.value ? \'d-active\' : \'\']}\' data-index=\'{[ xindex ]}\'>',
                '{text}',
                '</div>',
                '</tpl>'
            ],
            data: {
                selected: this.getSelectField().getData().value,
                items: [
                    {
                        text: CJ.app.t('tool-formula-example-arithmetic', true),
                        value: 'Arithmetic'
                    },
                    {
                        text: CJ.app.t('tool-formula-example-algebra', true),
                        value: 'Algebra'
                    },
                    {
                        text: CJ.app.t('tool-formula-example-function', true),
                        value: 'Functions'
                    },
                    {
                        text: CJ.app.t('tool-formula-example-set', true),
                        value: 'Set'
                    },
                    {
                        text: CJ.app.t('tool-formula-example-geometry', true),
                        value: 'Geometry'
                    },
                    {
                        text: CJ.app.t('tool-formula-example-physic', true),
                        value: 'Physics'
                    },
                    {
                        text: CJ.app.t('tool-formula-example-chemistry', true),
                        value: 'Chemistry'
                    }
                ]
            },
            listeners: {
                tap: {
                    scope: this,
                    element: 'element',
                    fn: 'onCategorySelect',
                    delegate: '.d-item'
                }
            }
        };
    },
    /**
     * @return {Ext.Component}
     */
    getSelectField() {
        return this.down('[ref=select]');
    },
    /**
     * @return {Ext.Component}
     */
    getExampleList() {
        return this.down('[ref=examples]');
    },
    /**
     * @return {Ext.Component}
     */
    getCategoriesList() {
        return this.down('[ref=categories]');
    },
    /**
     * @param {Ext.Evented} e
     */
    onCategorySelect(e) {
        const index = CJ.getNodeData(e.getTarget(), 'index') - 1, categories = this.getCategoriesList(), store = this.getExampleList().getStore(), item = categories.getData().items[index], select = this.getSelectField();
        store.clearFilter(true);
        store.resumeEvents(true);
        store.filter('type', item.value);
        this.hideCategories();
        select.setData(Ext.apply(select.getData(), {
            title: item.text,
            value: item.value
        }));
    },
    /**
     * @param {Ext.DataView} dataview
     * @param {Number} index
     * @param {HTMLElement} node
     * @param {Ext.data.Model} record
     */
    onItemTap(dataview, index, node, record) {
        this.fireEvent('selected', record);
    }
});