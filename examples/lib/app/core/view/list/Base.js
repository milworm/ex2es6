import 'Ext/Container';

/**
 * Base class for all lists.
 */
Ext.define('CJ.core.view.list.Base', {
    extend: 'Ext.Container',
    xtype: 'core-view-list-base',
    /**
     * @property {Boolean} isList
     */
    isList: true,
    config: {
        /**
         * @cfg {Boolean} isLoading
         */
        isLoading: false,
        /**
         * @cfg {Number} requestId
         */
        requestId: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-list d-scroll',
        /**
         * @cfg {String} displayType can be one of ["list", "view"]
         *                           View-type means that list is used to render
         *                           only one block.
         */
        displayType: 'list',
        /**
         * @cfg {Object} lastRequest
         */
        lastRequest: null,
        /**
         * @cfg {Object} lastResponse
         */
        lastResponse: null
    },
    /**
     * simply clears the list
     * @return {undefined}
     */
    cleanup() {
        this.removeAll();
        const nodes = this.element.dom.querySelectorAll('.d-paging-separator');
        for (let i = 0, node; node = nodes[i]; i++)
            Ext.removeNode(node);
    },
    /**
     * @param {Array} items List of objects
     */
    beforeRenderItems(items) {
    },
    /**
     * updated #add method that a little bit faster than sencha's implemetation,
     * because of making one DOM insert operation.
     * @param {Array} items
     * @return {undefined}
     */
    renderItems(items) {
        if (this.isDestroyed)
            return;
        items = Ext.isArray(items) ? items : [items];
        this.beforeRenderItems(items);
        const renderTree = document.createDocumentFragment(), innerItems = this.innerItems, componentItems = this.getItems(), defaults = this.getDefaults() || {};
        renderTree.appendChild(this.createPageSeparator());
        for (let i = 0, item; item = items[i]; i++) {
            Ext.apply(item, defaults);
            item.renderTo = item.renderTo || renderTree;
            item.parent = this;
            item = items[i] = Ext.factory(item);
            item.setRendered(this.rendered);    // need to think abou it, as for example filter doesn't have parent
                                                // without this line
            // need to think abou it, as for example filter doesn't have parent
            // without this line
            item.parent = this;
            innerItems.push(item);
            componentItems.add(item);
        }
        this.innerElement.appendChild(renderTree);
        Ext.TaskQueue.requestWrite(function () {
            this.afterRenderItems(items);
        }, this);
    },
    /**
     * Can be overriden in sub class if needed.
     * @param {Array} items List of CJ.view.block.BaseBlock
     */
    afterRenderItems() {
        this.fireEvent('afterrenderitems', this);
    },
    /**
     * @param {Boolean} state
     */
    updateIsLoading(state) {
        if (!this.initialized)
            return;
        if (state)
            this.mask();
        else
            this.unmask();
    },
    /**
     * updates scroller's autoRefresh in order to skip doings lots of refreshes.
     * @param {Object} request
     */
    onBeforeLoadItems(request) {
        this.fireEvent('beforeloaditems', this, request);
    },
    /**
     * Loads the initial set of items, to load prev/next items use 
     * loadPrevItems()/loadNextitems()
     */
    loadItems: Ext.emptyFn,
    /**
     * makes a request to the server in order to get list's data.
     * @param {Object} config
     */
    requestData: Ext.emptyFn,
    /**
     * @param {Number} index
     * @param {Ext.Component} item
     */
    insertListItem(index, item) {
        this.beforeRenderItems([this.insert(index, item)]);
    },
    /**
     * deletes single item from list, method will be not used for 
     * batch-operations like: removeNextItems, removePrevItems etc...
     * @param {Ext.Comonent} item
     */
    removeListItem(item) {
        item.destroy();
        this.fireEvent('itemdeleted', this, item);
    },
    /**
     * simply removes list-item by it's docId
     * @param {Number} docId
     */
    removeListItemByDocId(docId) {
        const item = this.getItemByDocId(docId);
        if (!item)
            return;
        this.removeListItem(item);
    },
    /**
     * @param {Number} docId
     * @return {CJ.view.block.BaseBlock|Boolean}
     */
    getItemByDocId(docId) {
        if (!docId)
            return false;
        const item = this.down(CJ.tpl('[docId={0}]', docId));
        if (!item)
            return false;
        return item;
    },
    /**
     * scrolls to required position
     * @param {Ext.Element} el
     * @return {undefined}
     */
    scrollToEl(el) {
        const el = CJ.fly(el), offset = this.element.getPageBox().bottom - el.getPageBox().bottom;
        if (offset < 0)
            this.scrollTop(-offset, true);
        CJ.unFly(el);
    },
    /**
     * @return {HTMLElement}
     */
    getItemsElement() {
        return this.innerElement;
    },
    /**
     * @param {Object} response
     */
    appendItems(response) {
        const renderTree = document.createDocumentFragment(), innerItems = this.innerItems, itemConfigs = response.ret.items, items = this.getItems();
        renderTree.appendChild(this.createPageSeparator());
        this.beforeRenderItems(itemConfigs);
        for (let i = 0, itemConfig, item; itemConfig = itemConfigs[i]; i++) {
            itemConfig.parent = this;
            itemConfig.renderTo = renderTree;
            item = Ext.factory(itemConfig);    // need to think abou it, as for example filter doesn't have parent
                                               // without this line
            // need to think abou it, as for example filter doesn't have parent
            // without this line
            item.parent = this;
            items.add(item);
            innerItems.push(item);
        }
        this.innerElement.dom.appendChild(renderTree);
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @param {HTMLElement} insertBeforeNode
     */
    prependItems(response, request, insertBeforeNode) {
        const renderTree = document.createDocumentFragment(), innerElement = this.innerElement.dom, innerItems = this.innerItems, itemConfigs = response.ret.items, items = this.getItems(), index = items.indexOf(this.getFirstItem());
        this.beforeRenderItems(itemConfigs);
        for (let i = 0, itemConfig, item; itemConfig = itemConfigs[i]; i++) {
            itemConfig.parent = this;
            itemConfig.renderTo = renderTree;
            item = Ext.factory(itemConfig);    // need to think abou it, as for example filter doesn't have parent
                                               // without this line
            // need to think abou it, as for example filter doesn't have parent
            // without this line
            item.parent = this;
            items.insert(index + i, item);
            innerItems.unshift(item);
        }
        renderTree.appendChild(this.createPageSeparator());
        innerElement.insertBefore(renderTree, insertBeforeNode || innerElement.firstChild);
    },
    /**
     * creates page separator node
     * @return {HTMLElement}
     */
    createPageSeparator() {
        const node = document.createElement('div');
        node.className = 'd-paging-separator';
        return node;
    },
    /**
     * @return {HTMLElement}
     */
    getLastPageSeparator() {
        const separators = this.element.dom.querySelectorAll('.d-paging-separator');
        return separators[separators.length - 1];
    },
    /**
     * @return {HTMLElement}
     */
    getFirstPageSeparator() {
        return this.element.dom.querySelector('.d-paging-separator');
    },
    /**
     * @param {HTMLElement} separator
     */
    removePrevItems(separator) {
        Ext.removeNode(separator);
    },
    /**
     * @param {HTMLElement} separator
     */
    removeNextItems(separator) {
        Ext.removeNode(separator);
    },
    /**
     * @return {Number}
     */
    getLastItemId() {
        return this.getLastItem().getDocId();
    },
    /**
     * @return {Number}
     */
    getFirstItemId() {
        return this.getFirstItem().getDocId();
    },
    /**
     * @return {Ext.Component}
     */
    getLastItem() {
        return this.getItems().last();
    },
    /**
     * @return {Ext.Component}
     */
    getFirstItem() {
        return this.getItems().first();
    },
    /**
     * aborts current ajax-request
     */
    abort() {
        CJ.Ajax.abort(this.getRequestId());
    },
    /**
     * @return {Number}
     */
    getCount() {
        return this.getItems().getCount();
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.cleanup();
        this.callParent(args);
    }
});