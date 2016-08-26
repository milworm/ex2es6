import 'app/core/view/Popup';

/**
 * Class provides popup with list of filters by key.
 * @TODO need to refactor this class in order to create popup on fly.
 */
Ext.define('CJ.view.answers.filter.Popup', {
    extend: 'CJ.core.view.Popup',
    /**
     * @property {Boolean} isAnswersFilterPopup
     */
    isAnswersFilterPopup: true,
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-popup-answers-filtering',
        /**
         * @cfg {String} title
         */
        title: 'tool-answer-filterpopup-title',
        /**
         * @cfg {Object|Boolean} store
         */
        store: true,
        /**
         * @cfg {Boolean} resetButton
         */
        resetButton: true,
        /**
         * @cfg {Boolean} dataView
         */
        dataView: true
    },
    constructor() {
        this.callParent(args);
        this.setContent(this.getDataView());
    },
    /**
     * Initializes the store of user's keys.
     * @param {Object/Boolean} config
     * @returns {Ext.dataStore/Boolean}
     */
    applyStore(config) {
        if (!config)
            return false;
        if (config == true)
            config = {};
        Ext.applyIf(config, {
            autoLoad: true,
            fields: [
                'docId',
                'icon',
                'name',
                'members'
            ],
            filters: [{
                    filterFn(item) {
                        return item.get('members') > 0;
                    }
                }],
            proxy: {
                type: 'ajax',
                url: CJ.constant.request.rpc,
                extraParams: {
                    kwargs: Ext.encode({
                        offset: 0,
                        limit: 10
                    }),
                    model: 'Group',
                    method: 'list_user_owned_groups',
                    args: '[]',
                    variant: ''
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
     * Initializes the reset button of filtering.
     * @param {Object/Boolean} config
     * @returns {Ext.Button/Boolean}
     */
    applyResetButton(config) {
        if (!config)
            return false;
        if (config == true)
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            cls: 'reset',
            iconCls: 'reset-answers-filter',
            text: 'answers-filtering-button-default-text',
            handler: this.onResetButtonTap,
            scope: this
        });
        return Ext.factory(config);
    },
    /**
     * Handler of event 'tap' of reset button.
     */
    onResetButtonTap() {
        this.fireEvent('filterselected', null);
        this.hide();
    },
    /**
     * Initializes the dataview of filters list.
     * @param {Object/Boolean} config
     * @returns {Ext.dataview.DataView/Boolean}
     */
    applyDataView(config) {
        if (!config)
            return false;
        if (config == true)
            config = {};
        Ext.applyIf(config, {
            xtype: 'dataview',
            cls: 'd-scroll',
            store: this.getStore(),
            scrollable: CJ.Utils.getScrollable(),
            itemTpl: new Ext.XTemplate('<div class="icon">', '<tpl if="icon">', '<span style="{[ CJ.Utils.makeIcon(values.icon) ]}"></span>', '</tpl>', '</div>', '<div class="info">', '<div class="title">{name}</div>', '</div>', '<div class="followers">{members}</div>'),
            items: [this.getResetButton()],
            listeners: {
                itemtap: this.onDataViewItemTap,
                scope: this
            },
            plugins: [{ xclass: 'CJ.core.plugins.SimpleDataViewPaging' }]
        });
        return Ext.factory(config);
    },
    /**
     * Handler of event 'tap' of dataview.
     * Fires event with chosen key and hides popup.
     * @param {Ext.dataview.DataView} dataview
     * @param {Number} index
     * @param {Ext.Element} target
     * @param {Ext.data.model} record
     */
    onDataViewItemTap(dataview, index, target, record) {
        this.fireEvent('filterselected', record);
        this.hide();
    }
});