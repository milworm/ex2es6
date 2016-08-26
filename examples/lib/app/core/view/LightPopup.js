/**
 * As we don't have consistent design for all popups in the app, some popups are very light and this component is used
 * when we need to show them (overlay, content, close-button).
 */
Ext.define('CJ.core.view.LightPopup', {
    /**
     * @property {String} alias
     */
    alias: 'widget.core-view-light-popup',
    /**
     * @property {Boolean} isPopup
     */
    isPopup: true,
    /**
     * @property {Ext.Element} element
     */
    element: null,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: null,
        /**
         * @cfg {Boolean} hiding
         */
        hiding: null,
        /**
         * @cfg {Ext.Component} content
         */
        content: null,
        /**
         * @cfg {String|Boolean} closeButton True to render stringless html element.
         */
        closeButton: true,
        /**
         * @cfg {String} tpl
         */
        tpl: [
            '<div class=\'d-light-popup-mask\'></div>',
            '<div class=\'d-light-popup {cls}\'>',
            '<div class=\'d-light-popup-content\'></div>',
            '<div class=\'d-popup-close-button d-light-popup-close-button\'>{closeButton}</div>',
            '</div>'
        ].join('')
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initConfig(config);
        this.initElement();
        this.show();
    },
    /**
     * @param {Boolean|String} button
     * @return {String}
     */
    applyCloseButton(button) {
        if (!button)
            return '';
        return Ext.isString(button) ? CJ.t(button) : '';
    },
    /**
     * @param {Boolean|String} config
     * @return {Ext.Component}
     */
    applyContent(config) {
        if (!config)
            return config;
        return Ext.factory(config);
    },
    /**
     * @param {Ext.Component} newContent
     * @param {Ext.Component} oldContent
     * @return {undefined}
     */
    updateContent(newContent, oldContent) {
        if (oldContent)
            oldContent.destroy();
    },
    /**
     * @param {Boolean} state
     */
    updateHiding(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-hiding');
    },
    /**
     * @return {Object}
     */
    getData() {
        return {
            cls: this.getCls(),
            closeButton: this.getCloseButton()
        };
    },
    /**
     * @return {undefined}
     */
    initElement() {
        const content = this.getContent(), div = document.createElement('div'), data = this.getData();
        div.style.zIndex = CJ.ZIndexManager.getZIndex();
        div.className = 'd-light-popup-container';
        div.innerHTML = this.getTpl().replace(/{([^}]+)}/g, (a, b) => data[b] || '');
        this.getContent().renderTo(div.querySelector('.d-light-popup-content'));
        this.element = Ext.get(div);
    },
    /**
     * @return {undefined}
     */
    show() {
        this.element.appendTo(Ext.Viewport.bodyElement);
        CJ.fire('popupshow', this);
        Ext.Viewport.hideKbd();
        CJ.PopupManager.onShow(this);
    },
    /**
     * @return {undefined}
     */
    hide() {
        if (this.getHiding())
            return;
        this.setHiding(true);
        CJ.fire('popuphide', this);
        CJ.PopupManager.onHide(this);
        Ext.defer(this.destroy, 550, this);
    },
    /**
     * @return {undefined}
     */
    onCloseButtonTap() {
        this.hide();
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.element.destroy();
        this.setContent(null);
    }
});