import 'Ext/Container';

Ext.define('CJ.view.group.Invitations', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Container',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-group-invitations',
    statics: {
        /**
         * @param {Object} contentConfig
         * @return {CJ.core.view.popup}
         */
        popup(contentConfig) {
            return Ext.factory({
                xtype: 'core-view-popup',
                title: 'view-group-invitations-popup-title',
                cls: 'd-popup d-invitations-popup',
                content: Ext.apply({ xtype: 'view-group-invitations' }, contentConfig),
                actionButton: { text: 'view-group-invitations-popup-button' }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Number} groupId
         */
        groupId: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-group-items-list d-invitations-list',
        /**
         * @cfg {Ext.Component} searchBar
         */
        searchField: true,
        /**
         * @cfg {Ext.Component} list
         */
        list: true,
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null
    },
    /**
     * @param {Object|Boolean} config
     * @return {Ext.Component}
     */
    applySearchField(config) {
        if (!config)
            return false;
        if (config == true)
            config = {};
        return Ext.factory(Ext.apply({
            xtype: 'core-view-search-field',
            listeners: {
                scope: this,
                input: this.onSearchFieldInput
            }
        }, config));
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyList(config) {
        if (!config)
            return false;
        if (config)
            config = {};
        const me = this;
        return Ext.factory(Ext.apply({
            xtype: 'dataview',
            cls: 'd-scroll',
            scrollable: CJ.Utils.getScrollable(),
            mode: 'MULTI',
            store: {
                autoLoad: true,
                fields: [
                    'id',
                    'icon',
                    'name',
                    'title'
                ],
                proxy: {
                    type: 'ajax',
                    url: CJ.constant.request.rpc,
                    enablePagingParams: false,
                    extraParams: {
                        model: 'Group',
                        method: 'list_invitable_users',
                        id: this.getGroupId(),
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
                '<tpl if="this.isSearchEnabled()">',
                '<div class="d-user-icon" style="background-image: url({icon})"></div>',
                '<div class="d-content">',
                '<div class="d-title">{[ this.getTitle(values.title, values.name) ]}</div>',
                '</div>',
                '<div class="d-apply-icon d-invite"></div>',
                '<tpl else>',
                '<div class="d-user-icon" style="background-image: url({icon})"></div>',
                '<div class="d-content">',
                '<div class="d-title">{title}</div><br />',
                '<div class="d-tags">{name}</div>',
                '</div>',
                '<div class="d-apply-icon d-invite"></div>',
                '</tpl>',
                {
                    compiled: true,
                    isSearchEnabled() {
                        const field = me.getSearchField();
                        if (!field)
                            return false;
                        return !Ext.isEmpty(field.getValue());
                    },
                    getTitle(title, name) {
                        const value = me.getSearchField().getValue().toLowerCase();
                        const titleIndex = title.toLowerCase().indexOf(value);
                        const tagIndex = name.toLowerCase().indexOf(value);
                        let index;
                        if (titleIndex != -1) {
                            var part = title.substr(titleIndex, value.length);
                            return title.replace(part, part.italics());
                        } else {
                            var part = name.substr(tagIndex, value.length);
                            return name.replace(part, part.italics());
                        }
                    }
                }
            ],
            /**
                 * @param {Object} plugins
                 */
            plugins: [{ xclass: 'CJ.core.plugins.SimpleDataViewPaging' }],
            listeners: {
                scope: this,
                itemtap: this.onListItemTap
            }
        }, config));
    },
    /**
     * @param {CJ.core.view.SearchField} newField
     * @param {CJ.core.view.SearchField} oldField
     * @return {undefined}
     */
    updateSearchField: CJ.Utils.updateComponent,
    updateList: CJ.Utils.updateComponent,
    /**
     * @param {Ext.dataview.DataView} list
     * @param {Number} index
     * @param {HTMLElement} target
     * @param {Object} target
     * @param {Ext.data.Model} record
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onListItemTap(list, index, target, record, e) {
        if (e.getTarget('.d-user-icon, .d-title, .d-tags'))
            this.doUserRedirect(record);
    },
    /**
     * @param {Ext.data.Model} record
     */
    doUserRedirect(record) {
        CJ.app.redirectTo(`!u/${ CJ.Utils.urlify(record.get('name')) }`);
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
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        if (popup)
            popup.on('actionbuttontap', this.onPopupActionButtonTap, this);
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onPopupActionButtonTap() {
        this.inviteUsers(this.getList().getSelection());
    },
    /**
     * @param {Array} items
     */
    inviteUsers(items) {
        const userIds = Ext.Array.map(items, item => item.get('id'));
        CJ.Ajax.request({
            rpc: {
                model: 'Group',
                method: 'invite_users',
                id: this.getGroupId()
            },
            params: { userIds }
        });
    }
});