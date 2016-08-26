import 'app/core/view/popup/Options';
import 'app/view/block/Permissions';
import 'app/view/course/add/View';

/**
 * Base class for all block's options popups that have edit/delete/permissions
 * buttons
 */
Ext.define('CJ.view.block.options.Base', {
    extend: 'CJ.core.view.popup.Options',
    alias: 'widget.view-block-options-base',
    config: {
        /**
         * @cfg {Ext.Button} editButton
         */
        editButton: true,
        /**
         * @cfg {Ext.Button} deleteButton
         */
        deleteButton: true,
        /**
         * @cfg {Ext.Button} permissionsButton
         */
        permissionsButton: true,
        /**
         * @cfg {Ext.Button} linkButton
         */
        linkButton: true,
        /**
         * @cfg {Object|Boolean} addToCourseButton
         */
        addToCourseButton: false,
        /**
         * @cfg {Object|Boolean} saveToMyFeedButton
         */
        saveToMyFeedButton: false,
        /**
         * @cfg {String} deleteConfirmationText
         */
        deleteConfirmationText: 'block-popup-options-confirmtext',
        /**
         * @cfg {Object|Boolean} pinToPortalButton
         */
        pinToPortalButton: false,
        /**
         * @cfg {Object|Boolean} unpinFromPortalButton
         */
        unpinFromPortalButton: false,
        /**
         * @cfg {Object} scrollable
         */
        scrollable: CJ.Utils.getScrollable()
    },
    /**
     * @param {Object} config
     */
    applyEditButton(config) {
        if (!config)
            return false;
        const block = this.getBlock();
        let text;
        if (block.isReusable && block.isReused()) {
            if (block.hasQuestion())
                text = 'view-block-popup-options-edit-question';
            return false;
        } else {
            if (!CJ.User.isMine(block))
                return false;
            text = 'block-popup-options-edit';
        }
        if (config == true)
            config = {};
        return this.createButton(Ext.applyIf(config, {
            text,
            cls: 'd-button d-icon-edit',
            handler: this.onEditButtonTapped
        }));
    },
    onEditButtonTapped() {
        this.getBlock().setEditing(true);
    },
    /**
     * @param {Object} config
     */
    applyDeleteButton(config) {
        if (!config)
            return false;
        if (!CJ.User.isMine(this.getBlock()))
            return false;
        return this.createButton(Ext.apply({
            text: 'block-popup-options-delete',
            cls: 'd-button d-icon-delete',
            handler: this.onDeleteButtonTap
        }, config));
    },
    /**
     * method will be called when user taps on delete-button
     */
    onDeleteButtonTap() {
        const text = this.getDeleteConfirmationText(), title = 'block-popup-options-confirm-title';
        CJ.confirm(title, text, this.deleteBlock, this);
    },
    /**
     * makes an ajax request to remove the block
     * @param {String} confirm [yes, no]
     * @return {undefined}
     */
    deleteBlock(confirm) {
        if (confirm != 'yes')
            return;
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'soft_delete',
                id: this.getBlock().getDocId()
            },
            scope: this,
            success: this.onDeleteBlockSuccess
        });
    },
    /**
     * will be called after block has been successfully deleted on the server.
     */
    onDeleteBlockSuccess() {
        const block = this.getBlock(), parent = block.getParent();
        if (block.getIsModal()) {
            CJ.StreamHelper.removeBlockById(block.getDocId());
            block.getPopup().hide();
            return;
        }
        if (!parent)
            return block.destroy();
        if (parent.isPlaylistCarousel)
            parent.fireEvent('removeitem', parent, block);
        else
            parent.removeListItem(block);
    },
    /**
     * @param {Object} config
     */
    applyPermissionsButton(config) {
        if (!config)
            return false;
        if (!CJ.User.isMine(this.getBlock()))
            return false;
        if (config == true)
            config = {};
        return this.createButton(Ext.applyIf(config, {
            text: 'block-popup-options-permissions',
            cls: 'd-button d-icon-settings',
            handler: this.onPermissionsButtonTapped
        }));
    },
    /**
     * renders permissions-popup.
     */
    onPermissionsButtonTapped() {
        this.getBlock().showPermissions();
    },
    applyLinkButton(config) {
        if (!config)
            return false;
        const block = this.getBlock();
        let link = block.getUrl();
        const button = this.createButton(Ext.apply({
            text: 'view-block-popup-options-link',
            cls: 'd-button d-icon-link'
        }, config));    // only content blocks can be purchased.
        // only content blocks can be purchased.
        if (block.isBlock && block.isPaid()) {
            link = CJ.view.purchase.LicensedBlock.prototype.getLocalUrl.call(block);
            link = CJ.Utils.makeUrl(link);
        }
        CJ.Clipboard.copy({
            cmp: this,
            delegate: '.d-icon-link',
            text: link
        });
        return button;
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applySaveToMyFeedButton(config) {
        if (!config)
            return false;
        const block = this.getBlock(), isMine = CJ.User.isMine(block, true), hasTags = block.hasTags(), visible = !isMine || isMine && !hasTags;
        if (!visible)
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-popup-options-save-to-my-feed',
            cls: 'd-button d-icon-save-to-my-feed',
            handler: this.onSaveToMyFeedButtonTap,
            disabled: !CJ.User.isLogged()
        }, config));
    },
    /**
     * @param {Ext.Button}
     */
    onSaveToMyFeedButtonTap() {
        const tags = [CJ.User.get('user')];
        this.getBlock().assign(null, tags, {
            scope: this,
            success: this.onSaveToMyFeedSuccess
        });
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onSaveToMyFeedSuccess() {
        const url = CJ.Utils.tagsToPath(CJ.User.get('user'));
        CJ.feedback({
            message: CJ.t('view-block-options-base-save-to-my-feed-success'),
            duration: 5000,
            tap(e) {
                if (e.getTarget('.d-button'))
                    CJ.app.redirectTo(url);
            }
        });
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyAddToCourseButton(config) {
        if (!config)
            return false;
        this.getAddToPlaylistButton();
        return this.createButton(Ext.apply({
            text: 'view-block-options-add-to-course',
            cls: 'd-button d-icon-add-to-course',
            handler: this.onAddToCourseButtonTap,
            disabled: !CJ.User.isLogged()
        }, config));
    },
    /**
     * @return {undefined}
     */
    onAddToCourseButtonTap() {
        const block = this.getBlock();
        CJ.AddToCourse.popup({
            block,
            listeners: {
                selected: Ext.bind(this.onCoursesSelected, this),
                created: Ext.bind(this.onCourseCreated, this),
                destroy: this.onCourseSelectDestroy
            }
        });
    },
    /**
     * @param {Ext.Component} component
     * @return {undefined}
     */
    onCourseSelectDestroy(component) {
        delete component.config.listeners.selected;
        delete component.config.listeners.created;
    },
    /**
     * @param {Ext.Component} list
     * @param {Array} ids
     */
    onCoursesSelected(list, ids) {
        this.getBlock().addToCourses(ids);
    },
    /**
     * @param {Ext.Component} list
     * @param {CJ.view.course.block.Block} course
     */
    onCourseCreated(list, course) {
        const id = course.getDocId();
        this.getBlock().addToCourses([id], {
            isNew: true,
            success() {
                course.setEditing(true);
            }
        });
    },
    /**
     * @param {Object|Boolean} config
     * @return {Object}
     */
    applyPinToPortalButton(config) {
        const block = this.getBlock(), isPinned = block.getPinned && block.getPinned();
        if (!(CJ.User.isPortalAdmin() && !isPinned))
            return;
        return this.createButton(Ext.apply({
            text: 'view-block-options-default-pin-to-portal',
            cls: 'd-button d-icon-pin',
            handler: this.onPinToPortalButtonTap
        }, config));
    },
    /**
     * pins block to user's portal.
     * @return {undefined}
     */
    onPinToPortalButtonTap() {
        CJ.request({
            rpc: {
                model: 'Key',
                method: 'pin'
            },
            params: {
                key: CJ.User.getPortalTag(),
                docId: this.getBlock().getDocId()
            },
            scope: this,
            success() {
                CJ.feedback();
            }
        });
    },
    /**
     * @param {Object|Boolean} config
     * @return {Object}
     */
    applyUnpinFromPortalButton(config) {
        const block = this.getBlock(), isPinned = block.getPinned && block.getPinned();
        if (!(CJ.StreamHelper.isMyPortalStream() && isPinned))
            return;
        return this.createButton(Ext.apply({
            text: 'view-block-options-default-unpin-from-portal',
            cls: 'd-button d-icon-unpin',
            handler: this.onUnpinFromPortalButtonTap
        }, config));
    },
    /**
     * unpins block from user's portal.
     * @return {undefined}
     */
    onUnpinFromPortalButtonTap() {
        CJ.request({
            rpc: {
                model: 'Key',
                method: 'unpin'
            },
            params: {
                key: CJ.User.getPortalTag(),
                docId: this.getBlock().getDocId()
            },
            scope: this,
            success: this.onUnpinBlockSuccess
        });
    },
    /**
     * removes block from featured-list.
     */
    onUnpinBlockSuccess() {
        this.getBlock().destroy();
        CJ.feedback();
    }
});