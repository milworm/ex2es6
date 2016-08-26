/**
 * Defines a plugin that implements deferred loading.
 */
Ext.define('CJ.view.stream.ScrollLoader', {
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} response Contains an initial response, that is used to render data at the first time.
         */
        response: null,
        /**
         * @cfg {Object} request Contains an initial request, that is used to render data at the first time.
         */
        request: null,
        /**
         * @cfg {Ext.Component} component
         */
        component: null,
        /**
         * @cfg {Array} visibleBuffer Defines a list of visible items 
         *                            (exist in DOM); 
         *                            order: from newest to olders.
         */
        visibleBuffer: [],
        /**
         * @cfg {Array} recentBuffer Defines a buffer for recent items;
         *                           order: from newest to oldest.
         */
        recentBuffer: [],
        /**
         * @cfg {Array} latestBuffer Defines a buffer the latest items;
         *                           order: from newest to oldest.
         */
        latestBuffer: [],
        /**
         * @cfg {Number} bufferSize Defines how much items should be in the 
         *                          preloaded buffer.
         */
        bufferSize: 'auto',
        /**
         * @cfg {Number} pageSize Defines how much items should be rendered
         *                        per page.
         */
        pageSize: null,
        /**
         * @cfg {Number} visiblePageCount Defines how much pages are currently
         *                                visible.
         */
        visiblePageCount: null,
        /**
         * @cfg {Number} visiblePageMaxCount Defines the maximum number of pages
         *                                   that could be visible at once.
         */
        visiblePageMaxCount: 3,
        /**
         * @cfg {Number} lastScrollTop Defines the last scrolling position and 
         *                             is used to check did user scroll or not.
         *                             It's used only on iOS.
         */
        lastScrollTop: 0,
        /**
         * @cfg {Boolean} isFirstPage Flag that will be true if we don't have
         *                            more items to preload before current page.
         */
        isFirstPage: false,
        /**
         * @cfg {Boolean} isLastPage Flag that will be true if we don't have
         *                           more items to preload after current page.
         */
        isLastPage: false,
        /**
         * @cfg {String} loading Defines what type of items(previous, next) we
         *                       load.
         */
        loading: null,
        /**
         * @cfg {Boolean} scrollRestored Will be true only in case when we 
         *                               change scroll-position by ourself.
         */
        scrollRestored: null,
        /**
         * @cfg {Number} listCols Number that shows how much columns do we have
         *                        in the list.
         */
        listCols: 1,
        /**
         * @cfg {Boolean} loadBar
         */
        loadBar: null,
        /**
         * @cfg {Object} requestData Contains 2 properties: rpc and params. We use it to make loadNext and loadPrev 
         *                           page requests.
         */
        requestData: null
    },
    constructor(config) {
        this.callParent(args);
        this.initConfig(config);
    },
    /**
     * @param {Number|String} size
     * @return {Number}
     */
    applyBufferSize(size) {
        if (size != 'auto')
            return size;
        if (Ext.os.is.Phone)
            return 20;
        if (Ext.os.is.Tablet)
            return 20;
        return 40;
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateComponent(newComponent, oldComponent) {
        if (!newComponent)
            return;
        newComponent.on({
            itemdeleted: this.onComponentItemDeleted,
            scope: this
        });
        newComponent.on({
            touchstart: this.onComponentTouchStart,
            touchend: this.onComponentTouchEnd,
            element: 'element',
            scope: this
        });    // can't attach resize-handler to a component, because ST creates
               // x-size-monitors and x-paint-monitor elements in the component's 
               // element node, which will cause to rerender the full list in each 
               // frame instead of just repainting the scroll. And as list is only one
               // item in Viewport's content, we can use this line.
               // @TODO can we just use window.onresize here?
        // can't attach resize-handler to a component, because ST creates
        // x-size-monitors and x-paint-monitor elements in the component's 
        // element node, which will cause to rerender the full list in each 
        // frame instead of just repainting the scroll. And as list is only one
        // item in Viewport's content, we can use this line.
        // @TODO can we just use window.onresize here?
        Ext.Viewport.content.on('resize', this.onComponentResize, this);
        fastdom.defer(fastdom.frames.length + 1, this.onComponentResize, this);
        newComponent.getScrollEl().onDom('scroll', this.onComponentScroll, this);
    },
    /**
     * changes the response to show correct items and fill buffers.
     * @param {Object} response
     * @return {undefined}
     */
    init() {
        const response = this.getResponse();
        const items = response.items.slice();
        const params = this.getRequest().params;
        let isFirstPage = false;
        let isLastPage = false;    // it's the beginning.
        // it's the beginning.
        if (response.order.length == 0 || response.order[0] == items[0].docId)
            isFirstPage = true;    // it's an ending.
        // it's an ending.
        if (items.length != params.limit)
            isLastPage = true;
        this.setVisibleBuffer([]);
        this.setRecentBuffer([]);
        this.setLatestBuffer(items);
        this.setIsFirstPage(isFirstPage);
        this.setIsLastPage(isLastPage);
        this.setVisiblePageCount(1);    // after reloading a list, it's always 1.
        // after reloading a list, it's always 1.
        if (!isFirstPage)
            this.getComponent().changeStaticItemsDisplay(false);
    },
    /**
     * @return {Array}
     */
    extractFromLatestBuffer() {
        const items = this.getLatestBuffer().splice(0, this.getPageSize());
        this.setVisibleBuffer(this.getVisibleBuffer().concat(items));
        return items;
    },
    /**
     * @return {Array}
     */
    extractFromRecentBuffer() {
        const pageSize = this.getPageSize(), items = this.getRecentBuffer().splice(-pageSize, pageSize);
        this.setVisibleBuffer(items.concat(this.getVisibleBuffer()));
        return items;
    },
    /**
     * detects how much columns will be rendered in the list and 
     * updates #listCols property.
     *
     * 358px * 2 + 3 = 2 columns
     * 358px * 3 + 4 = 3 columns
     * 358px * 4 + 5 = 4 columns
     * 358px * 5 + 6 = 5 columns
     * 358px * 6 + 7 = 6 columns
     */
    onComponentResize() {
        if (this.isDestroyed)
            return;
        const width = this.getComponent().element.getWidth();
        const blockWidth = 358;
        let cols = 1;
        for (let i = 6; i > 1; i--) {
            if (width > blockWidth * i + i + 1) {
                cols = i;
                break;
            }
        }
        this.setPageSize(Math.floor(this.getPageSize() / cols) * cols);
        this.setListCols(cols);
    },
    /**
     * @return {undefined}
     */
    onComponentTouchStart() {
        this.touchStarted = true;
    },
    /**
     * @return {undefined}
     */
    onComponentTouchEnd() {
        delete this.touchStarted;
    },
    /**
     * @return {undefined}
     */
    onComponentScroll() {
        if (this.scrollTimerId)
            return;
        this.scrollTimerId = Ext.defer(function () {
            delete this.scrollTimerId;
            this.processScroll();
        }, 80, this);
    },
    /**
     * @return {undefined}
     */
    processScroll() {
        if (Ext.os.is.iOS)
            this.processIOsScroll();
        else
            this.processDefaultScroll();
    },
    /**
     * @return {undefined}
     */
    processIOsScroll() {
        const component = this.getComponent();
        const scrollTop = component.getScrollTop();
        const maxScrollTop = component.getMaxScrollTop();
        const percentage = this.calcScrollPercentage(scrollTop, maxScrollTop);
        let direction;
        let method;
        this.setLastScrollTop(scrollTop);
        if (percentage > 75 && scrollTop > maxScrollTop - 1000)
            direction = 'down';
        else if (percentage < 25 && scrollTop < 1000)
            direction = 'up';
        if (!direction)
            return;
        switch (direction) {
        case 'down': {
                if (this.getIsLastPage() && this.getLatestBuffer().length == 0)
                    return;    // buffer is empty and we have nothing to preload.
                // buffer is empty and we have nothing to preload.
                break;
            }
        case 'up': {
                if (this.getIsFirstPage() && this.getRecentBuffer().length == 0) {
                    this.getComponent().changeStaticItemsDisplay(true);
                    return;    // buffer is empty and we have nothing to preload.
                }
                break;
            }
        }
        method = direction == 'down' ? 'showNextItems' : 'showPreviousItems';
        this.setLoadBar(true);
        this.onScrollStop(function () {
            this.onAfterScrollStop(method);
        }, this);
    },
    /**
     * @param {String} method
     */
    onAfterScrollStop(method) {
        if (this.touchStarted)
            return Ext.defer(this.onAfterScrollStop, 100, this, [method]);
        if (!this.isDestroyed)
            this[method]();
        this.setLoadBar(false);
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateLoadBar(state) {
        if (state) {
            CJ.LoadBar.run({
                renderTo: Ext.Viewport.getSearchBar().element.dom,
                maskedEl: CJ.Stream.element
            });
            Ext.Viewport.setPreventPanning(true);
        } else {
            CJ.LoadBar.finish();
            Ext.defer(() => {
                Ext.Viewport.setPreventPanning(false);
            }, 500);
        }
    },
    /**
     * executes callback when browser stops scrolling.
     * @param {Function} callback
     * @param {Object} scope
     * @return {undefined}
     */
    onScrollStop(callback, scope) {
        clearTimeout(this.scrollStopTimerId);
        this.scrollStopTimerId = Ext.defer(function () {
            const component = this.getComponent(), scrollTop = component.getScrollTop(), lastScrollTop = this.getLastScrollTop();    // had been stopped?
            // had been stopped?
            if (scrollTop != lastScrollTop) {
                this.setLastScrollTop(scrollTop);
                this.onScrollStop(callback, scope);
            } else {
                Ext.callback(callback, scope);
            }
        }, 250, this);
    },
    /**
     * @param {type} param description
     * @return {undefined}
     */
    processDefaultScroll() {
        const component = this.getComponent(), scrollTop = component.getScrollTop(), maxScrollTop = component.getMaxScrollTop(), percentage = this.calcScrollPercentage(scrollTop, maxScrollTop);    // scrolling up
        // scrolling up
        if (percentage < 20 && scrollTop < 1000)
            return this.showPreviousItems();    // scrolling down
        // scrolling down
        if (percentage > 70 && maxScrollTop - scrollTop < 1000)
            return this.showNextItems();
    },
    /**
     * @param {Number} scrollTop
     * @param {Number} maxScrollTop
     */
    calcScrollPercentage(scrollTop, maxScrollTop) {
        return scrollTop / maxScrollTop * 100;
    },
    /**
     * @return {undefined}
     */
    showPreviousItems() {
        delete this.showItemsOnLoad;
        const isFirstPage = this.getIsFirstPage();
        let buffer = this.getRecentBuffer();
        if (buffer.length == 0 && isFirstPage) {
            this.getComponent().changeStaticItemsDisplay(true);
            return;    // buffer is empty and we have nothing to preload. 
        }    // buffer could have few a different number of items comparing to 
             // pageSize, which is bad, as to maintain columns integrity we need
             // to have the same items-count. There is only one exception: we can't 
             // maintain list integrity in case when it's the first page
        // buffer could have few a different number of items comparing to 
        // pageSize, which is bad, as to maintain columns integrity we need
        // to have the same items-count. There is only one exception: we can't 
        // maintain list integrity in case when it's the first page
        if (buffer.length < this.getPageSize() && !isFirstPage) {
            this.showItemsOnLoad = true;
            this.fillBuffer('before', this.getRecentAvaibleDocId());
            this.setLoadBar(true);
            return;
        }
        const items = this.extractFromRecentBuffer();
        let visiblePageCount = this.getVisiblePageCount();
        let hideNextPage = false;
        let refId;
        if (visiblePageCount == this.getVisiblePageMaxCount()) {
            visiblePageCount--;
            hideNextPage = true;
        }
        if (buffer.length == 0)
            buffer = items;
        refId = buffer[0].docId;
        this.setVisiblePageCount(visiblePageCount + 1);
        this.fillBuffer('before', refId);    // fastdom.defer(fastdom.frames.length + 1, function() {
        // fastdom.defer(fastdom.frames.length + 1, function() {
        this.setScrollRestored(true);
        this.getComponent().prependItems(items);
        if (hideNextPage)
            this.hideNextPage();    // }, this);
    },
    /**
     * appends new items to list in case when user scrolls down.
     * visible page.
     * @return {undefined}
     */
    showNextItems() {
        const isLastPage = this.getIsLastPage();
        let buffer = this.getLatestBuffer();
        if (buffer.length == 0 && isLastPage)
            return;    // buffer is empty and we have nothing to preload.
                       // buffer could have few a different number of items comparing to 
                       // pageSize, which is bad, as to maintain columns integrity we need
                       // to have the same items-count. There is only one exception: in case
                       // when it's last page, we cann't maintain columns integrity.
        // buffer is empty and we have nothing to preload.
        // buffer could have few a different number of items comparing to 
        // pageSize, which is bad, as to maintain columns integrity we need
        // to have the same items-count. There is only one exception: in case
        // when it's last page, we cann't maintain columns integrity.
        if (buffer.length < this.getPageSize() && !isLastPage) {
            this.showItemsOnLoad = true;
            this.fillBuffer('after', this.getLatestAvaibleDocId());
            this.setLoadBar(true);
            return;
        }
        const items = this.extractFromLatestBuffer();
        let visiblePageCount = this.getVisiblePageCount();
        let hidePreviousPage = false;
        let refId;
        if (visiblePageCount == this.getVisiblePageMaxCount()) {
            visiblePageCount--;
            hidePreviousPage = true;
        }
        if (buffer.length == 0)
            buffer = items;
        refId = buffer[buffer.length - 1].docId;
        this.setVisiblePageCount(visiblePageCount + 1);
        this.fillBuffer('after', refId);    // fastdom.defer(fastdom.frames.length + 1, function() {
        // fastdom.defer(fastdom.frames.length + 1, function() {
        if (hidePreviousPage)
            this.hidePreviousPage();
        this.getComponent().appendItems(items);    // }, this);
    },
    /**
     * @return {Number}
     */
    getLatestAvaibleDocId() {
        let buffer = this.getLatestBuffer();
        if (buffer.length == 0)
            buffer = this.getVisibleBuffer();
        return buffer[buffer.length - 1].docId;
    },
    /**
     * @return {Number}
     */
    getRecentAvaibleDocId() {
        let buffer = this.getRecentBuffer();
        if (buffer.length == 0)
            buffer = this.getVisibleBuffer();
        return buffer[0].docId;
    },
    /**
     * @param {String} mode after/before
     * @param {Number} lastRefId
     * @return {undefined}
     */
    fillBuffer(mode, lastRefId) {
        if (this.getLoading() == mode)
            return;
        let buffer, difference;
        if (mode == 'after')
            buffer = this.getLatestBuffer();
        else if (mode == 'before')
            buffer = this.getRecentBuffer();
        difference = this.getBufferSize() - buffer.length;    // we are full.
        // we are full.
        if (difference == 0)
            return;
        const request = this.getRequest(), rpc = request.rpc, params = request.params;
        delete rpc.kwargs;
        Ext.apply(params, {
            refId: lastRefId,
            refMode: mode,
            limit: difference
        });
        this.setLoading(mode);
        CJ.Ajax.request({
            rpc,
            params,
            scope: this,
            loadIndicator: false,
            success: this.onFillBufferSuccess
        });
    },
    /**
     * adds new items to recent/latest buffer and triggers showing items,
     * in case when buffer is empty, because user scrolls too fast.
     * @param {Object} response
     * @param {Object} request
     */
    onFillBufferSuccess(response, request) {
        this.setLoading(false);
        const rawRequest = request.initialConfig;
        const params = rawRequest.params;
        const mode = params.refMode;
        const items = response.ret.items;
        const pageSize = this.getPageSize();
        let wasEmpty = false;
        if (mode == 'after') {
            var buffer = this.getLatestBuffer();
            if (buffer.length < pageSize)
                wasEmpty = true;
            this.setLatestBuffer(buffer.concat(items));
            if (items.length < params.limit)
                this.setIsLastPage(true);
        } else {
            var buffer = this.getRecentBuffer();
            if (buffer.length < this.getPageSize())
                wasEmpty = true;
            this.setRecentBuffer(items.concat(buffer));
            if (items.length < params.limit)
                this.setIsFirstPage(true);
        }
        if (!wasEmpty)
            return;
        if (!this.showItemsOnLoad)
            return;
        delete this.showItemsOnLoad;
        if (mode == 'after')
            this.showNextItems();
        else if (mode == 'before')
            this.showPreviousItems();
        this.setLoadBar(false);
    },
    /**
     * simply hides previous/upper page, will be called when user scrolls down.
     */
    hidePreviousPage() {
        const component = this.getComponent();
        const separator = component.getFirstPageSeparator();
        let blockNode = separator.nextSibling;
        const blockNodes = [];
        const blockNodesIds = [];
        component.saveScroll();
        component.changeStaticItemsDisplay(false);
        this.setScrollRestored(true);
        while (blockNode) {
            if (blockNode.classList.contains('d-paging-separator'))
                break;
            blockNodes.push(blockNode);
            blockNode = blockNode.nextSibling;
        }
        separator.parentNode.removeChild(separator);
        for (let i = 0, node; node = blockNodes[i]; i++) {
            blockNodesIds.push(node.id);
            node.parentNode.removeChild(node);
        }
        this.afterHidePreviousPage(blockNodes);
        component.restoreScroll();
        fastdom.defer(fastdom.frames.length + 1, () => {
            for (let i = 0, nodeId; nodeId = blockNodesIds[i]; i++)
                Ext.getCmp(nodeId).destroy();
        }, this);    // }, this);
    },
    /**
     * simply hides next/bottom page, will be called when user scrolls up.
     */
    hideNextPage() {
        fastdom.defer(fastdom.frames.length + 1, function () {
            const separator = this.getComponent().getLastPageSeparator();
            let blockNode = separator.nextSibling;
            const blockNodes = [];
            while (blockNode) {
                blockNodes.push(blockNode);
                blockNode = blockNode.nextSibling;
            }
            separator.parentNode.removeChild(separator);
            const blockNodeIds = [];
            for (let i = 0, node; node = blockNodes[i]; i++) {
                blockNodeIds.push(node.id);
                node.parentNode.removeChild(node);
            }
            this.afterHideNextPage(blockNodes);
            fastdom.defer(fastdom.frames.length + 1, () => {
                for (let i = 0, nodeId; nodeId = blockNodeIds[i]; i++)
                    Ext.getCmp(nodeId).destroy();
            }, this);
        }, this);
    },
    /**
     * @param {Array} blockNodes
     * @return {undefined}
     */
    afterHidePreviousPage(blockNodes) {
        const component = this.getComponent();
        const pageSize = this.getPageSize();
        const bufferSize = this.getBufferSize();
        const items = this.getVisibleBuffer().splice(0, pageSize);
        let recentBuffer = this.getRecentBuffer().concat(items);    // remove all newest items that exceeds bufferSize
        // remove all newest items that exceeds bufferSize
        if (recentBuffer.length > bufferSize) {
            recentBuffer = recentBuffer.slice(bufferSize);
            this.setIsFirstPage(false);
        }
        this.setRecentBuffer(recentBuffer);
    },
    /**
     * @param {Array} blockNodes
     * @return {undefined}
     */
    afterHideNextPage(blockNodes) {
        const pageSize = this.getPageSize(), items = this.getVisibleBuffer().splice(-pageSize, pageSize), buffer = items.concat(this.getLatestBuffer()), bufferSize = this.getBufferSize();
        if (buffer.length > bufferSize)
            buffer.splice(bufferSize);
        this.setIsLastPage(false);
        this.setLatestBuffer(buffer);
    },
    /**
     * method will be called when item is deleted from list,
     * checks scroll position in order to load more items if needed.
     * @return {undefined}
     */
    onComponentItemDeleted() {
        const component = this.getComponent(), scrollHeight = component.getMaxScrollTop();
        if (scrollHeight == 0)
            this.showNextItems();
        else if (component.getScrollTop() / scrollHeight * 100 > 70)
            this.showNextItems();
    },
    /**
     * @param {Boolean} state
     */
    updateIsFirstPage(state) {
        const component = this.getComponent();
        if (!component)
            return;
        component.changeStaticItemsDisplay(state);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        Ext.Viewport.content.un('resize', this.onComponentResize, this);
        this.getComponent().getScrollEl().unDomAll();
        this.callParent(args);
    }
});