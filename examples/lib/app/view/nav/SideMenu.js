import 'Ext/Component';

/**
 * The class provides the side menu component.
 */
Ext.define('CJ.view.nav.SideMenu', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Component',
    /**
     * @inheritdoc
     */
    xtype: 'view-nav-sidemenu',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-nav-side-menu d-scroll',
        /**
         * @inheritdoc
         */
        data: {},
        /**
         * @cfg {Object} listRequest
         */
        listRequest: null,
        /**
         * @cfg {Object} relatedTagsRequest
         */
        relatedTagsRequest: null,
        /**
         * @cfg {CJ.view.notifications.Button}
         */
        notificationButton: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', [
            '<tpl if="isPublic">',
            '<li class="public">',
            '<a class=\'d-button d-business\' href=\'http://www.skillnow.co\' data-external=\'true\' onclick=\'return false;\'>',
            '<span>{[ CJ.t(\'nav-slidemenu-public-section-business\')]}</span>',
            '</a>',
            '<a class=\'d-button d-schools\' href=\'http://info.challengeu.com/education\' data-external=\'true\' onclick=\'return false;\'>',
            '<span>{[ CJ.t(\'nav-slidemenu-public-section-schools\') ]}</span>',
            '</a>',
            /*"<a class='d-button d-learn-more' href='http://info.challengeu.com' target='_blank'>",
                     "{[ CJ.t('nav-slidemenu-public-section-learn-more') ]}",
                     "</a>",*/
            '<a class=\'d-button d-explore\' href=\'#!explore\' onclick=\'return false;\'>',
            '<span>{[ CJ.t(\'nav-slidemenu-public-section-explore\') ]}</span>',
            '</a>',
            '<div class=\'d-action-container\'>',
            '<div class=\'d-buttons\'>',
            '<div class=\'d-button d-sign-in\'>',
            '{[ CJ.t(\'sign-in\')]}',
            '</div>',
            '<tpl if=\'!inAppDomain\'>',
            '<div class=\'d-button d-sign-up\'>',
            '{[ CJ.t(\'sign-up\')]}',
            '</div>',
            '</tpl>',
            '</div>',
            '<div class=\'d-preload\'></div>',
            '</div>',
            '</li>',
            '<tpl else>',
            '<li class="user">',
            '<div class="d-inner">',
            '<a class="d-button" href="{userUrl}" onclick="return false;">',
            '<span class="d-menu-item-icon" style="background-image: url({userIcon})"></span>',
            '<span class="d-text">{userName}</span>',
            '<span class="d-trigger"></span>',
            '</a>',
            '<ul>',
            '<li class="help">{[CJ.t("nav-slidemenu-help")]}</li>',
            '<li class="about">{[CJ.t("nav-slidemenu-about")]}</li>',
            '<li class="settings">{[CJ.t("nav-slidemenu-settings")]}</li>',
            '<li class="logout">{[CJ.t("nav-slidemenu-logout")]}</li>',
            '</ul>',
            '</div>',
            '</li>',
            '<li class="notifications"></li>',
            '<tpl if="isPortal && !isFgaStudent">',
            '<li class="portal">',
            '<a class="d-button" href="#!pu/{portal.tag}/f" onclick="return false;">',
            '<span class="d-menu-item-icon" style="background-image: url({portal.icon})"></span>',
            '<span class="d-text">{portal.name}</span>',
            '</a>',
            '</li>',
            '</tpl>',
            '<tpl if="!isFgaStudent">',
            '<li class="explore">',
            '<a class="d-button" href="#!explore" onclick="return false;">',
            '{[CJ.t("view-nav-sidemenu-container-explore")]}',
            '</a>',
            '</li>',
            '<li class="purchased">',
            '<a class="d-button" href="#!purchased" onclick="return false;">',
            '{[ CJ.t("nav-slidemenu-public-section-purchased") ]}',
            '</a>',
            '</li>',
            '<li class="feed">',
            '<div class="d-inner">',
            '<a class="d-button" href="#!feed" onclick="return false;">',
            '<span class="d-text">{[CJ.t("nav-slidemenu-feed")]}</span>',
            '<span class="d-trigger"></span>',
            '</a>',
            '<ul></ul>',
            '</div>',
            '</li>',
            '<li class="groups">',
            '<div class="d-inner">',
            '<div class="d-button">',
            '<span class="d-text">{[CJ.t("nav-slidemenu-my-groups")]}</span>',
            '<span class="d-trigger"></span>',
            '</div>',
            '<ul></ul>',
            '<div class="add-group">{[CJ.t("nav-sidemenu-addgroupbutton-popuptitle")]}</div>',
            '</div>',
            '</li>',
            '</tpl>',
            '<li class="courses">',
            '<div class="d-inner">',
            '<div class="d-button">',
            '<span class="d-text">{[CJ.t("nav-slidemenu-courses")]}</span>',
            '<span class="d-trigger"></span>',
            '</div>',
            '<ul></ul>',
            '</div>',
            '</li>',
            '</tpl>',
            '<li class="tags">',
            '<ul class="selected"></ul>',
            '<ul class="related"></ul>',
            '</li>',
            { compiled: true }
        ]),
        /**
         * @cfg {Ext.XTemplate} listTpl
         */
        listTpl: Ext.create('Ext.XTemplate', [
            '<tpl for=".">',
            '<li data-target="{target}">',
            '<tpl if="icon || iconCls">',
            '<span class="d-icon {iconCls}" style="{icon}"></span>',
            '</tpl>',
            '<span class="d-text">',
            '<span class="d-title">{title}</span>',
            '<tpl if="hint">',
            '<span class="d-hint">{hint}</span>',
            '</tpl>',
            '</span>',
            // '{completeness}',
            '</li>',
            '</tpl>',
            { compiled: true }
        ]),
        /**
         * @inheritdoc
         */
        tapListeners: {
            'li.user .d-button': 'onUserButtonTap',
            'li.user .help': 'onHelpTap',
            'li.user .about': 'onAboutTap',
            'li.user .settings': 'onSettingsTap',
            'li.user .logout': 'onLogoutTap',
            'li.explore, .d-explore': 'onExploreButtonTap',
            'li.purchased': 'onPurchasedButtonTap',
            'li.portal': 'onPortalButtonTap',
            'li.feed .d-button': 'onFeedButtonTap',
            'li.groups .d-button': 'onGroupsButtonTap',
            'li.groups .add-group': 'onAddGroupTap',
            'li.courses .d-button': 'onCoursesButtonTap',
            'li.tags ul.selected li': 'onSelectedTagTap',
            'li.public': 'onPublicTap',
            'li ul li': 'onListItemTap'
        }
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        CJ.on('tags.change', this.onSearchChange, this);
        if (!CJ.User.isExploreEnabled())
            this.addCls('d-explore-hidden');
        if (!CJ.User.isLogged())
            return this.addCls('d-public');
        this.setNotificationButton(true);
        CJ.User.on('update', this.onUserUpdate, this);
        CJ.app.on({
            'key.followingchange': this.onFollowingChange,
            'group.followingchange': this.onFollowingChange,
            'group.create': this.onGroupCreate,
            'group.destroy': this.onGroupDestroy,
            scope: this
        });
        CJ.on('group.update', this.onGroupUpdate, this);
        CJ.on('portal.update', this.onPortalUpdate, this);
        CJ.on('course.enroll', this.onCourseEnroll, this);
        CJ.on('course.leave', this.onCourseLeave, this);
        CJ.on('course.deleted', this.onCourseLeave, this);
        CJ.on('contentblock.created', this.onBlockChange, this);
        CJ.on('contentblock.deleted', this.onBlockChange, this);
        CJ.on('contentblock.updated', this.onBlockChange, this);
    },
    destroy() {
        this.callParent(args);
        CJ.un('tags.change', this.onSearchChange, this);
        this.setNotificationButton(false);
        CJ.User.un('update', this.onUserUpdate, this);
        CJ.app.un({
            'key.followingchange': this.onFollowingChange,
            'group.followingchange': this.onFollowingChange,
            'group.create': this.onGroupCreate,
            'group.destroy': this.onGroupDestroy,
            scope: this
        });
        CJ.un('group.update', this.onGroupUpdate, this);
        CJ.un('portal.update', this.onPortalUpdate, this);
        CJ.un('course.enroll', this.onCourseEnroll, this);
        CJ.un('course.leave', this.onCourseLeave, this);
        CJ.un('course.deleted', this.onCourseLeave, this);
        CJ.un('contentblock.created', this.onBlockChange, this);
        CJ.un('contentblock.deleted', this.onBlockChange, this);
        CJ.un('contentblock.updated', this.onBlockChange, this);
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            tag: 'ul'
        };
    },
    /**
     * @inheritdoc
     */
    applyData(data) {
        Ext.applyIf(data, {
            userIcon: CJ.User.get('icon'),
            userName: CJ.User.get('name'),
            userUrl: CJ.tpl('#!u/{0}', CJ.User.get('user')),
            isPublic: !CJ.User.isLogged(),
            isPortal: CJ.User.isPortal(),
            inAppDomain: CJ.User.inAppDomain(),
            portal: CJ.User.getPortal(),
            isFgaStudent: CJ.User.isFgaStudent()
        });
        return data;
    },
    /**
     * @inheritdoc
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    applyNotificationButton(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'view-notifications-button',
            renderTo: this.element.dom.querySelector('li.notifications')
        });
        return Ext.factory(config);
    },
    updateNotificationButton(button, current) {
        if (current)
            current.destroy();
    },
    /**
     * Aborts existing request before new.
     * @param {Object} request
     * @param {Object} current
     */
    updateListRequest(request, current) {
        if (request && current) {
            current.options.stash.el.classList.remove('loading');
            Ext.Ajax.abort(current);
        }
    },
    /**
     * Expands collapsible.
     * @param {String} target
     */
    expand(target) {
        const el = this.element.dom.querySelector(CJ.tpl('li.{0}', target)), inner = el.querySelector('.d-inner'), handler = this[CJ.tpl('on{0}Expand', CJ.capitalize(target))], callback = () => {
                el.classList.add('expanded');
                el.style.height = `${ inner.clientHeight }px`;
            };
        this.toggleExpanded(target);
        if (handler)
            return handler.call(this, callback);
        callback.call(this);
    },
    /**
     * Collapses collapsible.
     * @param {String} target
     */
    collapse(target) {
        const el = this.element.dom.querySelector(CJ.tpl('li.{0}', target));
        if (el)
            el.classList.remove('expanded');
    },
    /**
     * Toggles collapsible.
     * @param {String} target
     */
    toggle(target) {
        const el = this.element.dom.querySelector(CJ.tpl('li.{0}', target));
        this.toggleExpanded(target);
        if (el.classList.contains('expanded'))
            this.collapse(target);
        else
            this.expand(target);
    },
    /**
     * Collapses expanded collapsible.
     * @param {String} [skip]
     */
    toggleExpanded(skip) {
        const expanded = this.element.dom.querySelector('li.expanded');
        if (expanded && (!skip || !expanded.classList.contains(skip)))
            expanded.classList.remove('expanded');
    },
    /**
     * Renders list.
     * @param {Array} items
     * @param {String} target
     */
    renderList(items, target) {
        this.element.dom.querySelector(CJ.tpl('li.{0} ul', target)).innerHTML = this.getListTpl().apply(items);
    },
    /**
     * Renders empty label
     * @param {String} target
     */
    renderEmptyLabel(target) {
        const tpl = '<li class="d-empty-label">{0}</li>', message = CJ.tpl('nav-slidemenu-{0}-empty-label', target);
        this.element.dom.querySelector(CJ.tpl('li.{0} ul', target)).innerHTML = CJ.tpl(tpl, CJ.t(message));
    },
    /**
     * Loads list.
     * @param {String} target
     * @param {Object} request
     * @param {Function} [callback]
     * @param {String} [root]
     */
    loadList(target, request, callback, root) {
        const el = this.element.dom.querySelector(CJ.tpl('li.{0}', target)), classList = el.classList;
        if (classList.contains('loading'))
            return;
        classList.add('loading');
        Ext.applyIf(request, {
            success: this.onListItemsLoaded,
            stash: {
                el,
                target,
                callback,
                root
            },
            scope: this
        });
        this.setListRequest(CJ.request(request));
    },
    /**
     * Handler of successfully request to load list.
     * Renders list items or empty label.
     * @param {Object} response
     * @param {Object} request
     */
    onListItemsLoaded(response, request) {
        const stash = request.stash, el = stash.el, target = stash.target, data = eval(CJ.tpl('response.{0}', stash.root || 'ret')), handler = this[CJ.tpl('configure{0}Items', CJ.capitalize(target))];
        if (data.length)
            this.renderList(handler.call(this, data), target);
        else
            this.renderEmptyLabel(target);
        el.classList.remove('loading');
        if (this.element.dom.querySelector('li.expanded'))
            return;
        Ext.callback(stash.callback);
    },
    /**
     * Handles tapping on user button.
     * @param {Ext.event.Event} e
     */
    onUserButtonTap(e) {
        if (e.getTarget('.d-trigger'))
            return this.toggle('user');
        this.expand('user');
        const href = e.getTarget('.d-button').getAttribute('href');
        CJ.app.redirectTo(href.slice(1));
    },
    /**
     * Handles tapping on about.
     */
    onAboutTap() {
        window.open('http://info.challengeu.com');
    },
    /**
     * Handles tapping on settings.
     */
    onSettingsTap() {
        CJ.app.redirectTo('profile');
    },
    /**
     * @NOTE if ever the help emplacement changes , here's where url should change.
     * Handles tapping on help.
     * @NOTE if help placement changes please modify this url accordingly.
     */
    onHelpTap() {
        const lang = CJ.User.getLanguage(), domain = CJ.app.host, user = lang === 'en' ? 'help' : 'aide';
        CJ.app.redirectTo(CJ.Utils.urlify(`!u/challengeu@${ user }/c`));
    },
    /**
     * Handles tapping on logout.
     */
    onLogoutTap() {
        CJ.User.logout();
    },
    /**
     * Handles tapping on explore button.
     */
    onExploreButtonTap() {
        this.toggleExpanded();
        CJ.app.redirectTo('!explore');
    },
    /**
     * Handles tapping on purchased button.
     */
    onPurchasedButtonTap() {
        this.toggleExpanded();
        CJ.app.redirectTo('!purchased');
    },
    /**
     * Handles tapping on portal button.
     */
    onPortalButtonTap(e) {
        CJ.app.redirectTo(e.getTarget('a').getAttribute('href'));
    },
    /**
     * Handles tapping on feed button.
     * @param {Ext.event.Event} e
     */
    onFeedButtonTap(e) {
        if (e.getTarget('.d-trigger'))
            return this.toggle('feed');
        this.expand('feed');
        CJ.app.redirectTo('!feed');
    },
    /**
     * Loads feed items.
     * @param {Function} callback
     */
    onFeedExpand(callback) {
        this.loadList('feed', {
            rpc: {
                model: 'PortalUser',
                method: 'list_followed_keys'
            }
        }, callback);
    },
    /**
     * Configures and returns feed items for list template.
     * @param {Array} config
     * @returns {Array}
     */
    configureFeedItems(config) {
        const items = [];
        Ext.each(config, data => {
            const tags = data.name.split(' ');
            const type = CJ.Utils.getTagType(tags);
            let icon = data.icon;
            let title = data.title;
            let hint;
            let iconCls;
            if (type == 'category') {
                const category = CJ.User.getCategoryByTag(tags[0]);
                if (tags.length == 1) {
                    icon = category.icon;
                    title = category.name;
                } else {
                    title = data.name.replace(tags[0], category.name);
                }
                iconCls = 'd-category';
            }
            if (type == 'user' || type == 'tag')
                hint = data.name;
            if (!icon) {
                icon = `${ Core.opts.resources_root }/resources/images/icons/public-key.png`;
                iconCls = 'd-default';
            }
            if (!title)
                title = data.name;
            icon = CJ.Utils.makeIcon(icon);
            title = title.replace(/[%@#]/g, '');
            title = CJ.capitalize(title);
            items.push({
                icon,
                iconCls,
                title,
                hint,
                target: data.name
            });
        });
        return items;
    },
    /**
     * Handles tapping on groups button.
     */
    onGroupsButtonTap() {
        this.toggle('groups');
    },
    /**
     * Loads groups.
     * @param {Function} callback
     */
    onGroupsExpand(callback) {
        this.loadList('groups', {
            rpc: {
                model: 'Group',
                method: 'list_user_owned_groups'
            },
            params: { limit: 50 }
        }, callback, 'ret.items');
    },
    /**
     * Configures and returns groups data for list template.
     * @param {Array} config
     * @returns {Array}
     */
    configureGroupsItems(config) {
        const items = [];
        Ext.each(config, data => {
            items.push({
                icon: CJ.Utils.makeIcon(data.icon),
                title: CJ.capitalize(data.name),
                target: CJ.tpl('+{0}', data.hashId)
            });
        });
        return items;
    },
    /**
     * Handles tapping on courses button.
     */
    onCoursesButtonTap() {
        this.toggle('courses');
    },
    /**
     * Loads courses.
     * @param {Function} callback
     */
    onCoursesExpand(callback) {
        this.loadList('courses', {
            rpc: {
                model: 'Course',
                method: 'list_enrolled_courses'
            }
        }, callback);
    },
    /**
     * Configures and returns courses data for list template.
     * @param {Array} config
     * @returns {Array}
     */
    configureCoursesItems(config) {
        const items = [];
        const isFga = CJ.User.isFGA();
        let completeness;
        Ext.each(config, data => {
            if (isFga)
                completeness = CJ.Utils.completeness(data.completeness);
            items.push({
                icon: CJ.Utils.makeIcon(data.backgroundHsl),
                title: CJ.capitalize(data.title),
                target: CJ.tpl('!cs/{0}', data.docId),
                completeness
            });
        });
        return items;
    },
    /**
     * Removes selected tag and redirects to new url.
     * @param {Ext.event.Event} e
     */
    onSelectedTagTap(e) {
        e.stopEvent();
        const searchBar = Ext.Viewport.getSearchBar(), target = e.getTarget('li'), tag = target.getAttribute('data-target');
        target.classList.add('hiding');
        searchBar.reset();
        searchBar.removeTag(tag);
        searchBar.redirect();
    },
    /**
     * Handles tapping on public section.
     */
    onPublicTap(e) {
        const externalAnchor = e.getTarget('[data-external]', 5);
        if (externalAnchor)
            return window.open(externalAnchor.getAttribute('href'), '_blank');
        if (e.getTarget('.d-action-container', 1))
            CJ.app.redirectTo(CJ.User.getDefaultPage());
    },
    /**
     * Handles tapping on list item.
     */
    onListItemTap(e) {
        const el = e.getTarget('li'), target = el.getAttribute('data-target');
        if (!target)
            return;
        if (e.getTarget('li.tags')) {
            const searchBar = Ext.Viewport.getSearchBar();
            searchBar.appendSimpleTag({ name: target }, true);
            searchBar.redirect();
            return;
        }
        if (target[0] == '!')
            return CJ.app.redirectTo(target);
        if (CJ.Utils.getTagType(target) == 'group') {
            CJ.StreamHelper.setGroup({ name: el.querySelector('.d-title').textContent });
        }
        CJ.app.redirectTo(CJ.Utils.tagsToPath(target));
    },
    /**
     * Handles tapping on add group button.
     */
    onAddGroupTap() {
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        Ext.Viewport.buttons.createGroup();
    },
    /**
     * Handler of the event 'update' of user.
     * Updates user icon.
     * @param {Object} data
     */
    onUserUpdate(data) {
        // data.name is the old value but first_name and last_name are updated.
        // we compile name on the fly.
        const name = CJ.Utils.capitalizeWords(`${ data.first_name } ${ data.last_name }`);
        this.element.dom.querySelector('li.user .d-button .d-text').innerHTML = name;
        this.element.dom.querySelector('li.user .d-button .d-menu-item-icon').style.backgroundImage = CJ.tpl('url({0})', data.icon);
    },
    /**
     * Handler of the event 'key.followingchange'.
     * Adds or removes feed item.
     * @param {Object} data
     */
    onFollowingChange(data) {
        const el = this.element.dom.querySelector('li.feed');
        const innerEl = el.querySelector('.d-inner');
        let listEl;
        if (!el.classList.contains('expanded'))
            return;
        listEl = el.querySelector('ul');
        if (data.followed) {
            const data = this.configureFeedItems([data]), html = this.getListTpl().apply(data), emptyLabel = listEl.querySelector('.d-empty-label');
            listEl.insertAdjacentHTML('afterBegin', html);
            Ext.removeNode(emptyLabel);
        } else {
            listEl.removeChild(listEl.querySelector(CJ.tpl('[data-target="{0}"]', data.name)));
            if (!listEl.childNodes.length)
                this.renderEmptyLabel('feed');
        }
        if (innerEl)
            el.style.height = `${ innerEl.clientHeight }px`;
    },
    /**
     * Handler of the event 'group.create'.
     * Adds a group to the list.
     * @param {CJ.view.group.Block} group
     */
    onGroupCreate(group) {
        const el = this.element.dom.querySelector('li.groups');
        const innerEl = el.querySelector('.d-inner');
        let emptyLabel;
        if (!el.classList.contains('expanded'))
            return;
        el.querySelector('ul').insertAdjacentHTML('afterBegin', this.getListTpl().apply(this.configureGroupsItems([{
                icon: group.getIcon(),
                name: group.getName(),
                hashId: group.getHashId()
            }])));
        emptyLabel = el.querySelector('.d-empty-label');
        Ext.removeNode(emptyLabel);
        if (innerEl)
            el.style.height = `${ innerEl.clientHeight }px`;
    },
    /**
     * Handler of the event 'group.update'.
     * Updates a group in the list.
     * @param {CJ.view.group.Block|Object} group
     */
    onGroupUpdate(group) {
        const el = this.element.dom.querySelector('li.groups');
        let itemEl;
        let tagsEl;
        if (!el.classList.contains('expanded'))
            return;
        tagsEl = this.element.dom.querySelector(CJ.tpl('li.tags [data-target="+{0}"] .d-title', group.hashId));
        if (tagsEl)
            tagsEl.innerHTML = group.name;
        if (group.isGroup)
            group = {
                hashId: group.getHashId(),
                name: group.getName()
            };
        itemEl = el.querySelector(CJ.tpl('[data-target="+{0}"] .d-title', group.hashId));
        if (itemEl)
            itemEl.innerHTML = CJ.capitalize(group.name);
    },
    /**
     * Handler of the event 'group.destroy'.
     * Removes a group from the list.
     * @param {CJ.view.group.Block} group
     */
    onGroupDestroy(group) {
        const el = this.element.dom.querySelector('li.groups');
        const innerEl = el.querySelector('.d-inner');
        let listEl;
        let itemEl;
        if (!el.classList.contains('expanded'))
            return;
        listEl = el.querySelector('ul');
        itemEl = listEl.querySelector(CJ.tpl('[data-target="+{0}"]', group.getHashId()));
        Ext.removeNode(itemEl);
        if (!listEl.childNodes.length)
            this.renderEmptyLabel('groups');
        if (innerEl)
            el.style.height = `${ innerEl.clientHeight }px`;
    },
    /**
     * Handler of the event 'course.enroll'.
     * Adds a course to the list.
     * @param {CJ.view.course.block.Block} course
     */
    onCourseEnroll(course) {
        const el = this.element.dom.querySelector('li.courses');
        const innerEl = el.querySelector('.d-inner');
        let emptyLabel;
        if (!el.classList.contains('expanded'))
            return;
        el.querySelector('ul').insertAdjacentHTML('afterBegin', this.getListTpl().apply(this.configureCoursesItems([{
                backgroundHsl: course.getBackgroundHsl(),
                title: course.getTitle(),
                docId: course.getDocId()
            }])));
        emptyLabel = el.querySelector('.d-empty-label');
        Ext.removeNode(emptyLabel);
        if (innerEl)
            el.style.height = `${ innerEl.clientHeight }px`;
    },
    /**
     * Handler of the event 'course.leave'.
     * Removes a course from the list.
     * @param {CJ.view.course.block.Block} course
     */
    onCourseLeave(course) {
        const el = this.element.dom.querySelector('li.courses');
        const innerEl = el.querySelector('.d-inner');
        let listEl;
        let itemEl;
        if (!el.classList.contains('expanded'))
            return;
        listEl = el.querySelector('ul');
        itemEl = listEl.querySelector(CJ.tpl('[data-target="!cs/{0}"]', course.getDocId()));
        Ext.removeNode(itemEl);
        if (!listEl.childNodes.length)
            this.renderEmptyLabel('courses');
        if (innerEl)
            el.style.height = `${ innerEl.clientHeight }px`;
    },
    onBlockChange(block) {
        if (block.getIsModal() || CJ.app.getActiveRoute().getMeta('isFullScreen'))
            return;
        this.onSearchChange();
    },
    /**
     * Handler of the event 'tags.change' of the search bar.
     * Shows related tags if needed, hide otherwise.
     * @param {CJ.view.tag.Search} [searchBar]
     */
    onSearchChange(searchBar undefined Ext.Viewport.getSearchBar()) {
        const tags = searchBar.getTags();
        fastdom.write(function () {
            if (this.isDestroyed)
                return;
            if (CJ.app.getActiveRoute().getMeta('showRelatedTags'))
                this.showRelatedTags(tags);
            else
                this.resetRelatedTags();
        }, this);
    },
    /**
     * Shows related tags.
     * @param {String} tags
     */
    showRelatedTags(tags) {
        const el = this.element.dom.querySelector('li.tags');
        el.classList.add('loading');
        this.setRelatedTagsRequest(CJ.Tag.load(`${ tags } `, {
            stash: {
                el,
                tags
            },
            success: this.onRelatedTagsLoaded,
            callback: this.onRelatedTagsCallback,
            scope: this
        }));
    },
    /**
     * Handler of successfully request to load related tags.
     * Renders list of lags.
     * @param {Object} response
     * @param {Object} request
     */
    onRelatedTagsLoaded(response, request) {
        request.stash.el.querySelector('.related').innerHTML = this.getListTpl().apply(this.configureTagsItems(response.ret));
        this.showSelectedTags(request.stash.tags);
    },
    /**
     * Callback of the request to load related tags.
     * @param {Object} request
     */
    onRelatedTagsCallback(request) {
        this.setRelatedTagsRequest(null);
        request.stash.el.classList.remove('loading');
    },
    showSelectedTags(tags) {
        tags = tags.split(' ').filter(tag => !/[@$\+]/.exec(tag));
        this.element.dom.querySelector('li.tags ul.selected').innerHTML = this.getListTpl().apply(this.configureTagsItems(tags));
    },
    /**
     * Configures and returns tags for the list template.
     * @param {Array} config
     * @returns {Array}
     */
    configureTagsItems(config) {
        const items = [];
        Ext.each(config, function (data) {
            const tag = data.name || data;
            let title = data.title || tag;
            const type = CJ.Utils.getTagType(tag);
            switch (type) {
            case 'category':
                title = CJ.User.getCategoryByTag(tag).name;
                break;
            case 'group':
                const group = CJ.StreamHelper.getGroup();
                title = group && group.name;
                if (!title) {
                    title = '';    // group data is loading
                    // group data is loading
                    CJ.app.on({
                        'groupheader.load': this.onGroupHeaderLoad,
                        single: true,
                        scope: this
                    });
                }
                break;
            }
            items.push({
                icon: '',
                iconCls: '',
                title: CJ.capitalize(title.replace(/[%@#]/g, '')),
                target: tag
            });
        }, this);
        return items;
    },
    onGroupHeaderLoad(group) {
        this.element.dom.querySelector(CJ.tpl('.tags [data-target="+{0}"] .d-title', group.hashId)).innerHTML = group.name;
    },
    /**
     * Resets related tags.
     */
    resetRelatedTags() {
        const request = this.getRelatedTagsRequest();
        if (request)
            Ext.Ajax.abort(request);
        this.element.dom.querySelector('li.tags ul.selected').innerHTML = '';
        this.element.dom.querySelector('li.tags ul.related').innerHTML = '';
    },
    /**
     * @param {Object} data
     * @param {String} data.icon
     * @param {String} data.name
     * @return {undefined}
     */
    onPortalUpdate(data) {
        const node = this.element.dom.querySelector('.portal');
        if (!node)
            return;
        if (!CJ.User.isMinePortal(data.tag))
            return;
        node.querySelector('.d-menu-item-icon').style.cssText = CJ.Utils.makeIcon(data.icon);
        node.querySelector('.d-text').innerHTML = data.name;
    }
});