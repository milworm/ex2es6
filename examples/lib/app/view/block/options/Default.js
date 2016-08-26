import 'app/view/block/options/Base';
import 'app/view/playlist/add/Popup';
import 'app/view/block/Assign';

/**
 * Base options class for default, map, playlist, course and group blocks.
 */
Ext.define('CJ.view.block.options.Default', {
    extend: 'CJ.view.block.options.Base',
    alias: 'widget.view-block-options-default',
    config: {
        /**
         * @cfg {Boolean} publishOptions
         */
        publishOptionsButton: true,
        /**
         * @cfg {Object|Boolean} reuseButton
         */
        assignButton: true,
        /**
         * @cfg {Ext.Button} permissionsButton
         */
        permissionsButton: false,
        /**
         * @cfg {Object|Boolean} addToPlaylistButton
         */
        addToPlaylistButton: true,
        /**
         * @cfg {Object|Boolean} addToCourseButton
         */
        addToCourseButton: true,
        /**
         * @cfg {Object|Boolean} saveToMyFeedButton
         */
        saveToMyFeedButton: true,
        /**
         * @cfg {Object|Boolean} pinToPortalButton
         */
        pinToPortalButton: true,
        /**
         * @cfg {Object|Boolean} unpinFromPortalButton
         */
        unpinFromPortalButton: true,
        /**
         * @cfg {Object|Boolean} deleteFromCourseButton
         */
        deleteFromCourseButton: null,
        /**
         * @cfg {Object|Boolean} buyMoreLicensesButton
         */
        buyMoreLicensesButton: null,
        /**
         * @cfg {Ext.Button} viewInvoiceButton
         */
        viewInvoiceButton: true,
        /**
         * @cfg {Ext.Button} assignLicensesButton
         */
        assignLicensesButton: true
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyBuyMoreLicensesButton(config) {
        if (!config)
            return false;
        if (!this.getBlock().isAcquired())
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-popup-options-buy-more',
            cls: 'd-button d-icon-reuse',
            // @TODO
            handler: this.onBuyMoreLicensesButtonTap
        }, config));
    },
    /**
     * @return {undefined}
     */
    onBuyMoreLicensesButtonTap() {
        let block = this.getBlock();
        const data = block.initialConfig;
        data.xtype = 'view-block-licensed-block';
        block = Ext.factory(data);
        block.preview();
        CJ.app.redirectTo(block.getLocalUrl(), true);
    },
    /**
     * @param {Object} config
     */
    applyAssignButton(config) {
        if (!config)
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-popup-options-assign',
            cls: 'd-button d-icon-reuse',
            handler: this.onAssignButtonTap,
            disabled: !CJ.User.isLogged()
        }, config));
    },
    /**
     * Method will be called when user taps on assign-button
     */
    onAssignButtonTap() {
        CJ.view.block.Assign.popup({ block: this.getBlock() });
    },
    /**
     * @param {Object} config
     */
    applyEditButton(config) {
        if (!config)
            return false;
        const block = this.getBlock();
        if (!block.isReused() || !block.hasQuestion())
            return this.callParent(args);
        if (block.isShallowlyReused() || !CJ.User.isMine(block))
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-popup-options-edit-question',
            cls: 'd-button d-icon-popup-edit',
            handler: this.onEditQuestionOptionsButtonTap
        }, config));
    },
    /**
     * @return {undefined}
     */
    updateEditButton() {
        this.getPublishOptionsButton();
    },
    /**
     * shows question's options popup
     */
    onEditQuestionOptionsButtonTap() {
        const question = this.getBlock().getQuestion();
        question.editOptions().on('actionbuttontap', question.saveOptions, question);
    },
    applyAddToPlaylistButton(config) {
        if (!config)
            return false;
        if (this.getBlock().isPlaylist)
            return false;
        if (config == true)
            config = {};
        return this.createButton(Ext.applyIf(config, {
            text: 'view-block-popup-options-add-to-playlist',
            cls: 'd-button d-icon-add-to-playlist',
            handler: this.onAddToPlaylistButtonTapped,
            disabled: !CJ.User.isLogged()
        }));
    },
    onAddToPlaylistButtonTapped() {
        Ext.factory({
            xtype: 'view-playlist-add-popup',
            block: this.getBlock()
        });
    },
    applyViewInvoiceButton(config) {
        if (!config)
            return false;
        if (!this.getBlock().isAcquired())
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-popup-options-view-invoice',
            cls: 'd-button d-icon-invoice',
            handler: this.onViewInvoiceButtonTap
        }, config));
    },
    onViewInvoiceButtonTap() {
        const block = this.getBlock(), licenses = block.getLicenseInfo(), license = licenses[licenses.length - 1];    // last item will be used until further details (directions) about how this is supposed to work.
        // last item will be used until further details (directions) about how this is supposed to work.
        CJ.view.profile.InvoiceList.popup({ content: { providedInvoiceId: license.licenseId } });
    },
    applyAssignLicensesButton(config) {
        if (!config)
            return false;
        if (!this.getBlock().isReused())
            return false;
        return this.applyViewInvoiceButton(Ext.apply({
            text: 'view-block-popup-options-assign-licenses',
            cls: 'd-button d-icon-assign-licenses',
            handler: this.onViewInvoiceButtonTap
        }, config));
    },
    /**
     * @param {Object} config
     */
    applyDeleteButton(config) {
        const block = this.getBlock(), isMine = CJ.User.isMine(block);
        if (!config || block.hasPrice())
            return false;
        if (!(isMine || CJ.User.isGroupOwner()))
            return false;
        this.getDeleteFromCourseButton();
        return this.createButton(Ext.apply({
            text: 'block-popup-options-delete',
            cls: 'd-button d-icon-delete',
            handler: this.onDeleteButtonTap
        }, config));
    },
    /**
     * @return {undefined}
     */
    onDeleteButtonTap() {
        this.getBlock().deleteBlock();
    },
    /**
     * @return {undefined}
     */
    applyDeleteFromCourseButton(config) {
        if (!config)
            return false;
        return this.createButton(Ext.apply({
            text: 'block-popup-options-delete-from-course',
            cls: 'd-button d-icon-remove',
            handler: this.onDeleteFromCourseButtonTap
        }, config));
    },
    /**
     * deletes block from course.
     * @return {undefined}
     */
    onDeleteFromCourseButtonTap() {
        const block = this.getBlock();
        CJ.CourseHelper.getOpenedEditor().deleteBlockFromCourse(block);
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyPublishOptionsButton(config) {
        const block = this.getBlock(), isMine = CJ.User.isMine(block);
        if (!(config && isMine && !block.isShallowlyReused()))
            return;
        return this.createButton(Ext.apply({
            text: 'playlist-popup-options-publish-options',
            cls: 'd-button d-icon-edit',
            handler: this.onPublishOptionsButtonTap
        }, config));
    },
    /**
     * shows a popup to change playlist's title, description and cover image.
     * @return {undefined}
     */
    onPublishOptionsButtonTap() {
        const block = this.getBlock(), options = {};
        if (block.isReused())
            Ext.apply(options, { type: 'reused' });
        block.publish(options);
    }
});