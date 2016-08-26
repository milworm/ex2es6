import 'Ext/Container';

/**
 * Defines a component that allows user to assign or tag a block.
 */
Ext.define('CJ.view.block.Assign', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Container',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-block-assign',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} contentConfig
         * @return {CJ.core.view.Popup}
         */
        popup(contentConfig) {
            if (!CJ.User.isLogged())
                return CJ.view.login.Login.popup();
            return Ext.factory({
                xtype: 'core-view-popup',
                title: 'view-block-assign-popup-title',
                cls: 'd-popup d-popup-transparent d-popup-assign',
                content: Ext.apply({ xtype: 'view-block-assign' }, contentConfig),
                actionButton: { text: 'view-block-assign-popup-button' }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} scrollable
         */
        scrollable: CJ.Utils.getScrollable(),
        /**
         * @cfg {String} cls
         */
        cls: 'd-assign d-scroll',
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null
    },
    /**
     * @return {String}
     */
    generateBlockTags() {
        const block = this.getBlock();
        if (CJ.User.isMine(block))
            return block.getTags();
        return [CJ.User.get('user')];
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        popup.on('actionbuttontap', this.assignActivity, this);
    },
    /**
     * @param {Array} items
     * @return {Array}
     */
    applyItems(items) {
        items = [{
                xtype: 'container',
                cls: 'd-list-wrapper',
                items: [
                    {
                        xtype: 'core-view-search-field',
                        ref: 'search',
                        listeners: {
                            scope: this,
                            input: this.onSearchFieldInput
                        }
                    },
                    this.getDataViewConfig()
                ]
            }];
        return this.callParent(args);
    },
    /**
     * @return {Object}
     */
    getDataViewConfig() {
        return {
            ref: 'list',
            xtype: 'dataview',
            cls: 'd-scroll',
            scrollable: CJ.Utils.getScrollable(),
            disableSelection: true,
            masked: true,
            mode: 'MULTI',
            store: {
                autoLoad: true,
                fields: [
                    'docId',
                    'smallIcon',
                    'name',
                    'members',
                    'hashId',
                    'postingAllowed',
                    'selected',
                    'userInfo'
                ],
                proxy: {
                    type: 'ajax',
                    url: CJ.constant.request.rpc,
                    enablePagingParams: false,
                    extraParams: {
                        model: 'Group',
                        method: 'list_user_joined_groups',
                        id: this.getBlock().getDocId(),
                        kwargs: Ext.encode({
                            offset: 0,
                            limit: 20
                        })
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'ret.items',
                        totalProperty: 'ret.paging.count'
                    }
                }
            },
            /**
             * @cfg {Ext.XTemplate} itemTpl
             */
            itemTpl: [
                '<div class="d-item {[ values.selected ? "d-selected" : ""]} {[ this.isEnabled(values) ? "" : "d-disabled" ]}">',
                '<div class="d-user-icon" style="{[ CJ.Utils.makeIcon(values.smallIcon) ]}"></div>',
                '<div class="d-content d-hbox">',
                '<div class="d-title">{name}</div>',
                '<span class="d-members">( {members} )</span>',
                '</div>',
                '<div class="d-apply-icon"></div>',
                '</div>',
                {
                    compiled: true,
                    /**
                     * @param {Object} values
                     * @return {Boolean}
                     */
                    isEnabled(values) {
                        return values.postingAllowed || CJ.User.isMine(values);
                    }
                }
            ],
            /**
             * @param {Object} plugins
             */
            plugins: [{ xclass: 'CJ.core.plugins.SimpleDataViewPaging' }],
            listeners: {
                scope: this,
                refresh: this.onListRefresh,
                itemtap: this.onListItemTap
            }
        };
    },
    /**
     * @return {Ext.dataview.DataView}
     */
    getList() {
        return this.down('[ref=list]');
    },
    /**
     * @param {CJ.core.view.SearchField} field
     * @param {String} value
     */
    onSearchFieldInput(field, value) {
        const list = this.getList(), store = list.getStore(), proxy = store.getProxy(), kwargs = Ext.decode(proxy.getExtraParams().kwargs);
        if (value)
            kwargs.filter = value;
        else
            delete kwargs.filter;
        list.fireEvent('beforerefresh', list, store, kwargs);
        proxy.setExtraParam('kwargs', Ext.encode(kwargs));
        store.load();
    },
    /**
     * method will be called before refreshing the list, selects all groups
     * that are already assigned to a block.
     * @param {Ext.dataview.DataView} list
     */
    onListRefresh(list) {
        const blockGroups = this.getBlock().getGroups();
        list.getStore().each(record => {
            if (blockGroups.indexOf(record.get('hashId')) > -1)
                record.set('selected', true);
        }, this);
    },
    /**
     * @param {Ext.dataview.DataView} list
     * @param {Number} index
     * @param {Ext.dom.Element} element
     * @param {Ext.data.Model} record
     */
    onListItemTap(list, index, element, record) {
        if (!(record.get('postingAllowed') || CJ.User.isMine(record.data)))
            return;
        record.set('selected', !record.get('selected'));
    },
    /**
     * sends a request in order to assing selected groups to a block.
     */
    assignActivity() {
        const block = this.getBlock(), groups = this.getSelectedGroups(), tags = this.generateBlockTags();
        block.assign(groups, tags);
    },
    /**
     * @return {Array}
     */
    getSelectedGroups() {
        const groups = [];
        this.getList().getStore().each(record => {
            if (record.get('selected'))
                groups.push(record.get('hashId'));
        }, this);
        return groups;
    }
});