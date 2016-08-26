import 'Ext/DataView';

/**
 * Represents a simple list of users for a specific group.
 */
Ext.define('CJ.view.group.UserSelect', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.DataView',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-group-user-select',
    /**
     * @property {Boolean} isUserSelect
     */
    isUserSelect: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Array} selected
         * List of selected users.
         */
        selected: [],
        /**
         * @cfg {Number} groupId
         */
        groupId: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-group-user-select d-scroll',
        /**
         * @cfg {Object} scrollable
         */
        scrollable: CJ.Utils.getScrollable(),
        /**
         * @cfg {Boolean} masked
         */
        masked: true,
        /**
         * @cfg {Boolean} disableSelection
         */
        disableSelection: true,
        /**
         * @cfg {Object} store
         */
        store: {},
        /**
         * @cfg {Ext.XTemplate} itemTpl
         */
        itemTpl: {},
        /**
         * @param {Object} plugins
         */
        plugins: [{ xclass: 'CJ.core.plugins.SimpleDataViewPaging' }]
    },
    /**
     * @param {Object} config
     * @param {Object} config.loadParams
     */
    constructor(config) {
        this.callParent(args);
        this.on('itemtap', this.onItemTap, this);
    },
    applyItemTpl(tpl) {
        if (!tpl)
            return this.callParent(args);
        return Ext.create('Ext.XTemplate', '<div class="d-item d-hbox d-vcenter {[ this.isSelected(values) ? \'d-selected\' : \'\' ]}">', '<div class="d-user-icon" style="{[ CJ.Utils.makeIcon(values.icon) ]}"></div>', '<div class="d-title">{title}</div>', '</div>', {
            selected: this.getSelected(),
            isSelected(values) {
                return values.hasLicense || this.selected.indexOf(values.name) > -1;
            }
        });
    },
    /**
     * @param {Object} store
     * @return {Ext.data.Store}
     */
    applyStore(store) {
        if (store) {
            store = Ext.apply({
                autoLoad: true,
                fields: [
                    'icon',
                    'title',
                    'name',
                    'hasLicense'
                ],
                proxy: {
                    type: 'ajax',
                    url: CJ.constant.request.rpc,
                    enablePagingParams: false,
                    extraParams: {
                        model: 'Group',
                        method: 'list_members_for_licensing',
                        id: this.getGroupId(),
                        kwargs: Ext.encode({
                            offset: 0,
                            limit: 20,
                            licenseId: CJ.License.getLicense().id
                        })
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'ret.items',
                        totalProperty: 'ret.paging.count'
                    }
                }
            }, store);
        }
        return this.callParent(args);
    },
    /**
     * @param {Ext.Component} list
     * @param {Number} index
     * @param {HTMLElement} target
     * @param {Ext.data.Model} record
     * @return {undefined}
     */
    onItemTap(list, target, index) {
        const item = this.getStore().getAt(index);
        let isSelected;
        let selected;
        let name;
        if (item.get('hasLicense'))
            return;    // we don't allow unlicense.
        // we don't allow unlicense.
        name = item.get('name');
        target = target.dom.querySelector('.d-item');
        isSelected = target.classList.contains('d-selected');
        selected = this.getSelected();
        if (isSelected)
            Ext.Array.remove(selected, name);
        else
            selected.push(name);
        target.classList[isSelected ? 'remove' : 'add']('d-selected');
        this.fireEvent('selectionchange', this, selected);
    },
    /**
     * @inheritdoc
     */
    getScrollEl() {
        return this.element;
    }
});