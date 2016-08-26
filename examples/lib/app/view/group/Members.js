import 'Ext/Container';

Ext.define('CJ.view.group.Members', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Container',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-group-members',
    statics: {
        /**
         * @param {Object} contentConfig
         * @return {CJ.core.view.popup}
         */
        popup(contentConfig) {
            return Ext.factory({
                xtype: 'core-view-popup',
                title: 'view-group-members-popup-title',
                cls: 'd-popup d-members-popup',
                content: Ext.apply({ xtype: 'view-group-members' }, contentConfig),
                actionButton: CJ.User.isMine(contentConfig.block) ? { text: 'view-group-members-popup-button' } : false
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {CJ.view.group.Block} block
         */
        block: null,
        /**
         * @cfg {Number} groupId
         */
        groupId: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-group-items-list d-members-list',
        /**
         * @cfg {Ext.Component} searchBar
         */
        searchField: true,
        /**
         * @cfg {Ext.Component} list
         */
        list: true,
        /**
         * @cfg {Ext.Component} inviteButton
         */
        inviteButton: null
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
    applyInviteButton(config) {
        if (!config)
            return false;
        if (config == true)
            config = {};
        return Ext.factory(Ext.apply({
            xtype: 'core-view-component',
            cls: 'd-button',
            type: 'light',
            html: CJ.app.t('view-group-members-send-invitations')
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
        return Ext.factory(Ext.apply({
            xtype: 'dataview',
            cls: 'd-scroll',
            scrollable: CJ.Utils.getScrollable(),
            store: {
                autoLoad: true,
                fields: [
                    'id',
                    'icon',
                    'name',
                    'title',
                    'type',
                    'accepted',
                    'denied'
                ],
                proxy: {
                    type: 'ajax',
                    url: CJ.constant.request.rpc,
                    enablePagingParams: false,
                    extraParams: {
                        model: 'Group',
                        method: 'list_members',
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
            itemTpl: this.generateItemTpl(),
            plugins: [{ xclass: 'CJ.core.plugins.SimpleDataViewPaging' }],
            listeners: {
                scope: this,
                itemtap: this.onListItemTap
            }
        }, config));
    },
    /**
     * @return {Array}
     */
    generateItemTpl() {
        const me = this, block = this.getBlock(), ownerUser = block.getUserInfo().user;
        return [
            '<div class="d-user-icon" style="background-image: url({icon})"></div>',
            '<div class="d-content">',
            '<div class="d-title">{[ this.getTitle(values.title) ]}</div><br />',
            '<div class="d-tags">{[ this.getTags(values.name) ]}</div>',
            '</div>',
            '<tpl if="',
            CJ.User.isMine(block),
            ' == true">',
            '<tpl if="type == \'request\'">',
            '<div class="d-apply-icon d-approve"></div>',
            '<tpl if="accepted">',
            '<div class="d-accepted d-overlay">',
            '<div class="d-text">{[ CJ.app.t("view-group-members-joined") ]}</div>',
            '</div>',
            '</tpl>',
            '<tpl if="denied">',
            '<div class="d-denied d-overlay">',
            '<div class="d-text">{[ CJ.app.t("view-group-members-denied") ]}</div>',
            '<div class="d-undo">{[ CJ.app.t("view-group-members-undo") ]}</div>',
            '</div>',
            '</tpl>',
            '<div class="d-close-icon d-disapprove"></div>',
            '<tpl elseif="type == \'member\' && name != \'',
            ownerUser,
            '\'">',
            '<div class="d-close-icon d-remove"></div>',
            '</tpl>',
            '</tpl>',
            {
                compiled: true,
                getTitle(title) {
                    const value = me.getSearchField().getValue().toLowerCase();
                    const titleIndex = title.toLowerCase().indexOf(value);
                    let index;
                    if (titleIndex == -1)
                        return title;
                    const part = title.substr(titleIndex, value.length);
                    return title.replace(part, part.italics());
                },
                getTags(tags) {
                    const value = me.getSearchField().getValue().toLowerCase();
                    const tagIndex = tags.toLowerCase().indexOf(value);
                    let index;
                    if (tagIndex == -1)
                        return tags;
                    const part = tags.substr(tagIndex, value.length);
                    return tags.replace(part, part.italics());
                }
            }
        ];
    },
    /**
     * @param {CJ.core.view.SearchField} newField
     * @param {CJ.core.view.SearchField} oldField
     * @return {undefined}
     */
    updateSearchField: CJ.Utils.updateComponent,
    updateInviteButton: CJ.Utils.updateComponent,
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
        if (e.getTarget('.d-title, .d-tags, .d-user-icon'))
            this.doUserRedirect(record);
        else if (e.getTarget('.d-approve'))
            this.approveRequest(record);
        else if (e.getTarget('.d-disapprove'))
            this.disapproveRequest(record);
        else if (e.getTarget('.d-remove'))
            this.removeMember(record);
    },
    /**
     * @param {Ext.data.Model} record
     */
    doUserRedirect(record) {
        CJ.app.redirectTo(`!u/${ CJ.Utils.urlify(record.get('name')) }`);
    },
    /**
     * @param {Ext.data.Model} record
     */
    approveRequest(record) {
        CJ.Ajax.request({
            rpc: {
                model: 'Group',
                method: 'approve_request',
                id: this.getGroupId()
            },
            params: { userId: record.get('id') },
            stash: { record },
            success: this.onApproveRequestSuccess,
            scope: this
        });
    },
    /**
     * @param {Object} response
     */
    onApproveRequestSuccess(response, request) {
        this.onGroupMembersUpdate(response);
        const record = request.stash.record;
        record.set('accepted', true);
        Ext.defer(function () {
            this.hideRecord(record);
        }, 1500, this);
    },
    /**
     * @param {Ext.data.Model} record
     */
    disapproveRequest(record) {
        CJ.Ajax.request({
            rpc: {
                model: 'Group',
                method: 'deny_request',
                id: this.getGroupId()
            },
            params: { userId: record.get('id') },
            stash: { record },
            success: this.onDisapproveRequestSuccess,
            scope: this
        });
    },
    /**
     * @param {Object} response
     */
    onDisapproveRequestSuccess(response, request) {
        this.onGroupMembersUpdate(response);
        const record = request.stash.record;
        record.set('denied', true);
        Ext.defer(function () {
            this.hideRecord(record);
        }, 4000, this);
    },
    /**
     * shows the confirmation for removing a member from a group
     * @param {Ext.data.Model} record
     */
    removeMember(record) {
        CJ.confirm('view-group-members-remove-confirm-title', 'view-group-members-remove-confirm-text', function (result) {
            if (result == 'yes')
                this.doRemoveMember(record);
        }, this);
    },
    /**
     * removes member from a group
     * @param {Ext.data.Model} record
     */
    doRemoveMember(record) {
        CJ.Ajax.request({
            rpc: {
                model: 'Group',
                method: 'remove_member',
                id: this.getGroupId()
            },
            params: { userId: record.get('id') },
            stash: { record },
            success: this.onRemoveMemberSuccess,
            scope: this
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onRemoveMemberSuccess(response, request) {
        this.onGroupMembersUpdate(response);
        this.getList().getStore().load();
    },
    /**
     * method will be called after executing any server-action like: 
     * remove_member, approve_request, deny_request etc ...
     * @param {Object} response
     */
    onGroupMembersUpdate(response) {
        CJ.fire('group.update', response.ret);
    },
    /**
     * @param {Ext.data.Model} record
     */
    hideRecord(record) {
        const list = this.getList(), store = list.getStore(), index = store.indexOf(record);
        Ext.get(list.getItemAt(index)).addCls('d-hide');
        Ext.defer(() => {
            store.remove(record);
            store.load();
        }, 250, this);
    },
    /**
     * @param {CJ.core.view.SearchField} field
     * @param {String} value
     */
    onSearchFieldInput(field, value) {
        const store = this.getList().getStore();
        store.clearFilter(true);
        store.filter(Ext.create('Ext.util.Filter', {
            filterFn(item) {
                return item.get('title').toLowerCase().indexOf(value) > -1 || item.get('name').toLowerCase().indexOf(value) > -1;
            }
        }));
        store.resumeEvents(true);
    }
});