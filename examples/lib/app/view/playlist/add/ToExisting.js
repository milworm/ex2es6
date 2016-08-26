import 'Ext/Container';

/**
 * The class provides component for adding a block to existing playlists.
 */
Ext.define('CJ.view.playlist.add.ToExisting', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Container',
    /**
     * @inheritdoc
     */
    xtype: 'view-playlist-add-to-existing',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-add-to-existing-playlist',
        /**
         * @cfg {CJ.view.playlist.add.Popup} popup
         * The wrapper component.
         */
        popup: null,
        /**
         * @cfg {CJ.view.block.DefaultBlock} block
         * The block that will be added to playlists.
         */
        block: null,
        /**
         * @cfg {Boolean/Object/Ext.field.Text} filter
         * The component or config for it,
         * that provides the filtering of existing playlists.
         */
        filter: true,
        /**
         * @cfg {Boolean/Object/Ext.dataview.DataView} list
         * The component or config for it,
         * that provides the list of existing playlists.
         */
        list: true,
        /**
         * @cfg {Boolean/Object/Ext.data.Store} store
         * The store for existing playlists.
         */
        store: true,
        /**
         * @cfg {Boolean/Object/Ext.Button}
         * The component or config for it,
         * that provides button for the switching adding method.
         */
        createButton: true
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        if (!popup)
            return;
        popup.on('actionbuttontap', this.onActionButtonTap, this);
        popup.denySubmit();
    },
    /**
     * Applies and initializes the filter component.
     * @param {Boolean/Object} config
     * @returns {Boolean/Ext.field.Text}
     */
    applyFilter(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'textfield',
            placeHolder: CJ.t('add-to-playlist-existing-filter-placeholder', true),
            clearIcon: false,
            listeners: {
                keyup: this.onFilter,
                scope: this
            }
        });
        return Ext.factory(config);
    },
    /**
     * Updates the filter component.
     */
    updateFilter: CJ.Utils.updateComponent,
    /**
     * Handler of the event 'keyup' of the filter component.
     * Runs the filter applier after defer.
     * Prevents a request to the server each time
     * when an user changes the filter value.
     * @param {Ext.field.Text} field
     */
    onFilter(field) {
        Ext.defer(this.applyFilterValue, 500, this, [
            field,
            field.getValue()
        ]);
    },
    /**
     * Makes the request to the server to load playlists,
     * dependent from filter value.
     * @param {Ext.field.Text} field
     * @param {String} deferredValue - the filter value before defer.
     */
    applyFilterValue: function fn(field, deferredValue) {
        const value = field.getValue();
        if (value != deferredValue)
            return;
        if (fn.lastValue == value)
            return;
        fn.lastValue = value;
        const list = this.getList(), store = list.getStore(), proxy = store.getProxy(), extraParams = this.getExtraParams(value);
        proxy.setExtraParams(extraParams);
        store.load();
    },
    /**
     * Applies and initializes the list component of existing playlists.
     * @param {Boolean/Object} config
     * @returns {Boolean/Ext.dataview.DataView}
     */
    applyList(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        const filter = this.getFilter();
        Ext.applyIf(config, {
            xtype: 'dataview',
            mode: 'MULTI',
            store: this.getStore(),
            scrollable: CJ.Utils.getScrollable(),
            emptyText: CJ.t('add-to-playlist-existing-list-empty-text'),
            itemTpl: [
                '<div class="icon" style="{[this.getIcon(values)]}"></div>',
                '<div class="title">{[this.getTitle(values)]}</div>',
                {
                    getIcon(values) {
                        // @TODO need a backgroundHsl from the server, temporary it's random
                        return CJ.Utils.makeIcon(CJ.Utils.randomHsl());
                    },
                    getTitle(values) {
                        const filterValue = filter.getValue();
                        let title = values.title;
                        if (filterValue) {
                            const highlight = CJ.tpl('<span>{0}</span>', filterValue);
                            title = title.replace(filterValue, highlight);
                        }
                        return title;
                    }
                }
            ],
            listeners: {
                refresh: this.onListRefresh,
                selectionchange: this.onListSelectionChange,
                scope: this
            }
        });
        return Ext.factory(config);
    },
    /**
     * Updates the list component of existing playlists
     */
    updateList: CJ.Utils.updateComponent,
    /**
     * Handler of the event 'refresh' of the list component of existing playlists.
     * Updates the height of the component and wrapper element of it.
     * Required for animations.
     */
    onListRefresh() {
        return;
        Ext.defer(function () {
            const popup = this.getPopup();
            popup.updateContentHeight();
        }, 50, this);
    },
    /**
     * @param {Object} record
     * @return {undefined}
     */
    onListSelectionChange(record) {
        const list = this.getList(), selectionExists = list.hasSelection();
        this.getPopup()[selectionExists ? 'allowSubmit' : 'denySubmit']();
        if (!selectionExists)
            return;
        const popup = this.getPopup();
        const selection = list.getSelection();
        let text = 'add-to-playlist-popup-submit-text-add';
        if (selection.length > 1)
            text += '-many';
        popup.getActionButton().setHtml(CJ.t(text));
    },
    applyStore(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            autoLoad: true,
            autoDestroy: true,
            fields: [
                'id',
                'title'
            ],
            proxy: {
                type: 'ajax',
                url: CJ.constant.request.rpc,
                enablePagingParams: false,
                extraParams: this.getExtraParams(),
                reader: {
                    type: 'json',
                    rootProperty: 'ret'
                }
            }
        });
        return Ext.create('Ext.data.Store', config);
    },
    /**
     * Returns the proxy config for the reloading store with filter value.
     * @param {String} [filter]
     * @returns {Object}
     */
    getExtraParams(filter) {
        return {
            model: 'Playlist',
            method: 'list_playlists',
            kwargs: Ext.encode({ filter })
        };
    },
    /**
     * Applies and initializes the button for switching adding method.
     * @param {Boolean/Object} config
     * @returns {Boolean/Ext.Button}
     */
    applyCreateButton(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            text: 'add-to-playlist-existing-switching-method-button-text',
            listeners: {
                tap: this.onCreateButtonTap,
                scope: this
            }
        });
        return Ext.factory(config);
    },
    /**
     * Updates the button
     */
    updateCreateButton: CJ.Utils.updateComponent,
    /**
     * Handler of the event 'tap' of the button that switches adding method.
     * Switches adding method to the 'Add to new playlist'.
     */
    onCreateButtonTap() {
        this.getPopup().setAddToExisting(false);
    },
    /**
     * @return {Array}
     */
    getSelectedIds() {
        const ids = [];
        Ext.each(this.getList().getSelection(), record => {
            ids.push(record.get('id'));
        }, this);
        return ids;
    },
    /**
     * Handler of the event 'tap' of the action button of the popup.
     * Shows the error message if no one playlist was selected.
     * Adds to the playlist if selected only one.
     * Shows confirmation if selected more than one playlist.
     * Returns false for prevent closing popup.
     * @returns {Boolean}
     */
    onActionButtonTap() {
        const ids = this.getSelectedIds();
        switch (ids.length) {
        case 1:
            this.addToPlaylists(ids);
            break;
        default:
            CJ.confirm('add-to-playlist-existing-confirmation-title', 'add-to-playlist-existing-confirmation-message', function (result) {
                if (result == 'yes')
                    this.addToPlaylists(ids);
            }, this);
        }
        return false;
    },
    /**
     * Makes the request to the server to add the block to selected playlists.
     * @param {Array} ids - array of selected playlists ids.
     */
    addToPlaylists(ids) {
        this.mask();
        CJ.request({
            rpc: {
                model: 'Playlist',
                method: 'add_to_playlists'
            },
            params: {
                docId: this.getBlock().getDocId(),
                playlistIds: ids
            },
            stash: { ids },
            success: this.onAddToPlaylistsSuccess,
            scope: this
        });
    },
    /**
     * Handler of the success response from server
     * to add the block to selected playlists.
     * Hides popup.
     */
    onAddToPlaylistsSuccess(response, request) {
        const ids = request.stash.ids;
        if (ids.length == 1) {
            this.showFeedback(ids[0]);
        } else {
            CJ.feedback({
                message: CJ.t('msg-feedback-success'),
                duration: 2000
            });
        }
        this.unmask();
        this.getPopup().hide();
    },
    /**
     * @param {Number} docId
     */
    showFeedback(docId) {
        CJ.feedback({
            message: CJ.t('add-to-playlist-activity-added-message'),
            duration: 5000,
            scope: this,
            tap(e) {
                if (e.getTarget('.d-button'))
                    this.showPlaylist(docId);
            }
        });
    },
    /**
     * @param {Number} docId
     * @return {undefined}
     */
    showPlaylist(docId) {
        CJ.Block.load(docId, {
            scope: this,
            success(response) {
                Ext.factory(response.ret).setState('review');
            }
        });
    }
});