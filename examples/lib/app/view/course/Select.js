import 'Ext/Container';

/**
 * Defines a component that is used to display a list of courses (in popup) with search and select functionality.
 */
Ext.define('CJ.view.course.Select', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Container',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-select',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config undefined {}) {
            return Ext.factory({
                xtype: 'core-view-popup',
                title: config.title,
                actionButton: { text: config.button },
                content: {
                    xtype: this.xtype,
                    listeners: config.listeners,
                    selectionMode: config.selectionMode || 'multi'
                }
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
        cls: 'd-course-select d-scroll',
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {String} selectionMode
         */
        selectionMode: 'multi'
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        if (!popup)
            return;
        popup.on('actionbuttontap', this.onActionButtonTap, this);
        this.updatePopupState();
    },
    /**
     * @param {Array} items
     * @return {Array}
     */
    applyItems(items) {
        items = [
            this.getSearchConfig(),
            this.getDataViewConfig()
        ];
        if (!Ext.os.is.Phone)
            items.push(this.getCreateButtonConfig());
        return this.callParent(args);
    },
    /**
     * @return {Object}
     */
    getSearchConfig() {
        return {
            xtype: 'core-view-search-field',
            ref: 'search',
            listeners: {
                scope: this,
                input: this.onSearchFieldInput
            }
        };
    },
    /**
     * @return {Object}
     */
    getDataViewConfig() {
        return {
            ref: 'list',
            xtype: 'dataview',
            cls: 'd-course-select-list d-scroll',
            scrollable: CJ.Utils.getScrollable(),
            disableSelection: true,
            masked: true,
            mode: this.getSelectionMode().toUpperCase(),
            store: {
                autoLoad: true,
                fields: [
                    'docId',
                    'icon',
                    'backgroundHsl',
                    'title',
                    'selected',
                    'userInfo'
                ],
                proxy: {
                    type: 'ajax',
                    url: CJ.constant.request.rpc,
                    enablePagingParams: false,
                    extraParams: {
                        model: 'Course',
                        method: 'list_courses'
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'ret'
                    }
                }
            },
            /**
             * @cfg {Ext.XTemplate} itemTpl
             */
            itemTpl: [
                '<div class="d-item {[ values.selected ? "d-selected" : ""]}">',
                '<div class="d-user-icon" style="{[ CJ.Utils.makeIcon(values.icon || values.backgroundHsl) ]}"></div>',
                '<div class="d-content">',
                '<div class="d-title">',
                '{title} <span class="d-members d-hidden">()</span>',
                '</div>',
                '</div>',
                '<div class="d-apply-icon"></div>',
                '</div>',
                { compiled: true }
            ],
            /**
             * @param {Object} plugins
             */
            // @TODO disabled for now.
            // plugins: [{
            //     xclass: "CJ.core.plugins.SimpleDataViewPaging",
            //     pagingMode: "docId"
            // }],
            listeners: {
                scope: this,
                itemtap: this.onListItemTap
            }
        };
    },
    /**
     * @return {Object}
     */
    getCreateButtonConfig() {
        return {
            xtype: 'core-view-component',
            cls: 'd-create-button',
            html: CJ.t('view-course-select-create-course'),
            listeners: {
                scope: this,
                element: 'element',
                tap: this.onCreateButtonTap
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
        const list = this.getList(), store = list.getStore(), proxy = store.getProxy(), kwargs = Ext.decode(proxy.getExtraParams().kwargs) || {};
        if (value)
            kwargs.filter = value;
        else
            delete kwargs.filter;
        list.fireEvent('beforerefresh', list, store, kwargs);
        proxy.setExtraParam('kwargs', Ext.encode(kwargs));
        store.load();
    },
    /**
     * @param {Ext.dataview.DataView} list
     * @param {Number} index
     * @param {Ext.dom.Element} element
     * @param {Ext.data.Model} record
     */
    onListItemTap(list, index, element, record) {
        const state = !record.get('selected'), singleMode = this.getSelectionMode() == 'single', selection = this.getSelectedCourseIds();
        if (state && singleMode && selection.length)
            return;
        record.set('selected', state);
        this.updatePopupState();
    },
    /**
     * @return {undefined}
     */
    updatePopupState() {
        const popup = this.getPopup();
        const button = popup.getActionButton();
        let text = button.initialConfig.text.split(' ')[1];
        const selection = this.getSelectedCourseIds();
        if (selection.length > 1)
            text += '-many';
        popup[selection.length ? 'allowSubmit' : 'denySubmit']();
        button.setHtml(CJ.t(text));
    },
    /**
     * sends a request in order to assing selected groups to a block.
     */
    onActionButtonTap() {
        const ids = this.getSelectedCourseIds();
        if (!ids.length)
            return;
        this.fireEvent('selected', this, ids);
    },
    /**
     * @return {Array}
     */
    getSelectedCourseIds() {
        const items = [];
        this.getList().getStore().each(record => {
            if (record.get('selected'))
                items.push(record.get('docId'));
        }, this);
        return items;
    },
    /**
     * @return {undefined}
     */
    onCreateButtonTap() {
        const course = Ext.factory(Ext.apply({
            xtype: 'view-course-block',
            sections: CJ.CourseHelper.getDefaultSectionConfig(),
            title: CJ.t('view-course-edit-menu-menu-default-title', true),
            docVisibility: 'private'
        }, CJ.Block.getInitialTagsAndCategories()));
        this.mask();
        course.save({
            scope: this,
            callback: this.unmask,
            success() {
                this.fireEvent('created', this, course);
                this.getPopup().hide();
            }
        });
    }
});