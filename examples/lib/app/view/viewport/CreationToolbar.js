import 'Ext/Component';

/**
 * Defines a floatable component that is used to create activity, group
 */
Ext.define('CJ.view.viewport.CreationToolbar', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-viewport-creation-toolbar',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} expanded
         */
        expanded: false,
        /**
         * @cfg {Object} buttons
         */
        buttons: {
            group: true,
            activity: true,
            course: true,
            map: true
        },
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-viewport-creation-toolbar',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-mask\'></div>', '<div class=\'d-items\'>', '<tpl if=\'values.map && (CJ.User.hasPremiumTools() || CJ.User.isPortal()) && !Ext.os.is.Phone\'>', '<div class=\'d-item d-new-map\' data-type=\'map\'>', '<div class=\'d-title\'>{map}</div>', '<div class=\'d-icon\'></div>', '</div>', '</tpl>', '<tpl if=\'group\'>', '<div class=\'d-item d-new-group\' data-type=\'group\'>', '<div class=\'d-title\'>{group}</div>', '<div class=\'d-icon\'></div>', '</div>', '</tpl>', '<tpl if=\'course && !Ext.os.is.Phone\'>', '<div class=\'d-item d-new-course\' data-type=\'course\'>', '<div class=\'d-title\'>{course}</div>', '<div class=\'d-icon\'></div>', '</div>', '</tpl>', '<tpl if=\'activity\'>', '<div class=\'d-item d-new-activity\' data-type=\'activity\'>', '<div class=\'d-title\'>{activity}</div>', '<div class=\'d-icon\'></div>', '</div>', '</tpl>', '</div>', '<div class=\'d-open-button\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-title\'>{cancel}</div>', '</div>'),
        listeners: {
            touchstart: {
                element: 'element',
                fn: 'onElementTouchStart'
            }
        }
    },
    constructor() {
        this.callParent(args);
        this.enableSideMenuListeners(true);
    },
    /**
     * @param {Object} param description
     * @return {Object}
     */
    applyButtons(buttons undefined {}) {
        for (const name in buttons)
            buttons[name] = CJ.t(CJ.tpl('view-block-button-add-{0}-button', name));
        return buttons;
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    applyData(data undefined {}) {
        data.cancel = CJ.t('view-viewport-creation-toolbar-cancel');
        return Ext.apply(data, this.getButtons());
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {Boolean} state
     */
    updateExpanded(state) {
        if (!this.initialized)
            return;
        this.isAnimating = true;
        if (state)
            this.element.replaceCls('d-collapsed', 'd-expanding');
        else
            this.element.replaceCls('d-expanded', 'd-collapsing');
        Ext.defer(function () {
            this.isAnimating = false;
            if (state)
                this.element.replaceCls('d-expanding', 'd-expanded');
            else
                this.element.replaceCls('d-collapsing', 'd-collapsed');
        }, 505, this);
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTouchStart(e) {
        if (this.isAnimating)
            return;
        this.setExpanded(!this.getExpanded());
        const button = e.getTarget('.d-item', 2);
        let type;
        if (!button)
            return;
        type = CJ.getNodeData(button, 'type');
        Ext.defer(function () {
            this.onMenuItemTap(type);
        }, 255, this);
    },
    /**
     * @param {String} type
     */
    onMenuItemTap(type) {
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        this[CJ.tpl('create{0}', CJ.capitalize(type))]();
    },
    /**
     * opens an editor in order to create new block/playlist.
     * @return {undefined}
     */
    createActivity() {
        Ext.factory({
            xtype: 'view-block-edit-defaults-popup',
            block: CJ.Block.getInitialTagsAndCategories()
        });
    },
    /**
     * opens a form in order to create new group.
     * @return {undefined}
     */
    createGroup() {
        Ext.factory({
            xtype: 'view-group-block',
            editing: true,
            tags: [CJ.User.get('user')]
        });
    },
    /**
     * method will be called when user taps on course-button
     * @return {undefined}
     */
    createCourse() {
        CJ.view.course.edit.Editor.popup();
    },
    /**
     * method will be called when user taps on map-button
     * @return {undefined}
     */
    createMap() {
        CJ.view.map.edit.Container.newMap();
    },
    /**
     * @param {Object} buttons
     * @return {undefined}
     */
    updateButtons(buttons) {
        if (!this.initialized)
            return;
        this.setData({});
        this.show();
    },
    /**
     * makes a component invisible
     */
    invisible() {
        this.element.setRight(-1000);
    },
    /**
     * makes a component visible
     */
    visible() {
        this.element.setRight(null);
    },
    /**
     * @param {Boolean} state
     */
    enableSideMenuListeners(state) {
        if (Ext.os.is.Desktop)
            return;
        const method = state ? 'on' : 'un';
        CJ[method]('sidemenu.show', this.invisible, this);
        CJ[method]('sidemenu.hide', this.visible, this);
        CJ[method]('buttons.invisible', this.invisible, this);
        CJ[method]('buttons.visible', this.visible, this);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.enableSideMenuListeners(false);
    }
});