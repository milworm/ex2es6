import 'Ext/Component';
import 'app/core/view/list/Editor';

/**
 * Defines base class for any kind block (block to show user's answer or
 * just default block to show some information or to ask a question)
 * in the application.
 */
Ext.define('CJ.view.block.BaseBlock', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.Block',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-block-base-block',
    /**
     * @property {Boolean} isBlock
     */
    isBlock: true,
    /**
     * @property {Boolean} isOptimized
     */
    isOptimized: true,
    statics: {
        /**
         * @param {String} docId
         * @return {Boolean}
         */
        isPhantom(docId) {
            return !!/^temp_/.exec(docId);
        },
        /**
         * @param {Object} config
         * @param {Object} config.block
         * @param {Object} config.tab
         * @param {Ext.Element} config.context When it's passed, popup will
         *                                     x-aligned to that element.
         * @return {CJ.core.view.Popup}
         */
        popup(config) {
            return Ext.factory(Ext.apply({ xtype: 'view-block-fullscreen-popup' }, config || {}));
        },
        /**
         * @param {String} date
         * @return {String}
         */
        formatDate(date) {
            const format = 'Y/m/d - g:i A';
            if (date)
                date = Ext.Date.parse(date, 'Y-m-d G:i:s');
            else
                date = new Date();
            return CJ.Utils.formatUTCDate(date, format);
        },
        /**
         * @param {Number} id
         * @param {Object} config
         * @param {Function} [config.success]
         * @param {Function} [config.failure]
         * @param {Object} [config.scope]
         * @return {Object}
         */
        load(id, config) {
            return CJ.Ajax.request(Ext.apply({
                method: 'GET',
                rpc: {
                    model: 'Document',
                    method: 'load_document'
                },
                params: { id }
            }, config || {}));
        },
        /**
         * method is used only when user opens and editor in order to create new
         * course. Discovers what tags and categories should have new course-block.
         * @return {Object} config.
         *         {Object} config.tags
         *         {Object} config.categories
         */
        getInitialTagsAndCategories() {
            const tags = Ext.Viewport.getPageTags(), groups = Ext.Viewport.getPageGroup(), type = CJ.Utils.getTagType(tags), userTag = CJ.User.get('user'), categories = CJ.Utils.getTagCategories(tags);
            switch (type) {
            case 'tag': {
                    tags.unshift(userTag);
                    break;
                }
            case 'category':
            case 'user': {
                    tags[0] = userTag;
                    break;
                }
            case 'group': {
                    tags.shift();
                    if (CJ.Utils.getTagType(tags) != 'user')
                        tags.unshift(userTag);
                    break;
                }
            }
            return {
                userInfo: CJ.User.getInfo(),
                categories,
                tags,
                groups
            };
        },
        /**
         * @param {CJ.view.block.BaseBlock} block
         * @param {Object} config
         * @param {Object} config.scope
         * @param {Function} config.success
         * @return {undefined}
         */
        requestCompleteness(block, config) {
            const docId = block.getDocId(), nodeCls = block.getNodeCls();
            CJ.request({
                rpc: {
                    model: nodeCls,
                    method: 'completeness'
                },
                params: { docId },
                stash: config,
                success: this.refreshCompleteness
            });
        },
        /**
         * @param {Object} response
         * @param {Object} request
         * @return {undefined}
         */
        refreshCompleteness(response, request) {
            const docId = request.initialConfig.params.docId, selector = CJ.tpl('[docId={0}]', docId), blocks = Ext.ComponentQuery.query(selector), completeness = response.ret, stash = request.stash;
            Ext.each(blocks, block => {
                const node = block.element.dom.querySelector('.d-completeness-container');
                if (node)
                    node.innerHTML = CJ.Utils.completeness(completeness);
            });
            if (request.stash)
                Ext.callback(stash.success, stash.scope, [
                    response,
                    request
                ]);
        }
    },
    config: {
        /**
         * @cfg {Boolean} isModal When it's true, block is in a popup.
         */
        isModal: false,
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-block',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-block-inner',
        /**
         * @cfg {Number} docId
         */
        docId: false,
        /**
         * @@cfg {String} nodeCls
         */
        nodeCls: null,
        /**
         * @cfg {Object} bottomBar Additional container that is used to show
         *                         commens/answers buttons.
         */
        bottomBar: null,
        /**
         * @cfg {String} createdDate
         */
        createdDate: null,
        /**
         * @cfg {Boolean} saving
         */
        saving: null,
        /**
         * @cfg {Object} answers Note: server doesn't return this property. It's
         *                       used only to render answers in case when we use
         *                       batch request.
         */
        answers: {
            items: [],
            order: []
        },
        /**
         * @cfg {Object} comments
         */
        comments: {
            total: 0,
            subtreeTotal: 0,
            items: [],
            order: []
        },
        /**
         * @cfg {Ext.Template} headerTpl
         */
        headerTpl: null,
        /**
         * @cfg {Ext.Template} footerTpl
         */
        footerTpl: null,
        /**
         * @cfg {String} docVisibility [public, private, portal]
         */
        docVisibility: null,
        /**
         * @cfg {Array} tags
         */
        tags: [],
        /**
         * @cfg {Boolean} editing
         */
        editing: null,
        /**
         * @cfg {Ext.Component} editor
         */
        editor: null,
        /**
         * @cfg {Object} userInfo
         */
        userInfo: {},
        /**
         * @cfg {Array} groups
         */
        groups: [],
        /**
         * @cfg {Boolean} isOriginal This flag will be false in case when block
         *                           is processing an-event, but it is not a
         *                           block that fires this event.
         */
        isOriginal: true,
        /**
         * @cfg {Array} categories
         */
        categories: [],
        /**
         * @cfg {Boolean} pinned
         */
        pinned: null,
        /**
         * @cfg {Object} completeness
         */
        completeness: null
    },
    /**
     * @property {Object} tapListeners
     */
    tapListeners: {},
    constructor(config undefined {}) {
        this.parent = config.parent;
        this.callParent(args);
        Ext.TaskQueue.requestWrite(function () {
            this.on('commentcreate', this.onCommentCreate, this);
        }, this);
    },
    /**
     * @param {Object} userInfo
     * @return {Object}
     */
    applyUserInfo(userInfo) {
        if (userInfo && userInfo.user)
            return userInfo;
        return CJ.User.getInfo();
    },
    /**
     * performs required callback for each copy of current block.
     * @param {Function} callback
     */
    eachCopy(callback) {
        if (!this.getIsOriginal())
            return;
        const selector = CJ.tpl('[docId={0}]', this.getDocId()), blocks = Ext.ComponentQuery.query(selector);
        for (let i = 0, block; block = blocks[i]; i++) {
            if (block == this)
                continue;
            block.setIsOriginal(false);
            callback(block);
            block.setIsOriginal(true);
        }
    },
    /**
     * @param {Function} callback
     */
    each(callback) {
        if (!this.getIsOriginal())
            return;
        const selector = CJ.tpl('[docId={0}]', this.getDocId()), blocks = Ext.ComponentQuery.query(selector);
        for (let i = 0, block; block = blocks[i]; i++) {
            block.setIsOriginal(false);
            callback(block);
            block.setIsOriginal(true);
        }
    },
    /**
     * @param {Number} count
     */
    onCommentCreate(count) {
        this.getComments().subtreeTotal = count;
    },
    /**
     * @return {Number}
     */
    getCommentsCount() {
        return this.getComments().subtreeTotal;
    },
    /**
     * @return {Number}
     */
    getAnswersCount() {
        if (this.hasQuestion(true))
            return this.getQuestion().getAnswers();
        return 0;
    },
    /**
     * @param {Ext.Evented} e
     * @param {HTMLElement} target
     * @return {undefined}
     */
    onElementTap(e, target) {
        for (const selector in this.tapListeners)
            if (e.getTarget(selector, 10))
                return this[this.tapListeners[selector]](e, target);
        const bottomBarButton = e.getTarget('[data-type]', 2);
        if (!bottomBarButton)
            return;
        this.getBottomBar().onButtonTap(e, bottomBarButton);
    },
    initElement() {
        this.callParent(args);
        this.headerNode = this.element.dom.querySelector('.d-header');
        this.footerNode = this.element.dom.querySelector('.d-footer');
    },
    /**
     * @param {Ext.Evented} e
     */
    onMenuButtonTap(e) {
        const blockNode = e.getTarget('.d-block');    // extjs will call handlers based on subscribe-order
                                                      // so in case when some parent block had been rendered before
                                                      // inner blocks (it's default rendering flow),
                                                      // we should do this check in order to call showOptions method for
                                                      // correct block.
        // extjs will call handlers based on subscribe-order
        // so in case when some parent block had been rendered before
        // inner blocks (it's default rendering flow),
        // we should do this check in order to call showOptions method for
        // correct block.
        if (this.element.dom != blockNode)
            return;
        if (this.isPhantom())
            return;
        e.stopEvent();
        this.showOptions();
    },
    /**
     * @param {Ext.Evented} e
     */
    onAssignButtonTap(e) {
        e.stopEvent();
        CJ.view.block.Assign.popup({ block: this });
    },
    /**
     * @param {Ext.Evented} e
     */
    onPermissionsButtonTap(e) {
        if (this.isPhantom())
            return;
        e.stopEvent();
        this.showPermissions();
    },
    /**
     * @return {Object}
     */
    getHeaderTplData() {
        return {
            scope: this,
            userInfo: this.getUserInfo(),
            createdDate: this.getCreatedDate(),
            docId: this.getDocId(),
            docVisibility: this.getDocVisibility()
        };
    },
    /**
     * @param {String} newTpl
     * @param {String} oldTpl
     */
    updateHeaderTpl(newTpl, oldTpl) {
        if (!newTpl)
            return;
        this.headerNode.innerHTML = newTpl.apply(this.getHeaderTplData());
    },
    /**
     * @param {String} newTpl
     * @param {String} oldTpl
     */
    updateFooterTpl(newTpl, oldTpl) {
        if (!newTpl)
            return;
        this.footerNode.innerHTML = newTpl.apply(this.getFooterTplData());
    },
    /**
     * @return {Object} object that will be used to render footer tpl
     */
    getFooterTplData() {
        return {};
    },
    /**
     * shows block's options popup
     */
    showOptions: Ext.emptyFn,
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                {
                    className: 'd-block-content',
                    children: [
                        { className: 'd-header' },
                        {
                            reference: 'innerElement',
                            classList: [
                                'x-inner',
                                'd-body'
                            ]
                        }
                    ]
                },
                { className: 'd-footer' }
            ]
        };
    },
    /**
     * @param {Number|undefined} docId
     * @return {Number|String}
     */
    applyDocId(docId) {
        return docId || CJ.Guid.generatePhantomId();
    },
    /**
     * @param {Number|String} docId
     */
    updateDocId(docId) {
        this.element.set({ docId });
    },
    /**
     * @return {Boolean}
     */
    isPhantom() {
        return CJ.Block.isPhantom(this.getDocId());
    },
    /**
     * @return {CJ.core.view.list.Base}
     */
    getParentList() {
        return this.up('[isList]');
    },
    /**
     * @return {String} view or list.
     */
    getListDisplayType() {
        try {
            return this.getParentList().getDisplayType();
        } catch (e) {
            // parentlist doesn't exist
            return 'list';
        }
    },
    /**
     * @return {Boolean} true in case when users is viewing only this one item.
     */
    isViewItem() {
        return this.getListDisplayType() == 'view';
    },
    /**
     * @return {Boolean} true in case when users is viewing list of blocks.
     */
    isListItem() {
        return this.getListDisplayType() == 'list';
    },
    /**
     * @param {Boolean} state
     */
    updateEditing(state) {
        if (state)
            this.toEditState();
        else
            this.toViewState();
    },
    /**
     * must be overriden in sub-class
     * can contain any logic when block changes state to edit
     */
    toEditState: Ext.emptyFn,
    /**
     * must be overriden in sub-class
     * can contain any logic when block changes state to view
     */
    toViewState: Ext.emptyFn,
    /**
     * saves current block's information
     */
    save(request) {
        // could be null
        // @TODO this is a kind of hack
        if (this.getEditing())
            this.setEditing(false);
        this.setSaving(true);
        CJ.request(Ext.applyIf(request, {
            scope: this,
            success: this.onSaveSuccess,
            callback: this.onSaveCallback
        }));
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onSaveSuccess(response, request) {
        if (this.isPhantom())
            this.onBlockCreated();
        else
            this.onBlockUpdated();
        const docId = this.getDocId(), data = response.ret.saved[docId];    // always keep answers and comments, as these 2 properties could be
                                                                            // already loaded.
                                                                            // @TODO need to find better way to do it
        // always keep answers and comments, as these 2 properties could be
        // already loaded.
        // @TODO need to find better way to do it
        Ext.apply(data, {
            answers: this.config.answers,
            comments: this.config.comments
        });
        this.reinit(data);    // sometimes, for example in fullscreen-popup, we edit the copy
                              // of a block, so after user updates it, we need to update all copies
        // sometimes, for example in fullscreen-popup, we edit the copy
        // of a block, so after user updates it, we need to update all copies
        this.eachCopy(block => {
            block.reinit(data);
            if (block.isPlaylistPlayBlock)
                block.getPlaylist().updateItem(block);
        });
        this.fireEvent('saved', this);
        const stash = request.stash || {}, success = stash.success || Ext.emptyFn;
        success.call(stash.scope, this, response, request);
    },
    /**
     * @return {undefined}
     */
    onSaveCallback(response, request) {
        const stash = request.stash || {}, callback = stash.callback || Ext.emptyFn;
        this.setSaving(false);
        callback.call(stash.scope, this);
    },
    /**
     * must be overriden in sub class
     * @return {Object}
     */
    serialize() {
        return {};
    },
    destroy() {
        delete this.headerNode;
        delete this.footerNode;
        if (this.contentElement)
            this.contentElement.destroy();
        this.setBottomBar(null);
        this.callParent(args);
    },
    applyChanges: Ext.emptyFn,
    resetChanges: Ext.emptyFn,
    /**
     * should be overriden in sub-class
     * @return {Boolean}
     */
    hasQuestion() {
        return false;
    },
    /**
     * @return {String} owners' @USER_NAME, to get user how created this block
     *                                      you have to call #getOriginalUser()
     */
    getOwnerUser() {
        return this.getUserInfo().user;
    },
    /**
     * @return {Boolean} true in case when current block is suitable for current
     *                   page, for example: block's group are the same as group
     *                   of current page, or pages's tags are parent tags of
     *                   block's tags.
     */
    hasPageTags() {
        const pageTags = Ext.Viewport.getPageTags();
        if (pageTags == '%feed')
            return true;
        if (pageTags == CJ.tpl('%{0}', this.getDocId()))
            return true;
        const tags = this.getTags(), groups = this.getGroups(), categories = this.getCategories();    // for public tags in order to simplify logic, we need to add username of current user.
        // for public tags in order to simplify logic, we need to add username of current user.
        if (CJ.Utils.getTagType(pageTags[0]) == 'tag')
            pageTags.unshift(CJ.User.get('user'));
        for (let i = 0, tag; tag = pageTags[i]; i++) {
            const type = CJ.Utils.getTagType(tag), slicedTag = tag.slice(1);
            switch (type) {
            case 'category': {
                    if (categories.indexOf(slicedTag) == -1)
                        return false;
                    break;
                }
            case 'group': {
                    if (groups.indexOf(slicedTag) == -1)
                        return false;
                    break;
                }
            default: {
                    if (tags.indexOf(tag) == -1)
                        return false;
                }
            }
        }
        return true;
    },
    /**
     * simply re-renders headerElement
     */
    refreshHeader() {
        if (this.isBatchUpdate)
            return this.batchOperations.push('refreshHeader');
        this.getHeaderTpl().overwrite(this.headerNode, this.getHeaderTplData());
    },
    /**
     * changes block's mode in order to collect operations (methods) that should
     * update the UI. It is used in case when you need to update few properties,
     * that should update HTML, but you want to prevent making several updates,
     * as just one update will be enough:
     */
    startBatchUpdate() {
        this.isBatchUpdate = true;
        this.batchOperations = [];
    },
    /**
     * runs pending operations that should update the UI
     */
    endBatchUpdate() {
        delete this.isBatchUpdate;
        const operations = Ext.Array.unique(this.batchOperations);
        for (let i = 0, operation; operation = operations[i]; i++)
            this[operation]();
    },
    /**
     * @return {String} url in "protocol://#{localUrl}" format.
     */
    getUrl() {
        return CJ.Utils.makeUrl(this.getLocalUrl());
    },
    /**
     * @return {String} hash-part of url, that is used for in-app navigation.
     */
    getLocalUrl() {
        return CJ.tpl('!{0}', this.getDocId());
    },
    /**
     * @param {String} tags
     * @param {Object} config
     */
    share(tags, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'Document',
                method: 'save_tags',
                id: this.getDocId()
            },
            params: { tags }
        }, config || {}));
    },
    /**
     * @param {Boolean} state
     */
    updateSaving(state) {
        if (this.isDestroyed)
            return;
        this.element[state ? 'addCls' : 'removeCls']('d-saving');
    },
    /**
     * method should/will be called right before saving a block,
     * checks whenever we are creating a block on a group page, and if so,
     * sets block's groups to be page's groups.
     * @return {undefined}
     */
    initGroups() {
        if (!this.isPhantom())
            return;
        this.setGroups(Ext.Viewport.getPageGroup());
    },
    /**
     * performs assign_to request in order to assign current block to
     * all selected groups and tags (block will be reused if needed)
     * @param {Array} groups
     * @param {Array} tags
     * @param {Object} config
     * @param {Object} config.scope
     * @param {Function} config.success
     */
    assign(groups undefined [], tags undefined [], config) {
        if (CJ.User.isMine(this)) {
            this.setGroups(groups);
            this.setTags(tags);
        }
        const request = Ext.apply({
            rpc: {
                model: 'Document',
                method: 'assign_to',
                id: this.getDocId()
            },
            params: {
                groups,
                tags
            },
            scope: this,
            success: this.onAssignSuccess
        }, config);
        CJ.request(request);
    },
    /**
     * @param {Object} response
     */
    onAssignSuccess(response) {
        const response = response.ret;
        let block;
        CJ.feedback();    // @TODO we need to show correct confirms for different types
                          // of user actions
                          // CJ.feedback(CJ.app.t("activity-created"));
        // @TODO we need to show correct confirms for different types
        // of user actions
        // CJ.feedback(CJ.app.t("activity-created"));
        if (this.getIsModal())
            block = CJ.byDocId(this.getDocId());
        if (!block)
            return;
        block.onBlockUpdated();
        const group = CJ.StreamHelper.getGroup();    // @TODO
        // @TODO
        if (group && response.groups.indexOf(group.hashId) == -1)
            block.getParentList().adjustContaining(block);
        else
            block.onDeleteGroupPostSuccess();
    },
    /**
     * @return {CJ.core.view.Popup}
     */
    getPopup() {
        return this.up('[isPopup]');
    },
    /**
     * simply displays permissions popup
     * @return {undefined}
     */
    showPermissions() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-shareid-title',
            layout: 'light',
            content: {
                block: this,
                xtype: 'view-block-permissions',
                values: { visibility: this.getDocVisibility() }
            },
            actionButton: { iconCls: 'icon-progress-continue' }
        });
    },
    /**
     * @param {String} newDocVisibility
     */
    updateDocVisibility(newDocVisibility) {
        if (!this.initialized)
            return;
        this.refreshHeader();
    },
    onBlockCreated: Ext.emptyFn,
    onBlockUpdated: Ext.emptyFn,
    /**
     * @return {Boolean}
     */
    hasTags() {
        return this.getTags().length > 0;
    },
    /**
     * this method is needed, as we cannot use useBodyElement == false
     * because ST ignores it for example while adding a mask
     */
    updateUseBodyElement: Ext.emptyFn,
    /**
     * shows current block in modal popup.
     */
    popup() {
        CJ.Block.popup({ block: Ext.apply({ isModal: true }, this.initialConfig) });
    },
    /**
     * @return {HTMLElement}
     */
    getContentElement() {
        if (this.contentElement)
            return this.contentElement;
        return this.contentElement = Ext.get(this.element.dom.querySelector('.d-block-content'));
    },
    clone() {
        return Ext.factory(this.serialize());
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    reinit(config) {
        // sometimes we call reinit on destroyed block, which might cause some errors as #element is also destroyed.
        // for example: when user removes a tag from a block, so block will be destroyed, when onSaveSuccess is called.
        if (this.isDestroyed)
            return;
        Ext.Base.prototype.initConfig.call(this, config);
    },
    /**
     * @param {Array} courseIds
     * @param {Object} callbacks
     * @return {undefined}
     */
    addToCourses(courseIds, callbacks) {
        courseIds = Ext.isArray(courseIds) ? courseIds : [courseIds];
        CJ.Ajax.request({
            rpc: {
                model: 'Course',
                method: 'add_to_courses'
            },
            params: {
                docId: this.getDocId(),
                courseIds
            },
            scope: this,
            callbacks: callbacks || {},
            success: this.onAddToCoursesSuccess,
            failure: this.onAddToCoursesFailure
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onAddToCoursesSuccess(response, request) {
        const courseIds = request.initialConfig.params.courseIds;
        const callbacks = request.initialConfig.callbacks;
        let message;    // for newly created course, we don't need to show any feedback message,
                        // because we bring the editor.
        // for newly created course, we don't need to show any feedback message,
        // because we bring the editor.
        if (!callbacks.isNew)
            this.showAddToCourseFeedback(courseIds);
        Ext.callback(callbacks.success, callbacks.scope, arguments);
    },
    /**
     * @param {Array} courseIds
     */
    showAddToCourseFeedback(courseIds) {
        if (courseIds.length > 1)
            return CJ.feedback();
        CJ.feedback({
            duration: 5000,
            message: CJ.t('view-block-base-block-add-to-course-success'),
            tap() {
                CJ.app.redirectTo(`!cs/${ courseIds[0] }`);
            }
        });
    },
    /**
     * @return {undefined}
     */
    onAddToCoursesFailure() {
    }    // @TODO
,
    /**
     * @return {Boolean} true if block was paid.
     */
    isPaid() {
        if (!this.isContentBlock)
            return false;
        if (CJ.User.isMine(this)) {
            if (this.isReused())
                return this.hasLicensedVisibility();
            else
                return false;
        }
        if (this.isReused())
            return false;
        return this.hasLicensedVisibility();
    },
    hasLicensedVisibility() {
        return this.getDocVisibility() == 'licensed';
    }
});