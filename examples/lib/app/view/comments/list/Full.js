import 'app/view/comments/list/Base';

/**
 * Class is used to display full list of comments for example in viewable block-
 * list.
 */
Ext.define('CJ.view.comments.list.Full', {
    extend: 'CJ.view.comments.list.Base',
    alias: 'widget.view-comments-list-full',
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-comments-list-full',
        /**
         * @cfg {Boolean} hasTabs
         */
        hasTabs: true,
        /**
         * @cfg {String} activeTab
         */
        activeTab: 'all',
        /**
         * @cfg {Ext.Template} tabBarTpl
         */
        tabBarTpl: Ext.create('Ext.Template', '<div class="d-hbox d-valign d-tabs">', '<div class="d-tab" data-type="faq">{faq}</div>', '<div class="d-tab" data-type="all">{all}</div>', '</div>'),
        /**
         * @cfg {Array} plugins
         */
        plugins: [{
                pageSize: 50,
                xclass: 'CJ.core.plugins.ListScrollLoader'
            }]
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        const target = e.getTarget('.d-tab', 1);
        let type;
        if (!target)
            return;
        type = CJ.Utils.getNodeData(target, 'type');
        this.setActiveTab(type);
    },
    /**
     * @param {Ext.Evented} e
     */
    onTabTap(e) {
        const type = CJ.Utils.getNodeData(e.target, 'type');
        this.setActiveTab(type);
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [{
                    reference: 'innerElement',
                    cls: 'x-inner'
                }]
        };
    },
    /**
     * @param {Boolean} state
     * @return {Boolean}
     */
    applyHasTabs(state) {
        const hasContext = CJ.Comment.hasContext();
        return state && CJ.User.isFGA() && !hasContext;
    },
    /**
     * @param {Boolean} state
     */
    updateHasTabs(state) {
        if (!state)
            return;
        const html = this.getTabBarTpl().apply({
            faq: CJ.t('view-comments-list-full-faq'),
            all: CJ.t('view-comments-list-full-all')
        });
        this.tabBarElement.setHtml(html);
    },
    /**
     * @param {String} tab
     */
    updateActiveTab(tab) {
        if (!this.getHasTabs())
            return;
        if (!this.initialized) {
            this.element.set({ 'data-tab': tab });
            return;
        }
        Promise.all([
            this.reload(),
            this.animateFeedHide()
        ]).then(responses => responses[0]).then(this.onReload.bind(this)).then(this.animateFeedShow.bind(this));
    },
    /**
     * @param {Object} comments
     */
    updateComments(comments) {
        this.getPlugins();
        this.callParent(args);
    },
    /**
     * @param {Object} config
     */
    loadNextItems(config) {
        const blockId = this.getBlock().getDocId(), lastCommentId = this.store.last().docId;
        CJ.LoadBar.run({ renderTo: Ext.Viewport.element });
        CJ.Comment.loadFullItems(blockId, {
            refMode: 'after',
            refId: lastCommentId,
            scope: this,
            success() {
                this.onLoadItemsSuccess(...arguments);
                Ext.callback(config.success, config.scope, arguments);
            },
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    /**
     * @param {Object} config
     */
    loadPrevItems(config) {
        CJ.LoadBar.run({ renderTo: Ext.Viewport.element });
        CJ.Comment.loadFullItems(this.getBlock().getDocId(), {
            refMode: 'before',
            refId: this.store.first().docId,
            scope: this,
            success() {
                this.onLoadItemsSuccess(...arguments);
                Ext.callback(config.success, config.scope, arguments);
            },
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    /**
     * @param {Object} response
     */
    onLoadItemsSuccess(response, request) {
        if (this.isDestroyed)
            return;
        this.setLastRequest(request);
        this.setLastResponse(response);
    },
    /**
     * adds some required fileds
     * @param {Array} items
     */
    prepareItemsToInsert(items) {
        items = this.callParent(args);
        for (let i = 0, item; item = items[i]; i++) {
            item.showArrows = true;
            item.expanded = true;
            this.prepareBottomBarTpl(item);
        }
    },
    /**
     * @param {Object} item
     * @return {undefined}
     */
    prepareBottomBarTpl(item) {
        if (item.deleted)
            return;
        const tab = this.getActiveTab();
        item.bottomBarTpl = this.getBottomBarTpl().apply({
            type: this.getUserType(item),
            item,
            hasPinFeature: CJ.User.isTeacher() || CJ.User.isPortalAdmin(),
            isAll: tab == 'all',
            isFaq: tab == 'faq'
        });
    },
    /**
     * removes items before d-paging-separator
     */
    removePrevItems() {
        const itemsEl = this.getItemsElement();
        const pageSeparator = itemsEl.first('.d-paging-separator').dom;
        let item;
        while (item = itemsEl.first()) {
            if (item.dom.nextSibling == pageSeparator) {
                Ext.removeNode(pageSeparator);
                this.destroyElement(item);
                this.store.remove(this.store.first());
                break;
            }
            this.destroyElement(item);
            this.store.remove(this.store.first());
        }
    },
    /**
     * removes all items after d-paging-separator
     */
    removeNextItems() {
        const itemsEl = this.getItemsElement();
        const pageSeparator = itemsEl.last('.d-paging-separator').dom;
        let item;
        while (item = itemsEl.last()) {
            if (item.dom.previousSibling == pageSeparator) {
                Ext.removeNode(pageSeparator);
                this.destroyElement(item);
                this.store.remove(this.store.last());
                break;
            }
            this.destroyElement(item);
            this.store.remove(this.store.last());
        }
    },
    /**
     * @return {Ext.Element}
     */
    getScrollEl() {
        if (Ext.os.is.Phone)
            return this.getBlock().getPopup().innerElement;
        return this.callParent(args);
    },
    /**
     * @return {Promise} will be resolved with list of comments.
     */
    reload() {
        const blockId = this.getBlock().getDocId(), scored = this.isScored();
        return Promise.resolve().then(() => CJ.Comment.loadItems(blockId, { scored })).then(response => {
            response.ret.request = response.request;
            return response.ret;
        });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    onReload(data) {
        this.setComments(data);
    },
    /**
     * hides comments-feed with an animation.
     * @return {Promise} will be resolved when an animation is over.
     */
    animateFeedHide() {
        const element = this.element;
        element.addCls('d-animate-feed-hide');
        return Promise.resolve().then(() => new Promise(resolve => {
            setTimeout(resolve, 250);
        }));
    },
    /**
     * shows comments-feed with an animation.
     * @return {Promise} will be resolved when an animation is over.
     */
    animateFeedShow() {
        const element = this.element, cls = 'd-active-feed-show';
        element.replaceCls('d-animate-feed-hide', cls);
        element.set({ 'data-tab': this.getActiveTab() });
        return Promise.resolve().then(() => new Promise(resolve => {
            setTimeout(resolve, 250);
        })).then(() => {
            element.removeCls(cls);
        });
    },
    /**
     * @return {Boolean} true if current comments list displays scored comments.
     */
    isScored() {
        return this.getActiveTab() == 'faq';
    }
});