import 'app/view/stream/header/Base';

/**
 * The class provides component for tags feed header.
 */
Ext.define('CJ.view.stream.header.Tags', {
    /**
     * @property {Boolean} isTagsHeader
     */
    isTagsHeader: true,
    extend: 'CJ.view.stream.header.Base',
    xtype: 'view-stream-header-tags',
    config: {
        /**
         * @TODO
         * @inheritdoc
         */
        cls: 'd-header-block d-tags',
        /**
         * @cfg {String} tags
         */
        tags: null,
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
                key: 'g',
                text: 'block-header-tab-groups'
            }    /*,{
            key: 's',
            text: 'block-header-tab-subscribers'
        }*/
        ],
        /**
         * @inheritdoc
         */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-tags">{tags}</div>', '{stats}', '<div class="d-action-button"></div>', '{tabs}', { compiled: true })
    },
    /**
     * @inheritdoc
     */
    applyData() {
        return this.callParent([{ tags: this.getTags() }]);
    },
    /**
     * @inheritdoc
     */
    updateData() {
        this.callParent(args);
        this.element.setStyle({ backgroundColor: CJ.tpl('hsla({0}, 50%, 50%, 1)', CJ.Utils.randomHsl()) });
    },
    /**
     * @inheritdoc
     */
    applyTabs(tabs) {
        const tabs = Ext.clone(tabs), tabIndex = CJ.app.getActiveRoute().getMeta('tabIndex'), tabKey = CJ.History.getActiveAction().getArgs()[tabIndex], tags = Ext.Viewport.getSearchBar().getTags(), routeTpl = '#!t/{0}/{1}';
        Ext.each(tabs, item => {
            item.url = CJ.tpl(routeTpl, tags.replace(/#/g, ''), item.key);
            item.text = CJ.t(item.text);
            if (tabKey == item.key)
                item.active = true;
        });
        return tabs;
    },
    /**
     * @inheritdoc
     */
    onSubscribedStateSaveSuccess(response) {
        this.updateStat('subscribers', response.ret);
        CJ.app.fireEvent('key.followingchange', {
            name: Ext.Viewport.getSearchBar().getTags(),
            followed: this.getSubscribed()
        });
    },
    /**
     * @inheritdoc
     */
    onTabTap(e) {
        e.stopEvent();
        if (e.getTarget('li').getAttribute('data-key') == 's')
            this.openSubscribersPopup();
        else
            this.callParent(args);
    }
});