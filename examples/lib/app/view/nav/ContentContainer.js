import 'Ext/Container';

/**
 * The class provides the main container fot all content
 * with ability show the side menu.
 */
Ext.define('CJ.view.nav.ContentContainer', {
    extend: 'Ext.Container',
    xtype: 'view-nav-content-container',
    MENU_ANIMATION_TIME: 250,
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-content-container',
        /**
         * @inheritdoc
         */
        layout: 'light',
        /**
         * @inheritdoc
         */
        items: [{
                xtype: 'component',
                isContent: true,
                cls: 'd-nav-content d-vbox'
            }],
        /**
         * @cfg {String} shownMenuCls
         * The CSS class that will be added when the side menu is shown.
         */
        shownMenuCls: 'd-menu-shown',
        /**
         * @cfg {String} hiddenMenuCls
         * The CSS class that will be added when the side menu is hidden.
         */
        hiddenMenuCls: 'd-menu-hidden',
        /**
         * @cfg {Boolean} isMenuShown
         * The opened state of the side menu.
         */
        isMenuShown: false
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        const config = {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [{
                    reference: 'innerElement',
                    classList: [
                        'x-inner',
                        'd-vbox'
                    ]
                }]
        };
        return config;
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        this.enableMenu();
        CJ.on('dohidesidemenu', this.hideMenu, this);
    },
    /**
     * Handler of the event 'onafterlocalforward'.
     * Check an url on changing after local forward,
     * if it was changed, navigation was to forward,
     * so we should run detectStateChange again.
     */
    onAfterLocalForward() {
        const history = CJ.History;
        if (history.isUrlChanged())
            history.detectStateChange();
    },
    /**
     * Toggle visibility of the side menu.
     * @param {Ext.Evented} e
     */
    toggleMenu() {
        if (this.getIsMenuShown())
            this.hideMenu();
        else
            this.showMenu();
    },
    /**
     * Shows the side menu.
     */
    showMenu() {
        this.setIsMenuShown(true);
        this.element.replaceCls(this.getHiddenMenuCls(), this.getShownMenuCls());
        CJ.fire('sidemenu.show');
        if (!Ext.os.is.Desktop)
            this.element.on('touchstart', this.hideMenu, this);
    },
    /**
     * Hides the side menu.
     * Calls a callback after the side menu will be hidden.
     * @param {Function} [callback]
     * @param {Object} [scope]
     */
    hideMenu(callback, scope) {
        this.setIsMenuShown(false);
        this.element.un('touchstart', this.hideMenu, this);
        this.element.replaceCls(this.getShownMenuCls(), this.getHiddenMenuCls());
        if (Ext.isFunction(callback))
            Ext.defer(callback, this.MENU_ANIMATION_TIME, scope || this);
        CJ.fire('sidemenu.hide');
    },
    /**
     * Disables the side menu.
     */
    disableMenu() {
        this.hideMenu();
        if (this.menuButton)
            this.menuButton.hide();
    },
    /**
     * Enables the side menu.
     */
    enableMenu() {
        if (Ext.os.is.Desktop)
            this.showMenu();
        else
            this.hideMenu();
        if (this.menuButton)
            this.menuButton.show();
    },
    /**
     * this method is needed, as we cannot use useBodyElement == false 
     * because ST ignores it for example while adding a mask
     */
    updateUseBodyElement: Ext.emptyFn
});