import 'app/view/skill/Options';

/**
 * Defines a base class that we use to display list of items in stream-container.
 */
Ext.define('CJ.view.stream.list.Skill', {
    /**
     * @property {String} alias
     */
    alias: 'widget.view-stream-list-skill',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {String} user
         * @param {Object} config
         * @return {undefined}
         */
        load(user, config) {
            return CJ.Ajax.request(Ext.apply({
                rpc: {
                    model: 'PortalUser',
                    method: 'list_badges'
                },
                params: { user }
            }, config));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} owner
         */
        isOwner: null,
        /**
         * @cfg {Array} items
         */
        items: null,
        /**
         * @cfg {CJ.view.stream.Container} stream
         */
        stream: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-section-bar\'>', '<span class=\'d-title\'>{badgesTitle}</span>', '</div>', '<tpl for=\'items\'>', '<div data-item-id=\'{#}\' class=\'d-badge {[values.display ? \'d-pinned\' : \'d-unpinned\']}\'>', '<div class=\'d-icon\' style=\'background-image: url({icon});\'></div>', '<div class=\'d-title\'>', '<span>{name}</span>', '</div>', '<span class=\'d-acquired\'>{[parent.acquiredLabel]}: </span>', '<span class=\'d-date\'>{[ Ext.Date.format(Ext.Date.parse(values.earned, \'Y-m-d h:i:s\'), \'m / d / Y\') ]}</span>', '</div>', '</tpl>')
    },
    /**
     * creates component's element.
     * @return {undefined}
     */
    initElement() {
        this.htmlElement = Ext.get(document.createElement('div'));
        this.htmlElement.dom.className = 'd-list d-list-skill';
        this.htmlElement.on('tap', this.onTap, this);
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initElement();
        this.initConfig(config);
        this.setIsOwner(CJ.User.isMineFeed());
        if (config.renderTo)
            this.renderTo();
    },
    /**
     * @param {Event} evt
     */
    onTap(evt) {
        const target = evt.getTarget('.d-badge', 5);
        let itemId;
        let description;
        let iconElement;
        if (!target)
            return;
        itemId = CJ.Utils.getNodeData(target, 'itemId') - 1;
        description = this.getDescriptionComponentConfig(itemId);
        iconElement = target.querySelector('.d-icon');
        if (!Ext.os.is.Desktop) {
            Ext.factory({
                xtype: 'core-view-popup',
                closeOnTap: true,
                cls: 'd-badge-description-popup',
                content: description
            });
        } else {
            CJ.core.view.Popover.show({
                position: {
                    x: 'right',
                    y: 'middle'
                },
                innerComponent: description,
                cls: 'd-badge-description-popover',
                target: iconElement || target
            });
        }
    },
    /**
     * @return {Object}
     */
    getDescriptionComponentConfig(itemId) {
        const items = this.getItems();
        return {
            xtype: 'view-skill-options',
            badge: items[itemId],
            isOwner: this.getIsOwner(),
            stream: this.getStream()
        };
    },
    /**
     * @param {HTMLElement} element
     */
    renderTo(element undefined this.initialConfig.renderTo) {
        if (element)
            element.appendChild(this.htmlElement.dom);
    },
    /**
     * @param {Array} items
     * @return {undefined}
     */
    updateItems(items) {
        if (items.length)
            this.htmlElement.dom.innerHTML = this.getTpl().apply({
                acquiredLabel: CJ.t('view-stream-list-skill-acquired-label'),
                badgesTitle: CJ.t('view-stream-list-skill-badges-label'),
                items
            });
        else
            this.renderNoContent();
    },
    /**
     * @inheritdoc
     */
    renderNoContent() {
        Ext.factory({
            xtype: 'view-noresult-content',
            data: { title: 'view-noresult-content-skills-title' },
            renderTo: this.htmlElement.dom
        });
    },
    /**
     * @return {undefined}
     */
    destroy() {
        const me = this;
        me.callParent(args);
        me.htmlElement.destroy();
        delete me.htmlElement;
    }
});