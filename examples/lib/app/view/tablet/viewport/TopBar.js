import 'app/view/viewport/TopBar';

Ext.define('CJ.view.tablet.viewport.TopBar', {
    extend: 'CJ.view.viewport.TopBar',
    alias: 'widget.view-tablet-viewport-top-bar',
    /**
     * @property {Boolean} hasShareButton
     */
    hasShareButton: false,
    /**
     * @property {Ext.XTemplate} tpl
     */
    tpl: Ext.create('Ext.XTemplate', '<div class=\'d-top-bar d-hbox d-vcenter\' id=\'top-bar\'>', '<div class=\'d-top-bar-button d-top-bar-back-button\'></div>', '<div class=\'d-search-container\'>', '<div class=\'d-search-container-inner\'></div>', '</div>', '<div class=\'d-top-bar-button d-top-bar-menu-button\'></div>', '</div>'),
    /**
     * @return {undefined}
     */
    initElement() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        if (e.getTarget('.d-top-bar-back-button', 1))
            CJ.History.back();
        else if (e.getTarget('.d-top-bar-menu-button', 1))
            Ext.Viewport.container.toggleMenu();
    }
});