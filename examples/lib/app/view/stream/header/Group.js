import 'app/view/stream/header/Base';
import 'app/view/group/Members';

/**
 * The class provides component for group feed header.
 */
Ext.define('CJ.view.stream.header.Group', {
    extend: 'CJ.view.stream.header.Base',
    xtype: 'view-stream-header-group',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-header-block d-group',
        /**
         * @cfg {Object} userInfo
         */
        userInfo: null,
        /**
         * @cfg {Number} docId
         */
        docId: null,
        /**
         * @cfg {String} hashId
         */
        hashId: null,
        /**
         * @cfg {String} name
         */
        name: null,
        /**
         * @cfg {Boolean} isOwner
         */
        isOwner: null,
        /**
         * @cfg {Boolean} isMember
         */
        isMember: null,
        /**
         * @cfg {Boolean} isPending
         */
        isPending: null,
        /**
         * @cfg {Boolean} isPublic
         */
        isPublic: null,
        /**
         * @cfg {Boolean} postingAllowed
         */
        postingAllowed: null,
        /**
         * @cfg {String|Number} icon
         */
        icon: null,
        /**
         * @cfg {Object} iconCfg
         */
        iconCfg: null,
        /**
         * @cfg {String|Array} notice
         */
        notice: null,
        /**
         * @inheritdoc
         * @TODO
         */
        tabs: [
            {
                key: 'a',
                text: 'block-header-tab-activities'
            },
            {
                key: 'c',
                text: 'block-header-tab-courses'
            },
            {
                key: 'm',
                text: 'block-header-tab-members'
            }
        ],
        /**
         * @inheritdoc
         */
        showOptions: true,
        /**
         * @inheritdoc
         */
        routeKey: 'g',
        /**
         * @inheritdoc
         */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-image"></div>', '<tpl if="canEdit">', '<div class="d-change-image-button">', '{[CJ.t("block-header-button-change-image")]}', '<input type="file" class="invisible-stretch" />', '</div>', '</tpl>', '<div class="d-title">{name}</div>', '{stats}', '<div class="d-action-button"></div>', '<div class="d-fields">', '<div class="d-description"></div>', '<div class="d-buttons">', '<span class="d-cancel">{[CJ.t("block-header-button-cancel")]}</span>', '<span class="d-save">{[CJ.t("block-header-button-save")]}</span>', '</div>', '</div>', '{tabs}', '{notice}', { compiled: true }),
        /**
         * @cfg {Ext.Template} noticeTpl
         */
        noticeTpl: Ext.create('Ext.Template', '<div class="d-notice">', '<div class="d-notice-inner">', '<div class="d-title">{title}</div>', '<div class="d-message">{message}</div>', '</div>', '</div>', { compiled: true }),
        tapListeners: { '.d-notice .d-button': 'onNoticeTap' }
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        this.configureActionButton();
        if (CJ.app.AUTO_OPEN_MEMBERS)
            this.openMembersPopup();
    },
    /**
     * @inheritdoc
     */
    applyData() {
        this.getIsOwner();
        return this.callParent([{
                name: this.getName(),
                notice: this.generateNotice()
            }]);
    },
    /**
     * Generates notice HTML
     * @returns {String}
     */
    generateNotice() {
        const notice = Ext.clone(this.getNotice());
        let html = '';
        if (notice)
            html = this.getNoticeTpl().apply(notice);
        return html;
    },
    /**
     * Sets can edit.
     * @param {Boolean} isOwner
     */
    updateIsOwner(isOwner) {
        this.setCanEdit(isOwner);
    },
    /**
     * Updates name in the DOM, when it's updated.
     * @param name
     */
    updateName(name) {
        if (!this.initialized)
            return;
        this.element.dom.querySelector('.d-title').innerHTML = name;
    },
    /**
     * Sets background image.
     * @param {String} icon
     */
    updateIcon(icon) {
        this.setImage(icon);
    },
    /**
     * Sets background color if it's number, image otherwise.
     * @param {String} image
     */
    updateImage(image) {
        if (!image)
            return;
        if (!Ext.isNumber(+image))
            return this.callParent(args);
        const el = this.element.dom.querySelector('.d-image');
        el.classList.add('shown');
        el.style.backgroundColor = CJ.tpl('hsla({0}, 50%, 50%, 1)', image);
    },
    /**
     * Runs buttons configuration.
     */
    updateIsMember() {
        if (this.initialized)
            this.configureActionButton();
    },
    /**
     * Runs buttons configuration.
     */
    updateIsPending() {
        if (this.initialized)
            this.configureActionButton();
    },
    /**
     * Handler of successfully response,
     * generate icon config, sets and updates this.
     * @param {Object} response
     */
    onUploadImageSuccess(response) {
        let cdnUrl = response.cdnUrl, iconCfg;
        if (Core.opts.uploadcare.replace_cdn_netloc)
            cdnUrl = Core.opts.uploadcare.cdn_netloc;
        iconCfg = {
            preview: [
                'https:/',
                cdnUrl,
                response.uuid,
                '-/preview',
                '140x140',
                'preview'
            ].join('/'),
            original: [
                'https:/',
                cdnUrl,
                response.uuid,
                encodeURIComponent(response.name)
            ].join('/')
        };
        this.element.dom.querySelector('.d-change-image-button').classList.remove('loading');
        this.setIconCfg(iconCfg);
        this.setIcon(iconCfg.original);
        this.updateGroup({ iconCfg });
    },
    /**
     * Handler of the event 'tap' of the notice button.
     * Shows login popup.
     * @param {Ext.event.Event} e
     */
    onNoticeTap(e) {
        e.stopEvent();
        CJ.view.login.Login.popup();
    },
    /**
     * Runs workflow, depends on group state.
     * @param {Ext.event.Event} e
     */
    onActionButtonTap(e) {
        e.stopEvent();
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        if (this.getIsOwner())
            this.openSharePopup();
        else
            this.handleJoining();
    },
    /**
     * Handler of the event 'tap' of the save button.
     * Updates group's data.
     * @param {Ext.event.Event} e
     */
    onSaveButtonTap(e) {
        this.callParent(args);
        this.updateGroup({ description: this.getDescription().getValue(true) });
    },
    /**
     * Handler of the event 'tap' of the cancel button.
     * Resets changes of fields.
     * @param {Ext.event.Event} e
     */
    onCancelButtonTap(e) {
        this.callParent(args);
        this.getDescription().reset(true);
    },
    /**
     * Handler of the event 'tap' of the option button.
     * Shows editing if owner, options otherwise.
     * @param {Ext.event.Event} e
     */
    onOptionsTap(e) {
        e.stopEvent();
        if (this.getIsOwner())
            Ext.factory({
                cls: 'd-popup-transparent',
                xtype: 'core-view-popup',
                title: 'view-group-block-edit-popup-title',
                content: {
                    xtype: 'view-group-edit-form',
                    values: {
                        name: this.getName(),
                        isPublic: this.getIsPublic(),
                        postingAllowed: this.getPostingAllowed()
                    }
                },
                actionButton: { text: 'view-group-block-edit-popup-button-title' },
                listeners: {
                    actionbuttontap: this.onSubmitOption,
                    scope: this
                }
            });
        else
            CJ.view.group.Options.popup({ block: this });
    },
    onTabTap(e) {
        e.stopEvent();
        if (e.getTarget('li').getAttribute('data-key') == 'm')
            this.openMembersPopup();
        else
            this.callParent(args);
    },
    /**
     * Updates of group's data.
     * @param {CJ.core.view.Popup} popup
     * @returns {boolean}
     */
    onSubmitOption(popup) {
        const form = popup.getContent();
        let values;
        if (!form.validate())
            return false;
        form.applyChanges();
        values = form.getValues();
        this.updateGroup({
            name: Ext.String.trim(values.name),
            isPublic: values.isPublic,
            postingAllowed: values.postingAllowed
        }, this.onGroupInfoUpdate, this);
    },
    /**
     * Handler of successfully update group.
     * @param {Object} data
     */
    onGroupInfoUpdate(data) {
        this.setName(data.name);
        this.setIsPublic(data.isPublic);
        this.setPostingAllowed(data.postingAllowed);
    },
    openSharePopup() {
        CJ.view.group.Share.popup({
            block: this,
            inviteButton: false
        });
    },
    /**
     * Opens member popup
     */
    openMembersPopup() {
        if (CJ.app.AUTO_OPEN_MEMBERS)
            CJ.app.AUTO_OPEN_MEMBERS = false;
        CJ.view.group.Members.popup({
            block: this,
            groupId: this.getDocId()
        });
    },
    /**
     * Runs workflow depending on state.
     */
    handleJoining() {
        if (this.getIsPending())
            return;    // already requested an access
        // already requested an access
        if (this.hasAccess()) {
            const isMember = this.getIsMember();
            CJ.Group[isMember ? 'leave' : 'join'](this.getDocId(), {
                scope: this,
                success: this.onJoinStateSaveSuccess
            });
        } else {
            CJ.view.group.RequestAccess.popup({
                block: this,
                listeners: {
                    scope: this,
                    success: this.onRequestAccessSuccess
                }
            });
        }
    },
    /**
     * Handler of successfully response of join/leave request.
     * @param {Object} response
     */
    onJoinStateSaveSuccess(response) {
        // user can switch to another tab during ajax-request
        if (!this.isDestroyed) {
            const isMember = this.getIsMember();
            this.setIsMember(!isMember);
            this.updateStat('members', response.ret.members);
        }
        CJ.app.fireEvent('group.followingchange', {
            name: `+${ this.getHashId() }`,
            title: this.getName(),
            icon: this.getIcon(),
            followed: this.getIsMember()
        });
    },
    /**
     * Handler of successfully request to access.
     * Update pending state.
     */
    onRequestAccessSuccess() {
        this.setIsPending(true);
    },
    /**
     * @inheritdoc
     */
    getLocalUrl() {
        return CJ.tpl('!g/+{0}', this.getHashId());
    },
    /**
     * Configures of the action button text.
     */
    configureActionButton() {
        let text = 'block-header-button-';
        if (this.getIsOwner())
            text += 'invite-members';
        else if (this.getIsPending())
            text += 'pending';
        else
            text += this.getIsMember() ? 'leave' : 'join';
        this.element.dom.querySelector('.d-action-button').innerHTML = CJ.t(text);
        this.configureAddBlockButton();
    },
    /**
     * Configures of the add button.
     */
    configureAddBlockButton() {
        const buttons = Ext.Viewport.buttons;
        if (this.canPost()) {
            buttons.show();
            buttons.setButtons({
                activity: true,
                course: true,
                map: true
            });
        } else
            buttons.hide();
    },
    /**
     * Return true in case when an user can post.
     * @returns {Boolean}
     */
    canPost() {
        let canPost = this.getIsOwner() || this.getIsMember() && this.getPostingAllowed();
        const searchTags = Ext.Viewport.getSearchBar().getTags();
        const hasUserTag = searchTags.indexOf('@') != -1;
        if (hasUserTag && canPost)
            canPost = CJ.User.isMineTags(searchTags.split(' ').slice(1).join(' '));
        return canPost;
    },
    /**
     * Return true in case when an user has access.
     *  @returns {Boolean}
     */
    hasAccess() {
        return this.getIsPublic() || this.getIsMember() || this.getIsOwner();
    },
    /**
     * Updates group.
     * @param {Object} data
     * @param {Function} [callback]
     * @param {Object} [scope]
     */
    updateGroup(data, callback, scope) {
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'save_documents'
            },
            params: { data: [Ext.apply(data, { docId: this.getDocId() })] },
            success(response) {
                const data = response.ret.saved[this.getDocId()];
                Ext.callback(callback, scope, [data]);
                CJ.fire('group.update', data);
            },
            scope: this
        });
    },
    /**
     * @return {String} full url to current group.
     */
    getUrl() {
        return CJ.view.group.Block.prototype.getUrl.call(this);
    },
    destroy() {
        CJ.StreamHelper.setGroup(null);
        this.callParent(args);
    }
});