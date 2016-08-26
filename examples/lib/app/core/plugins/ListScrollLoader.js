import 'Ext/Component';

/**
 * Plugin is used to add a list an ability to load more items
 * when user's scroll reaches defined boundary
 */
Ext.define('CJ.core.plugins.ListScrollLoader', {
    extend: 'Ext.Component',
    ptype: 'listScrollLoader',
    config: {
        /**
         * @cfg {Ext.Component} component Reference to component where plugin is
         *                                attached.
         */
        component: null,
        /**
         * @cfg {Boolean} isLoading True in case when list has been reached the 
         *                          end, started loading new portion of date,
         *                          but still haven't finished.
         */
        isLoading: false,
        /**
         * @cfg {Number} maxPageBuffer Defines how much pages should be in
         *                             visible buffer.
         */
        maxPageBuffer: 2,
        /**
         * @cfg {Number} pageCount Defines how much pages have been currently 
         *                         loaded. Max avaible value is #maxPageBuffer
         */
        pageCount: 0,
        /**
         * @cfg {Boolean} isFirstPage Will be true if we have first page loaded
         */
        isFirstPage: true,
        /**
         * @cfg {Boolean} isLastPage Will be true if we have last page loaded
         */
        isLastPage: true,
        /**
         * @cfg {Boolean} pageSize
         */
        pageSize: 10,
        /**
         * @cfg {Boolean} scrolling
         */
        scrolling: null
    },
    /**
     * @param {Boolean} state
     */
    updateScrolling(state) {
        return;
        const node = this.getComponent().element.dom;
        if (state) {
            if (node.classList.contains('d-scrolling'))
                return;
            Ext.TaskQueue.requestWrite(() => {
                node.classList.add('d-scrolling');
            });
        } else {
            clearTimeout(this.updateScrollingTimerId);
            this.updateScrollingTimerId = Ext.defer(() => {
                node.classList.remove('d-scrolling');
            }, 250);
        }
    },
    /**
     * @param {Object} component
     */
    init(component) {
        this.onComponentScroll = Ext.bind(this.onComponentScroll, this);
        this.setComponent(component);
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateComponent(newComponent, oldComponent) {
        if (!newComponent)
            return;
        newComponent.on({
            scope: this,
            afterrenderitems: this.onComponentAfterRenderItems,
            itemdeleted: this.onComponentItemDeleted,
            beforeloaditems: this.onComponentBeforeLoadItems
        });
        this.enableScrollHandling(false);
    },
    /**
     * @param {Ext.Component} component
     * @param {Object} request
     */
    onComponentBeforeLoadItems(component, request) {
        this.setPageSize(request.params.limit);
    },
    /**
     * will be called only after component renders (not append or prepend) 
     * list-items at this point plugin initiailizes isFirstPage, isLastPage 
     * properties.
     * (refMode == "midpoint").
     * 
     * @return {undefined}
     */
    onComponentAfterRenderItems() {
        // clear these flags, as there can be a situation when user swiches from
        // previous page to current (with the same list), and if for prev page
        // for example isFirstPage was false setting it false again will not 
        // trigger an updater, and also we cannot use applier here to avoid
        // calling unneded logic every time after list loads new portion of data
        this._isFirstPage = null;
        this._isLastPage = null;
        const list = this.getComponent();
        const response = list.getLastResponse();
        const request = list.getLastRequest();
        let params;
        if (!request) {
            this.setIsFirstPage(true);
            this.setIsLastPage(true);
            return;
        }
        params = request.initialConfig.params;
        this.setPageCount(1);
        if (params.refMode != 'midpoint') {
            this.setIsFirstPage(true);
            this.setIsLastPage(!this.isMiddlePage(response));
            return;
        }
        const refId = params.refId, order = response.ret.order, items = response.ret.items;
        if (items.length > 0) {
            this.setIsFirstPage(order[0] == items[0].docId);
            this.setIsLastPage(!this.isMiddlePage(response));
        } else {
            this.setIsFirstPage(true);
            this.setIsLastPage(true);
        }
    },
    /**
     * @param {Boolean} reset
     */
    onComponentScroll() {
        const component = this.getComponent();
        const scrollTop = component.getScrollTop();
        let lastScrollTop = this.lastScrollTop;
        let maxScrollTop;
        if (this.resetScrollDetection) {
            this.resetScrollDetection = false;
            maxScrollTop = component.getMaxScrollTop();    // in case when user scrolls up or down too fast we have an 
                                                           // interesting bug. Imagine, that user scrolls to the top and he
                                                           // still trying to scroll to the top. At this point we catch the 
                                                           // value of scrollTop-property (which is zero) and start loading 
                                                           // new items. Right after prepending we got setInterval method 
                                                           // executed, which will checks the value of scrollTop. As user
                                                           // haven't stopped scrolling to the top, we will get the same value
                                                           // 0 == 0, which basically means that user did scroll nothing.
                                                           // in order to avoid this we need this check.  
            // in case when user scrolls up or down too fast we have an 
            // interesting bug. Imagine, that user scrolls to the top and he
            // still trying to scroll to the top. At this point we catch the 
            // value of scrollTop-property (which is zero) and start loading 
            // new items. Right after prepending we got setInterval method 
            // executed, which will checks the value of scrollTop. As user
            // haven't stopped scrolling to the top, we will get the same value
            // 0 == 0, which basically means that user did scroll nothing.
            // in order to avoid this we need this check.  
            if (scrollTop == 0 || scrollTop == maxScrollTop)
                lastScrollTop = scrollTop;
            else
                return this.lastScrollTop = scrollTop;
        } else {
            if (lastScrollTop == scrollTop)
                return this.setScrolling(false);
        }
        this.lastScrollTop = scrollTop;
        this.setScrolling(true);
        if (this.getIsLoading())
            return;
        maxScrollTop = maxScrollTop || component.getMaxScrollTop();
        const percentage = scrollTop / maxScrollTop * 100;
        if (percentage < 20 && scrollTop <= lastScrollTop)
            this.loadPrevItems();
        else if (percentage > 70 && scrollTop >= lastScrollTop)
            this.loadNextItems();
    },
    /**
     * @param {Boolean} newValue
     * @param {Boolean} oldValue
     */
    updateIsFirstPage(newValue, oldValue) {
        const component = this.getComponent();
        if (!component)
            return;
        component.isFirstPage = newValue;
        if (Ext.isFunction(component.changeStaticItemsDisplay))
            component.changeStaticItemsDisplay(newValue ? 'show' : 'hide');
    },
    /**
     * @return {undefined}
     */
    loadPrevItems() {
        if (this.getIsFirstPage())
            return this.setIsLoading(false);
        this.getComponent().loadPrevItems({
            scope: this,
            success: this.onAfterPrevPageLoad
        });
        this.setIsLoading(true);
    },
    /**
     * loads next items for a list
     */
    loadNextItems() {
        if (this.getIsLastPage())
            return this.setIsLoading(false);
        this.getComponent().loadNextItems({
            scope: this,
            success: this.onAfterNextPageLoad
        });
        this.setIsLoading(true);
    },
    /**
     * will be called when new portion of prev-data will be loaded
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onAfterPrevPageLoad(response, request) {
        const me = this;
        if (response.ret.items.length == 0) {
            me.disableScrollHandling();
            me.saveScrollPosition();
            me.setIsFirstPage(true);
            me.restoreScrollPosition();
            me.setIsLoading(false);
            me.enableScrollHandling(true);
            return;
        }
        const beforeNode = this.getComponent().getFirstItem().element.dom;
        me.disableScrollHandling();
        me.saveScrollPosition();
        me.setPageCount(me.getPageCount() + 1);
        me.getComponent().prependItems(response, request, beforeNode);
        me.restoreScrollPosition();
        me.removeNextItems();
        me.setIsFirstPage(!this.isMiddlePage(response));
        me.setIsLoading(false);
        me.enableScrollHandling(true);
    },
    /**
     * @param {Object} response
     * @return {Boolean} True in case when response is not a first or last page
     */
    isMiddlePage(response) {
        return response.ret.items.length == this.getPageSize();
    },
    /**
     * adds new porition of data to the end of the list
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onAfterNextPageLoad(response, request) {
        const me = this;
        if (response.ret.items.length == 0) {
            me.setIsLoading(false);
            me.setIsLastPage(true);
            return;
        }
        me.disableScrollHandling();
        me.saveScrollPosition();
        me.setPageCount(me.getPageCount() + 1);
        me.removePrevItems();
        me.restoreScrollPosition();
        me.getComponent().appendItems(response, request);
        me.setIsLoading(false);
        me.setIsLastPage(!this.isMiddlePage(response));
        me.enableScrollHandling(true);
    },
    /**
     * removes the items at the top of a list,
     * to show only the number of defined visible items
     */
    removePrevItems() {
        if (this.getPageCount() <= this.getMaxPageBuffer())
            return;
        this.setPageCount(this.getPageCount() - 1);
        this.getComponent().removePrevItems();
        this.setIsFirstPage(false);
    },
    /**
     * removes the items at the bottom of a list,
     * to show only the number of defined visible items
     */
    removeNextItems() {
        const me = this;
        if (me.getPageCount() <= me.getMaxPageBuffer())
            return;
        me.setPageCount(me.getPageCount() - 1);
        me.getComponent().removeNextItems();
        me.setIsLastPage(false);
    },
    /**
     * disables scroll-event handler
     */
    disableScrollHandling() {
        clearInterval(this.scrollTimerId);
    },
    /**
     * enable scroll-event handler
     */
    enableScrollHandling(reset) {
        this.resetScrollDetection = reset;
        this.scrollTimerId = setInterval(this.onComponentScroll, 80);
    },
    /**
     * saves scroll position (used before dom-modifications)
     * @return {undefined}
     */
    saveScrollPosition() {
        // var node = this.getComponent().element.dom.lastChild;
        // this.scrollPositionState = {
        //     node: node,
        //     bottom: node.getBoundingClientRect().bottom
        // };
        const node = this.getComponent().innerElement.dom.lastChild;
        this.scrollPositionState = {
            node,
            bottom: node.getBoundingClientRect().bottom
        };
    },
    /**
     * scrolls to the saved position in order to show user the same items
     * as he saw before DOM-modifications
     */
    restoreScrollPosition() {
        if (!this.scrollPositionState)
            return;
        const component = this.getComponent(), state = this.scrollPositionState, oldBottom = state.bottom, newBottom = state.node.getBoundingClientRect().bottom;    // alert(oldBottom - newBottom);
        // alert(oldBottom - newBottom);
        component.scrollTop(newBottom - oldBottom, true);
    },
    /**
     * method will be called when item is deleted from list,
     * checks scroll position in order to load more items if needed.
     * @return {undefined}
     */
    onComponentItemDeleted() {
        this.removeEmptyPage();
        if (this.getIsLoading())
            return;
        const component = this.getComponent(), maxScrollTop = component.getMaxScrollTop();
        if (!(maxScrollTop == 0 || component.getScrollTop() / maxScrollTop * 100 > 70))
            return;
        if (this.getIsLastPage())
            return;
        this.getComponent().loadNextItems({
            scope: this,
            success(response, request) {
                if (response.ret.items.length > 0) {
                    this.setPageCount(this.getPageCount() + 1);
                    component.appendItems(response, request);
                }
                this.setIsLoading(false);
                this.setIsLastPage(!this.isMiddlePage(response));
            }
        });
        this.setIsLoading(true);
    },
    /**
     * user can remove a lot of items one by one, and in this case we may have
     * a situation like: 
     * <div class="d-paging-separator"></div>
     * <div class="d-paging-separator"></div>
     * <div class="d-block"></div>
     * which means that we have one empty page that should be removed.
     * @return {undefined}
     */
    removeEmptyPage() {
        const selector = '.d-paging-separator+.d-paging-separator', node = this.getComponent().element.dom.querySelector(selector);
        if (!node)
            return;
        node.parentNode.removeChild(node);
        this.setPageCount(this.getPageCount() - 1);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.disableScrollHandling();
        this.callParent(args);
    }
});