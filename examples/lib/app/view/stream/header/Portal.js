import 'app/view/stream/header/Base';

/**
 * The class provides component for user feed header.
 */
Ext.define('CJ.view.stream.header.Portal', {
    extend: 'CJ.view.stream.header.Base',
    xtype: 'view-stream-header-portal',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-header-block d-portal',
        /**
         * @cfg {CJ.core.view.form.Icon|String} icon
         */
        icon: null,
        /**
         * @cfg {String} name
         */
        name: null,
        /**
         * @cfg {String} tag
         */
        tag: null,
        /**
         * @cfg {String} user
         */
        user: null,
        /**
         * @cfg {String} role
         */
        role: null,
        /**
         * @cfg {String} company
         */
        company: null,
        /**
         * @cfg {String} url
         */
        url: null,
        /**
         * @cfg {Number} portalId
         */
        portalId: null,
        /**
         * @inheritdoc
         */
        tabs: [
            {
                key: 'f',
                text: 'block-header-tab-featured'
            },
            {
                key: 'a',
                text: 'block-header-tab-activities'
            },
            {
                key: 'c',
                text: 'block-header-tab-courses'
            },
            {
                key: 'g',
                text: 'block-header-tab-groups'
            }
        ],
        /**
         * @inheritdoc
         */
        routeKey: 'pu',
        /**
         * @inheritdoc
         */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-image"></div>', '<tpl if="canEdit">', '<div class="d-change-image-button">', '{[CJ.t("block-header-button-change-image")]}', '<input type="file" class="invisible-stretch" />', '</div>', '</tpl>', '<div class="d-info">', '<div class="d-title">', '<div class="d-title-inner">', '<span class="name">{name}</span>', '<span class="user">{tag}</span>', '</div>', '</div>', '<div class="d-icon"></div>', '{stats}', '</div>', '<div class="d-action-button"></div>', '<div class="d-fields">', '<div class="d-description"></div>', '<div class="d-url">', '</div>', '<div class="d-buttons">', '<span class="d-cancel">{[CJ.t("block-header-button-cancel")]}</span>', '<span class="d-save">{[CJ.t("block-header-button-save")]}</span>', '</div>', '</div>', '{tabs}')
    },
    /**
     * @inheritdoc
     */
    destroy() {
        this.callParent(args);
        if (!this.getCanEdit())
            return;
        this.getIcon().destroy();
        this.getUrl().destroy();
    },
    /**
     * @inheritdoc
     */
    applyData() {
        return this.callParent([{
                name: this.getName(),
                tag: this.getTag()
            }]);
    },
    /**
     * @param {String} tag
     */
    updateTag(tag) {
        const portal = tag.slice(0, -1);
        if (CJ.User.isPortalAdmin(portal))
            this.setCanEdit(true);
    },
    /**
     * Applies user's icon,
     * will be inited an icon filed if can edit, just image otherwise.
     * @param icon
     * @returns {CJ.core.view.form.Icon|String}
     */
    applyIcon(icon) {
        const el = this.element.dom.querySelector('.d-icon');
        if (this.getCanEdit())
            icon = Ext.factory({
                xtype: 'core-view-form-icon',
                renderTo: el,
                value: icon,
                labelText: null,
                listeners: {
                    uploadsuccess: this.onUploadIconSuccess,
                    scope: this
                }
            });
        else
            el.style.backgroundImage = CJ.tpl('url("{0}")', icon);
        return icon;
    },
    /**
     * Applies user's url,
     * will be inited an growfield if can edit, a link otherwise.
     * @param {String} url
     * @returns {CJ.core.view.form.GrowField|String}
     */
    applyUrl(url) {
        const el = this.element.dom.querySelector('.d-url');
        if (!this.getCanEdit()) {
            const corrected = CJ.Utils.toUrl(url), tpl = '<a href="{0}" target="_blank">{1}</a>';
            el.innerHTML = CJ.tpl(tpl, corrected, url);
            return url;
        }
        return Ext.factory({
            xtype: 'core-view-form-growfield',
            renderTo: el,
            value: url,
            placeHolder: CJ.t('block-header-url-placeholder', true),
            allowNewRow: false,
            maxLength: 100,
            listeners: {
                focus: this.onFieldFocus,
                blur: this.onFieldBlur,
                scope: this
            }
        });
    },
    /**
     * Updates user's data, when an image is uploaded.
     */
    onUploadImageSuccess() {
        this.callParent(args);
        this.save({ image: this.getImage() });
    },
    /**
     * Updates user's data, when an icon is uploaded.
     * @param {CJ.core.view.form.Icon} field
     * @param {Object} response
     * @param {Object} iconCfg
     */
    onUploadIconSuccess(field, response, iconCfg) {
        this.save({ iconCfg });
    },
    /**
     * Handler of successfully response of following request.
     * Updates count of subscribers and fires an event.
     * @param {Object} response
     */
    onSubscribedStateSaveSuccess(response) {
        const tags = Ext.Viewport.getSearchBar().getTags().split(' ');
        let icon;
        let title;
        this.updateStat('subscribers', response.ret);
        if (tags.length == 1) {
            title = this.getName();
            icon = this.getIcon();
            if (icon.isComponent)
                icon = icon.getValue().preview;
        }
        CJ.app.fireEvent('key.followingchange', {
            name: tags.join(' '),
            icon,
            title,
            followed: this.getSubscribed()
        });
    },
    /**
     * Handler of the event 'tap' of the save button.
     * Updates user's data.
     * @param {Ext.event.Event} e
     */
    onSaveButtonTap(e) {
        this.callParent(args);
        this.save({
            description: this.getDescription().getValue(),
            url: this.getUrl().getValue()
        });
    },
    /**
     * Handler of the event 'tap' of the cancel button.
     * Resets changes of fields.
     * @param {Ext.event.Event} e
     */
    onCancelButtonTap(e) {
        this.callParent(args);
        this.getDescription().reset(true);
        this.getUrl().reset(true);
    },
    /**
     * Shows user's a profile page.
     * @param {Ext.event.Event} e
     */
    onOptionsTap(e) {
        e.stopEvent();
        CJ.app.redirectTo('profile');
    },
    /**
     * Applies tabs, generates tab url and translates text of button
     * @param {Array} tabs
     * @returns {Array}
     */
    applyTabs(tabs) {
        const tabs = Ext.clone(tabs);
        const allTags = Ext.Viewport.getSearchBar().getTags().split(' ');
        const entity = allTags[0];
        let tags = `/${ allTags.slice(1).join().replace(/#/g, '') }`;
        const routeTpl = '#!{0}/{1}/{2}{3}';
        const routeKey = this.getRouteKey();
        if (tags.length == 1)
            tags = '';
        Ext.each(tabs, item => {
            let tagsList = tags;
            if (item.key == 'f')
                tagsList = '';
            item.url = CJ.tpl(routeTpl, routeKey, entity, item.key, tagsList);
            item.text = CJ.t(item.text);
        });
        return tabs;
    },
    onTabTap(e) {
        e.stopEvent();
        if (e.getTarget('li.d-subscribers'))
            this.openSubscribersPopup();
        else
            this.callParent(args);
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.callParent(args);
        CJ.fire('portal.update', {
            icon: this.initialConfig.icon,
            name: this.getName(),
            tag: data.tag
        });
    },
    /**
     * @param {Object} data
     * @param {String} data.image
     * @param {String} data.icon
     * @param {String} data.url
     * @param {String} data.description
     * @return {undefined}
     */
    save(data) {
        CJ.request({
            rpc: {
                model: 'Portal',
                method: 'set_header_info',
                id: this.getPortalId()
            },
            params: data,
            success: this.onSaveSuccess
        });
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onSaveSuccess(response) {
        CJ.fire('portal.update', response.ret);
    }
});