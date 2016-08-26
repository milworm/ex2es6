import 'Ext/Container';

/**
 * Class provides an interface to display followers of user.
 */
Ext.define('CJ.view.tool.FollowersList', {
    extend: 'Ext.Container',
    xtype: 'view-tool-followers-list',
    statics: {
        popup(contentConfig) {
            return Ext.factory({
                title: 'tool-followers-list-headertitle',
                xtype: 'core-view-popup',
                cls: 'd-popup-followers',
                layout: 'vbox',
                content: Ext.apply({
                    xtype: 'view-tool-followers-list',
                    flex: 1
                }, contentConfig)
            });
        }
    },
    config: {
        cls: 'd-followers-list',
        layout: 'vbox',
        defaultSort: {
            sortBy: 'last_name',
            sortDir: 'ASC'
        },
        sorter: true,
        dataView: true,
        store: true,
        key: null
    },
    /**
     * Initialize component.
     */
    initialize() {
        this.callParent(args);
        this.on('destroy', this.onDestroy, this);
    },
    /**
     * Handler of event 'destroy'.
     * Destroys store of followers.
     */
    onDestroy() {
        this.getStore().destroy();
    },
    /**
     * Initialize sort container.
     * @param {Boolean/Object} config
     * @returns {Ext.Container}
     */
    applySorter(config) {
        if (config === false)
            return false;
        if (config === true)
            config = {};
        const defaultSort = this.getDefaultSort();
        Ext.applyIf(config, {
            xtype: 'container',
            cls: 'sorter',
            layout: 'hbox',
            items: [
                {
                    xtype: 'label',
                    html: CJ.app.t('tool-followers-list-title')
                },
                {
                    flex: 1,
                    xtype: 'view-light-segmented-button',
                    ref: 'field',
                    buttons: [
                        {
                            text: CJ.app.t('tool-followers-list-col-name'),
                            value: 'alias'
                        },
                        {
                            text: CJ.app.t('tool-followers-list-col-fname'),
                            value: 'first_name'
                        },
                        {
                            text: CJ.app.t('tool-followers-list-col-lname'),
                            value: 'last_name'
                        }
                    ],
                    listeners: {
                        scope: this,
                        itemtap: this.onSortItemTap
                    }
                }
            ]
        });
        const sorter = Ext.factory(config), field = sorter.down('[ref=field]');
        field.setPressed(defaultSort.sortBy);
        field.getPressedButton().addCls(defaultSort.sortDir);
        return this.add(sorter);
    },
    /**
     * Handler of event 'change' of sort container.
     * Sets store sorting.
     * @param {Ext.Button} button
     */
    onSortItemTap(sorter, value) {
        const button = sorter.getPressedButton();
        const store = this.getStore();
        const proxy = store.getProxy();
        const params = proxy.getExtraParams();
        const kwargs = Ext.decode(params.kwargs);
        const dataView = this.getDataView();
        let sortDir;
        if (button.hasCls('ASC'))
            sortDir = 'DESC';
        else
            sortDir = 'ASC';
        Ext.apply(kwargs, {
            sortBy: value,
            sortDir
        });
        button.removeCls('ASC DESC').addCls(sortDir);
        dataView.fireEvent('beforestoresort', dataView, store, kwargs);
        proxy.setExtraParam('kwargs', Ext.encode(kwargs));
        store.load();
    },
    /**
     * Initialize dataview of followers.
     * @param {Boolean/Object} config
     * @returns {Ext.DataView}
     */
    applyDataView(config) {
        if (config === false)
            return false;
        if (config === true)
            config = {};
        Ext.applyIf(config, {
            xtype: 'dataview',
            flex: 1,
            store: this.getStore(),
            scrollable: CJ.Utils.getScrollable(),
            itemTpl: [
                '<img class="avatar" src="{icon}" />',
                '<span class="name">{title}</span>',
                '<span class="alias">{name}</span>'
            ],
            listeners: {
                itemtap: this.onDataViewItemTap,
                scope: this
            },
            plugins: [{ xclass: 'CJ.core.plugins.SimpleDataViewPaging' }]
        });
        return this.add(Ext.factory(config));
    },
    /**
     * Initialize store of followers.
     * @param {Boolean/Object} config
     * @returns {Ext.data.Store}
     */
    applyStore(config) {
        if (config === false)
            return false;
        if (config === true)
            config = {};
        const defaultSort = this.getDefaultSort();
        Ext.applyIf(config, {
            autoLoad: true,
            fields: [
                'icon',
                'title',
                'name'
            ],
            proxy: {
                type: 'ajax',
                enablePagingParams: false,
                url: CJ.constant.request.rpc,
                extraParams: {
                    model: 'Key',
                    method: 'list_followers',
                    args: '[]',
                    variant: '',
                    kwargs: Ext.encode({
                        key: this.getKey(),
                        limit: 20,
                        offset: 0,
                        sortBy: defaultSort.sortBy,
                        sortDir: defaultSort.sortDir
                    })
                },
                reader: {
                    type: 'json',
                    rootProperty: 'ret.items'
                }
            }
        });
        return Ext.create(Ext.data.Store, config);
    },
    /**
     * Handler of event 'tap' of dataview item.
     * Hide popup and redirects to user page.
     * @param {Ext.DataView} dataview
     * @param {Number} index
     * @param {Ext.Elemnt} target
     * @param {Ext.data.Model} record
     */
    onDataViewItemTap(dataview, index, target, record) {
        const route = CJ.Utils.urlify(`!u/${ record.get('name') }`), popup = this.up('[isPopup]');
        popup.on('hide', () => {
            CJ.app.redirectTo(route);
        }, this, { single: true }).hide();
    }
});