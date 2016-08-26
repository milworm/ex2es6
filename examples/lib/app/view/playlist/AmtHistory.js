import 'Ext/Container';

/**
 * Defines a component that displays list of users who paid for a specific playlist.
 */
Ext.define('CJ.view.playlist.AmtHistory', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Container',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-playlist-amt-history',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} contentConfig
         * @return {CJ.core.view.popup}
         */
        popup(contentConfig) {
            return Ext.factory({
                xtype: 'core-view-popup',
                title: 'view-playlist-amt-history-popup-title',
                cls: 'd-popup d-playlist-amt-history-popup',
                content: Ext.apply({ xtype: this.xtype }, contentConfig),
                actionButton: false
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-members-list d-playlist-amt-history-list',
        /**
         * @cfg {Ext.Component} searchBar
         */
        searchField: true,
        /**
         * @cfg {Ext.Component} list
         */
        list: true,
        /**
         * @cfg {Number} playlistId
         */
        playlistId: null
    },
    /**
     * @param {Object|Boolean} config
     * @return {Ext.Component}
     */
    applySearchField(config) {
        if (!config)
            return false;
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
        return Ext.factory(Ext.apply({
            xtype: 'dataview',
            cls: 'd-scroll',
            scrollable: CJ.Utils.getScrollable(),
            store: {
                autoLoad: false,
                fields: [
                    'id',
                    'firstname',
                    'lastname',
                    'contractorname',
                    'email'
                ],
                proxy: {
                    type: 'ajax',
                    url: CJ.constant.request.rpc,
                    enablePagingParams: false,
                    extraParams: {
                        model: 'Playlist',
                        method: 'amt_form_search',
                        kwargs: Ext.encode({ limit: 20 })
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'ret'
                    }
                }
            },
            itemTpl: [
                '<div class="d-content">',
                '<div class="d-title">{firstname} {lastname}, {contractorname}</div><br />',
                '<div class="d-tags">{email}</div>',
                '</div>'
            ]
        }, config));
    },
    updateSearchField: CJ.Utils.updateComponent,
    updateList: CJ.Utils.updateComponent,
    /**
     * @param {CJ.core.view.SearchField} field
     * @param {String} value
     */
    onSearchFieldInput(field, value) {
        const store = this.getList().getStore(), proxy = store.getProxy(), kwargs = Ext.decode(proxy.getExtraParams().kwargs);
        store.removeAll();
        if (!value)
            return;
        kwargs.name = value;
        proxy.setExtraParam('kwargs', Ext.encode(kwargs));
        store.load();
    }
});