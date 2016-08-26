import 'Ext/Component';

/**
 * The class provides base component for feed header.
 */
Ext.define('CJ.view.stream.header.Base', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.StreamHeader',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {String} tags
         * @param {String} type Document, Tag, Group etc...
         * @param {Object} config
         * @param {Object} config.scope
         * @param {Function} config.success
         * @param {Function} config.failure
         * @return {Object} request
         */
        load(tags, type, config) {
            let method = 'info';
            const params = {};
            if (type == 'Key') {
                method = 'load_config';
                params.key = tags;
            } else {
                method = 'info';
                params.tags = tags;
            }
            return CJ.request(Ext.apply({
                rpc: {
                    model: type,
                    method
                },
                params,
                stash: {
                    tags,
                    type
                }
            }, config));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} tags
         */
        tags: null,
        /**
         * @inheritdoc
         * @TODO
         */
        cls: 'd-header-block',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Boolean} canEdit
         * True in case when user can edit.
         */
        canEdit: false,
        /**
         * @cfg {String} image
         * Path to the background image.
         */
        image: null,
        /**
         * @property {SimpleUploader} imageUploader
         */
        imageUploader: null,
        /**
         * @cfg {Boolean} imagePreloaded
         * True in case when image is preloaded.
         */
        imagePreloaded: false,
        /**
         * @cfg {Boolean} subscribed
         * True in case when user is subscribed.
         */
        subscribed: null,
        /**
         * @cfg {CJ.core.view.form.GrowField|String} description
         */
        description: null,
        /**
         * @cfg {Object} stats
         * Statistic config, that contains nameStat: valueStat.
         */
        stats: null,
        /**
         * @cfg {Array} tabs
         * Array of tab config, that contain
         * key - route key of tab, text - text of tab button.
         */
        tabs: null,
        /**
         * @cfg {Boolean} showOptions
         */
        showOptions: false,
        /**
         * @cfg {String} routeKey
         * Route key of feed, using for generation routes of tabs,
         * for example: u - for user, g - for groups, etc...
         */
        routeKey: null,
        /**
         * @cfg {Boolean} collapsed
         * Collapsed state of info.
         * Uses for mobile.
         */
        collapsed: null,
        /**
         * @cfg {String} collapseButtonText
         */
        collapseButtonText: null,
        /**
         * @cfg {String} expandButtonText
         */
        expandButtonText: null,
        /**
         * @cfg {Ext.XTemplate} statsTpl
         * Template of stats.
         */
        statsTpl: Ext.create('Ext.XTemplate', [
            '<div class="d-stats">',
            '<ul>',
            '<tpl for=".">',
            '<li data-key="{key}">',
            '<span class="d-label">{label}</span>',
            '<span class="d-value">{value}</span>',
            '</li>',
            '</tpl>',
            '</ul>',
            '</div>',
            { compiled: true }
        ]),
        /**
         * @cfg {Ext.XTemplate} tabsTpl
         * Template of tabs.
         */
        tabsTpl: Ext.create('Ext.XTemplate', [
            '<div class="d-tabs">',
            '<ul>',
            '<tpl for="tabs">',
            '<li class="{[values.active ? "active" : ""]} {cls}" data-key="{key}">',
            '<a href="{url}" onclick="return false;">{text}</a>',
            '</li>',
            '</tpl>',
            '<tpl if="showOptions">',
            '<li class="d-options"></li>',
            '</tpl>',
            '</ul>',
            '</div>',
            { compiled: true }
        ]),
        /**
         * @cfg {Object} tapListeners
         * Config that contains selector: callback,
         * callback will be called when selector is tapped.
         */
        tapListeners: {
            '.d-action-button': 'onActionButtonTap',
            '.d-toggle-button': 'onToggleButtonTap',
            '.d-buttons .d-save': 'onSaveButtonTap',
            '.d-buttons .d-cancel': 'onCancelButtonTap',
            '.d-tabs li.d-options': 'onOptionsTap',
            '.d-tabs li a': 'onTabTap',
            '.d-stats li': 'onStatsItemTap'
        }
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        this.on('change', this.onImageSelect, this, {
            element: 'element',
            delegate: '.d-change-image-button input'
        });
        CJ.on('course.publish', this.onBlockCreated, this);
        CJ.on('contentblock.created', this.onBlockCreated, this);
        CJ.on('contentblock.deleted', this.onBlockDeleted, this);
    },
    onBlockCreated(block) {
        if (block.isCourse)
            this.updateStat('courses', 'incr');
        this.updateStat('activities', 'incr');
    },
    onBlockDeleted(block) {
        if (block.isCourse)
            this.updateStat('courses', 'decr');
        this.updateStat('activities', 'decr');
    },
    /**
     * Destroys additional components.
     */
    destroy() {
        this.callParent(args);
        CJ.un('course.publish', this.onBlockCreated, this);
        CJ.un('contentblock.created', this.onBlockCreated, this);
        CJ.un('contentblock.deleted', this.onBlockDeleted, this);
        if (!this.getCanEdit())
            return;
        this.setImageUploader(null);
        this.getDescription().destroy();
    },
    /**
     * @param {Object} data
     * @returns {Object}
     */
    applyData(data) {
        return Ext.applyIf(data, {
            stats: this.generateStats(),
            tabs: this.generateTabs(),
            canEdit: this.getCanEdit()
        });
    },
    /**
     * Renders of the component template.
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    applyShowOptions(config) {
        if (Ext.os.is.Phone)
            return false;
        return config;
    },
    /**
     * Updates text of the action button.
     * @param {Boolean} state
     */
    updateSubscribed(state) {
        const el = this.element.dom.querySelector('.d-action-button'), text = CJ.tpl('block-header-{0}subscribe', state ? 'un' : '');
        el.innerHTML = CJ.t(text);
    },
    /**
     * Applies description, it will be growfield if user can edit, text otherwise.
     * @param description
     * @returns {CJ.core.view.form.GrowField|String}
     */
    applyDescription(description) {
        this.getData();
        const el = this.element.dom.querySelector('.d-description');
        let maxFieldHeight = 100;
        if (Ext.os.is.Phone)
            maxFieldHeight = 300;
        if (this.getCanEdit())
            description = Ext.factory({
                xtype: 'core-view-form-growfield',
                placeHolder: CJ.t('block-header-description-placeholder', true),
                minFieldHeight: 60,
                maxFieldHeight,
                allowNewRow: false,
                maxLength: 250,
                renderTo: el,
                value: description,
                listeners: {
                    focus: this.onFieldFocus,
                    blur: this.onFieldBlur,
                    scope: this
                }
            });
        else
            el.innerHTML = description;
        return description;
    },
    /**
     * Applies stats.
     * @param {Object} stats
     * @returns {Array}
     */
    applyStats(stats) {
        const configured = [];
        Ext.iterate(stats, (key, value) => {
            configured.push({
                key,
                label: CJ.t(`block-header-stat-${ key }`),
                value
            });
        }, this);
        return configured;
    },
    /**
     * Generates stats HTML.
     * @returns {string}
     */
    generateStats() {
        const stats = this.getStats();
        let html = '';
        if (stats)
            html = this.getStatsTpl().apply(stats);
        return html;
    },
    /**
     * Updates stat in the dom.
     * @param {String} key
     * @param {Number|String} value
     */
    updateStat(key, value) {
        const selector = CJ.tpl('.d-stats [data-key="{0}"] .d-value', key), el = this.element.dom.querySelector(selector);
        if (el) {
            switch (value) {
            case 'incr':
                value = +el.innerHTML + 1;
                break;
            case 'decr':
                value = +el.innerHTML - 1;
                break;
            }
            el.innerHTML = value;
        }
    },
    /**
     * Applies tabs, generates tab url and translates text of button
     * @param {Array} tabs
     * @returns {Array}
     */
    applyTabs(tabs) {
        const tabs = Ext.clone(tabs), allTags = Ext.Viewport.getSearchBar().getTags().split(' '), entity = allTags[0], tags = allTags.slice(1).join().replace(/#/g, ''), routeTpl = `#!{0}/{1}/{2}${ tags ? '/{3}' : '' }`, routeKey = this.getRouteKey();
        Ext.each(tabs, item => {
            item.url = CJ.tpl(routeTpl, routeKey, entity, item.key, tags);
            item.text = CJ.t(item.text);
        });
        return tabs;
    },
    /**
     * Generates tabs HTML.
     * @returns {string}
     */
    generateTabs() {
        const tabs = this.getTabs();
        let html = '';
        if (tabs)
            html = this.getTabsTpl().apply({
                tabs,
                showOptions: this.getShowOptions()
            });
        return html;
    },
    updateCollapsed(state) {
        const collapsibleButtonEl = this.element.dom.querySelector('.d-toggle-button');
        let buttonText;
        if (state)
            buttonText = this.getExpandButtonText();
        else
            buttonText = this.getCollapseButtonText();
        collapsibleButtonEl.innerHTML = CJ.t(buttonText);
        if (!this.initialized)
            return;
        const collapsibleEl = this.element.dom.querySelector('.d-collapsible'), collapsibleInnerEl = collapsibleEl.querySelector('.d-collapsible-inner'), collapsibleInnerHeight = collapsibleInnerEl.clientHeight;
        collapsibleEl.style.maxHeight = `${ collapsibleInnerHeight }px`;
        if (state) {
            collapsibleEl.classList.add('d-collapsing');
            Ext.defer(() => {
                collapsibleEl.style.maxHeight = '0px';
                collapsibleEl.classList.remove('d-collapsing');
            }, 10);
        } else {
            Ext.defer(() => {
                collapsibleEl.style.maxHeight = '100%';
            }, 255);
        }
    },
    /**
     * Loads an image before showing.
     * @param {String} image
     * @param {String} current
     */
    updateImage(image, current) {
        const el = this.element.dom.querySelector('.d-image');
        const classList = el.classList;
        let deffer = 0;
        if (image) {
            if (current) {
                classList.remove('shown');
                deffer = 250;
                this.setImagePreloaded(false);
            }
            Ext.defer(function () {
                const img = new Image();
                img.src = image;
                img.onload = Ext.bind(function (el, classList) {
                    this.setImagePreloaded(true);
                    classList.add('shown');
                    el.style.backgroundImage = CJ.tpl('url("{0}")', image);
                    img.onload = null;
                }, this, [
                    el,
                    classList
                ]);
            }, deffer, this);
        } else
            classList.remove('shown');
    },
    /**
     * Handler of the event 'change' of the change image button.
     * Starts uploading of an image.
     * @param {Ext.event.Event} e
     */
    onImageSelect(e) {
        // in case when user cancel selecting
        if (!e.target.files.length)
            return;
        const imageUploader = CJ.FileUploader.upload(e.target, {
            scope: this,
            success: this.onUploadImageSuccess
        });
        this.element.dom.querySelector('.d-change-image-button').classList.add('loading');
        this.setImageUploader(imageUploader);
    },
    /**
     * Aborts uploading an image.
     * @param {SimpleUploader} uploader
     * @param {SimpleUploader} current
     */
    updateImageUploader(uploader, current) {
        if (current)
            current.abort();
    },
    /**
     * Handler of successfully response, generate image url and sets this.
     * @param {Object} response
     */
    onUploadImageSuccess(response) {
        let cdnUrl = response.cdnUrl, url;
        if (Core.opts.uploadcare.replace_cdn_netloc)
            cdnUrl = Core.opts.uploadcare.cdn_netloc;
        url = [
            'https:/',
            cdnUrl,
            response.uuid,
            encodeURIComponent(response.name)
        ].join('/');
        this.element.dom.querySelector('.d-change-image-button').classList.remove('loading');
        this.setImage(url);
    },
    /**
     * Handler of the event 'focus' of the growfiled.
     */
    onFieldFocus() {
        this.element.dom.querySelector('.d-fields').classList.add('focused');
    },
    /**
     * Handler of the event 'blur' of the growfiled.
     */
    onFieldBlur() {
        this.element.dom.querySelector('.d-fields').classList.remove('focused');
    },
    /**
     * Handler of the event 'tap' on the tab button.
     * Redirects to tab's route.
     */
    onTabTap(e) {
        e.stopEvent();
        CJ.app.redirectTo(e.target.getAttribute('href'));
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onStatsItemTap(e) {
        if (CJ.Utils.getNodeData(e.getTarget('li'), 'key') == 'subscribers')
            this.openSubscribersPopup();
    },
    /**
     * Handler of the event 'tap' of the action button.
     * By default send request to follow.
     * Can be overridden in subclasses.
     * @param {Ext.event.Event} e
     */
    onActionButtonTap(e) {
        e.stopEvent();
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        const el = this.element.dom.querySelector('.d-action-button'), classList = el.classList, subscribed = this.getSubscribed();
        if (classList.contains('d-disabled'))
            return;
        classList.add('d-disabled');
        this.setSubscribed(!subscribed);
        CJ.request({
            rpc: {
                model: 'PortalUser',
                method: CJ.tpl('{0}follow_key', subscribed ? 'un' : '')
            },
            params: { key: Ext.Viewport.getSearchBar().getTags() },
            success: this.onSubscribedStateSaveSuccess,
            callback: this.onSubscribedStateSaveCallback,
            scope: this
        });
    },
    /**
     * Handler of successfully response of following request.
     * Should be  implemented in subclasses.
     */
    onSubscribedStateSaveSuccess: Ext.emptyFn,
    /**
     * Activates of the action button that was disabled during following request.
     */
    onSubscribedStateSaveCallback() {
        const el = this.element.dom.querySelector('.d-action-button');
        if (el)
            el.classList.remove('d-disabled');
    },
    onToggleButtonTap(e) {
        e.stopEvent();
        this.setCollapsed(!this.getCollapsed());
    },
    /**
     * Handler of the event 'tap' on the save button.
     * Should be implemented in subclasses.
     * @param {Ext.Evented} e
     */
    onSaveButtonTap(e) {
        e.stopEvent();
        Ext.Viewport.hideKbd();
    },
    /**
     * Handler of the event 'tap' on the cancel button.
     * Should be implemented in subclasses.
     * @param {Ext.Evented} e
     */
    onCancelButtonTap(e) {
        e.stopEvent();
        Ext.Viewport.hideKbd();
    },
    /**
     * Handler of the event 'tap' on the options button.
     * Should be implemented in subclasses.
     */
    onOptionsTap: Ext.emptyFn,
    /**
     * Activates tab by current route.
     * @param {String} [tabKey]
     */
    activateTab(tabKey) {
        const el = this.element;
        const activeTabEl = el.dom.querySelector('.d-tabs .active');
        let tabIndex;
        let targetTabEl;
        if (!tabKey) {
            tabIndex = CJ.app.getActiveRoute().getMeta('tabIndex');
            tabKey = CJ.History.getActiveAction().getArgs()[tabIndex];
        }
        if (activeTabEl)
            if (activeTabEl.getAttribute('data-key') == tabKey)
                return;
            else
                activeTabEl.classList.remove('active');
        targetTabEl = el.dom.querySelector(CJ.tpl('.d-tabs [data-key={0}]', tabKey));
        if (targetTabEl)
            targetTabEl.classList.add('active');
    },
    /**
     * Shows popup with an image in full mode.
     */
    showFullImage(image) {
        const popup = Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-full-image-popup',
            overlayCls: 'd-popup-overlay d-dark',
            titleBar: false,
            fitMode: true,
            content: {
                xtype: 'core-view-full-image',
                image
            }
        });
    },
    openSubscribersPopup() {
        CJ.view.tool.FollowersList.popup({ key: Ext.Viewport.getSearchBar().getTags() });
    }
});