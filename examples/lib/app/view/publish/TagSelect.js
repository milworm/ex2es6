import 'Ext/Component';

Ext.define('CJ.view.publish.TagSelect', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-tag-select',
    /**
     * @property {Number} loadTimerId
     */
    loadTimerId: null,
    /**
     * @property {Object} eventedConfig
     */
    eventedConfig: null,
    /**
     * @property {Object} config
     */
    config: {
        floatingCls: null,
        hiddenCls: null,
        styleHtmlCls: null,
        tplWriteMode: null,
        disabledCls: null,
        carousel: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-tag-select',
        /**
         * @cfg {Array} tags
         */
        tags: [],
        /**
         * @cfg {Array} staticTags
         */
        staticTags: [],
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {Number} requestId
         */
        requestId: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<input class=\'d-field d-input\' placeholder=\'{placeholder}\' />', '<div class=\'d-list\'></div>', { compiled: true }),
        /**
         * @cfg {Ext.Template} itemTpl
         */
        itemsTpl: Ext.create('Ext.XTemplate', '<tpl for=\'staticTags\'>', '<div class=\'d-item d-selected\' data-tag=\'{.}\'>', '{[ CJ.capitalize(values.replace(/[@#%]/g, \'\')) ]}', '</div>', '</tpl>', '<tpl for=\'items\'>', '<div class=\'d-item {[ this.isSelected(values, parent.selectedTags) ? \'d-selected\' : \'\' ]}\' data-tag=\'{name}\'>', '{[ CJ.capitalize(values.title.replace(/[@#%]/g, \'\')) ]}', '</div>', '</tpl>', {
            compiled: true,
            isSelected(values, selectedTags) {
                return selectedTags.indexOf(values.title) > -1;
            }
        }),
        /**
         * @cfg {Ext.Template} itemTpl
         */
        selectedItemsTpl: Ext.create('Ext.XTemplate', '<tpl for=\'.\'>', '<div class=\'d-item\' data-tag=\'{name}\'>', '{[ CJ.capitalize(values.title.replace(/[@#%]/g, \'\')) ]}', '</div>', '</tpl>', { compiled: true })
    },
    constructor() {
        this.callParent(args);
        this.load();
    },
    /**
     * @return {undefined}
     */
    initElement() {
        this.callParent(args);    // because IE emits input-event when an input has a placeholder attribute.
        // because IE emits input-event when an input has a placeholder attribute.
        if (Ext.browser.is.IE)
            Ext.TaskQueue.requestWrite(this.initElementListeners, this);
        else
            this.initElementListeners();
    },
    initElementListeners() {
        this.element.on('tap', this.onElementTap, this);
        this.element.on({
            keypress: this.onFieldKeyPress,
            input: this.onFieldChange,
            scope: this,
            delegate: '.d-field'
        });
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        const tagNode = e.getTarget('.d-item', 2);
        if (!tagNode)
            return;
        this.onTagTap(tagNode);
    },
    /**
     * @param {HTMLElement} tagNode
     */
    onTagTap(tagNode) {
        const tag = CJ.getNodeData(tagNode, 'tag');
        if (tagNode.classList.contains('d-selected'))
            this.deselectTag(tag);
        else
            this.selectTag(tag);
    },
    /**
     * @param {String} tag
     * @return {undefined}
     */
    selectTag(tag) {
        this.setSearchValue('');
        this.getTags().push(tag);
        this.load();
    },
    /**
     * @param {String} tag
     * @return {undefined}
     */
    deselectTag(tag) {
        if (this.getStaticTags().indexOf(tag) > -1)
            return;
        Ext.Array.remove(this.getTags(), tag);
        this.setSearchValue('');
        this.load();
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateLoading(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-loading');
        if (state)
            this.element.dom.querySelector('.d-list').scrollTop = 0;
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        data = Ext.apply({ placeholder: CJ.t('view-publish-tag-select-placeholder', true) }, data);
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * loads suggestions.
     * @return {undefined}
     */
    load() {
        this.setLoading(true);
        let tags = this.getStaticTags().join(' ');
        const search = this.getSearchValue();
        let request;
        tags += ' ';
        if (!Ext.isEmpty(search))
            tags += search;
        request = CJ.Tag.load(tags, {
            scope: this,
            success: this.onLoadSuccess,
            failure: this.onLoadFailure
        });
        this.setRequestId(request.id);
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onLoadSuccess(response, request) {
        this.setLoading(false);
        this.renderTags(response.ret);
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onLoadFailure(response, request) {
        this.setLoading(false);
    },
    /**
     * @param {Array} items
     * @return {undefined}
     */
    renderTags(items) {
        if (this.isAutocomplete())
            this.renderAutocompleteTags(items);
        else
            this.renderSuggestionTags(items);
        this.initMode();
    },
    /**
     * for autocomplete mode we need to add search-string when results do not contain it, and render user created tags
     * that don't exist from server's response.
     * @param {Array} items
     * @return {undefined}
     */
    renderAutocompleteTags(items) {
        let value = this.getSearchValue();
        const responseTags = Ext.Array.pluck(items, 'title');
        const selectedTags = Ext.Array.difference(this.getTags(), this.getStaticTags());
        value = `#${ value.toLowerCase() }`;    // adding tags created by user.
        // adding tags created by user.
        for (let i = 0, tag; tag = selectedTags[i]; i++) {
            if (tag.indexOf(value) == 0 && responseTags.indexOf(tag) == -1) {
                items.push({
                    name: tag,
                    title: tag
                });
                responseTags.push(tag);
            }
        }    // add search-string if it's missing in response.
        // add search-string if it's missing in response.
        if (responseTags.indexOf(value) == -1)
            items.unshift({
                name: value,
                title: value
            });
        this.element.dom.querySelector('.d-list').innerHTML = this.getItemsTpl().apply({
            items,
            selectedTags: this.getTags(),
            staticTags: []
        });
    },
    /**
     * for non-autocomplete mode we need to show selected items at top of the list.
     * @param {Array} items
     * @return {undefined}
     */
    renderSuggestionTags(items) {
        const staticTags = this.getStaticTags(), selectedTags = this.getTags();
        for (var i = 0, k = 0, item; item = items[i]; i++)
            if (selectedTags.indexOf(item.title) > -1) {
                items.splice(i, 1);
                items.splice(k++, 0, item);
            }
        const tags = Ext.Array.pluck(items, 'title');
        let diff = Ext.Array.difference(selectedTags, tags);
        diff = Ext.Array.difference(diff, staticTags);
        for (let i = 0, tag; tag = diff[i]; i++)
            items.splice(k++, 0, {
                name: tag,
                title: tag
            });
        this.element.dom.querySelector('.d-list').innerHTML = this.getItemsTpl().apply({
            items,
            selectedTags,
            staticTags
        });
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onFieldChange(e) {
        this.abort();
        this.setLoading(true);
        clearTimeout(this.loadTimerId);
        this.loadTimerId = Ext.defer(this.load, 250, this);
        this.getCarousel().setFocusOn(this);
    },
    /**
     * @param {Ext.Evented} e
     * @param {HTMLElement} target
     * @return {undefined}
     */
    onFieldKeyPress(e, target) {
        if (e.browserEvent.keyCode != 13)
            return;
        const tag = `#${ target.value }`;
        if (this.getTags().indexOf(tag) == -1)
            this.selectTag(tag);
        this.getCarousel().setFocusOn(this);
    },
    /**
     * @return {String}
     */
    getSearchValue() {
        let value = this.element.dom.querySelector('.d-field').value;
        value = Ext.String.trim(value);
        value = value.replace(/[^À-ÿa-zA-Z0-9_\-]/g, '');
        return value;
    },
    /**
     * @param {String}
     */
    setSearchValue(value) {
        return this.element.dom.querySelector('.d-field').value = value;
    },
    /**
     * @return {undefined}
     */
    initMode() {
        this.element[this.isAutocomplete() ? 'addCls' : 'removeCls']('d-autocomplete');
    },
    /**
     * @return {Boolean}
     */
    isAutocomplete() {
        return !Ext.isEmpty(this.getSearchValue());
    },
    /**
     * tag-select will automatically upate #tags property so we don't have any changes to be applied.
     * @return {Ext.Component}
     */
    applyChanges() {
        return this;
    },
    /**
     * aborts current request.
     * @return {undefined}
     */
    abort() {
        CJ.Ajax.abort(this.getRequestId());
    },
    /**
     * @return {undefined}
     */
    destroy() {
        clearTimeout(this.loadTimerId);
        this.abort();
        this.callParent(args);
    }
});