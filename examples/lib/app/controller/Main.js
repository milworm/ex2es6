import 'Ext/app/Controller';

/**
 */
Ext.define('CJ.controller.Main', {
    extend: 'Ext.app.Controller',
    systemRedirect: false,
    initialRedirect: false,
    config: {
        /**
         * @cfg {String} savedUrl Contains user's last visited url before
         *                        logout.
         */
        savedUrl: null,
        /**
         * @cfg {Boolean} isLogged True if current user is logged in
         */
        isLogged: false,
        routes: {
            '': 'defaultAction',
            'login': 'login',
            'register': 'register',
            'notifications': 'notifications',
            'merge': 'merge',
            'profile': 'profile',
            '!feed': 'feed',
            '!purchased': 'purchased',
            '!explore': 'explore',
            '!welcome': 'welcome',
            'tokenLogin/:token': 'tokenLogin',
            'reset/:user/:token': {
                action: 'reset',
                conditions: { ':user': '[%a-zÀ-ÿA-Z0-9@\\-\\_\\s.,]+' }
            },
            '!:id': {
                action: 'fullscreen',
                meta: { isFullScreen: true },
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!m/:id': {
                action: 'fullscreen',
                meta: { isFullScreen: true },
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!a/:id': {
                action: 'fullscreen',
                meta: {
                    tab: 'answers',
                    isFullScreen: true
                },
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!m/:id/a': {
                action: 'fullscreen',
                meta: {
                    tab: 'answers',
                    isFullScreen: true
                },
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!a/:id/answer/:answerId': {
                action: 'fullscreenAnswer',
                meta: {
                    tab: 'answers',
                    // desktop has only one state for answers, but
                    // tablet has 2 states
                    answerState: Ext.os.is.Desktop ? 'comments' : 'answers',
                    isFullScreen: true
                },
                conditions: {
                    ':id': CJ.DOC_ID_RE,
                    ':answerId': CJ.DOC_ID_RE
                }
            },
            '!m/:id/a/:answerId': {
                action: 'fullscreenAnswer',
                meta: {
                    tab: 'answers',
                    // desktop has only one state for answers, but
                    // tablet has 2 states
                    answerState: Ext.os.is.Desktop ? 'comments' : 'answers',
                    isFullScreen: true
                },
                conditions: {
                    ':id': CJ.DOC_ID_RE,
                    ':answerId': CJ.DOC_ID_RE
                }
            },
            '!m/:id/a/:answerId/c': {
                action: 'fullscreenAnswer',
                meta: {
                    tab: 'answers',
                    answerState: 'comments',
                    isFullScreen: true
                },
                conditions: {
                    ':id': CJ.DOC_ID_RE,
                    ':answerId': CJ.DOC_ID_RE
                }
            },
            '!c/:id': {
                action: 'fullscreen',
                meta: {
                    tab: 'comments',
                    isFullScreen: true
                },
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!m/:id/c': {
                action: 'fullscreen',
                meta: {
                    tab: 'comments',
                    isFullScreen: true
                },
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!c/:id/comment/:commentId': {
                action: 'fullscreen',
                meta: {
                    tab: 'comments',
                    isFullScreen: true
                },
                conditions: {
                    ':id': CJ.DOC_ID_RE,
                    ':commentId': CJ.DOC_ID_RE
                }
            },
            '!m/:id/c/:commentId': {
                action: 'fullscreen',
                meta: {
                    tab: 'comments',
                    isFullScreen: true
                },
                conditions: {
                    ':id': CJ.DOC_ID_RE,
                    ':commentId': CJ.DOC_ID_RE
                }
            },
            '!c/:id/reply/:parentId/:replyId': {
                action: 'fullscreen',
                meta: {
                    tab: 'comments',
                    isFullScreen: true
                },
                conditions: {
                    ':id': CJ.DOC_ID_RE,
                    ':parentId': CJ.DOC_ID_RE,
                    ':replyId': CJ.DOC_ID_RE
                }
            },
            '!m/:id/c/:parentId/:replyId': {
                action: 'fullscreen',
                meta: {
                    tab: 'comments',
                    isFullScreen: true
                },
                conditions: {
                    ':id': CJ.DOC_ID_RE,
                    ':parentId': CJ.DOC_ID_RE,
                    ':replyId': CJ.DOC_ID_RE
                }
            },
            '!p/:id': {
                action: 'playlist',
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!pu/:portal/:tab': {
                action: 'portal',
                conditions: {
                    ':portal': '[@a-zÀ-ÿA-Z0-9-_]+',
                    ':tab': '\\w{1,2}'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!pu/:portal/:tab/:tags': {
                action: 'portal',
                conditions: {
                    ':portal': '[@a-zÀ-ÿA-Z0-9-_]+',
                    ':tab': '\\w{1,2}',
                    ':tags': '[%@\\+a-zÀ-ÿA-Z0-9-\\_\\s,]+'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!cs/:id': {
                action: 'course',
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!mp/:id': {
                action: 'map',
                conditions: { ':id': CJ.DOC_ID_RE }
            },
            '!an/:id': {
                action: 'answer',
                conditions: { ':id': CJ.DOC_ID_RE },
                meta: { isFullScreen: true }
            },
            '!g/:group/:tab': {
                action: 'group',
                conditions: {
                    ':group': '\\+[a-zA-Z0-9]+',
                    ':tab': '\\w'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!g/:group/:tab/:tags': {
                action: 'group',
                conditions: {
                    ':group': '\\+[a-zA-Z0-9]+',
                    ':tab': '\\w',
                    ':tags': '[%@\\+a-zÀ-ÿA-Z0-9-\\_\\s,]+'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!g/:tags': {
                action: 'groupDeprecated',
                conditions: { ':tags': '\\+[%@a-zÀ-ÿA-Z0-9-\\_\\s,]+' },
                meta: { showRelatedTags: true }
            },
            '!t/:tags/:tab': {
                action: 'tags',
                conditions: {
                    ':tags': '[%a-zÀ-ÿA-Z0-9-\\_\\s,]+',
                    ':tab': '\\w'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!t/:tags': {
                action: 'tagsDeprecated',
                conditions: { ':tags': '[%a-zÀ-ÿA-Z0-9-\\_\\s,]+' },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!u/:user/:tab': {
                action: 'user',
                conditions: {
                    ':user': '[%@a-zÀ-ÿA-Z0-9-\\_\\s,]+',
                    ':tab': '\\w{1,2}'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!u/:user/:tab/:tags': {
                action: 'user',
                conditions: {
                    ':user': '[%@a-zÀ-ÿA-Z0-9-\\_\\s,]+',
                    ':tab': '\\w',
                    ':tags': '[%@\\$a-zÀ-ÿA-Z0-9-\\_\\s,]+'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!u/:user': {
                action: 'userDeprecated',
                conditions: { ':user': '[%@a-zÀ-ÿA-Z0-9-\\_\\s,]+' },
                meta: { showRelatedTags: true }
            },
            '!u/:user/:tags': {
                action: 'userDeprecated',
                conditions: {
                    ':user': '[%@a-zÀ-ÿA-Z0-9-\\_\\s,]+',
                    ':tags': '[%@\\$a-zÀ-ÿA-Z0-9-\\_\\s,]+'
                },
                meta: { showRelatedTags: true }
            },
            '!e/:category/:tab': {
                action: 'category',
                conditions: {
                    ':category': '[$a-zA-Z0-9]+',
                    ':tab': '\\w'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!e/:category/:tab/:tags': {
                action: 'category',
                conditions: {
                    ':category': '[$a-zA-Z0-9]+',
                    ':tab': '\\w',
                    ':tags': '[@%$a-zÀ-ÿA-Z0-9-\\_\\s,]+'
                },
                meta: {
                    showRelatedTags: true,
                    tabIndex: 1
                }
            },
            '!e/:tags': {
                action: 'categoryDeprecated',
                conditions: { ':tags': '[@%$a-zÀ-ÿA-Z0-9-\\_\\s,]+' },
                meta: { showRelatedTags: true }
            },
            '!l/:docId/preview': {
                action: 'licensePreview',
                meta: { isFullScreen: true },
                conditions: { ':docId': CJ.DOC_ID_RE }
            },
            '!activate/:pin': {
                action: 'activateLicensePin',
                meta: { isFullScreen: true },
                conditions: { ':pin': '[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}' }
            },
            '!invoice/:id/:print': {
                action: 'viewInvoice',
                conditions: {
                    ':id': CJ.DOC_ID_RE,
                    ':print': '[$a-zA-Z0-9]+'
                }
            },
            '!invoice/:id': {
                action: 'viewInvoice',
                conditions: { ':id': CJ.DOC_ID_RE }
            }
        },
        before: {
            'defaultAction': ['checkUserSession'],
            'feed': [
                'checkUserSession',
                'saveListUrl'
            ],
            'purchased': [
                'checkUserSession',
                'saveListUrl'
            ],
            'tags': [
                'checkUserSession',
                'saveListUrl'
            ],
            'group': [
                'checkUserSession',
                'saveListUrl'
            ],
            'playlist': ['checkUserSession'],
            'course': ['checkUserSession'],
            'map': ['checkUserSession'],
            'user': [
                'checkUserSession',
                'saveListUrl'
            ],
            'merge': ['checkUserSession'],
            'licensePreview': ['checkUserSession'],
            'fullscreen': ['checkUserSession'],
            'fullscreenAnswer': ['checkUserSession'],
            'activateLicensePin': ['checkUserSession'],
            'profile': ['checkUserSession'],
            'notifications': ['checkUserSession'],
            'explore': [
                'checkUserSession',
                'saveListUrl'
            ],
            'welcome': [
                'checkUserSession',
                'saveListUrl'
            ],
            'category': [
                'checkUserSession',
                'saveListUrl'
            ],
            'portal': [
                'checkUserSession',
                'saveListUrl'
            ],
            'reset': [
                'redirectIfLogged',
                'checkUserSession'
            ],
            'login': ['redirectIfLogged'],
            'register': ['redirectIfLogged'],
            'viewInvoice': ['checkUserSession']
        }
    },
    /**
     * @private
     * Adds any routes specified in this Controller to the global Application router
     */
    applyRoutes(routes) {
        const router = this.getApplication().getRouter();
        const priorityRoutes = [
            '!feed',
            '!purchased',
            '!explore',
            '!welcome'
        ];
        let url;
        for (url in routes) {
            if (priorityRoutes.indexOf(url) > -1)
                continue;
            this.applyRoute(url, routes, router);
        }
        for (let i = 0; url = priorityRoutes[i]; i++) {
            this.applyRoute(url, routes, router);
            router.getRoutes().unshift(router.getRoutes().pop());
        }
        return routes;
    },
    /**
     * @param {String} url
     * @param {Array} routes
     * @param {Ext.app.Router} router
     * @return {undefined}
     */
    applyRoute(url, routes, router) {
        const route = routes[url];
        let config;
        config = { controller: this.$className };
        if (Ext.isString(route)) {
            config.action = route;
        } else {
            Ext.apply(config, route);
        }
        router.connect(url, config);
    },
    init() {
        CJ.app.on({
            routenotmatch: this.onRouteNotMatch,
            showNotFound: this.showPageNotFound,
            scope: this
        });
        CJ.User.on('session.reinit', this.onSessionReinit, this);
    },
    onRouteNotMatch() {
        if (CJ.User.hasSession())
            return this.showPageNotFound();
        CJ.User.requestSessionData(() => {
            Ext.Viewport.createAndInitItems();
            this.showPageNotFound();
        });
    },
    showPageNotFound() {
        Ext.Viewport.replaceContentWith({ xtype: 'view-noresult-route' });
    },
    onSessionReinit() {
        Ext.Viewport.onSessionReinit();
        CJ.History.processCurrentUrl();
    },
    /**
     * @return {Array} list of actions which creates isHistoryMember popup.
     */
    getModalActions() {
        return [
            'playlist',
            'fullscreen',
            'fullscreenAnswer',
            'login',
            'register',
            'reset',
            'course',
            'map',
            'licensePreview',
            'answer'
        ];
    },
    /**
     * @param {Ext.Base} action
     * @return {Boolean} true in case when action creates history-memeber modal popup.
     */
    isModalAction(action) {
        if (!action)
            return false;
        return this.getModalActions().indexOf(action.getAction()) > -1;
    },
    /**
     * @param {Object} action
     */
    execute(action) {
        const actions = this.getApplication().getHistory().getActions(), appHistory = CJ.History, isPageAction = !this.isModalAction(action);
        if (CJ.HISTORY_MEMBER_CLOSED) {
            CJ.HISTORY_MEMBER_CLOSED = false;
            if (isPageAction) {
                if (!appHistory.loadFirstState)
                    return;
                appHistory.loadFirstState = false;
            }
        } else {
            if (isPageAction)
                appHistory.loadFirstState = false;
        }    // ST doesn't add action on CJ.app.redirectTo
        // ST doesn't add action on CJ.app.redirectTo
        if (actions.indexOf(action) == -1)
            actions.push(action);
        CJ.fire('controller.beforeaction', this);
        this.callParent(args);    //Google analytics
        //Google analytics
        if (window.ga) {
            ga('send', {
                'hitType': 'pageview',
                'page': CJ.Utils.unurlify(action.getUrl())
            });
        }
        if (!CJ.LocalStorage.getItem('isNewUser'))
            return;
        if (this.defferedTutorialTimer)
            clearInterval(this.defferedTutorialTimer);
        this.defferedTutorialTimer = Ext.defer(() => {
            CJ.LocalStorage.removeItem('isNewUser');
            Ext.factory({ xtype: 'view-tutorial-popup' });
        }, 2000);
    },
    /**
     * @param {Object} action
     */
    redirectIfLogged(action) {
        if (CJ.User.isLogged())
            return this.backToLastValidUrl();
        return action.resume();
    },
    /**
     * @param {Object} action
     */
    checkUserSession(action) {
        if (CJ.User.hasSession())
            return action.resume();
        CJ.User.requestSessionData(Ext.bind(this.onSessionDataReceived, this, [action], true));
    },
    /**
     * simply saves the current url, where we have a list (feed, user, tags ...)
     * this is needed in order to restore a correct url in case when user
     * refreshes the page with isHistoryMemeber popup opened.
     * @param {Object} action
     */
    saveListUrl(action) {
        CJ.app.saveCurrentUrl();
        action.resume();
    },
    /**
     * Callback function of request session data.
     * @param {Boolean} status True if data received.
     * @param {Object} data
     * @param {Ext.app.Action} action
     */
    onSessionDataReceived(status, data, action) {
        Ext.Viewport.createAndInitItems();
        action.resume();
    },
    /**
     * Action: default
     */
    defaultAction() {
        CJ.History.replaceState(CJ.User.getDefaultPage());
        CJ.History.onStateChange();
    },
    /**
     * Action: merge
     */
    merge() {
        if (CJ.User.isPortal())
            CJ.view.profile.Merge.popup();
        else
            this.backToLastValidUrl();
    },
    /**
     * Action: reset
     */
    reset(user, token) {
        Ext.Viewport.createAndInitItems();
        CJ.view.login.ResetPassword.popup({
            content: {
                token,
                username: user
            }
        });
    },
    /**
     * Action: login
     */
    login() {
        Ext.Viewport.createAndInitItems();
        CJ.view.login.Login.popup({ popup: { isHistoryMember: true } });
    },
    /**
      * Action: register
      */
    register() {
        Ext.Viewport.createAndInitItems();
        CJ.view.login.Register.popup({ popup: { isHistoryMember: true } });
    },
    /**
     * Action: profile
     */
    profile() {
        if (!CJ.User.isLogged())
            return CJ.History.back();
        const viewport = Ext.Viewport;
        if (viewport.down('[isProfileSettings]'))
            return;
        viewport.replaceContentWith({ xtype: 'view-profile-profile' });
    },
    /**
     * Action: notifications
     */
    notifications() {
        if (!CJ.User.isLogged())
            return this.backToLastValidUrl();
        CJ.Notifications.showPopup();
    },
    /**
     * will be called when user navigates to feed-route,
     * displays feed items
     *
     * @return {undefined}
     */
    feed() {
        if (!CJ.User.isLogged())
            return this.backToLastValidUrl();
        this.createStream().load('%feed', 'Document');
        Ext.defer(() => {
            Ext.Viewport.sidemenu.expand('feed');
        }, 100);
    },
    /**
     * will be called when user navigates to purchased-route,
     * displays feed items
     *
     * @return {undefined}
     */
    purchased() {
        if (!CJ.User.isLogged())
            return CJ.app.redirectTo('!explore');
        this.createStream().load('%purchased', 'Document');
    },
    /**
     * @param {String} username
     * @param {String} tab
     * @param {String} tags
     * @return {undefined}
     */
    user(username, tab, tags) {
        if (username.indexOf('@') == -1)
            username = `@${ username }`;
        const type = CJ.StreamHelper.getListTypeFromRouteKey(tab);
        if (!type)
            return this.userDeprecated(username, tags);
        this.createStream().load([
            username,
            tags
        ].join(' ').trim(), type);
    },
    userDeprecated(username, tags) {
        const route = `!u/{0}/c${ tags ? '/{1}' : '' }`;
        CJ.History.replaceState(CJ.tpl(route, username, tags));
        CJ.History.onStateChange();
    },
    /**
     * Action: fullscreen
     * Shows a block in a popup.
     * @param {Number} id Block's id
     */
    fullscreen(id) {
        CJ.Block.popup({
            state: CJ.app.getActiveRoute().getMeta('tab'),
            blockId: id
        });
    },
    /**
     * Shows an answer in a popup.
     * @param {Number} docId
     * @param {Number} answerId
     */
    fullscreenAnswer(blockId, answerId) {
        if (Ext.os.is.Phone) {
            CJ.Block.popup({
                xtype: 'view-block-fullscreen-answer-popup',
                state: 'comments',
                blockId: answerId
            });
            return;
        }
        const token = CJ.History.getToken();
        let popup;
        CJ.History.replaceState(CJ.tpl('!m/{0}/a', blockId), true);
        popup = CJ.Block.popup({
            blockId,
            state: 'answers'
        });
        popup.addCls('d-hidden');
        Ext.defer(() => {
            popup.removeCls('d-hidden');
        }, 1500);
        CJ.app.redirectTo(token, true);
        CJ.Block.popup({
            xtype: 'view-block-fullscreen-answer-popup',
            state: CJ.app.getActiveRoute().getMeta('answerState'),
            blockId: answerId
        });
    },
    /**
     * @param {String} id answer's id
     * @return {undefined}
     */
    answer(id) {
        CJ.Block.popup({
            xtype: 'view-block-fullscreen-answer-popup',
            blockId: id
        });
    },
    /**
     * Action: tags
     */
    tags(tags, tab) {
        const model = CJ.StreamHelper.getListTypeFromRouteKey(tab);
        if (model)
            this.createStream().load(tags, model);
        else
            this.tagsDeprecated(tags);
    },
    tagsDeprecated(tags) {
        CJ.History.replaceState(CJ.tpl('!t/{0}/a', tags));
        CJ.History.onStateChange();
    },
    explore() {
        if (CJ.User.inAppDomain())
            return this.defaultAction();
        const viewPort = Ext.Viewport, searchBar = viewPort.getSearchBar();
        searchBar.setTags('%explore');
        viewPort.replaceContentWith({ xtype: 'view-category-list' });
        CJ.fire('tags.change', searchBar);
    },
    welcome() {
        if (CJ.User.inEduDomain() || CJ.User.isLogged())
            return this.defaultAction();
        const viewport = Ext.Viewport;
        if (viewport.down('[isWelcomePage]'))
            return;
        viewport.replaceContentWith({ xtype: 'view-welcome' });
    },
    category(category, tab, tags) {
        const type = CJ.StreamHelper.getListTypeFromRouteKey(tab);
        if (!type)
            return this.categoryDeprecated([
                category,
                tags
            ].join());
        this.createStream().load([
            category,
            tags
        ].join(' ').trim(), type);
    },
    categoryDeprecated(tags) {
        if (tags[0] != '$')
            tags = `$${ tags }`;
        const tags = tags.split(','), route = `!e/{0}/c${ tags.length > 1 ? '/{1}' : '' }`;
        CJ.History.replaceState(CJ.tpl(route, tags[0], tags.splice(1)));
        CJ.History.processCurrentUrl();
    },
    group(group, tab, tags) {
        const model = CJ.StreamHelper.getListTypeFromRouteKey(tab);
        if (!model)
            return this.groupDeprecated([
                group,
                tags
            ].join());
        this.createStream().load([
            group,
            tags
        ].join(' ').trim(), model);
    },
    groupDeprecated(tags) {
        const tags = tags.split(','), route = `!g/{0}/a${ tags.length > 1 ? '/{1}' : '' }`;
        CJ.History.replaceState(CJ.tpl(route, tags[0], tags.splice(1)));
        CJ.History.onStateChange();
    },
    /**
     * @param {Number} id
     */
    playlist(id) {
        CJ.view.playlist.Block.view(id);
    },
    /**
     * @param {String} portal
     * @param {String} tab
     * @param {String} tags
     */
    portal(portal, tab, tags) {
        if (tab == 'f' && !Ext.isEmpty(tags)) {
            const route = CJ.tpl('!pu/{0}/{1}/{2}', portal, 'a', tags);
            CJ.History.replaceState(route);
            CJ.History.onStateChange();
            return;
        }
        const model = CJ.StreamHelper.getListTypeFromRouteKey(tab), tags = [
                portal,
                tags
            ].join(' ').trim();
        this.createStream().load(tags, model);
    },
    /**
     * @param {Number} id
     */
    course(id) {
        Ext.defer(() => {
            CJ.LoadBar.run();    // it seems that IOS runs some optimizations to reduce dom-operations
                                 // and defer solves a problem.
        }, Ext.os.is.iOS ? 1 : 0);
        let block = CJ.StreamHelper.byDocId(id);
        CJ.Block.load(id, {
            success(response) {
                const result = response.ret;
                if (block) {
                    block.setSections(result.sections);
                    block.setIsEnrolled(result.isEnrolled);
                    block.setCompleteness(result.completeness);
                    block.setStudentStats(result.studentStats);
                } else {
                    block = Ext.factory(result);
                }    // can be a private block
                // can be a private block
                if (!block.isCourse) {
                    CJ.History.replaceState(CJ.tpl('!{0}', block.getDocId()));
                    CJ.History.onStateChange();
                    return;
                }
                CJ.view.course.view.Editor.popup({ block });
            },
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    map(id) {
        CJ.view.map.Block.toViewState(id);
    },
    /**
     *
     */
    tokenLogin(token) {
        Ext.Ajax.request({
            method: 'POST',
            url: `${ CJ.app.url }/auth/token_login`,
            params: { token },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            scope: this,
            disableCaching: false,
            success(response) {
                let error = false;
                try {
                    response = JSON.parse(response.responseText);
                } catch (e) {
                    error = true;
                }
                if (response.success) {
                    CJ.LocalStorage.setItem('username', response.username);
                    document.cookie = 'is_logged=1;';
                    CJ.app.redirectTo(CJ.User.getDefaultPage());
                    CJ.app.reload();
                } else {
                    error = true;
                }
            }
        });
    },
    /**
     * creates and renders stream component.
     * @return {CJ.view.stream.Container}
     */
    createStream() {
        if (!CJ.Stream) {
            CJ.Stream = Ext.factory({ xtype: 'view-stream' });
            Ext.Viewport.replaceContentWith(CJ.Stream);
        }
        return CJ.Stream;
    },
    /**
     * Renders a popup to show users a preview for licensed-container.
     * @param {Number} docId
     * @return {undefined}
     */
    licensePreview(docId) {
        CJ.view.purchase.LicensedBlock.previewById(docId);
    },
    /**
     * Renders fullscreen popup that allows user to redeem license code.
     * @param {String} pin Example: XGMJ-9L9Y-YQE3-7EZW
     * @return {undefined}
     */
    activateLicensePin(pin) {
        CJ.view.purchase.LicensedBlock.previewByPin(pin);
    },
    viewInvoice(id, print) {
        if (!CJ.User.isLogged())
            return this.backToLastValidUrl();
        CJ.view.profile.InvoiceList.popup({
            content: {
                providedInvoiceId: id,
                printOnInvoiceLoaded: print == 'print'
            }
        });
    },
    /**
     * when app starts we initialize lastUrl, which is the lastVisited url of user's defaultUrl, so this method simply
     * redirects back to that page.
     * @return {undefined}
     */
    backToLastValidUrl() {
        CJ.History.back();
    }
});