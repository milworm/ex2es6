import 'Ext/Component';
import 'app/view/stream/Helper';
import 'app/view/stream/ScrollLoader';
import 'app/core/plugins/StateSaver';
import 'app/view/stream/header/Category';
import 'app/view/stream/header/Group';
import 'app/view/stream/header/Tags';
import 'app/view/stream/header/User';
import 'app/view/stream/header/Portal';
import 'app/view/stream/list/Activity';
import 'app/view/stream/list/Course';
import 'app/view/stream/list/Group';
import 'app/view/stream/list/Skill';
import 'app/view/stream/list/User';
import 'app/view/stream/list/Featured';
import 'app/view/block/DefaultBlock';
import 'app/view/block/DeletedBlock';
import 'app/view/block/PrivateBlock';
import 'app/view/map/Block';
import 'app/view/group/Block';
import 'app/view/noresult/Entity';
import 'app/view/noresult/Content';
import 'app/view/noresult/Route';

/**
 * Defines a component that we use to render stream for user, group etc...
 */
Ext.define('CJ.view.stream.Container', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {Boolean} isStream
     */
    isStream: true,
    /**
     * @property {String} alias
     */
    alias: [
        'widget.view-stream',
        'widget.view-stream-container'
    ],
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-stream d-scroll',
        /**
         * @cfg {Ext.Base} header
         */
        header: null,
        /**
         * @cfg {Ext.Base} list
         */
        list: null,
        /**
         * @cfg {Ext.Component} notFoundStub
         */
        notFoundStub: null,
        /**
         * @cfg {Number} requestId
         */
        requestId: null,
        /**
         * @TODO need to move state-saver from "plugins" to "components"-folder.
         * @cfg {Object} stateSaver A component which saves and restores state (scroll-position) of a stream. We use it
         *                          here instead of stream/list/Base just to avoid creating and destroying this
         *                          component every time when user changes a tab.
         */
        stateSaver: { itemSelector: '[isBlock]' }
    },
    constructor() {
        CJ.User.onBefore('session.reinit', this.onSessionReinit, this);
        this.callParent(args);
    },
    /**
     * @param {Object} config
     * @param {Ext.Component} oldStateSaver
     * @return {undefined}
     */
    applyStateSaver(config, oldStateSaver) {
        if (oldStateSaver)
            oldStateSaver.destroy();
        if (!config)
            return false;
        return Ext.create('CJ.core.plugins.StateSaver', Ext.apply({ component: this }, config));
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyHeader(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({ renderTo: this.element }, config));
    },
    /**
     * @param {Ext.Component} newHeader
     * @param {Ext.Component} oldHeader
     * @return {undefined}
     */
    updateHeader(newHeader, oldHeader) {
        if (oldHeader)
            oldHeader.destroy();
    },
    /**
     * @param {Object} config
     * @param {Ext.Base} oldList
     * @return {Ext.Component}
     */
    applyList(config, oldList) {
        if (oldList)
            oldList.destroy();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            renderTo: this.element,
            stream: this
        }, config));
    },
    /**
     * @param {String} type
     * @param {Ext.Component} oldStub
     * @return {Ext.Component}
     */
    applyNotFoundStub(type, oldStub) {
        if (oldStub)
            oldStub.destroy();
        if (!type)
            return false;
        const label = CJ.tpl('view-noresult-{0}-entity-label', type);
        const action = CJ.tpl('view-noresult-{0}-entity-action', type);
        let handler;
        switch (type) {
        case 'user':
            handler = this.onNoUserStubTap;
            break;
        case 'group':
            handler = this.onNoGroupStubTap;
            break;
        case 'portal':
            handler = this.onNoPortalStubTap;
            break;
        }
        this.hideAddButtons();
        return Ext.factory({
            xtype: 'view-noresult-entity',
            data: {
                label,
                action
            },
            listeners: {
                scope: this,
                action: handler
            },
            renderTo: this.element
        });
    },
    /**
     * @param {String} tags
     * @param {String} listModel Document, Group, Course, Skill etc...
     * @return {undefined}
     */
    load(tags, listModel) {
        tags = CJ.Utils.fixTags(tags);
        Ext.Viewport.getSearchBar().setTagsFromRequest({ params: { tags } });
        const headerModel = CJ.StreamHelper.getHeaderModelFromTags(tags);
        const routeTab = CJ.StreamHelper.getRouteTab();
        let requestId;
        CJ.Ajax.initBatch();
        CJ.LoadBar.run({
            renderTo: Ext.Viewport.getSearchBar().element,
            maskedEl: Ext.Viewport.container.element
        });
        if (headerModel) {
            this.loadHeader(tags, headerModel);
            this.loadList(tags, listModel);
        } else {
            this.hideAddButtons();
            this.loadList(tags, listModel);
        }
        requestId = CJ.Ajax.runBatch(Ext.bind(this.onBatchRequestCallback, this, [
            headerModel,
            routeTab
        ]));
        this.setRequestId(requestId);
    },
    /**
     * simply hides load-bar.
     * @param {String} headerModel
     * @param {String} tab
     * @return {undefined}
     */
    onBatchRequestCallback(headerModel, tab) {
        CJ.LoadBar.finish();
        if (!headerModel)
            return this.setHeader(null);
        const header = this.getHeader();    // user could open some popup before stream is loaded, so .. we can't rely on tab from routing,
                                            // that's why we save and use it from request.
        // user could open some popup before stream is loaded, so .. we can't rely on tab from routing,
        // that's why we save and use it from request.
        if (header)
            header.activateTab(tab);
    },
    /**
     * loads data required to show stream's header.
     *
     * @param {String} tags
     * @param {String} model
     * @return {undefined}
     */
    loadHeader(tags, model) {
        if (!this.beforeLoadHeader(tags))
            return;
        this.hideAddButtons();
        CJ.StreamHeader.load(tags, model, {
            scope: this,
            success: this.onLoadHeaderSuccess,
            failure: this.onLoadHeaderFailure
        });
    },
    /**
     * @param {String} tags
     * @return {Boolean} true in case when we need to load new header.
     */
    beforeLoadHeader(tags) {
        const header = this.getHeader();
        if (!(header && header.getTags() == tags))
            return true;
        header.activateTab();
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onLoadHeaderSuccess(response, request) {
        this.setNotFoundStub(null);
        response = response.ret;
        const tags = request.stash.tags;
        const type = CJ.Utils.getTagType(tags);
        const setter = `set${ CJ.capitalize(type) }Header`;
        let header;
        if (this[setter])
            this[setter](response);
        if (!this.getHeader())
            return this.renderNotFound(type);
        header = this.getHeader();
        header.setTags(tags);
    },
    /**
     * Sets user header.
     * @param {Object} data
     */
    setUserHeader(data) {
        // in case when user does not exist
        if (!data.user)
            return this.setHeader(null);
        Ext.apply(data, {
            id: null,
            // ask Ivo to remove this
            xtype: 'view-stream-header-user',
            subscribed: data.key.followedByUser,
            stats: { subscribers: data.key.followerCount || 0 }
        });
        this.setHeader(data);
        if (!CJ.User.isMineTags(data.user))
            return;
        Ext.Viewport.buttons.setButtons({
            activity: true,
            course: true,
            group: true,
            map: true
        });
    },
    /**
     * Sets user header.
     * @param {Object} data
     */
    setPortalHeader(data) {
        // in case when portal does not exist
        if (!data.tag)
            return this.setHeader(null);
        const id = data.id;
        delete data.id;
        Ext.apply(data, {
            portalId: id,
            xtype: 'view-stream-header-portal',
            subscribed: data.key.followedByUser,
            stats: { subscribers: data.key.followerCount || 0 }
        });
        this.setHeader(data);
    },
    /**
     * Sets group header.
     * @param {Object} data
     */
    setGroupHeader(data) {
        // in case when group does not exist
        if (!data.hashId)
            return this.setHeader(null);
        CJ.app.fireEvent('groupheader.load', data);
        const groupPortalName = CJ.User.getPortalName(data.userInfo.user);
        let notice;
        if (!CJ.User.isLogged() && groupPortalName)
            notice = {
                title: CJ.t('view-block-profile-notice-accessible-title'),
                message: CJ.tpl(CJ.t('view-block-profile-notice-accessible-message'), groupPortalName)
            };
        Ext.apply(data, {
            xtype: 'view-stream-header-group',
            notice,
            stats: { members: data.key.followerCount || 0 }
        });
        this.setHeader(data);
        CJ.StreamHelper.setGroup(data);
        if (CJ.User.canPostToGroup(data))
            Ext.Viewport.buttons.setButtons({
                activity: true,
                course: true
            });
    },
    /**
     * Sets category header.
     * @param {Object} data
     */
    setCategoryHeader(data) {
        if (!data.key)
            return this.setHeader(null);
        Ext.apply(data, {
            id: null,
            // ask Ivo to remove this
            xtype: 'view-stream-header-category',
            subscribed: data.key.followedByUser,
            stats: { subscribers: data.key.followerCount || 0 }
        });
        this.setHeader(data);
        const tags = data.key.name, atSymbols = tags.match(/@/g);
        if (!atSymbols)
            return;    // we don't support posting stuff in $category portal@ @user.
        // we don't support posting stuff in $category portal@ @user.
        if (atSymbols.length > 1)
            return;
        const portalTag = tags.split(' ')[0];    // portal always goes first.
        // portal always goes first.
        if (CJ.User.isPortal())
            Ext.Viewport.buttons.setButtons({
                activity: true,
                course: true,
                map: true
            });
    },
    /**
     * Sets tags header.
     * @param {Object} data
     */
    setTagHeader(data) {
        this.setHeader({
            xtype: 'view-stream-header-tags',
            tags: data.name,
            subscribed: data.followedByUser,
            stats: { subscribers: data.followerCount || 0 }
        });
        Ext.Viewport.buttons.setButtons({
            activity: true,
            course: true,
            map: true
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onLoadHeaderFailure(response, request) {
        if (request.aborted)
            return;
        const tags = request.stash.tags, type = CJ.Utils.getTagType(tags);
        this.renderNotFound(type);
    },
    /**
     * @param {String} tags
     * @param {String} model
     */
    loadList(tags, model) {
        const stateSaver = this.getStateSaver(), modelInLowerCase = model.toLowerCase();
        switch (model.toLowerCase()) {
        case 'skill':
            return this.loadSkillList(tags);
        case 'featured':
            return this.loadFeaturedList(tags);
        case 'group':
            return this.loadGroupList(tags);
        }
        CJ.StreamList.load(tags, model, {
            scope: this,
            success: this.onLoadListSuccess,
            before(request) {
                stateSaver.modifyRequest(request);
            }
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onLoadListSuccess(response, request) {
        if (this.getNotFoundStub())
            return this.setList(null);
        const response = response.ret;
        const rawRequest = request.initialConfig;
        let model = request.stash.model.toLowerCase();
        const items = response.items;
        if (model == 'document')
            model = 'activity';
        this.setList({ xtype: `view-stream-list-${ model }` });    // in order to prevent ST from copying response and request objects, we use setter instead of passing everything
                                                                   // in constructor.
        // in order to prevent ST from copying response and request objects, we use setter instead of passing everything
        // in constructor.
        const list = this.getList(), loader = list.getScrollLoader();
        loader.setResponse(response);
        loader.setRequest({
            rpc: rawRequest.rpc,
            params: rawRequest.params
        });
        list.setItems(items);
        this.getStateSaver().restorePosition();
    },
    /**
     * loads skills-list.
     * @param {String} tags
     * @return {undefined}
     */
    loadSkillList(tags) {
        const user = CJ.Utils.getUserFromTags(tags);
        CJ.view.stream.list.Skill.load(user, {
            scope: this,
            success: this.onLoadSkillListSuccess
        });
    },
    /**
     * @param {Array} items
     * @return {undefined}
     */
    onLoadSkillListSuccess(response) {
        if (this.getNotFoundStub())
            return this.setList(null);
        this.setList({ xtype: 'view-stream-list-skill' });
        this.getList().setItems(response.ret);
        this.getStateSaver().restorePosition();
    },
    /**
     * loads featured-list.
     * @param {String} tags
     * @return {undefined}
     */
    loadFeaturedList(tags) {
        CJ.view.stream.list.Featured.load(tags, {
            scope: this,
            success: this.onLoadFeaturedListSuccess
        });
    },
    /**
     * @param {Array} items
     * @return {undefined}
     */
    onLoadFeaturedListSuccess(response, request) {
        if (this.getNotFoundStub())
            return this.setList(null);
        this.setList({
            xtype: 'view-stream-list-featured',
            portalTag: response.ret.tag
        });
        const list = this.getList();
        list.setCategories(response.ret.categories);
        list.setItems(response.ret.pinned);
        this.getStateSaver().restorePosition();
    },
    /**
     * @param {String} tags
     * @return {undefined}
     */
    loadGroupList(tags) {
        CJ.view.stream.list.Group.load(tags, {
            scope: this,
            stash: {
                model: 'group'    // used in #onLoadListSuccess
            },
            success: this.onLoadListSuccess
        });
    },
    /**
     * aborts current ajax-request
     */
    abort() {
        CJ.Ajax.abort(this.getRequestId());
    },
    /**
     * @return {undefined}
     */
    onLanguageChange() {
        const header = this.getHeader();    // user could be on explore-page, then make login, so language could be changed when header doesn't exist.
        // user could be on explore-page, then make login, so language could be changed when header doesn't exist.
        if (!header)
            return;    // for now we only support language filtering on "category" and "public tags" lists.
        // for now we only support language filtering on "category" and "public tags" lists.
        if (!(header.isCategoryHeader || header.isTagsHeader))
            return;
        this.reload();
    },
    /**
     * simply reloads the stream.
     * @return {undefined}
     */
    reload() {
        this.getHeader().setTags(null);    // to reload header.
        // to reload header.
        CJ.History.onStateChange();
    },
    /**
     * will be called when user performs log in/out.
     * @return {undefined}
     */
    onSessionReinit() {
        try {
            this.getHeader().setTags(null);
        } catch (e) {
        }
    },
    /**
     * hides or shows static content that is not going to be removed when we render next or previous page.
     * @param {Boolean} state
     * @return {undefined}
     */
    changeStaticItemsDisplay(state) {
        const header = this.getHeader();
        if (header)
            header[state ? 'show' : 'hide']();
    },
    /**
     * renders entity not found stub.
     * @param {String} type
     * @return {undefined}
     */
    renderNotFound(type) {
        if (type == 'category')
            CJ.app.getController('Main').showPageNotFound();
        else
            this.setNotFoundStub(type);
    },
    /**
     * will be called when user taps on no-user-stub.
     * @return {undefined}
     */
    onNoUserStubTap() {
        const searchField = Ext.Viewport.getSearchBar();
        searchField.setVisibleTags('');
        searchField.setEditing(true);
    },
    /**
     * will be called when user taps on no-group-stub.
     * @return {undefined}
     */
    onNoGroupStubTap() {
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        Ext.create('CJ.view.group.Block', {
            xtype: 'view-group-block',
            editing: true,
            userInfo: { user: CJ.User.get('user') },
            listeners: {
                saved(block) {
                    CJ.app.redirectTo(`!g/+${ block.getHashId() }`);
                }
            }
        });
    },
    /**
     * will be called when user taps on no-user-stub.
     * @return {undefined}
     */
    onNoPortalStubTap() {
        const searchField = Ext.Viewport.getSearchBar();
        searchField.setVisibleTags('');
        searchField.setEditing(true);
    },
    /**
     * hides creation buttons.
     * @return {undefined}
     */
    showAddButtons() {
        Ext.Viewport.buttons.show();
    },
    /**
     * hides creation buttons.
     * @return {undefined}
     */
    hideAddButtons() {
        Ext.Viewport.buttons.hide();
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.abort();
        this.setStateSaver(null);
        this.setHeader(null);
        this.setList(null);
        this.hideAddButtons();
        this.callParent(args);
    }
});