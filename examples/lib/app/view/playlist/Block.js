import 'app/view/block/ContentBlock';
import 'app/view/playlist/Options';
import 'app/view/playlist/Scoreboard';
import 'app/view/playlist/play/Container';

Ext.define('CJ.view.playlist.Block', {
    extend: 'CJ.view.block.ContentBlock',
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.Playlist',
    xtype: 'view-playlist-block',
    isPlaylist: true,
    statics: {
        /**
         * opens a playlist for viewing.
         * @param {Number} id
         */
        view(id) {
            const block = CJ.byDocId(id);
            if (block)
                return block.setState('play');
            CJ.LoadBar.run();
            CJ.Block.load(id, {
                success(response) {
                    const block = Ext.factory(response.ret);    // can be a private block.
                    // can be a private block.
                    if (block.isPlaylist) {
                        block.setIsLoaded(true);
                        block.setState('play');
                    } else {
                        CJ.History.replaceState(CJ.tpl('!{0}', block.getDocId()));
                        CJ.History.onStateChange();
                    }
                },
                callback() {
                    CJ.LoadBar.finish();
                }
            });
        },
        /**
         * @param {Number} id Playlist's docId.
         * @param {Object} config
         * @param {Function} config.success
         * @param {Function} config.failure
         * @param {Object} config.scope
         * @return {Object} request
         */
        loadAnswers(id, config) {
            return CJ.request(Ext.apply({
                rpc: {
                    model: 'Playlist',
                    method: 'load_answer_stats',
                    id
                },
                params: { currentUser: true }
            }, config));
        },
        /**
         * @param {Number} id Playlist's docId.
         * @param {Object} config
         * @param {Function} config.success
         * @param {Function} config.failure
         * @param {Object} config.scope
         * @return {Object} request
         */
        deleteAnswers(id, config) {
            return CJ.request(Ext.apply({
                rpc: {
                    model: 'Playlist',
                    method: 'delete_all_user_answers',
                    id
                }
            }, config));
        },
        /**
         * shows playlist's scoreboard
         * @param {Number} id
         */
        scoreboard(id) {
            CJ.LoadBar.run();
            CJ.Block.load(id, {
                success(response) {
                    CJ.PlaylistScoreboard.popup({ block: Ext.factory(response.ret) });
                },
                callback() {
                    CJ.LoadBar.finish();
                }
            });
        }
    },
    config: {
        cls: 'd-cover-block d-playlist-block',
        tpl: Ext.create('Ext.XTemplate', '<div class="d-cover {[ CJ.Utils.getBackgroundCls(values) ]}" data-playlist>', '<div class="d-block-type-icon"></div>', '<div class="d-title">', '<span>{title}</span>', '</div>', '<tpl if="description">', '<div class="d-info-button">', '<span>{[ CJ.t("more-info") ]}</span>', '</div>', '</tpl>', '<tpl if="showCompleteness">', '<div class="d-completeness-container">', '{[ CJ.Utils.completeness(values.completeness) ]}', '</div>', '</tpl>', '</div>'),
        icon: null,
        iconCfg: null,
        backgroundHsl: true,
        backgroundMocksyNumber: true,
        title: null,
        description: null,
        canRetry: true,
        canPay: true,
        passingGrade: null,
        /**
         * @cfg {Object} badge
         */
        badge: null,
        userData: null,
        canShare: true,
        playlist: [],
        data: {},
        isLoaded: false,
        state: null,
        prevState: null,
        stateContainer: null,
        pendingIndex: null,
        /**
         * @cfg {String} originalBlockDocId
         * When playlist is created from default-block, it's docId will be stored here.
         */
        originalBlockDocId: null
    },
    /**
     * @property {Object} tapListeners
     */
    tapListeners: {
        '.d-user-icon, .d-user-name': 'onUserTap',
        '.d-menubutton': 'onMenuButtonTap',
        '.d-permissions-button': 'onPermissionsButtonTap',
        '.d-assign-button': 'onAssignButtonTap',
        '.content-updated-icon': 'onContentUpdatedIconTap',
        '.d-cover': 'onCoverTap'
    },
    updateData(data) {
        let html;
        data = Ext.apply({
            icon: this.getIcon(),
            backgroundHsl: this.getBackgroundHsl(),
            backgroundMocksyNumber: this.getBackgroundMocksyNumber(),
            title: this.getTitle(),
            description: this.getDescription(),
            completeness: this.getCompleteness(),
            showCompleteness: this.getShowCompleteness() && CJ.User.isFGA()
        }, data);    // todo: Ask Ivo to send me correct icon dimension after update
        // todo: Ask Ivo to send me correct icon dimension after update
        if (data.icon)
            data.icon = data.icon.replace('140x140', '600x600');
        html = this.getTpl().apply(data);
        this.innerElement.dom.innerHTML = html;
        this.renderCoverImage(data.icon, data);
    },
    applyBackgroundHsl(config) {
        if (config === true)
            config = CJ.Utils.randomHsl();
        return config;
    },
    applyBackgroundMocksyNumber(config) {
        if (config === true)
            config = CJ.Utils.getRandomNumber(1, 10);
        return config;
    },
    applyPlaylist(config) {
        return config || [];
    },
    /**
     * @return {String}
     */
    getLocalUrl() {
        return CJ.tpl('!p/{0}', this.getDocId());
    },
    getFooterTplData() {
        const values = this.callParent(args);
        return Ext.apply(values, { isOwner: this.getOwnerUser() == CJ.User.get().user });
    },
    applyEditor(editor) {
        if (editor)
            editor.setBlock(this);
        return editor;
    },
    applyItemChanges(index) {
        const playlist = this.getPlaylist(), editor = this.getEditor(), data = editor.serialize(false);
        Ext.merge(playlist[index], data);
    },
    insertItem(index) {
        const playlist = this.getPlaylist();
        const editor = this.getEditor();
        let data = {};
        if (editor)
            data = editor.serialize(false);
        Ext.apply(data, {
            xtype: 'view-block-default-block',
            docId: CJ.Guid.generatePhantomId(),
            userInfo: CJ.User.getInfo(),
            appVer: CJ.constant.appVer,
            nodeCls: 'Document'
        });
        if (Ext.isNumber(index)) {
            playlist.splice(index, 0, data);
        } else {
            playlist.push(data);
        }
    },
    removeItem(index) {
        this.getPlaylist().splice(index, 1);
    },
    getItemData(index) {
        const playlist = this.getPlaylist();
        return playlist[index];
    },
    getLength() {
        return this.getPlaylist().length;
    },
    /**
     * @param {String} mode Should be "local" to return all set of data
     *                      including comments/userInfo etc.., server by default
     * @return {Object}
     */
    serialize(mode undefined 'server') {
        const data = {
            xtype: this.xtype,
            docId: this.getDocId(),
            playlist: this.getPlaylist(),
            iconCfg: this.getIconCfg() || {},
            backgroundHsl: this.getBackgroundHsl(),
            backgroundMocksyNumber: this.getBackgroundMocksyNumber(),
            title: this.getTitle(),
            description: this.getDescription(),
            canRetry: this.getCanRetry(),
            canPay: this.getCanPay(),
            passingGrade: this.getPassingGrade(),
            badge: this.getBadge(),
            docVisibility: this.getDocVisibility(),
            tags: this.getTags(),
            categories: this.getCategories(),
            appVer: CJ.constant.appVer,
            nodeCls: 'Playlist',
            groups: this.getGroups(),
            licensingOptions: this.getLicensingOptions(),
            licenseInfo: this.getLicenseInfo()
        };    // we don't need to edit playlist-items, if user just changes
              // cover image.
        // we don't need to edit playlist-items, if user just changes
        // cover image.
        if (!this.isPhantom() && !this.getIsLoaded())
            delete data.playlist;
        if (mode == 'server')
            return data;
        Ext.apply(data, {
            userInfo: this.getUserInfo(),
            createdDate: this.getCreatedDate(),
            icon: this.getIcon(),
            comments: this.getComments(),
            reuseInfo: this.getReuseInfo(),
            reusedCount: this.getReuseCount()
        });
        return data;
    },
    save() {
        this.initGroups();
        CJ.StreamHelper.adjustContaining(this);
        this.callParent([{
                rpc: {
                    model: 'Document',
                    method: 'save_documents'
                },
                params: { data: [this.serialize()] }
            }]);
    },
    onSaveSuccess(response) {
        if (this.isPhantom())
            this.onBlockCreated();
        else
            this.onBlockUpdated();
        this.reinit(response.ret.saved[this.getDocId()]);
        this.fireEvent('aftersave', this);
    },
    /**
     * @return {undefined}
     */
    onBlockCreated() {
        this.callParent(args);
        const block = CJ.StreamHelper.byDocId(this.getOriginalBlockDocId());
        if (!block)
            return;
        block.setTags([]);
        block.save();
    },
    requestPlaylist(callback, scope) {
        if (this.isPhantom())
            return;
        CJ.LoadBar.run();
        CJ.request({
            method: 'GET',
            rpc: {
                model: 'Document',
                method: 'load_document'
            },
            params: { id: this.getDocId() },
            stash: {
                callback,
                scope
            },
            success: this.onPlaylistLoadSuccess,
            callback: this.onPlaylistLoadCallback,
            scope: this
        });
    },
    onPlaylistLoadSuccess(response, request) {
        const callback = request.stash.callback, scope = request.stash.scope, data = response.ret.playlist, userData = response.ret.userData;    // uses when resetChanges
        // uses when resetChanges
        this.initialConfig.playlist = Ext.clone(data);
        this.setUserData(userData);
        this.setPlaylist(data);
        this.setIsLoaded(true);
        if (Ext.isFunction(callback))
            callback.call(scope || this, true);
    },
    /**
     * @return {undefined}
     */
    onPlaylistLoadCallback() {
        CJ.LoadBar.finish();
    },
    updateState(state, current) {
        if (state == null)
            this.setIsLoaded(false);
        const stateContainer = this.getStateContainer();
        if (current && stateContainer)
            stateContainer.hide(300);
        if (!state)
            return this.setStateContainer(null);
        const stateHandlerName = CJ.tpl('to{0}State', CJ.capitalize(state)), stateHandler = this[stateHandlerName];
        this.setPrevState(current);
        Ext.callback(stateHandler, this);
    },
    updateStateContainer(container) {
        if (!container)
            return;
        const state = this.getState(), handler = CJ.tpl('from{0}State', CJ.capitalize(state));
        if (!Ext.isFunction(this[handler]))
            return;
        container.on({
            hide: this[handler],
            scope: this,
            single: true
        });
    },
    toPlayState: function self() {
        if (!this.getIsLoaded())
            return this.requestPlaylist(self);
        if (Ext.isEmpty(this.getPlaylist()))
            return this.showIsEmpty();
        const popup = Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-playlist-play-popup',
            fitMode: true,
            title: this.getTitle(),
            isHistoryMember: true,
            content: {
                xtype: 'view-playlist-play-container',
                examMode: this.isExamMode(),
                block: this
            }
        });
        this.setStateContainer(popup);
    },
    fromPlayState() {
        if (this.getState() != 'play')
            return;
        this.setState(null);
        CJ.fire('block.completeness.change', this);
    },
    toEditState: function self() {
        if (this.getEditor())
            return;
        if (!(this.isPhantom() || this.getIsLoaded()))
            return this.requestPlaylist(self);
        window.onbeforeunload = null;
        this.fireEvent('toeditstate', this);
        const index = this.getPendingIndex();
        const popup = Ext.factory({
            xtype: 'view-block-edit-defaults-popup',
            block: this,
            activeItemIndex: Ext.isNumber(index) ? index : false
        });
        this.setEditor(popup.getContent());
        this.setStateContainer(popup);
        this.setPendingIndex(null);
    },
    fromEditState() {
        const newState = this.getState();
        if (newState == 'edit')
            this.setState(null);
        this.setEditor(null);
    },
    toReviewState: function self() {
        if (!(this.isPhantom() || this.getIsLoaded()))
            return this.requestPlaylist(self);
        this.fireEvent('toreviewstate', this);
        window.onbeforeunload = null;
        const popup = Ext.factory({
            xtype: 'core-view-popup',
            title: 'playlist-review-popup-title',
            cls: 'd-playlist-review-popup',
            fitMode: true,
            actionButton: { text: 'playlist-review-popup-action-button-text' },
            closeConfirm: {
                title: 'nav-popup-block-close-title',
                message: 'nav-popup-block-close-message'
            },
            content: {
                xtype: 'view-playlist-review-container',
                block: this
            }
        });
        this.setStateContainer(popup);
    },
    fromReviewState() {
        if (this.getState() == 'review')
            this.setState(null);
    },
    resetChanges() {
        const editor = this.getEditor();
        if (editor)
            editor.resetPlaylist();
        else
            this.setPlaylist(this.initialConfig.playlist);
        const prevState = this.getPrevState(), isPhantom = this.isPhantom();
        this.setState(prevState || !isPhantom ? 'review' : null);
    },
    showOptions() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-popup-options-title',
            cls: 'd-menu-popup',
            layout: 'light',
            content: {
                xtype: 'view-playlist-options',
                block: this
            }
        });
    },
    onContentUpdatedIconTap(e) {
        e.stopEvent();
        Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-menu-popup',
            title: 'block-popup-reuse-updated-title',
            description: CJ.app.t('block-popup-reuse-updated-description'),
            content: {
                block: this,
                xtype: 'view-reuse-updated-options'
            }
        });
    },
    showIsEmpty() {
        // yes, it's historyMember, because if this alert is visible
        // the url had been changed.
        Ext.Msg.isHistoryMember = true;
        CJ.alert('view-playlist-empty-message-title', 'view-playlist-empty-message-text', function () {
            this.fromPlayState();
            Ext.Msg.isHistoryMember = false;
        }, this);
    },
    /**
     * method simply syncs #playlist[index] property with data that we have in
     * block.
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    updateItem(block) {
        const index = block.getParent().indexOf(block);
        this.getPlaylist()[index] = block.serialize();
    },
    /**
     * @return {undefined}
     */
    publish(options) {
        if (this.fireEvent('beforepublish', this) === false)
            return;
        options = Ext.apply({
            type: 'playlist',
            block: this,
            tags: this.getTags(),
            staticTags: [CJ.User.get('user')],
            categories: this.getCategories(),
            docVisibility: this.getDocVisibility(),
            title: this.getTitle(),
            description: this.getDescription(),
            iconCfg: this.getIconCfg(),
            badge: this.getBadge(),
            passingGrade: this.getPassingGrade(),
            licensingOptions: this.getLicensingOptions(),
            listeners: {
                scope: this,
                complete: this.doPublish
            }
        }, options);
        CJ.PublishCarousel.popup(options);
    },
    /**
     * @param {Object} values
     * @param {CJ.view.publish.Carousel} component
     * @return {undefined}
     */
    doPublish(values, component) {
        const iconCfg = values.iconCfg, docVisibility = values.docVisibility;
        delete values.docVisibility;
        Ext.apply(values, { data: {} });
        if (iconCfg)
            this.setIcon(iconCfg.preview);
        this.setConfig(values);
        this.saveWithVisibility(docVisibility);
        this.setState(null);
    },
    /**
     * @return {Boolean}
     */
    isExamMode() {
        const hasQuestions = Ext.Array.some(this.getPlaylist(), block => {
            if (block.question)
                return true;
        });
        return hasQuestions && this.getPassingGrade() > 0;
    },
    /**
     * @return {Boolean}
     */
    hasBadge() {
        const badge = this.getBadge();
        return badge && !Ext.isEmpty(badge.name);
    },
    /**
     * simply resets #badge-property to empty values.
     * @return {undefined}
     */
    resetBadge() {
        this.setBadge({
            name: '',
            description: '',
            iconCfg: ''
        });
    }
});