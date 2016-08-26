import 'app/core/view/list/Base';

/**
 * Defines a base class that we use to display list of items in stream-container.
 */
Ext.define('CJ.view.stream.list.Base', {
    /**
     * @property {Boolean} isStreamList
     */
    isStreamList: true,
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.list.Base',
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.StreamList',
    /**
     * @property {Array} alias
     */
    alias: [
        'widget.view-stream-list',
        'widget.view-stream-list-base'
    ],
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @return {Number}
         */
        getPageSize() {
            return Ext.os.is.Desktop ? 20 : 10;
        },
        /**
         * @param {String} tags
         * @param {String} model
         * @param {Object} config
         * @param {Function} config.before
         * @return {undefined}
         */
        load(tags, model, config) {
            const params = {};
            let request;
            let rpc;
            if (model == 'Skill') {
                rpc = {
                    model: 'PortalUser',
                    method: 'list_badges'
                };
            } else {
                rpc = {
                    model,
                    method: 'search'
                };
                params.tags = tags;
            }
            if (model == 'Course' && CJ.User.isFgaStudent()) {
                rpc.method = 'enrolled_courses_feed';
                delete params.tags;
            }
            request = Ext.apply({
                rpc,
                params,
                stash: {
                    tags,
                    model
                }
            }, config);
            Ext.callback(config.before, config.scope, [request]);
            params.limit = this.getPageSize();
            if (params.refMode != 'midpoint')
                params.limit *= 2;
            return CJ.Ajax.request(request);
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: null,
        /**
         * @cfg {Object} scrollLoader
         */
        scrollLoader: {},
        /**
         * @cfg {Ext.Component} stream
         */
        stream: null
    },
    /**
     * @return {undefined}
     */
    applyItems() {
        const loader = this.getScrollLoader();
        loader.init();
        this.renderItems(loader.extractFromLatestBuffer());
    },
    /**
     * @param {Object} config
     * @param {CJ.view.stream.ScrollLoader} oldLoader
     * @return {undefined}
     */
    applyScrollLoader(config, oldLoader) {
        if (oldLoader)
            oldLoader.destroy();
        if (!config)
            return false;
        return Ext.create('CJ.view.stream.ScrollLoader', Ext.apply({
            component: this,
            pageSize: CJ.view.stream.list.Base.getPageSize()
        }, config));
    },
    /**
     * @param {Array} items
     * @return {undefined}
     */
    renderItems(items) {
        items = Ext.isArray(items) ? items : [items];
        if (items.length == 0)
            return this.renderNoContent();
        this.appendItems(items);
        Ext.TaskQueue.requestWrite(function () {
            this.afterRenderItems(items);
        }, this);
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            className: 'd-list d-block-list d-multicolumn d-scroll',
            children: [{
                    reference: 'innerElement',
                    className: 'x-inner d-block-list-inner'
                }]
        };
    },
    /**
     * @param {CJ.core.view.BaseBlock} block
     * @return {undefined}
     */
    removeListItem() {
        this.callParent(args);
        if (this.getCount() == 0)
            this.renderNoContent();
    },
    /**
     * Renders no content label.
     * Should be overridden in sub-class.
     */
    renderNoContent: Ext.emptyFn,
    /**
     * @param {Array} items List of Objects
     */
    beforeRenderItems(items) {
        for (let i = 0, item; item = items[i]; i++) {
            CJ.Ajax.patchDocumentXtype(item);
            Ext.apply(item, {
                multicolumn: true,
                bottomBar: { xtype: 'view-block-toolbar-multicolumn-bottom-bar' }
            });
        }
    },
    /**
     * appends items to current list
     * @param {Array} items
     */
    appendItems(items) {
        this.beforeRenderItems(items);
        const innerItems = this.innerItems, listItems = this.getItems(), renderTree = document.createDocumentFragment(), renderItems = [];
        renderTree.appendChild(this.createPageSeparator());
        Ext.each(items, function (item) {
            item.parent = this;
            item = Ext.factory(item);
            item.parent = this;
            listItems.add(item);
            innerItems.push(item);
            renderTree.appendChild(item.element.dom);
        }, this);
        this.innerElement.dom.appendChild(renderTree);
        this.items.each(item => {
            item.setRendered(true);
        });
    },
    /**
     * prepends items to current list
     * @param {Array} items
     */
    prependItems(items) {
        this.saveScroll();
        this.beforeRenderItems(items);
        const innerItems = this.innerItems, listItems = this.getItems(), renderTree = document.createDocumentFragment(), renderItems = [];
        renderTree.appendChild(this.createPageSeparator());
        Ext.each(items, function (item) {
            item.parent = this;
            item = Ext.factory(item);
            item.parent = this;
            listItems.add(item);
            innerItems.push(item);
            renderTree.appendChild(item.element.dom);
        }, this);
        this.innerElement.dom.insertBefore(renderTree, this.innerElement.dom.firstChild);
        this.items.each(item => {
            item.setRendered(true);
        });
        this.restoreScroll();
    },
    /**
     * saves scroll position. Method is used when before removing previous or prepending items.
     * @return {undefined}
     */
    saveScroll() {
        const node = this.innerElement.dom.lastChild;    // looking for last block.
        // looking for last block.
        this.scrollState = {
            node,
            region: node.getBoundingClientRect()
        };
    },
    /**
     * restores saved scrollPosition. Method is used after removing previous or prepending items.
     * @return {undefined}
     */
    restoreScroll() {
        const state = this.scrollState, oldRegion = state.region, newRegion = state.node.getBoundingClientRect();
        this.scrollTop(newRegion.bottom - oldRegion.bottom, true);
        delete this.scrollState;
    },
    /**
     * @param {Boolean} state
     */
    changeStaticItemsDisplay(state) {
        this.getStream().changeStaticItemsDisplay(state);
    },
    /**
     * @return {Ext.Element}
     */
    getScrollEl() {
        return this.getStream().element;
    },
    /**
     * inserts or removes block from the list.
     * @param {CJ.core.view.BaseBlock} block
     * @return {Boolean} true if block was added to the list
     */
    adjustContaining(block) {
        if (block.getIsModal())
            return;
        const contains = this.indexOf(block) > -1;
        if (!block.hasPageTags()) {
            if (contains)
                this.removeListItem(block);
            return;
        }
        if (contains)
            return;
        this.insertListItem(0, block);
        const noContent = this.down('[isNoContent]');
        if (noContent)
            noContent.destroy();
        if (!CJ.StreamHelper.getGroup())
            return;
        CJ.app.fireEvent('group.documents.add');
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setScrollLoader(null);
    }
});