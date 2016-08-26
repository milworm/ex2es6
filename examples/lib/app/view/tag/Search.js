import 'app/view/tag/SearchResults';

Ext.define('CJ.view.tag.Search', {
    /**
     * @property {Array} mixins
     */
    mixins: ['Ext.mixin.Observable'],
    /**
     * @property {String} alias
     */
    alias: 'widget.view-tag-search',
    /**
     * @property {Object} tagsTemplates
     */
    tagsTemplates: {},
    /**
     * @property {Ext.Element} element
     */
    element: null,
    /**
     * @cfg {String} tpl
     */
    tpl: [
        '<div class=\'d-search-element\'>',
        '<div class=\'d-search-element-inner\'>',
        '<div class=\'d-tags\'></div>',
        '<input class=\'d-input\' type=\'text\'/>',
        '</div>',
        '<div class=\'d-search-icon\'></div>',
        '</div>'
    ].join(''),
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} mode Defines the mode of tag-search [suggestions or autocomplete].
         */
        mode: null,
        /**
         * @cfg {String} tags Tags that represent the state of an app. Usullay this property will be updated only when
         *                    user loads new feed.
         */
        tags: null,
        /**
         * @cfg {String} visibleTags Tags that are actually visible.
         */
        visibleTags: null,
        /**
         * @cfg {Boolean} editing Defines the state of a component.
         */
        editing: null,
        /**
         * @cfg {Ext.Component} searchResults Reference to SearchResults component.
         */
        searchResults: null,
        /**
         * @cfg {Boolean} hidden
         */
        hidden: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initElement();
        this.refreshHidden();
        this.initTemplates();
        this.initConfig(config);
        if (config.renderTo)
            this.renderTo(config.renderTo);
        CJ.on('portal.update', this.updatePortalTag, this);
    },
    /**
     * method updates component's hidden-state based on specific rules.
     * @return {undefined}
     */
    refreshHidden() {
        var state = CJ.User.inAppDomain() && !CJ.User.isLogged();
        const state = state || CJ.User.isFgaStudent();
        this.setHidden(state);
    },
    /**
     * creates templates for each type of tag (explore, category, feed, user, tag)
     * @return {undefined}
     */
    initTemplates() {
        Ext.apply(this.tagsTemplates, {
            explore: Ext.create('Ext.Template', '<div class=\'d-tag d-explore-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-text\'>{tagTitle}</div>', '<div class=\'d-remove-icon\'></div>', '</div>', { compiled: true }),
            feed: Ext.create('Ext.Template', '<div class=\'d-tag d-feed-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-text\'>{tagTitle}</div>', '<div class=\'d-remove-icon\'></div>', '</div>', { compiled: true }),
            profile: Ext.create('Ext.Template', '<div class=\'d-tag d-profile-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-text\'>{tagTitle}</div>', '<div class=\'d-remove-icon\'></div>', '</div>', { compiled: true }),
            purchased: Ext.create('Ext.Template', '<div class=\'d-tag d-purchased-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-text\'>{tagTitle}</div>', '<div class=\'d-remove-icon\'></div>', '</div>', { compiled: true }),
            group: Ext.create('Ext.Template', '<div class=\'d-tag d-group-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-text\'>{tag}</div>', '</div>', { compiled: true }),
            user: Ext.create('Ext.Template', '<div class=\'d-tag d-user-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\' style=\'background-image: url("{icon}")\'></div>', '<div class=\'d-text\'>{tag}</div>', '</div>', { compiled: true }),
            portal: Ext.create('Ext.Template', '<div class=\'d-tag d-portal-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\' style=\'background-image: url("{icon}")\'></div>', '<div class=\'d-text\'>{tag}</div>', '</div>', { compiled: true }),
            category: Ext.create('Ext.Template', '<div class=\'d-tag d-category-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\' style=\'background-image: url("{icon}")\'></div>', '<div class=\'d-text\'>{name}</div>', '</div>', { compiled: true }),
            tag: Ext.create('Ext.XTemplate', '<div class=\'d-tag d-simple-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-text\'>{[ CJ.capitalize(values.tag) ]}</div>', '</div>'),
            id: Ext.create('Ext.XTemplate', '<div class=\'d-tag d-simple-tag\' data-tag=\'{tag}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-text\'>{tag}</div>', '</div>')
        });
    },
    /**
     * @param {Object} param
     * @return {undefined}
     */
    initElement() {
        const html = this.tpl;
        let template;
        if (CJ.Utils.supportsTemplate()) {
            template = document.createElement('template');
            template.innerHTML = html;
            template = template.content;
        } else {
            template = document.createElement('div');
            template.innerHTML = html;
        }
        this.element = Ext.get(template.firstChild);
        this.element.on('tap', this.onElementTap, this);
        this.element.on({
            keydown: this.onKeyDown,
            input: this.onInput,
            delegate: '.d-input',
            scope: this
        });
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateHidden(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-hidden');
    },
    /**
     * @param {Ext.Element} element
     * @return {undefined}
     */
    renderTo(element) {
        element.appendChild(this.element.dom);
    },
    /**
     * transforms search-field back to viewing-state.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onPageTap(e) {
        if (e.getTarget('.d-search-results, .d-search-element'))
            return;
        this.setEditing(false);
    },
    /**
     * @param {Object} config
     * @return {Ext.Component|Boolean}
     */
    applySearchResults(config) {
        if (!config)
            return false;
        return Ext.factory({
            xtype: 'view-tag-search-results',
            renderTo: this.element,
            searchField: this,
            listeners: {
                scope: this,
                arrowtap: this.onSuggestionArrowTap,
                select: this.onSuggestionSelect
            }
        });
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     * @return {undefined}
     */
    updateSearchResults(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        const element = this.element;
        if (newComponent)
            element.addCls('d-with-search-results');
        else
            element.removeCls('d-with-search-results');
    },
    /**
     * restores tags, visibleTags and inputValue.
     */
    resetTags() {
        const tags = this.getTags();
        this.setTags('');
        this.setTags(tags);
    },
    /**
     * @param {String} tags
     * @return {String}
     */
    applyTags(tags) {
        return Ext.String.trim(tags.replace(/,/g, ' '));
    },
    /**
     * @param {String} tags
     */
    updateTags(tags) {
        this.setVisibleTags(tags);
        this.setInputValue(tags);
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateEditing(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-editing');
        Ext.getBody()[state ? 'on' : 'un']('touchstart', this.onPageTap, this);
        if (state)
            this.toEditState();
        else
            this.toViewState();
    },
    /**
     * transforms component to editing-state.
     * @return {undefined}
     */
    toEditState() {
        const type = this.getType();
        let value = '';    // for explore on desktop we don't need to make search according to specs.
        // for explore on desktop we don't need to make search according to specs.
        if (Ext.os.is.Desktop && ['explore'].indexOf(type) > -1) {
            this.setInputValue('');
            this.focus();
            return;
        }    // when user is on one of these tags we need to show empty-input field.
        // when user is on one of these tags we need to show empty-input field.
        if ([
                'explore',
                'feed',
                'id',
                'profile',
                'purchased'
            ].indexOf(type) == -1)
            value = this.getVisibleTags();
        if (this.getMode() == 'suggestions')
            value += ' ';
        this.setInputValue(value);
        this.focus();
        this.search();
    },
    /**
     * transforms component to viewing-state.
     * @return {undefined}
     */
    toViewState() {
        let value = this.getValidatedInputValue();
        if (Ext.isEmpty(value))
            value = this.getVisibleTags();
        value = CJ.Utils.fixTags(value);
        this.setVisibleTags(value);
        this.setSearchResults(null);
        this.setMode(null);
        this.blur();
        clearTimeout(this.inputTimerId);
    },
    /**
     * @return {Boolean} true if page has a dynamic url (not an explore or feed page).
     */
    hasDynamicUrl() {
        return [
            'explore',
            'feed',
            'profile',
            'purchased'
        ].indexOf(this.getType()) == -1;
    },
    /**
     * @param {String} tags
     * @return {String}
     */
    applyVisibleTags(tags) {
        return Ext.String.trim(tags);
    },
    /**
     * @param {String} tags
     * @return {undefined}
     */
    updateVisibleTags(tags) {
        this.renderTags(tags);
    },
    /**
     * @param {Object} tag
     * @param {String} tag.name
     * @param {String} tag.type
     * @param {Ext.Component} component
     * @return {undefined}
     */
    onSuggestionArrowTap(tag, component) {
        this.appendTag(tag);
        this.search();    // because user tapped on arrow so the focus is lost.
        // because user tapped on arrow so the focus is lost.
        this.focus();
    },
    /**
     * @param {Object} tag
     * @param {String} tag.name
     * @param {String} tag.type
     * @return {undefined}
     */
    onSuggestionSelect(tag) {
        if (tag)
            this.addSelectedTag(tag);
        this.setEditing(false);
        this.setTags(this.getVisibleTags());
        this.redirect();
    },
    /**
     * adds a tag selected in #searchResults
     * @param {Object} tag
     * @param {String} tag.name
     * @param {String} tag.type
     */
    addSelectedTag(tag) {
        const localSearch = this.getSearchResults().getLocalSearch(), value = this.getValidatedInputValue(), valueTagType = CJ.Utils.getTagType(value);    // local search is enabled and one is going to add a tag to "tag"-string
        // local search is enabled and one is going to add a tag to "tag"-string
        if (localSearch && valueTagType == 'tag' && tag.type == 'tag')
            this.appendTag({
                type: 'portal',
                name: CJ.User.getPortalTag()
            });
        this.appendTag(tag);
    },
    /**
     * adds a tag to #visibleTags and updates UI.
     * @param {Object} tag
     * @param {String} tag.type user, tag ...
     * @param {String} tag.name The tag itself.
     */
    appendTag(tag) {
        switch (tag.type) {
        case 'user':
        case 'portal':
            this.appendUserTag(tag);
            break;
        default:
            this.appendSimpleTag(tag);
            break;
        }
    },
    /**
     * @param {Object} tag
     * @param {String} tag.name
     * @return {undefined}
     */
    appendUserTag(tag) {
        const value = this.getInputValue(), type = CJ.Utils.getTagType(value);
        switch (type) {
        case 'group':
        case 'category':
            this.appendUserTagToCategoryType(tag);
            break;
        default:
            this.appendUserTagToDefaultType(tag);
            break;
        }
        this.updateUserTag({ icon: tag.icon });
    },
    /**
     * simply adds new tag to search-field.
     * @param {Object} tag
     * @param {String} tag.type
     * @param {String} tag.name
     * @param {Boolean} appendOnly True if you want to only append new tag, otherwise it will append or replace the last
     *                             tag depending on component's autocomplete state.
     * @return {undefined}
     */
    appendSimpleTag(tag, appendOnly) {
        this.appendTagToInput(tag.name.substring(1), appendOnly);
    },
    /**
     * appends tag to input-node using following rules:
     *  [tag1 ] -> [tag1 TAG ]
     *  [tag1] -> [TAG ]
     *  [] -> [TAG ]
     * @param {String} tag
     * @param {Boolean} appendOnly
     * @return {undefined}
     */
    appendTagToInput(tag, appendOnly) {
        const value = this.getInputValue();
        let result = '';
        if (appendOnly) {
            result = `${ Ext.String.trim(value) } ${ tag } `;
        } else {
            if (this.getInputMode() == 'autocomplete') {
                const lastWhitespaceIndex = value.lastIndexOf(' ');    // find last tag to autocomplete
                // find last tag to autocomplete
                if (lastWhitespaceIndex > -1)
                    result = value.substring(0, lastWhitespaceIndex + 1);
                result += `${ tag } `;
            } else {
                result = `${ value + tag } `;
            }
        }
        this.setInputValue(result);
    },
    /**
     * @return {String} type of the search-bar.
     */
    getType() {
        return CJ.Utils.getTagType(this.getVisibleTags());
    },
    /**
     * @param {Object} tag
     * @param {String} tag.name
     * @return {undefined}
     */
    appendUserTagToCategoryType(tag) {
        const tags = this.getInputValue().split(' ');
        tags.splice(1, 0, tag.name);
        this.setInputValue(tags.join(' '));
    },
    /**
     * @param {Object} tag
     * @param {String} tag.name
     * @return {undefined}
     */
    appendUserTagToDefaultType(tag) {
        tag = tag.name;
        const value = this.getInputValue();
        let result = '';    // last character is a whitespace, so we need to append new tag
        // last character is a whitespace, so we need to append new tag
        if (value[value.length - 1] == ' ') {
            result = `${ tag } ${ value }`;
        } else {
            // else replace the last tag, because it's not a tag (it's just a part of it)
            const lastWhitespaceIndex = value.lastIndexOf(' ');
            if (lastWhitespaceIndex > -1)
                result = value.substring(0, lastWhitespaceIndex + 1);
            result += `${ tag } `;
        }
        this.setInputValue(result);
    },
    /**
     * @param {Array} tags
     * @return {undefined}
     */
    renderTags(tags) {
        const html = [], tags = Ext.isArray(tags) ? tags : tags.split(' ');
        for (let i = 0, tag; tag = tags[i]; i++) {
            const type = CJ.Utils.getTagType(tag), tpl = this.tagsTemplates[type], data = {};
            if (tag.length == 0)
                continue;
            data.tag = tag;
            data.index = i;
            switch (type) {
            case 'group': {
                    this.beforeGroupTagRender(data);
                    break;
                }
            case 'category': {
                    this.beforeCategoryTagRender(data);
                    break;
                }
            case 'user': {
                    this.beforeUserTagRender(data);
                    break;
                }
            case 'tag': {
                    this.beforeSimpleTagRender(data);
                    break;
                }
            default: {
                    data.tagTitle = CJ.t(`view-viewport-top-bar-tag-${ type }`);
                    break;
                }
            }
            html.push(tpl.apply(data));
        }
        this.getTagsElement().innerHTML = html.join('');
    },
    /**
     * @return {HTMLElement}
     */
    getTagsElement() {
        return this.element.dom.querySelector('.d-tags');
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    beforeGroupTagRender(data) {
        data.hashId = data.tag;
        const group = CJ.StreamHelper.getGroup();
        if (group)
            data.tag = group.name;
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    beforeCategoryTagRender(data) {
        const category = CJ.User.getCategoryByTag(data.tag);    // portals don't have categories stored in user's session.
        // portals don't have categories stored in user's session.
        if (!category)
            return;
        data.name = category.name;
        data.icon = category.icon;
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    beforeUserTagRender(data) {
        const user = CJ.User;
        if (user.isMineTags(data.tag)) {
            data.icon = user.get('icon');
            data.name = user.get('name');
        } else {
            data.icon = `${ Core.opts.resources_root }/resources/webapp/images/user.jpg`;
            data.name = data.tag;
        }
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    beforeSimpleTagRender(data) {
        data.tag = data.tag.substring(1);
    },
    /**
     * @param {Object} request
     * @return {String}
     */
    getTagsFromRequest(request) {
        const params = request.params;
        let tags = params.tags;
        if (params.id)
            tags = `%${ params.id }`;
        return tags;
    },
    /**
     * @param {Object} request
     */
    setTagsFromRequest(request) {
        // this line is needed because we need to:
        // 1. display correctly translated tag's title, when user changes language on category-page.
        // 2. display correct tags when user is on user1-page, changed tags and didn't submit them, went to user1-link.
        this.setTags('');
        this.setTags(this.getTagsFromRequest(request));
        CJ.fire('tags.change', this);
    },
    /**
     * @param {Object} group
     */
    updateGroupTag(group) {
        const node = this.element.dom.querySelector('.d-group-tag .d-text');
        if (node)
            node.innerHTML = group.name;
    },
    /**
     * @param {Object} data
     */
    updateUserTag(user) {
        const node = this.element.dom.querySelector('.d-user-tag');
        try {
            node.querySelector('.d-icon').style.cssText = `background-image: url('${ user.icon }')`;
        } catch (e) {
        }
    },
    /**
     * @param {Object} data
     */
    updatePortalTag(data) {
        const node = this.element.dom.querySelector('.d-portal-tag');
        try {
            node.querySelector('.d-icon').style.cssText = `background-image: url('${ data.icon }')`;
        } catch (e) {
        }
    },
    /**
     * @param {Object} data
     */
    updateCategoryTag(data) {
        const node = this.element.dom.querySelector('.d-category-tag');
        try {
            node.querySelector('.d-icon').style.cssText = `background-image: url('${ data.icon }')`;
            node.querySelector('.d-text').innerHTML = data.name;
        } catch (e) {
        }
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-search-icon'))
            return this.onSearchIconTap(e);
        if (e.getTarget('.d-tags'))
            return this.onSearchElementTap(e);
    },
    /**
     * opens a licensed-container, in case when we have pin-code in url.
     * @return {undefined}
     */
    openLicensedContainer() {
        const value = Ext.String.trim(this.getInputValue());
        if (!/^[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{4}$/.exec(value))
            return false;
        this.resetTags();
        this.setEditing(false);
        CJ.app.redirectTo(`!activate/${ value }`);
        return true;
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onSearchIconTap(e) {
        if (!this.getEditing())
            return this.setEditing(true);
        this.setEditing(false);
        if (this.openLicensedContainer())
            return;
        const value = this.getValidatedInputValue();
        if (!Ext.isEmpty(value))
            this.redirect();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onSearchElementTap(e) {
        const node = e.getTarget('.d-tag', 5);
        if (node && this.hasDynamicUrl()) {
            const tag = CJ.Utils.getNodeData(node, 'tag').toString();
            this.setMode('autocomplete');
            this.onTagTap(e, tag);
        } else {
            this.setMode('suggestions');
            this.setEditing(true);
        }
    },
    /**
     * @param {String} tag
     * @return {undefined}
     */
    onTagTap(e, tag) {
        const adjustCursor = true;
        this.setEditing(true);    // @TODO find a better way of doing this.
        // @TODO find a better way of doing this.
        this.setInputValue(this.getVisibleTags());
        this.search();
        if (adjustCursor)
            this.setInputCursorFromTag(tag);
    },
    /**
     * method will be called when user clicks on a chiclet. Moves a cursor to the end of clicked chiclet.
     * @param {String} tag
     */
    setInputCursorFromTag(tag) {
        const value = this.getInputValue();
        const items = value.split(' ');
        let index = 0;
        for (let i = 0, item; item = items[i]; i++) {
            index += item.length + 1;
            if (item == tag) {
                index--;
                break;
            }
        }
        this.getInputElement().setSelectionRange(index, index);
    },
    /**
     * @param {String} tag
     * @return {undefined}
     */
    removeTag(tag) {
        const tags = this.getTags().split(' ');
        Ext.Array.remove(tags, tag);
        this.setInputValue(tags.join(' '));
    },
    /**
     * removes duplicate tags and denied symbols.
     * @return {undefined}
     */
    validate(value) {
        const tags = value.split(' '), newSimpleTags = [], newCompelexTags = [], counters = {};
        for (let i = 0, l = tags.length; i < l; i++) {
            const tag = tags[i];
            let result = tag.replace(/[\!\+\$\#\/\%\&]/g, '');
            if (/^(\+|\$|\%){1}/.test(tag)) {
                // it's group, category or id
                result = tag[0] + result.replace(/@/g, '');
                if (result.length == 1)
                    continue;
            } else {
                // it's simple or user tag.
                let symbolCount = 0;
                result = result.replace(/@/g, () => ++symbolCount == 1 ? '@' : '');
            }
            if (result.length == 0)
                continue;
            const type = CJ.Utils.getTagType(result);
            let counter;
            switch (type) {
            case 'tag': {
                    counter = `_tag_${ result }`;
                    break;
                }
            default: {
                    counter = type;
                    break;
                }
            }
            counters[counter] = counters[counter] || 0;
            counters[counter]++;
            if (counters[counter] == 1) {
                if (type == 'tag')
                    newSimpleTags.push(result);
                else
                    newCompelexTags.push(result);
            }
        }
        const newTags = this.correctTagsSequence(newCompelexTags, newSimpleTags, counters), difference = Ext.Array.difference(tags, newTags);    // checks if user entered last tag which we've just removed
                                                                                                                                                 // and in case when it's true we need to add one more white spaces at the end.
        // checks if user entered last tag which we've just removed
        // and in case when it's true we need to add one more white spaces at the end.
        if (difference.length == 1 && difference[0] == tags[tags.length - 1])
            newTags.push('');
        return newTags.join(' ');
    },
    /**
     * forms correct tags chain
     * tag @user -> @user tag
     * tag $category @user -> $category @user tag
     * @user portal@ $category ->  portal@ $category @user
     * etc ...
     * @param {Array} complexTags
     * @param {Array} simpleTags
     * @param {Object} counters
     */
    correctTagsSequence(complexTags, simpleTags, counters) {
        const newTags = [], config = [
                {
                    type: 'category',
                    re: /^\$[\d\w]+$/
                },
                {
                    type: 'portal',
                    re: /^[a-zÀ-ÿA-Z0-9\-\_]+@$/
                },
                {
                    type: 'group',
                    re: /^\+[\d\w]+$/
                },
                {
                    type: 'user',
                    re: /^([a-zÀ-ÿA-Z0-9\-\_]+)*@[a-zÀ-ÿA-Z0-9\-\_]+$/
                }
            ];
        for (let i = 0, item; item = config[i]; i++) {
            if (!counters[item.type])
                continue;
            for (let j = 0, tag; tag = complexTags[j]; j++) {
                const matches = tag.match(item.re);
                if (matches) {
                    newTags.push(tag);
                    break;
                }
            }
        }
        return newTags.concat(simpleTags);
    },
    /**
     * @return {String}
     */
    getValidatedInputValue() {
        return this.validate(this.getInputValue());
    },
    /**
     * performs search request to get suggestions for current component's current #value (not tags).
     * @return {undefined}
     */
    search() {
        this.openSearchResults();
        this.getSearchResults().search(this.getInputValue());
    },
    /**
     * @return {undefined}
     */
    focus() {
        this.getInputElement().focus();
    },
    /**
     * @return {undefined}
     */
    blur() {
        this.getInputElement().blur();
    },
    /**
     * opens a component to show search-results.
     * @return {undefined}
     */
    openSearchResults() {
        if (this.getSearchResults())
            return;
        this.setSearchResults({});
    },
    /**
     * @return {String} value from input field.
     */
    getInputValue() {
        return this.getInputElement().value;
    },
    /**
     * @param {String} value
     * @return {undefined}
     */
    setInputValue(value) {
        return this.getInputElement().value = value.replace(/#/g, '');
    },
    /**
     * @return {HTMLElement}
     */
    getInputElement() {
        return this.element.dom.querySelector('.d-input');
    },
    /**
     * @return {undefined}
     */
    onInput() {
        clearTimeout(this.inputTimerId);
        this.inputTimerId = Ext.defer(this.onInputTimeout, 250, this);
        const searchResults = this.getSearchResults();
        if (!searchResults)
            return;
        searchResults.abort();
        searchResults.setLoading(true);
    },
    /**
     * validates search-field and makes search-request
     * @return {undefined}
     */
    onInputTimeout() {
        this.search();
    },
    /**
     * @param {Ext.Evented}
     * @return {undefined}
     */
    onKeyDown(e) {
        if (e.event.keyCode == 13)
            this.onEnterKeyDown();
    },
    /**
     * @return {undefined}
     */
    onEnterKeyDown() {
        const suggestedItem = this.getSearchResults().getSelected();
        if (suggestedItem)
            return this.onSuggestionSelect(suggestedItem);
        if (this.openLicensedContainer())
            return;
        if (Ext.isEmpty(this.getValidatedInputValue()))
            return;
        this.setEditing(false);
        this.setTags(this.getVisibleTags());
        this.redirect();
    },
    /**
     * @return {undefined}
     */
    redirect() {
        let url;
        const utils = CJ.Utils;
        const value = this.getValidatedInputValue();
        if (this.isEmpty())
            url = '!feed';
        else if (utils.getTagType(value) == 'portal')
            url = utils.portalTagsToPath(value, 'f');
        else
            url = utils.tagsToPath(value);
        CJ.app.redirectTo(url);
    },
    /**
     * @return {Boolean}
     */
    getInputMode() {
        if (this.getInputValue().substr(-1, 1) == ' ')
            return 'suggestions';
        return 'autocomplete';
    },
    /**
     * @return {Ext.Element}
     */
    getPageBox() {
        return this.element.getPageBox();
    },
    reset() {
        this.setVisibleTags(this.getTags());
    },
    isEmpty() {
        return this.getInputValue().replace(/\s+/, '').length == 0;
    }
});