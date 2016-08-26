import 'app/view/block/BaseBlock';
import 'app/model/Group';
import 'app/view/group/EditForm';
import 'app/view/group/RequestAccess';
import 'app/view/group/Options';

/**
 * Defines group-block.
 */
Ext.define('CJ.view.group.Block', {
    extend: 'CJ.view.block.BaseBlock',
    alias: 'widget.view-group-block',
    /**
     * @property {Boolean} isGroup
     */
    isGroup: true,
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-group',
        /**
         * @cfg {String} editingMode
         */
        editingMode: 'full',
        /**
         * @cfg {String} hashId
         */
        hashId: null,
        /**
         * @cfg {Number|String} icon
         */
        icon: null,
        /**
         * @cfg {String} icon
         */
        smallIcon: null,
        /**
         * @cfg {Object} iconCfg
         */
        iconCfg: null,
        /**
         * @cfg {String} name
         */
        name: null,
        /**
         * @cfg {String} description
         */
        description: null,
        /**
         * @cfg {Boolean} isPublic True in case when anyone can join this group.
         *                         False if group is closed and owner can decide
         *                         should he accept user's request or not.
         */
        isPublic: true,
        /**
         * @cfg {Boolean} isPending True in case when user sent a request, but
         *                          group owner haven't accepted it yet.
         */
        isPending: false,
        /**
         * @cfg {Boolean} canLeave True in case when user is allowed to leave
         *                         a group.
         */
        canLeave: true,
        /**
         * @cfg {Boolean} postingAllowed True in case when any user is allowed
         *                               to post some block in group. False if
         *                               only owner of the group is allowed to
         *                               do it.
         */
        postingAllowed: false,
        /**
         * @cfg {Boolean} isMember True in case when current user is a member
         *                         of this group.
         */
        isMember: false,
        /**
         * @cfg {Number} documents
         */
        documents: null,
        /**
         * @cfg {Number} members
         */
        members: null,
        /**
         * @cfg {Ext.Template} headerTpl
         */
        headerTpl: Ext.create('Ext.Template', '<div class="d-user-icon" style="{icon}"></div>', '<a class="d-content" href="{href}">', '<div class="d-title">', '<span class="d-label">{label}</span>', '<span class="d-name">{name}</span>', '</div>', '</a>', '<div class="d-menubutton"></div>', { compiled: true }),
        /**
         * @cfg {Ext.Template} footerTpl
         */
        footerTpl: Ext.create('Ext.Template', '<div class="d-bottom-bar d-light-bottom-bar d-multicolumn-bottom-bar">', '<div class="d-html">', '<a class="d-button" href="#!g/+{hashId}/a" onclick="return false">', '<div class="d-count">{activities}</div>', '<div class="d-label">{activitiesText}</div>', '</a>', /*
                    '<a class="d-button" href="#!g/+{hashId}/c" onclick="return false">',
                        '<div class="d-count">{courses}</div>',
                        '<div class="d-label">{coursesText}</div>',
                    '</a>',
                    */
        '<a class="d-button d-members" onclick="return false">', '<div class="d-count">{members}</div>', '<div class="d-label">{membersText}</div>', '</a>', '</div>', '</div>', { compiled: true })
    },
    /**
     * @property {Object} tapListeners
     */
    tapListeners: {
        '.d-menubutton': 'onMenuButtonTap',
        '.d-body': 'onBodyTap',
        '.d-bottom-bar .d-button': 'onBottomBarButtonTap'
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            html: [
                '<div class=\'d-image\'></div>',
                '<div class=\'d-header\'></div>',
                '<div class=\'d-body\'></div>',
                '<div class=\'d-footer\'></div>'
            ].join('')
        };
    },
    /**
     * @return {Object}
     */
    getHeaderTplData() {
        const menuButton = '', user = this.getUserInfo();
        return {
            docId: this.getDocId(),
            icon: CJ.Utils.makeIcon(user.icon),
            label: CJ.t('block-group-started-by'),
            name: user.name,
            menuButton,
            href: CJ.tpl('#!u/{0}', user.user),
            scope: this
        };
    },
    /**
     * @return {Object}
     */
    getFooterTplData() {
        return {
            hashId: this.getHashId(),
            activities: this.getDocuments(),
            courses: 0,
            members: this.getMembers(),
            activitiesText: CJ.t('block-group-button-activities'),
            coursesText: CJ.t('block-group-button-courses'),
            membersText: CJ.t('block-group-button-members')
        };
    },
    /**
     * refreshes header in case when #postingAllowed had been updated.
     */
    updatePostingAllowed() {
        if (this.initialized)
            this.refreshHeader();
    },
    /**
     * refreshes header in case when #hashId had been updated.
     */
    updateHashId() {
        if (this.initialized)
            this.refreshHeader();
    },
    updateIcon(icon) {
        let background = icon;
        const imageEl = this.element.dom.querySelector('.d-image');
        if (Ext.isNumeric(background)) {
            imageEl.classList.add('shown');
            imageEl.style.backgroundColor = CJ.tpl('hsla({0}, 35%, 50%, 0.7)', background);
        } else {
            const img = new Image();
            background = background.replace('130x130', '600x600');
            img.src = background;
            img.onload = () => {
                imageEl.classList.add('shown');
                imageEl.style.backgroundImage = CJ.tpl('url({0})', background);
            };
        }
    },
    updateName(name undefined this.getName()) {
        this.element.dom.querySelector('.d-body').innerHTML = CJ.tpl('<a href="#!g/+{0}/a">{1}</a>', this.getHashId(), name);
    },
    onBodyTap() {
        this.redirectTo(CJ.tpl('!g/+{0}/a', this.getHashId()));
    },
    onBottomBarButtonTap(e) {
        const button = e.getTarget('.d-button', 5);
        if (button.classList.contains('d-members')) {
            CJ.view.group.Members.popup({
                block: this,
                groupId: this.getDocId()
            });
            return;
        }
        this.redirectTo(button.getAttribute('href'));
    },
    serialize() {
        return {
            xtype: 'view-group-block',
            docId: this.getDocId(),
            iconCfg: this.getIconCfg(),
            name: this.getName(),
            description: this.getDescription(),
            isPublic: this.getIsPublic(),
            postingAllowed: this.getPostingAllowed(),
            tags: [CJ.User.get('user')],
            appVer: CJ.constant.appVer,
            nodeCls: 'Group'
        };
    },
    save(config) {
        return this.callParent([Ext.apply({
                rpc: {
                    model: 'Document',
                    method: 'save_documents'
                },
                params: { data: [this.serialize()] }
            }, config || {})]);
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onSaveSuccess(respone) {
        CJ.feedback();
        this.callParent(args);
        this.repaint();
        const action = this.isPhantom() ? 'create' : 'update';
        CJ.app.fireEvent(`group.${ action }`, this);
    },
    showOptions() {
        CJ.view.group.Options.popup({ block: this });
    },
    toEditState() {
        let buttonText, popupTitle;
        if (this.isPhantom()) {
            popupTitle = 'view-group-block-create-popup-title';
            buttonText = 'view-group-block-create-popup-button-title';
        } else {
            buttonText = 'view-group-block-edit-popup-button-title';
            popupTitle = 'view-group-block-edit-popup-title';
        }
        Ext.factory({
            cls: 'd-popup-transparent',
            xtype: 'core-view-popup',
            title: popupTitle,
            content: {
                block: this,
                xtype: 'view-group-edit-form',
                mode: this.getEditingMode(),
                values: {
                    icon: this.getIcon(),
                    iconCfg: this.getIconCfg(),
                    name: this.getName(),
                    isPublic: this.getIsPublic(),
                    postingAllowed: this.getPostingAllowed(),
                    description: this.getDescription()
                }
            },
            actionButton: { text: buttonText }
        });
    },
    /**
     * @inheritdoc
     */
    getLocalUrl() {
        return CJ.tpl('!g/+{0}', this.getHashId());
    },
    /**
     * Performs re-rendering for d-body and d-footer, because footer and body rely on properties which will be not 
     * updated with #reinit-call. Method is used when we receive data after creating or updating a group.
     * @return {undefined}
     */
    repaint() {
        this.updateName();
        this.updateFooterTpl(this.getFooterTpl());
    },
    redirectTo(url) {
        CJ.app.redirectTo(url);
        CJ.StreamHelper.setGroup({
            hashId: this.getHashId(),
            name: this.getName()
        });
    }
});