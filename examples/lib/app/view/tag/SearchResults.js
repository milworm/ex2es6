/**
 * Defines a component that is used to show the search results popup for global search field.
 */
Ext.define('CJ.view.tag.SearchResults', {
    /**
     * @property {Object} mixins
     */
    mixins: ['Ext.mixin.Observable'],
    /**
     * @property {String} alias
     */
    alias: 'widget.view-tag-search-results',
    /**
     * @property {Ext.Element} element
     */
    element: null,
    /**
     * @property {Ext.XTemplate} tpl
     */
    tpl: Ext.create('Ext.XTemplate', '<div class=\'d-search-results\'>', '<div class=\'d-hint\'>', '<span>{hint}</span>', '<tpl if=\'CJ.User.isPortal()\'>', '<label class=\'d-checkbox\'>', '<input type=\'checkbox\' checked=\'checked\' class=\'checkbox-element\'>', '<div class=\'d-icon\'></div>', '<span>{relevantContentOnly}</span>', '</label>', '</tpl>', '</div>', '<div class=\'d-search-results-inner\'></div>', '<div class=\'d-hint\'>', '<span class=\'d-footer-text\'>', '{footerText}', '</span>', '</div>', '</div>'),
    /**
     * @property {Ext.XTemplate} listTpl
     */
    listTpl: Ext.create('Ext.XTemplate', '<div class=\'d-items\'>', '<tpl if=\'items.length == 0\'>', '<div class=\'d-title\'>{[ CJ.t(\'view-viewport-search-results-empty\') ]}</div>', '</tpl>', '<tpl for=\'items\'>', '<tpl if=\'["user", "portal"].indexOf(type) &gt; -1\'>', '<div class=\'d-item d-user-item\' data-index=\'{[xindex - 1]}\'>', '<span class=\'d-icon\' style=\'background-image:url("{icon}")\'></span>', '<span class=\'d-title\'>{title}</span>', '<span class=\'d-tag\'>{name}</span>', '<span class=\'d-arrow\'></span>', '</div>', '<tpl elseif=\'type=="tag"\'>', '<div class=\'d-item d-tag-item\' data-index=\'{[xindex - 1]}\'>', '<span class=\'d-icon\'></span>', '<span class=\'d-title\'>{[ CJ.capitalize(values.name.substring(1)) ]}</span>', '<span class=\'d-tag\'>{[ CJ.t(\'view-tag-search-results-tag\') ]}</span>', '<span class=\'d-arrow\'></span>', '</div>', '</tpl>', '</tpl>', '</div>'),
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Number} requestId
         */
        requestId: null,
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {Boolean} empty
         */
        empty: null,
        /**
         * @cfg {Number} cursor
         */
        cursor: null,
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {Ext.Component} searchField
         */
        searchField: null,
        /**
         * @cfg {Boolean} floating Should be true if component should track resize-events and automatically adjust it's
         *                         position.
         */
        floating: null,
        /**
         * @cfg {Boolean} localSearch
         */
        localSearch: null
    },
    /**
     * @param {Object} config
     */
    constructor(config undefined {}) {
        config.localSearch = CJ.User.isPortal();
        this.initElement();
        this.initListeners();
        this.initConfig(config);
        if (config.renderTo)
            this.renderTo(config.renderTo);
    },
    /**
     * @param {Number} index
     * @param {Number} oldIndex
     */
    applyCursor(index, oldIndex) {
        const lastIndex = this.getItems().length - 1;
        let node;
        if (index < 0)
            index = 0;
        if (index > lastIndex)
            index = lastIndex;
        node = this.getItemNode(oldIndex);
        if (node)
            node.classList.remove('d-selected');
        node = this.getItemNode(index);
        if (node) {
            node.classList.add('d-selected');
            CJ.Utils.scrollIntoViewIfNeeded(node);
        }
        return index;
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateFloating(state) {
        if (state)
            this.adjustPosition();
        Ext.Viewport.content[state ? 'on' : 'un']('resize', this.adjustPosition, this);
    },
    /**
     * @param {Number} index
     * @return {HTMLElement}
     */
    getItemNode(index) {
        return this.element.dom.querySelectorAll('.d-item')[index];
    },
    /**
     * creates the element.
     */
    initElement() {
        let template, element, html;
        html = this.tpl.apply({
            hint: CJ.t('view-viewport-search-results-hint'),
            relevantContentOnly: CJ.tpl(CJ.t('view-viewport-search-results-relevant-content-only'), CJ.User.getPortalName())
        });
        if (CJ.Utils.supportsTemplate()) {
            template = document.createElement('template');
            template.innerHTML = html;
            element = template.content.firstChild;
        } else {
            template = document.createElement('div');
            template.innerHTML = html;
            element = template.firstChild;
        }
        this.element = Ext.get(element);
        this.element.on({
            tap: {
                fn: this.onElementTap,
                scope: this
            },
            change: {
                fn: this.onCheckboxChange,
                scope: this,
                delegate: '.checkbox-element'
            }
        });
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onCheckboxChange(e) {
        const target = e.target, footerText = this.element.dom.querySelector('.d-footer-text');
        this.setLocalSearch(e.target.checked);
        this.search(this.getSearchField().getInputValue());
    },
    /**
     * @return {undefined}
     */
    updateFooterText() {
        const element = this.element.dom.querySelector('.d-footer-text');
        let portal = CJ.User.getPortalName();
        if (!element)
            return;
        if (!portal || !this.getLocalSearch())
            portal = 'ChallengeU';
        else
            portal += '@';
        element.innerHTML = CJ.tpl(CJ.t('view-viewport-search-footer-text'), portal);
    },
    /**
     * @return {undefined}
     */
    initListeners() {
        this.onBodyKeyDown = Ext.bind(this.onBodyKeyDown, this);
        document.body.addEventListener('keydown', this.onBodyKeyDown);
    },
    /**
     * @param {Ext.Element} element
     * @return {undefined}
     */
    renderTo(element) {
        element.appendChild(this.element);
        CJ.PopupManager.onShow(this);
        CJ.fire('buttons.invisible');
    },
    /**
     * @param {Boolean} state
     */
    updateLoading(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-loading');
    },
    /**
     * @param {Boolean} state
     */
    updateEmpty(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-empty');
    },
    /**
     * @return {HTMLElement}
     */
    getInnerNode() {
        return this.element.dom.querySelector('.d-search-results-inner');
    },
    /**
     * @return {undefined}
     */
    abort() {
        CJ.Ajax.abort(this.getRequestId());
    },
    /**
     * @param {Array} items
     * @return {undefined}
     */
    renderResults(items) {
        const html = this.listTpl.apply({ items });
        this.getInnerNode().innerHTML = html;
        this.updateFooterText();
    },
    /**
     * @param {String} tags
     * @return {undefined}
     */
    search(tags) {
        this.abort();
        const request = CJ.request({
            rpc: {
                model: 'Tag',
                method: 'search'
            },
            params: {
                tags,
                portalOnly: this.getLocalSearch()
            },
            scope: this,
            success: this.onSearchSuccess,
            failure: this.onSearchFailure,
            callback: this.onSearchCallback
        });
        this.setRequestId(request.id);
        this.setLoading(true);
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onSearchSuccess(response) {
        this.setItems(response.ret);
        this.renderResults(response.ret);
        this.setEmpty(response.ret.length == 0);
        if (this.getSearchField().getInputMode() == 'autocomplete')
            this.setCursor(0);
        else
            // silently show cursor at -1 position in order to show the first item next time when user hits down-arrow
            this._cursor = -1;
    },
    onSearchFailure() {
    },
    onSearchCallback() {
        this.setLoading(false);
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        if (!e.getTarget('.d-item'))
            return;
        this.onItemTap(e);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onItemTap(e) {
        const node = e.getTarget('.d-item'), index = CJ.getNodeData(node, 'index');
        this.setCursor(index);
        if (e.getTarget('.d-arrow'))
            this.fireArrowTapEvent();
        else
            this.fireSelectEvent();
    },
    /**
     * @param {Event} e
     */
    onBodyKeyDown(e) {
        switch (e.keyCode) {
        // arrow up
        case 38:
            e.preventDefault();
            this.highlightPreviousItem();
            break;    // arrow down
        // arrow down
        case 40:
            e.preventDefault();
            this.highlightNextItem();
            break;    // arrow right
        // arrow right
        case 39:
            this.onRightArrowPress(e);
            return;
        }
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onRightArrowPress(e) {
        const input = this.getSearchField().getInputElement();
        if (CJ.Utils.cursorPosition(input) != 'end')
            return;
        this.fireArrowTapEvent();
    },
    /**
     * highlights previous item in list.
     * @return {undefined}
     */
    highlightPreviousItem() {
        this.setCursor(this.getCursor() - 1);
        this.afterHighlightItem();
    },
    /**
     * highlights next item in list.
     * @return {undefined}
     */
    highlightNextItem() {
        this.setCursor(this.getCursor() + 1);
        this.afterHighlightItem();
    },
    /**
     * method will be called after user highlights an item from the list.
     * @return {undefined}
     */
    afterHighlightItem() {
        this.fireEvent('highlight', this.getSelected(), this);
    },
    /**
     * method will be called when user taps on an arrow or when user presses right-arrow key.
     * @return {undefined}
     */
    fireArrowTapEvent() {
        const item = this.getSelected();
        if (item)
            this.fireEvent('arrowtap', item, this);
    },
    /**
     * method will be called when user taps on an item or presses enter-key
     * @return {undefined}
     */
    fireSelectEvent() {
        this.fireEvent('select', this.getSelected(), this);
    },
    /**
     * @return {Object}
     */
    getSelected() {
        return this.getItems()[this.getCursor()];
    },
    /**
     * method is used only by CJ.PopupManager.
     * @return {undefined}
     */
    hide() {
        const field = this.getSearchField();
        field.setSearchResults(null);
        field.setEditing(false);
    },
    /**
     * calculates the position of a component relativealy to #searchField
     * @return {undefined}
     */
    adjustPosition() {
        const region = this.getSearchField().getPageBox(), cssText = CJ.tpl('top: {0}px; left: {1}px; width: {2}px', region.bottom + 10, region.left, region.width);
        this.element.dom.style.cssText = cssText;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.abort();
        this.setFloating(false);
        CJ.PopupManager.onHide(this);
        CJ.fire('buttons.visible');
        this.element.destroy();
        document.body.removeEventListener('keydown', this.onBodyKeyDown);
    }
});