import 'app/view/stream/header/Base';

/**
 * The class provides component for category feed header.
 */
Ext.define('CJ.view.stream.header.Category', {
    /**
     * @property {Boolean} isCategoryHeader
     */
    isCategoryHeader: true,
    extend: 'CJ.view.stream.header.Base',
    xtype: 'view-stream-header-category',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-header-block d-category',
        /**
         * @cfg {String} title
         */
        title: null,
        /**
         * @cfg {String} icon
         */
        icon: null,
        /**
         * @cfg {String} name
         */
        name: null,
        /**
         * @cfg {String} url
         */
        url: null,
        /**
         * @inheritdoc
         * @TODO
         */
        tabs: [
            {
                key: 'c',
                text: 'block-header-tab-courses'
            },
            {
                key: 'g',
                text: 'block-header-tab-groups'
            },
            {
                key: 'a',
                text: 'block-header-tab-activities'
            }    /*,{
            key: 's',
            text: 'block-header-tab-subscribers'
        }*/
        ],
        /**
         * @inheritdoc
         */
        routeKey: 'e',
        /**
         * @inheritdoc
         */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-image"></div>', '<div class="d-info">', '<div class="d-title">', '<div class="d-title-inner">', '<span class="name">{name}</span>', '</div>', '</div>', '<div class="d-icon" style="background-image: url(\'{icon}\')"></div>', '{stats}', '</div>', '<div class="d-action-button"></div>', '<div class="d-description">{description}</div>', '<tpl if="url">', '<div class="d-url">', '<a href="{url}" target="_blank">{url}</a>', '</div>', '</tpl>', '{tabs}', { compiled: true })
    },
    /**
     * @inheritdoc
     */
    applyData() {
        return this.callParent([{
                name: this.getName(),
                icon: this.getIcon(),
                description: this.getDescription(),
                url: this.getUrl()
            }]);
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.callParent(args);
        Ext.Viewport.getSearchBar().updateCategoryTag(data);
    },
    /**
     * It can't be editable, so need to override base logic.
     * @param {String} description
     * @returns {String}
     */
    applyDescription(description) {
        return description;
    },
    /**
     * Handler of successfully response of following request.
     * Fires an event.
     */
    onSubscribedStateSaveSuccess(response) {
        const tags = Ext.Viewport.getSearchBar().getTags().split(' ');
        const name = this.getName();
        let icon;
        let title;
        this.updateStat('subscribers', response.ret);
        if (tags.length == 1) {
            icon = this.getIcon();
            title = name;
        } else {
            title = tags.join(' ').replace(tags[0], name);
        }
        CJ.app.fireEvent('key.followingchange', {
            name: tags.join(' '),
            icon,
            title,
            followed: this.getSubscribed()
        });
    },
    onTabTap(e) {
        e.stopEvent();
        if (e.getTarget('li').getAttribute('data-key') == 's')
            this.openSubscribersPopup();
        else
            this.callParent(args);
    }
});