import 'app/view/block/BaseBlock';
import 'app/view/block/edit/defaults/Popup';
import 'app/view/block/edit/defaults/LightPopup';
import 'app/view/block/fullscreen/Popup';
import 'app/view/publish/Carousel';

/**
 * Defines a base class for all blocks that have content, like:
 * DefaultBlock, PlaylistBlock.
 */
Ext.define('CJ.view.block.ContentBlock', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.BaseBlock',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-block-content-block',
    /**
     * @property {Boolean} isContentBlock
     */
    isContentBlock: true,
    /**
     * @property {Object} mixins
     */
    mixins: { reusable: 'CJ.view.mixins.Reusable' },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Array} licenseInfo
         */
        licenseInfo: null,
        /**
         * @cfg {Object} licensingOptions
         */
        licensingOptions: null,
        /**
         * @cfg {Boolean} canDelete
         */
        canDelete: true,
        /**
         * @cfg {Object} reuseInfo
         */
        reuseInfo: null,
        /**
         * @cfg {Object} bottomBar
         */
        bottomBar: {},
        /**
         * @cfg {Boolean} isViewItem
         */
        isViewItem: null,
        /**
         * @cfg {Number} keyboardScrollSpeed
         */
        keyboardScrollSpeed: 20,
        /**
         * @cfg {String | Boolean} keyboardScrollSelector
         */
        keyboardScrollSelector: '.d-body',
        /**
         * @cfg {Ext.XTemplate} headerTpl
         */
        headerTpl: Ext.create('Ext.XTemplate', '<tpl if="values.licensed">', '<tpl if="values.samePortal">', '<a class="d-user-icon d-creator-icon" style=\'background-image: url("{creatorInfo.icon}")\' href="#!u/{creatorInfo.user}" onclick="return false;"></a>', '<tpl if="isReused">', '<a class="d-user-icon" style=\'background-image: url("{userInfo.icon}")\' href="#!u/{userInfo.user}" onclick="return false;"></a>', '</tpl>', '<div class="d-content">', '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">', '{userInfo.name}', '</a>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '</div>', '<tpl elseif="portal">', '<a class="d-user-icon d-creator-icon d-portal-icon" style=\'background-image: url("{portal.icon}")\' href="#!pu/{portal.prefix}@/f" onclick="return false;"></a>', '<tpl if="isReused">', '<a class="d-user-icon" style=\'background-image: url("{userInfo.icon}")\' href="#!u/{userInfo.user}" onclick="return false;"></a>', '<div class="d-content">', '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">', '{userInfo.name}', '</a>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '</div>', '<tpl else>', '<div class="d-content">', '<a class="d-title d-user-name d-portal-name" href="#!pu/{portal.prefix}@/f" onclick="return false;">', '{portal.name}', '</a>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '</div>', '</tpl>', '<tpl else>', '<a class="d-user-icon d-creator-icon" style=\'background-image: url("{creatorInfo.icon}")\' href="#!u/{creatorInfo.user}" onclick="return false;"></a>', '<tpl if="isReused">', '<a class="d-user-icon" style=\'background-image: url("{userInfo.icon}")\' href="#!u/{userInfo.user}" onclick="return false;"></a>', '</tpl>', '<div class="d-content">', '<a class="d-title d-user-name d-creator-icon" href="#!u/{userInfo.user}" onclick="return false;">', '{userInfo.name}', '</a>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '</div>', '</tpl>', '<tpl else>', '<a class="d-user-icon d-creator-icon" style=\'background-image: url("{creatorInfo.icon}")\' href="#!u/{creatorInfo.user}" onclick="return false;"></a>', '<tpl if="isReused">', '<a class="d-user-icon" style=\'background-image: url("{userInfo.icon}")\' href="#!u/{userInfo.user}" onclick="return false;"></a>', '</tpl>', '<div class="d-content">', '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">', '{userInfo.name}', '</a>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '</div>', '</tpl>', '<tpl if="values.scope.getShowContentUpdatedIcon(values)">', '<div class="content-updated-icon"></div>', '</tpl>', '<tpl if="CJ.User.isMine(values.scope)">', '<div class="d-permissions-button d-{docVisibility}"></div>', '</tpl>', '<div class="d-assign-button"></div>', '<div class="d-menubutton {menuButtonCls}"></div>', {
            compiled: true,
            /**
                 * @param {Object} values
                 * @return {String}
                 */
            getOwnerHref(values) {
                return `#!u${ CJ.Utils.urlify('/' + values.scope.getOwnerUser()) }`;
            }
        }),
        /**
         * @cfg {String} deleteConfirmationText
         */
        deleteConfirmationText: 'block-popup-options-confirmtext',
        /**
         * @cfg {Boolean} showCompleteness
         */
        showCompleteness: null
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
        '.d-tool-text a': 'onLinkTap'
    },
    initialize() {
        this.callParent(args);
        if (this.getIsModal())
            Ext.getBody().on({
                keydown: this.onKeyDown,
                scope: this
            });
    },
    onKeyDown(e) {
        const selector = this.getKeyboardScrollSelector();
        let scrollable;
        let scrollSpeed;
        if (selector)
            scrollable = this.element.dom.querySelector(selector);
        else
            scrollable = this.element.dom;
        if (!scrollable)
            return;
        scrollSpeed = this.getKeyboardScrollSpeed();
        if (e.event.keyCode == 38) {
            scrollable.scrollTop -= scrollSpeed;
        }
        if (e.event.keyCode == 40) {
            scrollable.scrollTop += scrollSpeed;
        }
        e.preventDefault();
    },
    /**
     * @param {Object} data
     */
    updateReuseInfo(data) {
        if (!this.initialized)
            return;
        const node = this.element.dom, icon = node.querySelector('.content-updated-icon');
        if (!icon)
            return;
        if (!this.hasPendingChanges())
            icon.style.display = 'none';
    },
    /**
     * @return {Boolean}
     */
    hasPendingChanges() {
        const reuseInfo = this.getReuseInfo();
        if (!reuseInfo)
            return false;
        return reuseInfo.contentUpdated && CJ.User.isMine(this);
    },
    /**
     * @return {String}
     */
    getMenuButtonCls() {
        if (this.getCanDelete())
            return '';
        return 'x-disabled';
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onUserTap(e) {
        CJ.app.redirectTo(e.target.getAttribute('href'));
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onLinkTap(e) {
        window.open(CJ.Utils.toUrl(e.target.getAttribute('href')), '_blank');
    },
    /**
     * will be called when user taps on the content-updated icon
     */
    onContentUpdatedIconTap(e) {
        e.stopEvent();
        Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-menu-popup',
            title: 'block-popup-reuse-updated-title',
            description: CJ.t('block-popup-reuse-updated-description'),
            content: {
                block: this,
                xtype: 'view-reuse-updated-options'
            }
        });
    },
    /**
     * @param {Object} values
     * @return {Boolean} returns true to render content-updated icon
     *                   for reused block.
     */
    getShowContentUpdatedIcon(values) {
        if (!values.reuseInfo)
            return false;
        return values.reuseInfo.contentUpdated && CJ.User.isMine(this);
    },
    /**
     * @param {Object} newBottomBar
     * @param {Object} oldBottomBar
     */
    applyBottomBar(newBottomBar, oldBottomBar) {
        if (oldBottomBar)
            oldBottomBar.destroy();
        if (!newBottomBar)
            return false;
        let xtype = 'view-block-toolbar-multicolumn-bottom-bar';
        if (this.getIsModal())
            xtype = 'view-block-toolbar-light-bottom-bar';
        const config = {
            parent: this,
            block: this,
            xtype,
            comments: this.getCommentsCount(),
            answers: this.getAnswersCount(),
            renderTo: this.footerNode
        };
        return Ext.factory(Ext.applyIf(newBottomBar, config));
    },
    onUserUpdate(data) {
        if (!CJ.User.isMine(this))
            return;
        Ext.TaskQueue.requestWrite(function () {
            let iconEl = this.headerNode.querySelectorAll('.d-user-icon');    // right icon is always a real user icon, so let's take it.
            // right icon is always a real user icon, so let's take it.
            iconEl = iconEl[iconEl.length - 1];
            iconEl.style.backgroundImage = CJ.tpl('url("{0}")', data.icon);
        }, this);
    },
    getHeaderTplData() {
        const values = this.callParent(args);
        let portal = this.getPortal();
        const isReused = this.isReused();
        const reuseInfo = this.getReuseInfo();
        let samePortal;
        if (portal && portal.name != 'Public')
            samePortal = CJ.User.getPortalName() == portal.prefix;
        else
            portal = null;
        return Ext.apply(values, {
            reuseInfo,
            menuButtonCls: this.getMenuButtonCls(),
            licensed: this.hasLicensedVisibility(),
            portal,
            samePortal,
            isReused,
            creatorInfo: isReused ? reuseInfo.userInfo : values.userInfo
        });
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    publish(options) {
        if (this.fireEvent('beforepublish', this) === false)
            return;
        options = Ext.apply({
            block: this,
            tags: this.getTags(),
            staticTags: [CJ.User.get('user')],
            categories: this.getCategories(),
            docVisibility: this.getDocVisibility(),
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
     */
    doPublish(values, component) {
        const docVisibility = values.docVisibility;
        this.setCategories(values.categories);
        this.setTags(values.tags);
        if (values.licensingOptions)
            this.setLicensingOptions(values.licensingOptions);
        this.closeEditor();
        this.saveWithVisibility(docVisibility);
    },
    /**
     * When user edits a block with a reused copy, he must grant us permissions when it's changing from public to
     * private. This method is a temporary solution, because server doesn't support change-docVisibility check.
     *
     * @param {String} docVisibility public, private or portal.
     * @return {undefined}
     */
    saveWithVisibility(docVisibility) {
        if (docVisibility == this.getDocVisibility())
            return this.save();
        if (this.isPhantom()) {
            this.setDocVisibility(docVisibility);
            this.save();
        } else {
            CJ.Ajax.initBatch();
            this.save();
            this.saveDocVisibility(docVisibility);
            CJ.Ajax.runBatch();
        }
    },
    /**
     * @return {undefined}
     */
    closeEditor() {
        const editor = this.getEditor();
        if (editor)
            editor.getPopup().hide();
    },
    /**
     * @return {undefined}
     */
    onBlockCreated() {
        CJ.fire('contentblock.created', this);
    },
    /**
     * @return {undefined}
     */
    onBlockDeleted() {
        CJ.fire('contentblock.deleted', this);
        CJ.StreamHelper.removeBlockById(this.getDocId());
    },
    /**
     * @return {undefined}
     */
    onBlockUpdated() {
        CJ.fire('contentblock.updated', this);
    },
    /**
     * @param {String} answer Empty in order to show confirm, or yes/no
     * @return {undefined}
     */
    deleteBlock(answer) {
        if (!Ext.isString(answer)) {
            const title = 'block-popup-options-confirm-title', text = this.getDeleteConfirmationText();
            return CJ.confirm(title, text, this.deleteBlock, this);
        }
        if (answer == 'no')
            return;    // it's mine block, so let's try to call soft-delete.
        // it's mine block, so let's try to call soft-delete.
        if (CJ.User.isMine(this))
            return this.softDelete();    // it's not mine block, but I could be a group owner, which wants to
                                         // delete posted block.
        // it's not mine block, but I could be a group owner, which wants to
        // delete posted block.
        if (CJ.User.isGroupOwner())
            return this.deleteGroupPost();
    },
    /**
     * softly removes block.
     * @return {undefined}
     */
    softDelete() {
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'soft_delete',
                id: this.getDocId()
            },
            scope: this,
            success: this.onSoftDeleteSuccess
        });
    },
    /**
     * Completely deletes block by passing confirmed-param to soft_delete method
     * @param {String} confirmed
     */
    hardDelete(confirmed) {
        if (confirmed != 'yes')
            return;
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'soft_delete',
                id: this.getDocId()
            },
            params: { confirmed: true },
            scope: this,
            success: this.onDeleteSuccess
        });
    },
    /**
     * deletes block only from group-feed.
     */
    deleteGroupPost() {
        CJ.request({
            rpc: {
                model: 'Group',
                method: 'remove_post',
                id: CJ.StreamHelper.getGroup().docId
            },
            params: { docId: this.getDocId() },
            scope: this,
            success: this.onDeleteGroupPostSuccess
        });
    },
    /**
     * @param {Object} response
     */
    onSoftDeleteSuccess(response) {
        const status = response.ret.status, reasons = response.ret.reasons;
        if (status == 'deleted')
            return this.onDeleteSuccess();
        if (status == 'confirm') {
            const counters = [
                'playlists',
                'courses',
                'maps'
            ];
            const title = 'block-popup-options-confirm-title';
            let message = 'block-popup-options-confirm-reason';
            const reused = counters.reuses;
            for (var i = 0, counter, value; counter = counters[i]; i++) {
                value = reasons[counter];
                if (counter == 0)
                    continue;
                if (counter == 1)
                    message += `-${ counter }-one`;
                else
                    message += `-${ counter }-many`;
                break;
            }
            if (value && reused) {
                message += '-and';
                if (reused == 1)
                    message += '-reused-one';
                else
                    message += '-reused-many';
            }
            message = CJ.t(message, true);
            message = message.replace('{count}', value).replace('{reused}', reused);
            CJ.confirm(title, message, this.hardDelete, this);
        }
    },
    /**
     * will be called after block has been successfully deleted on the server.
     */
    onDeleteSuccess() {
        if (!this.getIsModal())
            return this.onBlockDeleted();
        const popup = this.getPopup(), delay = popup.getHideAnimationTime();
        popup.hide();
        Ext.defer(this.onBlockDeleted, delay, this);    // popup's hide animation.
    },
    /**
     * @return {undefined}
     */
    onDeleteGroupPostSuccess() {
        CJ.app.fireEvent('group.documents.remove');
        this.onDeleteSuccess();
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    reinit(data) {
        if (!this.getIsModal())
            return this.callParent(args);
        const tab = this.getBottomBar().getTab(), popup = this.getPopup();
        this.callParent(args);
        if (!tab)
            return;
        let type = tab.config.type;
        if (type == 'answers' && !data.question)
            type = 'comments';
        if (type == 'comments')
            popup.toCommentsState();
        else
            popup.toAnswersState();
    },
    /**
     * @return {Boolean} True in case when block either fullscreen-block or is a conditional-block in fullscreen-popup.
     */
    inFullscreenPopup() {
        return this.getIsModal() || this.element.dom.parentNode.classList.contains('d-with-conditional-blocks');
    },
    /**
     * makes a request in order to save block's docVisibility, in case when somebody reuses this block, shows
     * confirmation-popup and sends confirmed request when user taps on "Yes"-button.
     * @param {String} visibility
     * @param {Boolean} confirmed
     * @return {undefined}
     */
    saveDocVisibility(visibility, confirmed) {
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'set_visibility',
                id: this.getDocId(),
                args: JSON.stringify([visibility]),
                kwargs: JSON.stringify({ confirmed })
            },
            stash: { visibility },
            success: this.onSaveDocVisibilitySuccess,
            callback: this.onSaveDocVisibilityFailure,
            scope: this
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onSaveDocVisibilitySuccess(response, request) {
        const visibility = request.stash.visibility;
        switch (response.ret.status) {
        case 'changed':
            this.onDocVisibilityChanged(visibility);
            break;
        case 'confirm':
            this.showDocVisibilityChangeConfirm(response.ret.reasons, visibility);
            break;
        }
    },
    /**
     * @return {undefined}
     */
    onSaveDocVisibilityFailure() {
    },
    /**
     * method will be called when nobody reuses a block, so visibility has changed.
     * @param {String} visibility
     * @return {undefined}
     */
    onDocVisibilityChanged(visibility) {
        this.setDocVisibility(visibility);
        CJ.feedback();
    },
    /**
     * method will be called when we tried to save new docVisibility, but somebody reuses this block, so we need to
     * show confirm-message and save it again with confirmed-key.
     * @param {Object} reasons
     * @param {String} visibility
     */
    showDocVisibilityChangeConfirm(reasons, visibility) {
        const title = 'view-block-shareid-confirm-title';
        let text;
        if (reasons.playlists || reasons.courses || reasons.maps) {
            text = CJ.app.t('view-block-shareid-confirm-text-activities');
        } else if (reasons.reuses) {
            text = 'view-block-shareid-confirm-text';
            if (reasons.reuses > 1)
                text += '-pluralize';
            text = CJ.app.t(text, true).replace('{0}', reasons.reuses);
        }
        CJ.confirm(title, text, function (result) {
            if (result != 'yes')
                return;
            this.saveDocVisibility(visibility, true);
        }, this);
    },
    /**
     * @return {Boolean} true in case when current block is located inside of stream-list component.
     */
    isStreamListItem() {
        if (!CJ.Stream)
            return false;
        return !!CJ.Stream.element.down(`#${ this.id }`);
    },
    /**
     * @return {Boolean}
     */
    canChangePermissions() {
        if (this.hasLicensedVisibility())
            return this.hasPrice();
        return true;
    },
    /**
     * @return {Boolean} true if current block was really purchased (not redeemed).
     */
    isAcquired() {
        if (!this.isPaid())
            return false;
        const licenseInfo = this.getLicenseInfo() || [];
        for (let i = 0, license; license = licenseInfo[i]; i++)
            if (license.isPurchaser)
                return true;
        return false;
    },
    /**
     * @return {Boolean} true if block isn't free (price is set).
     */
    hasPrice() {
        return !!(this.getLicensingOptions() || {}).price;
    },
    /**
     * @return {Object}
     */
    getDescriptionComponentConfig() {
        return {
            xtype: 'core-view-component',
            type: 'light',
            cls: 'd-licensed-block-description',
            html: this.getDescription()
        };
    },
    /**
     * @return {undefined}
     */
    onCoverTap(e) {
        if (e && e.getTarget('.d-info-button'))
            return this.onInfoButtonTap(e);
        if (!this.getIsModal())
            return this.fullscreen();
        this.getPopup().hide();
        Ext.defer(this.fullscreen, 500, this);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onInfoButtonTap(e) {
        if (!Ext.os.is.Desktop) {
            Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-licensed-block-description-popup',
                content: this.getDescriptionComponentConfig()
            });
        } else {
            CJ.core.view.Popover.show({
                position: {
                    x: 'right',
                    y: 'top',
                    inside: true
                },
                innerComponent: this.getDescriptionComponentConfig(),
                cls: 'd-licensed-block-description-popover',
                target: e.getTarget('.d-info-button')
            });
        }
    },
    /**
     * opens block in fullscreen mode.
     * @return {undefined}
     */
    fullscreen() {
        CJ.History.keepPopups = true;
        CJ.app.redirectTo(this.getLocalUrl());
    },
    /**
     * preloads an image and renders it.
     * @param {String} src
     * @param {Object} data
     * @param {Object} options
     * @param {Boolean} options.disabled
     * @return {undefined}
     */
    renderCoverImage(src, data undefined {}, options undefined {}) {
        const node = this.element.dom.querySelector('.d-cover');
        if (!src)
            return node.style.cssText = CJ.Utils.getBackground(data, options);
        const image = new Image();
        image.src = src;
        image.onload = () => {
            delete image.onload;
            node.style.cssText = CJ.Utils.getBackground({ icon: src }, options);
        };
    },
    /**
     * @return {String} the name of a portal where this block was created.
     */
    getPortal() {
        let userInfo = this.getUserInfo();
        if (this.isReused())
            userInfo = this.config.reuseInfo.userInfo;
        return userInfo.portal || {};
    },
    /**
     * requests a completeness and refreshes block's info.
     * @param {CJ.view.block.ContentBlock} block
     * @return {undefined}
     */
    requestCompleteness(config) {
        CJ.Block.requestCompleteness(this, config);
    }
});