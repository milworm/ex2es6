import 'app/view/block/ContentBlock';
import 'app/view/purchase/PurchaseForm';

/**
 * Block will be visible only for users who are able to buy licensed container.
 */
Ext.define('CJ.view.purchase.LicensedBlock', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.ContentBlock',
    /**
     * @property {Boolean} isLicensedBlock
     */
    isLicensedBlock: true,
    /**
     * @property {String} alias
     */
    alias: [
        'widget.view-block-licensed-block',
        // @TODO for Ivo, change to view-purchase-licensed-block
        'widget.view-purchase-licensed-block'
    ],
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * depending on data, method shows licensed-block preview or bought block.
         * @param {Object} data
         */
        preview(data) {
            const block = Ext.factory(data);
            if (block.isLicensedBlock)
                return block.preview();
            CJ.History.replaceState(block.getLocalUrl());
            if (block.onCoverTap)
                block.onCoverTap();
            else
                block.popup();
        },
        /**
         * loads and opens licensed-container's preview.
         * @param {Number} entitiyId
         * @param {Number} previewId
         * @return {undefined}
         */
        previewById(docId) {
            CJ.LoadBar.run();
            CJ.Block.load(docId, {
                scope: this,
                success(response) {
                    this.preview(response.ret);
                },
                failure() {
                    CJ.History.back();
                },
                callback() {
                    CJ.LoadBar.finish();
                }
            });
        },
        /**
         * @param {String} pin
         * @return {undefined}
         */
        previewByPin(pin) {
            CJ.LoadBar.run();
            CJ.License.getPinInfo(pin, {
                scope: this,
                success(response) {
                    response.ret.pin = pin;
                    this.preview(response.ret);
                },
                failure() {
                    CJ.History.back();
                },
                callback() {
                    CJ.LoadBar.finish();
                }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-cover-block d-licensed-block',
        /**
         * @cfg {String} icon
         */
        icon: null,
        /**
         * @cfg {String} pin
         */
        pin: null,
        /**
         * @cfg {Object} licensingOptions
         */
        licensingOptions: null,
        /**
         * @cfg {Number} backgroundHsl
         */
        backgroundHsl: true,
        /**
         * @cfg {Number} backgroundMocksyNumber
         */
        backgroundMocksyNumber: true,
        /**
         * @cfg {String} title
         */
        title: null,
        /**
         * @cfg {String} description
         */
        description: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-cover {[ CJ.Utils.getBackgroundCls(values) ]}" data-{type}>', '<div class="d-block-type-icon"></div>', '<div class="d-title">', '<span>{title}</span>', '</div>', '<div class="d-price">${price}</div>', '<tpl if="description">', '<div class="d-info-button">', '<span>{[ CJ.t("more-info") ]}</span>', '</div>', '</tpl>', '</div>'),
        /**
         * @cfg {Ext.XTemplate} headerTpl
         */
        headerTpl: Ext.create('Ext.XTemplate', [
            '<tpl if="values.licensed">',
            '<tpl if="values.samePortal">',
            '<a class="d-user-icon d-creator-icon" style="background-image: url({creatorInfo.icon})" href="#!u/{creatorInfo.user}" onclick="return false;"></a>',
            '<tpl if="isReused">',
            '<a class="d-user-icon" style="background-image: url({userInfo.icon})" href="#!u/{userInfo.user}" onclick="return false;"></a>',
            '</tpl>',
            '<div class="d-content">',
            '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">',
            '{userInfo.name}',
            '</a>',
            '<div class="d-time">',
            '<span>{[ CJ.t("block-posted-text") ]}</span> ',
            '{[ CJ.Block.formatDate(values.createdDate) ]} ',
            '</div>',
            '</div>',
            '<tpl elseif="portal">',
            '<a class="d-user-icon d-creator-icon d-portal-icon" style="background-image: url({portal.icon})" href="#!pu/{portal.prefix}@/f" onclick="return false;"></a>',
            '<tpl if="isReused">',
            '<a class="d-user-icon" style="background-image: url({userInfo.icon})" href="#!u/{userInfo.user}" onclick="return false;"></a>',
            '<div class="d-content">',
            '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">',
            '{userInfo.name}',
            '</a>',
            '<div class="d-time">',
            '<span>{[ CJ.t("block-posted-text") ]}</span> ',
            '{[ CJ.Block.formatDate(values.createdDate) ]} ',
            '</div>',
            '</div>',
            '<tpl else>',
            '<div class="d-content">',
            '<a class="d-title d-user-name d-portal-name" href="#!pu/{portal.prefix}@/f" onclick="return false;">',
            '{portal.name}',
            '</a>',
            '<div class="d-time">',
            '<span>{[ CJ.t("block-posted-text") ]}</span> ',
            '{[ CJ.Block.formatDate(values.createdDate) ]} ',
            '</div>',
            '</div>',
            '</tpl>',
            '<tpl else>',
            '<a class="d-user-icon d-creator-icon" style="background-image: url({creatorInfo.icon})" href="#!u/{creatorInfo.user}" onclick="return false;"></a>',
            '<tpl if="isReused">',
            '<a class="d-user-icon" style="background-image: url({userInfo.icon})" href="#!u/{userInfo.user}" onclick="return false;"></a>',
            '</tpl>',
            '<div class="d-content">',
            '<a class="d-title d-user-name d-creator-icon" href="#!u/{userInfo.user}" onclick="return false;">',
            '{userInfo.name}',
            '</a>',
            '<div class="d-time">',
            '<span>{[ CJ.t("block-posted-text") ]}</span> ',
            '{[ CJ.Block.formatDate(values.createdDate) ]} ',
            '</div>',
            '</div>',
            '</tpl>',
            '<tpl else>',
            '<a class="d-user-icon d-creator-icon" style="background-image: url({creatorInfo.icon})" href="#!u/{creatorInfo.user}" onclick="return false;"></a>',
            '<tpl if="isReused">',
            '<a class="d-user-icon" style="background-image: url({userInfo.icon})" href="#!u/{userInfo.user}" onclick="return false;"></a>',
            '</tpl>',
            '<div class="d-content">',
            '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">',
            '{userInfo.name}',
            '</a>',
            '<div class="d-time">',
            '<span>{[ CJ.t("block-posted-text") ]}</span> ',
            '{[ CJ.Block.formatDate(values.createdDate) ]} ',
            '</div>',
            '</div>',
            '</tpl>',
            '<div class="d-assign-button"></div>',
            '<div class="d-menubutton {menuButtonCls}"></div>',
            {
                compiled: true,
                /**
                 * @param {Object} values
                 * @return {String}
                 */
                getOwnerHref(values) {
                    return `#!u${ CJ.Utils.urlify('/' + values.scope.getOwnerUser()) }`;
                }
            }
        ])
    },
    constructor() {
        this.callParent(args);
        this.tapListeners = Ext.clone(this.tapListeners);
        this.tapListeners['.d-cover'] = 'onCoverTap';
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                { className: 'd-header' },
                {
                    reference: 'innerElement',
                    classList: [
                        'x-inner',
                        'd-body',
                        'd-block-body'
                    ]
                },
                { className: 'd-footer' }
            ]
        };
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        if (!data)
            return false;
        const licensingOptions = this.getLicensingOptions();
        let price = licensingOptions.price;
        if (licensingOptions.bundled)
            price = licensingOptions.bundlePrice;
        return Ext.apply(data, {
            icon: this.getIcon(),
            title: this.getTitle(),
            description: this.getDescription(),
            backgroundMocksyNumber: this.getBackgroundMocksyNumber(),
            backgroundHsl: this.getBackgroundHsl(),
            price,
            type: this.initialConfig.nodeCls.toLowerCase()
        });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        let html = '';
        if (data)
            html = this.getTpl().apply(data);
        this.innerElement.setHtml(html);
        this.renderCoverImage(data);
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    renderCoverImage(data) {
        let icon = data.icon;
        const node = this.element.dom.querySelector('.d-cover');
        const cssText = CJ.Utils.getBackground(data);
        if (!icon)
            return node.style.cssText = cssText;
        if (Ext.isObject(icon))
            icon = icon.preview || icon.original;
        const image = new Image();
        image.src = icon;
        image.onload = () => {
            node.style.cssText = cssText;
        };
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
    /**
     * @inheritdoc
     */
    showOptions() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-popup-options-title',
            cls: 'd-menu-popup',
            layout: 'light',
            content: {
                xtype: 'view-block-options-base',
                editButton: false,
                deleteButton: false,
                permissionsButton: false,
                saveToMyFeedButton: false,
                block: this
            }
        });
    },
    /**
     * @inheritdoc
     */
    getLocalUrl() {
        const reuseInfo = this.getReuseInfo(), docId = reuseInfo.reusesContent ? reuseInfo.docId : this.getDocId();
        return CJ.tpl('!l/{0}/preview', docId);
    },
    /**
     * loads preview-information (if needed) and shows it.
     * @return {undefined}
     */
    preview() {
        const options = this.getLicensingOptions();
        let previewDocId;
        try {
            previewDocId = options.preview.docId;
        } catch (e) {
            return;
        }
        if (options.preview.nodeCls)
            return this.showPreview(options.preview);
        CJ.LoadBar.run();
        CJ.Block.load(previewDocId, {
            scope: this,
            success(response) {
                this.showPreview(response.ret);
            },
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    /**
     * shows preview-popup.
     * @param {Object} config
     * @param {Object} popup Popup's config.
     * @return {undefined}
     */
    showPreview(config, popup) {
        Ext.apply(config, { licensedContainer: this });
        Ext.factory(config).popup(popup);
    },
    /**
     * opens an interface to buy a block.
     * @return {undefined}
     */
    buy() {
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        CJ.PurchaseForm.popup(this.getDocId());
    },
    /**
     * redeems a license.
     * @param {Object} config
     * @param {Object} config.scope
     * @param {Object} config.success
     * @return {undefined}
     */
    redeem(config) {
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        CJ.LoadBar.run();
        CJ.License.redeemPin(this.getPin(), Ext.apply({
            success() {
                CJ.feedback();
            },
            callback() {
                CJ.LoadBar.finish();
            }
        }, config));
    },
    /**
     * @return {Boolean}
     */
    hasPin() {
        return !!this.getPin();
    },
    /**
     * replaces current licensed-container preview with it's real content.
     * @return {undefined}
     */
    showPurchasedContent() {
        const license = CJ.License.getLicense();
        if (!license)
            return;    // user didn't purchase anything.
        // user didn't purchase anything.
        CJ.PopupManager.hideActive();
        this.self.previewById(license.blockId);
    },
    /**
     * removes current block from parent's list, creates and inserts new block to parent's list.
     * @return {undefined}
     */
    replaceWithRealBlock() {
        const parent = this.parent, config = this.initialConfig, index = parent.indexOf(this);
        config.xtype = CJ.tpl('view-{0}-block', this.getNodeCls().toLowerCase());
        parent.remove(this);
        parent.insert(index, config);
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
            docVisibility: this.getDocVisibility(),
            tags: this.getTags(),
            categories: this.getCategories(),
            appVer: CJ.constant.appVer,
            nodeCls: this.getNodeCls(),
            groups: this.getGroups(),
            backgroundHsl: this.getBackgroundHsl(),
            backgroundMocksyNumber: this.getBackgroundMocksyNumber(),
            licensingOptions: this.getLicensingOptions()
        };
        Ext.apply(data, {
            icon: this.getIcon(),
            title: this.getTitle(),
            description: this.getDescription()
        });
        if (mode == 'server')
            return data;
        Ext.apply(data, {
            userInfo: this.getUserInfo(),
            createdDate: this.getCreatedDate(),
            comments: this.getComments(),
            reuseInfo: this.getReuseInfo(),
            reusedCount: this.getReuseCount()
        });
        return data;
    }
});