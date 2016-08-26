import 'app/view/block/DefaultBlock';

Ext.define('CJ.view.purchase.PreviewBlock', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.DefaultBlock',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-preview-block',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-preview-block d-vbox',
        /**
         * @inheritdoc
         */
        headerTpl: Ext.create('Ext.Template', '<div class=\'d-user-icon\' style=\'background-image: url("{icon}")\'></div>', '<div class=\'d-user-name\'>{name}</div>', '<div class=\'d-bullet\'>&bull;</div>', '<div class=\'d-count\'>{count} {activityCountTitle}</div>', { compiled: true }),
        /**
         * @inheritdoc
         */
        footerTpl: Ext.create('Ext.XTemplate', '<tpl if=\'canBuy\'>', '<div class=\'d-button d-buy-button\'>{buy} ${price}</div>', '<tpl else>', '<div class=\'d-button d-redeem-button\'>{redeem}</div>', '</tpl>'),
        /**
         * @inheritdoc
         */
        bottomBar: null,
        /**
         * @cfg {Object} licensedContainer
         * Information about's licensedContainer (playlist,map,course)
         */
        licensedContainer: null,
        /**
         * @cfg {Number} count
         * Number of items in licensed-container.
         */
        count: 0,
        /**
         * @cfg {Number} intervalId
         * Contains an intervalId that is used to close current popup and replace it with purchased content, in case
         * when user purchased a license and curren popup is the active one.
         */
        intervalId: null
    },
    /**
     * @property {Object} tapListeners
     */
    tapListeners: {
        '.d-redeem-button': 'redeem',
        '.d-buy-button': 'buy',
        '.d-tool-text a': 'onLinkTap'
    },
    constructor() {
        this.callParent(args);
        if (CJ.vars.DO_BUY)
            this.buy();
        if (CJ.vars.DO_REDEEM)
            this.redeem();
        delete CJ.vars.DO_REDEEM;
        delete CJ.vars.DO_BUY;
    },
    /**
     * @return {undefined}
     */
    closePopupIfNeeded() {
        if (!CJ.License.getLicense())
            return;    // user didn't buy anything.
        // user didn't buy anything.
        if (CJ.PopupManager.getActive() != this.getPopup())
            return;    // we still have some popup on top.
        // we still have some popup on top.
        this.showAcquiredBlock();
    },
    /**
     * @inheritdoc
     */
    updateHeaderTpl() {
        if (!this.getLicensedContainer())
            return;
        return this.callParent(args);
    },
    /**
     * @inheritdoc
     */
    getHeaderTplData() {
        const config = this.getLicensedContainer(), userInfo = config.getUserInfo(), count = this.getCount(), activityCountTitle = 'view-purchase-preview-block-count';
        return {
            count,
            icon: userInfo.icon,
            name: userInfo.name,
            activityCountTitle: CJ.t(activityCountTitle + (count != 1 ? '-many' : ''))
        };
    },
    /**
     * @inheritdoc
     */
    updateFooterTpl() {
        // do not show buy/redeem button for mine blocks.
        if (CJ.User.isMine(this, true))
            return;
        return this.callParent(args);
    },
    /**
     * @return {Object}
     */
    getFooterTplData() {
        const licensedContainer = this.getLicensedContainer();
        const licensingOptions = licensedContainer.getLicensingOptions();
        let price = licensingOptions.price;
        if (licensingOptions.bundled)
            price = licensingOptions.bundlePrice;
        return {
            canBuy: !licensedContainer.hasPin(),
            buy: CJ.t('view-purchase-preview-block-buy'),
            price,
            redeem: CJ.t('view-purchase-preview-block-redeem')
        };
    },
    /**
     * @param {CJ.view.block.BaseBlock} component
     * @return {undefined}
     */
    updateLicensedContainer(component) {
        let count = 0;
        switch (component.getNodeCls().toLowerCase()) {
        case 'playlist':
            count = component.initialConfig.playlistLength;
            break;
        case 'course':
            count = component.initialConfig.blocksLength;
            break;
        case 'map':
            count = 0;
            break;
        }
        this.setCount(count);
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                { classList: ['d-header'] },
                {
                    reference: 'innerElement',
                    classList: [
                        'x-inner',
                        'd-body',
                        'd-block-body'
                    ]
                },
                { classList: ['d-footer'] }
            ]
        };
    },
    /**
     * @inheritdoc
     */
    publish() {
        this.closeEditor();
        this.save();
    },
    /**
     * @inheritdoc
     */
    save() {
        this.applyChanges();
        this.setSaving(true);
        CJ.Block.prototype.save.call(this, {
            rpc: {
                model: 'Document',
                method: 'save_documents'
            },
            params: { data: [this.serialize()] }
        });
    },
    /**
     * @inheritdoc
     */
    onBlockCreated() {
        CJ.feedback(CJ.t('activity-created'));
    },
    /**
     * @return {undefined}
     */
    toEditState() {
        if (this.getEditor())
            return;
        const list = this.getList().serialize();
        const activityTitle = this.getActivityTitle();
        let popup;
        this.setActivityTitle(null);
        popup = Ext.factory({
            xtype: 'view-block-edit-defaults-light-popup',
            title: CJ.t('nav-popup-block-title'),
            block: this,
            content: {
                xtype: 'view-block-edit-defaults-editor',
                block: this,
                activityTitle,
                list,
                editing: true
            }
        });
        this.setEditor(popup.getContent());
    },
    /**
     * shows preview-block in fullscreen-popup.
     * @param {Object} config
     * @return {undefined}
     */
    popup(config) {
        this.setIntervalId(setInterval(this.closePopupIfNeeded.bind(this), 1000));
        return Ext.factory(Ext.apply({
            cls: 'd-preview-popup d-popup-transparent',
            xtype: 'core-view-popup',
            content: this,
            fitMode: true,
            isHistoryMember: true,
            title: this.getLicensedContainer().getTitle()
        }, config));
    },
    /**
     * starts buying process.
     * @return {undefined}
     */
    buy() {
        this.getLicensedContainer().buy();
        if (!CJ.User.isLogged())
            CJ.vars.DO_BUY = true;
    },
    /**
     * @return {undefined}
     */
    redeem() {
        this.getLicensedContainer().redeem({
            scope: this,
            success: this.onRedeemSuccess
        });
        if (!CJ.User.isLogged())
            CJ.vars.DO_REDEEM = true;
    },
    /**
     * @return {undefined}
     */
    onRedeemSuccess(response) {
        CJ.License.setData({ license: { reusedId: response.ret.docId } });
        CJ.feedback();
        this.showAcquiredBlock();
    },
    /**
     * redirects user to an acquired block.
     */
    showAcquiredBlock() {
        this.getPopup().hide();
        let docId = CJ.License.getLicense().reusedId;
        if (!docId)
            docId = this.getLicensedContainer().getDocId();
        const url = CJ.tpl('!l/{0}/preview', docId);
        Ext.defer(() => {
            CJ.app.redirectTo(url);
        }, 500);    // waiting for history.
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        CJ.License.setData(null);
        clearInterval(this.getIntervalId());
    }
});