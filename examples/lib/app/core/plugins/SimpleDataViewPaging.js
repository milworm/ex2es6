/**
 * Defines a plugin that should be used in a conjuction with dataview-class
 * to provide it load-more (scroll) paging.
 */
Ext.define('CJ.core.plugins.SimpleDataViewPaging', {
    alias: 'plugin.simple-dataview-paging',
    config: {
        /**
         * @cfg {Ext.dataview.Dataview} component
         */
        component: null,
        /**
         * @cfg {Number} bottomBoundary
         */
        bottomBoundary: 100,
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {Boolean} isEndReached
         */
        isEndReached: false,
        /**
         * @cfg {Number} pagingMode
         */
        pagingMode: 'offset'
    },
    constructor(config) {
        this.initConfig(config || {});
        this.callParent(args);
    },
    /**
     * @param {Ext.dataview.Dataview} component
     */
    init(component) {
        this.setComponent(component);
    },
    /**
     * @param {Ext.dataview.Dataview} component
     */
    updateComponent(component) {
        if (!component)
            return;
        if (component.isDataView) {
            component.on('beforestoresort', this.onComponentBeforeStoreSort, this);
            component.on('beforerefresh', this.onComponentBeforeRefresh, this);
        }
        component.getScrollEl().onDom('scroll', this.onComponentScroll, this);
    },
    /**
     * @param {Boolean} state
     */
    updateLoading(state) {
        if (state) {
            const list = this.getComponent();
            CJ.LoadBar.run({
                renderTo: list.element,
                maskEl: list.element
            });
        } else {
            CJ.LoadBar.finish();
        }
    },
    /**
     * @return {undefined}
     */
    onComponentScroll() {
        const list = this.getComponent();
        if (list.isLoading() || this.getIsEndReached())
            return;
        if (list.getScrollTop() < list.getMaxScrollTop() - this.getBottomBoundary())
            return;
        this.loadNextPage();
    },
    /**
     * @param {Ext.view.View} list
     * @param {Ext.data.Store} store
     * @param {Object} kwargs
     */
    onComponentBeforeStoreSort(list, store, kwargs) {
        kwargs.offset = 0;
        this.setIsEndReached(false);
        list.scrollToTop();
    },
    /**
     * @param {Ext.view.View} list
     * @param {Ext.data.Store} store
     * @param {Object} kwargs
     */
    onComponentBeforeRefresh(list, store, kwargs) {
        kwargs.offset = 0;
        this.setIsEndReached(false);
        list.scrollToTop();
    },
    /**
     * @return {undefined}
     */
    loadNextPage() {
        if (this.getComponent().isDataView)
            this.loadDataViewNextPage();
        else
            this.loadComponentNextPage();
    },
    /**
     * loads next page only if component is a dataview.
     * @return {undefined}
     */
    loadDataViewNextPage() {
        this.setLoading(true);
        const list = this.getComponent(), store = list.getStore(), proxy = store.getProxy(), params = proxy.getExtraParams(), kwargs = Ext.decode(params.kwargs), limit = kwargs.limit, offset = kwargs.offset || 0;
        if (this.getPagingMode() == 'docId') {
            Ext.apply(kwargs, {
                refMode: 'after',
                refId: store.last().get('docId')
            });
        } else {
            Ext.apply(kwargs, {
                offset: offset + limit,
                limit
            });
        }
        proxy.setExtraParam('kwargs', Ext.encode(kwargs));
        this.lastScrollToTopOnRefresh = list.getScrollToTopOnRefresh();
        this.lastLoadingText = list.getLoadingText();
        list.setScrollToTopOnRefresh(false);
        list.setLoadingText(false);
        store.load({
            addRecords: true,
            scope: this,
            callback: this.onDataViewNextPageLoaded
        });
    },
    /**
     * loads next page for non-dataview component.
     * @return {undefined}
     */
    loadComponentNextPage() {
        const list = this.getComponent(), kwargs = Ext.decode(list.getLoadParams().kwargs), limit = kwargs.limit, offset = kwargs.offset || 0;
        Ext.apply(kwargs, {
            offset: offset + limit,
            limit
        });
        list.loadMore(kwargs, {
            scope: this,
            callback: this.onComponentNextPageLoaded
        });
    },
    /**
     * @param {Array} items
     * @param {Ext.data.Operation} operation
     */
    onDataViewNextPageLoaded(items, operation) {
        const kwargs = Ext.decode(operation.getRequest().getParams().kwargs), list = this.getComponent();
        this.onNextPageLoaded(items, kwargs);
        if (list.isDataView)
            list.setScrollToTopOnRefresh(this.lastScrollToTopOnRefresh);
        this.setLoading(false);
    },
    /**
     * @param {Array} items
     * @param {Object} params
     */
    onComponentNextPageLoaded(response, request) {
        this.onNextPageLoaded(response.ret.items, Ext.decode(request.params.kwargs));
    },
    /**
     * @param {Array} items
     * @param {Object} kwargs
     */
    onNextPageLoaded(items, kwargs) {
        if (items.length != kwargs.limit)
            this.setIsEndReached(true);
    }
});