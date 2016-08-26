import 'app/component/LocalStorage';
import 'app/component/Db';
import 'app/component/WebPush';

Ext.define('CJ.component.User', {
    alternateClassName: 'CJ.User',
    singleton: true,
    mixins: ['Ext.mixin.Observable'],
    data: {},
    logged: false,
    /**
     * @property {String} sessionId
     */
    sessionId: false,
    session: false,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} portal
         */
        portal: null
    },
    constructor() {
        this.callParent(args);
        this.initLanguage();
        this.initSessionId();
    },
    /**
     * @return {undefined}
     */
    initLanguage() {
        let lang = CJ.LocalStorage.getItem('currentDictName');
        if (lang)
            return this.saveLanguage(lang);
        if (navigator.languages)
            lang = navigator.languages[0];
        else
            lang = navigator.language || navigator.userLanguage;    // bugfix for chrome packaged app (it cannot handle errors, and will crash)
        // bugfix for chrome packaged app (it cannot handle errors, and will crash)
        if (!lang)
            lang = 'en';
        lang = lang.toLowerCase().slice(0, 2) == 'fr' ? 'fr' : 'en';
        this.saveLanguage(lang);
    },
    /**
     * @return {undefined}
     */
    initSessionId() {
        this.sessionId = this.discoverSessionId();
    },
    /**
     * @return {String|Boolean}
     */
    discoverSessionId() {
        const items = document.cookie.match(/session_id=([^;]*)/);
        if (!items)
            return this.logged = false;
        this.logged = true;
        return items[1];
    },
    /**
     * @param {String} language
     */
    saveLanguage(language) {
        CJ.LocalStorage.setItem('currentDictName', language);
        this.language = language;
        CJ.Db.save('language', language);
    },
    /**
     * Returns value of property if it was set or all data otherwise.
     * @param {String} [property] Name of property.
     * @returns {Mixed}
     */
    get(property) {
        return property ? this.data[property] : this.data;
    },
    getInfo() {
        const data = this.get();
        return {
            id: data.id,
            user: data.user,
            icon: data.icon,
            name: data.name
        };
    },
    /**
     * Gets all the data required by profile page.
     * @return {Object}
     */
    getProfileInfo() {
        const data = this.get();
        return {
            id: data.id,
            user: data.user,
            name: data.name,
            last_name: data.last_name,
            first_name: data.first_name,
            email: data.email,
            role: data.role,
            company: data.company,
            language: data.language
        };
    },
    /**
     * Sets data of user.
     * @param {String/Object} data Name of property or data object.
     * @param {Mixed} [value]
     */
    set(data, value) {
        switch (true) {
        case Ext.isString(data):
            this.data[data] = value;
            break;
        case Ext.isObject(data):
            Ext.iterate(data, function (key, value) {
                this.data[key] = value;
            }, this);
            break;
        default:
            return;
        }
        this.fireEvent('update', this.get());
    },
    /**
     * Returns logged status.
     * @returns {Boolean}
     */
    isLogged() {
        return this.logged;
    },
    /**
     * @return {Boolean} true in case when user changed a session (for example
     *                   from different tab).
     */
    isSessionChanged() {
        if (this.discoverSessionId() != this.sessionId)
            return true;
        return false;
    },
    /**
     * Makes request to the server to login.
     * @param {Object} data
     * @param {String} data.username
     * @param {String} data.password
     * @param {Object} config Contains callbacks for request.
     */
    login(data, config) {
        CJ.request({
            safe: true,
            loadMask: false,
            url: CJ.constant.request.login,
            params: data,
            success: this.onLoginSuccess,
            failure: this.onLoginFailure,
            scope: this,
            ignoreCookieMatch: true,
            //Needed when a previous auth request has failed and has set a cookie
            stash: { config }
        });
    },
    /**
     * Handler of success response of login request.
     * @param {Object} response
     * @param {Object} request
     */
    onLoginSuccess(response, request) {
        this.logged = true;
        const config = request.stash.config || {};
        if (Ext.isFunction(config.success))
            Ext.callback(config.success, config.scope || CJ.app, [response]);
        this.loadSession();
    },
    /**
     * Handler of failure response of login request.
     * @param {Object} response
     * @param {Object} request
     */
    onLoginFailure(response, request) {
        const config = request.stash.config;
        if (Ext.isFunction(config.failure))
            Ext.callback(config.failure, config.scope || CJ.app, [response]);
    },
    loadSession() {
        this.requestSessionData(Ext.bind(this.onLoadSessionCallback, this));
    },
    onLoadSessionCallback() {
        const me = this;
        me.initSessionId();
        if (!CJ.PopupManager.exists()) {
            me.fireEvent('session.reinit', me);
            return;
        }    // user did log in, so we need to hide all opened history-memebers popups (or all popups), move history
             // back to it's last state and restore last url.
        // user did log in, so we need to hide all opened history-memebers popups (or all popups), move history
        // back to it's last state and restore last url.
        CJ.PopupManager.hideAll(() => {
            // @TODO we assume that user can't open few historyMemeber popups at the same time being unlogged.
            CJ.History.preventAction = true;
            CJ.History.forward();    // waiting for a browser's forward action.
            // waiting for a browser's forward action.
            setTimeout(() => {
                me.fireEvent('session.reinit', me);
            }, 500);
        });
    },
    /**
     * Makes request to the server to receive session data.
     * @param {Function} callback
     */
    requestSessionData(callback) {
        CJ.request({
            url: CJ.constant.request.sessionData,
            method: 'GET',
            scope: this,
            success: this.onRequestSessionDataSuccess,
            ignoreCookieMatch: true,
            stash: { callback }
        });
    },
    /**
     * Handler of success response of request session data.
     * @param {Object} response
     * @param {Object} request
     */
    onRequestSessionDataSuccess(response, request) {
        const sessionData = response.session, userData = sessionData.user, categories = sessionData.location.categories, portalCategories = sessionData.location.portalCategories, portal = sessionData.location.portal, callback = request.stash.callback;
        Core.session = sessionData;
        Ext.applyIf(userData, { hiddenTips: [] });
        this.set(userData);
        this.initSessionId();
        this.setCategories(categories);
        this.setPortalCategories(portalCategories);
        this.setLanguage(userData.language);
        this.setPortal(portal);    //Google analytics
        //Google analytics
        if (window.ga)
            ga('set', '&uid', userData.id);
        CJ.fire('notifications.do', 'toggle');
        Ext.isFunction(callback) && callback(true, sessionData);
        CJ.WebPush.safeSubscribe();
    },
    /**
     * Makes request to the server to logout.
     */
    logout() {
        CJ.LoadBar.run();
        return Promise.resolve().then(() => CJ.WebPush.safeUnsubscribe()).then(this.doLogout.bind(this)).then(this.onLogoutSuccess.bind(this)).catch(this.onLogoutFailure.bind(this)).then(this.onLogoutCallback.bind(this));
    },
    /**
     * @return {Promise}
     */
    doLogout() {
        return new Promise((resolve, reject) => {
            CJ.request({
                url: CJ.constant.request.logout,
                success: resolve,
                failure: reject
            });
        });
    },
    /**
     *  Handler of success response of logout.
     */
    onLogoutSuccess() {
        //clear language and revert to browser language
        CJ.LocalStorage.removeItem('currentDictName');    // user is no longer logged
        // user is no longer logged
        this.logged = false;
        this.initSessionId();
        this.initLanguage();
        CJ.app.redirectTo(this.getDefaultPage());
        this.loadSession();
    },
    /**
     * Handler of failure response of logout.
     */
    onLogoutFailure() {
        // @TODO backend is broken, so temporary
        this.onLogoutSuccess();    // todo: translate message
                                   //CJ.alert('Error', 'Something wrong with server, try again later or contact support');
    },
    /**
     * Hides loadmask.
     */
    onLogoutCallback() {
        Ext.defer(CJ.LoadBar.finish, 1500, CJ.LoadBar);
        CJ.fire('language.change', this.language);
    },
    /**
     * @param {Ext.Component|Object} block
     * @param {Boolean} checkReuseCreator True in order to also check block's
     *                                    original user in if block was reused.
     * @return {Boolean} true when current user is a block owner
     */
    isMine(block, checkReuseCreator) {
        const me = this.get('user');
        if (!block.isComponent)
            return block.userInfo.user == me;
        if (block.getUserInfo().user == me)
            return true;
        if (checkReuseCreator && block.isReusable && block.isReused())
            return block.getOriginalUser() == me;
        return false;
    },
    /**
     * @param {String|Array} tags
     * @return {Boolean}
     */
    isMineTags(tags) {
        tags = Ext.isArray(tags) ? tags : tags.split(' ');
        return tags[0] == CJ.User.get('user');
    },
    /**
     * @return {Boolean} true in case when current app's page belongs to current
     *                   user.
     */
    isMineFeed() {
        return this.isMineTags(Ext.Viewport.getPageTags());
    },
    /**
     * @return {Object}
     */
    getAllowedDocumentVisibilities() {
        return this.get('allow_doc_vis');
    },
    /**
     * @return {String}
     */
    getDefaultDocVisibility() {
        return this.get('defaultDocVisibility');
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {Boolean} true in case when user can see answers of passed block.
     */
    canSeeAnswers(block) {
        return block.getQuestion().isAnswersPublic() || this.isMine(block);
    },
    isAmt(user) {
        if (!user)
            user = this.get('user');
        return /amt@/.test(user);
    },
    setCategories(raw) {
        const categories = Ext.Object.getValues(raw);
        categories.sort((a, b) => a.position > b.position);
        this.set('raw_categories', raw);
        this.set('categories', categories);
    },
    getCategories() {
        return this.get('categories');
    },
    /**
     * @param {Array} raw
     */
    setPortalCategories(raw) {
        const categories = Ext.Object.getValues(raw);
        categories.sort((a, b) => a.position > b.position);
        this.set('raw_portal_categories', raw);
        this.set('portalCategories', categories);
    },
    getCategoryByTag(tag) {
        const categories = this.get('raw_categories'), hashId = tag.slice(1);
        return categories[hashId];
    },
    /**
     * @return {Boolean} true if current user had been registered after an
     *                   official release at 18 of August
     */
    isNewUser() {
        const registerDate = this.get('registeredDate') || 1408309200100, releaseDate = 1408309200000;    // August 18
        // August 18
        return registerDate >= releaseDate;
    },
    /**
     * @param {CJ.view.group.BaseBlock|Object} group Pass nothing if you want to
     *                                         check currently viewing group.
     * @return {Boolean} true in case when current user is an owner of currently
     *                   viewing group.
     */
    isGroupOwner(group) {
        var group = CJ.StreamHelper.getGroup();
        if (!group)
            return false;    // it isn't a group-page
        // it isn't a group-page
        return group.isOwner;
    },
    /**
     * @return {Boolean} true in case when we have public or user session.
     */
    hasSession() {
        return Core.session;
    },
    /**
     * @return {Boolean}
     */
    isPublic() {
        return !localStorage.getItem('isRegistered') != 'true';
    },
    /**
     * @param {String} language
     * @return {undefined}
     */
    setLanguage(language) {
        if (this.language == language)
            return;
        this.saveLanguage(language);
        CJ.LoadBar.run();
        this.requestSessionData(result => {
            CJ.LoadBar.finish();
            CJ.fire('language.change', language);
        });
    },
    /**
     * @return {String}
     */
    getLanguage() {
        return this.language;
    },
    /**
     * Returns true if user is portal.
     * @param {String} [user]
     * @returns {Boolean}
     */
    isPortal(user) {
        return !!this.getPortalName(user);
    },
    /**
     * @param {String} portal Portal's name without '@'-symbol.
     * @return {Boolean} returns true if user is a portal-user and he has admin rights
     */
    isPortalAdmin(portal) {
        const isPortalAdmin = this.get('isPortalAdmin');
        if (!portal)
            return isPortalAdmin;
        return isPortalAdmin && this.getPortalName() == portal;
    },
    /**
     * @return {Boolean}
     */
    isAmtPortalAdmin() {
        return this.isAmt() && this.isPortalAdmin();
    },
    /**
     * @param {String} user
     * @return {String} portal name without @-char
     */
    getPortalName(user undefined this.get('user')) {
        const matches = /^(.*)@/.exec(user) || [];
        if (!matches)
            return '';
        return matches[1];
    },
    /**
     * @return {String} portal's tag
     */
    getPortalTag() {
        return (this.getPortal() || {}).tag;
    },
    /**
     * @param {String} portalTag
     * @return {Boolean}
     */
    isMinePortal(portalTag) {
        return this.getPortalName() == this.getPortalName(portalTag);
    },
    update(data, callback, scope, loadMask) {
        if (data.icon)
            data.iconCfg = data.icon;
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'save_documents'
            },
            params: {
                data: [Ext.apply(data, {
                        docId: this.get('profileDocId'),
                        nodeCls: 'ProfileDocument'
                    })]
            },
            success: this.onUpdateSuccess,
            scope: this,
            stash: {
                data,
                callback,
                scope
            },
            loadMask
        });
    },
    onUpdateSuccess(response, request) {
        const stash = request.stash;
        const profileDocId = this.get('profileDocId');
        const errorCode = response.ret.errors[profileDocId];
        let data;
        if (errorCode)
            return Ext.callback(stash.callback, stash.scope || this, [
                false,
                errorCode
            ]);
        data = response.ret.saved[profileDocId];
        Ext.apply(data, { iconCfg: { preview: data.icon } });
        this.set(data);
        if (data.language && data.language != this.getLanguage()) {
            this.saveLanguage(data.language);
            this.requestSessionData();
            CJ.fire('language.change', data.language);
        }
        Ext.callback(stash.callback, stash.scope || this, [
            true,
            data
        ]);
    },
    savePassword(currentPassword, newPassword, success, failure, scope) {
        CJ.request({
            rpc: {
                model: 'PortalUser',
                method: 'save_password'
            },
            params: {
                curr_passwd: currentPassword,
                new_passwd: newPassword
            },
            success,
            failure,
            scope
        });
    },
    /**
     * @param {Object} address
     * @param {String} address.line1
     * @param {String} address.line2
     * @param {String} address.state
     * @param {String} address.city
     * @param {String} address.name
     * @param {String} address.zip
     * @param {String} address.province
     * @param {Object} config
     * @param {Object} config.scope
     * @param {Function} config.success
     * @param {Function} config.failure
     * @return {undefined}
     */
    saveBillingAddress(address, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'PortalUser',
                method: 'save_billing_address'
            },
            params: { addr: address }
        }, config));
    },
    /**
     * @param {Object} config
     * @param {Object} config.scope
     * @param {Function} config.success
     * @param {Function} config.failure
     * @return {undefined}
     */
    loadBillingAddress(config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'PortalUser',
                method: 'load_billing_address'
            }
        }, config));
    },
    /**
     * @param {Object} config
     * @param {Object} config.scope
     * @param {Function} config.success
     * @param {Function} config.failure
     * @return {undefined}
     */
    listPurhcasedLicenses(config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'PortalUser',
                method: 'list_purchased_licenses'
            }
        }, config));
    },
    /**
     * @return {Boolean} true if current user has an access to premium tools like:
     *                   question's feedbacks, activity-title, maps etc ...
     */
    hasPremiumTools() {
        return !!CJ.User.data.ui_premium_tools_enabled;
    },
    /**
     * @param {Object} group
     * @return {Boolean} true if current user is able to post in group.
     */
    canPostToGroup(group) {
        if (this.isMine(group))
            return true;
        return group.isMember && group.postingAllowed;
    },
    /**
     * @return {Boolean}
     */
    hasLicensedDocVisibility() {
        return this.get('allow_doc_vis').licensed;
    },
    /**
     * @return {Boolean}
     */
    isExploreEnabled() {
        if (this.inAppDomain())
            return false;
        return this.isLogged() && Core.session.user.exploreEnabled;
    },
    /**
     * @return {Boolean} true if exam-form for playlists should be visible.
     */
    hasPlaylistExamMode() {
        return this.isPortal() || this.hasPremiumTools();
    },
    /**
     * @return {Boolean} true if question's options should contain feedback options.
     */
    hasQuestionFeedbackOptions() {
        return this.isPortal() || this.hasPremiumTools();
    },
    /**
     * @return {Boolean}
     */
    isFGA() {
        const user = CJ.User.get('user');
        return user ? user.indexOf('dqc') == 0 : false;
    },
    /**
     * @return {Boolean}
     */
    inAppDomain() {
        return /^app\.|localhost/.test(window.location.hostname);
    },
    /**
     * @return {Boolean}
     */
    inEduDomain() {
        return /^(edu|dev2|dev3)\./.test(window.location.hostname);
    },
    /**
     * @param {CJ.view.course.block.Block} block
     * @return {Boolean} true in case when block is managed and current user is a student of it.
     */
    isStudentFor(block) {
        return block.getIsManaged() && !block.getIsTeacher();
    },
    /**
     * @param {CJ.view.course.block.Block} block
     * @return {Boolean} true in case when block is managed and current user is a teacher of it.
     */
    isTeacherFor(block) {
        return block.getIsManaged() && block.getIsTeacher();
    },
    /**
     * @return {Boolean}
     */
    isStudent() {
        return !!this.get('student');
    },
    /**
     * @return {Boolean}
     */
    isTeacher() {
        return !!this.get('teacher');
    },
    /**
     * @return {Boolean}
     */
    isFgaStudent() {
        return this.isFGA() && this.isStudent();
    },
    /**
     * @return {Boolean}
     */
    isFgaTeacher() {
        return this.isFGA() && this.isTeacher();
    },
    /**
     * detects user's default page.
     * @return {undefined}
     */
    getDefaultPage() {
        let url;
        if (this.isLogged()) {
            url = 'feed';
            if (this.isPortal()) {
                url = CJ.tpl('pu/{0}@/f', this.getPortalName());
                if (this.inEduDomain())
                    url = 'feed';
            }
        } else {
            url = 'welcome';
            if (this.inEduDomain())
                url = 'explore';
        }
        if (this.isFGA())
            url = `u/${ this.get('user') }/c`;
        return `!${ url }`;
    }
});