/**
 * Defines a component that displays application's top-bar with search-field.
 */
Ext.define('CJ.view.viewport.TopBar', {
    /**
     * @property {String} alias
     */
    alias: 'widget.view-viewport-top-bar',
    /**
     * @property {Boolean} hasShareButton
     */
    hasShareButton: true,
    /**
     * @property {Ext.XTemplate} tpl
     */
    tpl: Ext.create('Ext.Template', '<div class=\'d-top-bar d-hbox d-vcenter\' id=\'top-bar\'>', '<div class=\'d-search-container\'>', '<div class=\'d-search-container-inner\'></div>', '</div>', '<div class=\'d-share-button\'></div>', '</div>', { compiled: true }),
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {CJ.view.tag.SearchField} searchField
         */
        searchField: {},
        /**
         * @cfg {Ext.Component} languageSwitcher
         */
        languageSwitcher: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initElement();
        this.initConfig(config);
        if (config.renderTo)
            this.renderTo(config.renderTo);
        this.configureLanguageSwitcher();
        CJ.on('tags.change', this.onTagsChange, this);
        CJ.User.on('session.reinit', this.configureLanguageSwitcher, this);
    },
    /**
     * Shows or hides the language switcher depending on user logged state.
     * @param {CJ.User} [user]
     */
    configureLanguageSwitcher(user undefined CJ.User) {
        this.setLanguageSwitcher(!user.isLogged());
    },
    /**
     * @param {Object/Boolean} config
     * @return {Ext.Component/Boolean}
     */
    applyLanguageSwitcher(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        return Ext.factory(Ext.apply({ xtype: 'view-viewport-language-switcher' }, config));
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     * @return {undefined}
     */
    updateLanguageSwitcher(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (newComponent)
            newComponent.renderTo(this.element, this.element.dom.lastChild);
    },
    /**
     * @param {Object} config
     * @return {CJ.view.tag.SearchField}
     */
    applySearchField(config) {
        if (!config)
            return false;
        return Ext.factory({
            xtype: 'view-tag-search',
            renderTo: this.element.dom.querySelector('.d-search-container-inner')
        });
    },
    /**
     * method will be called when user changes tags, hides/shows share-button when needed.
     * @return {undefined}
     */
    onTagsChange() {
        this.displayShareButton(this.getSearchField().hasDynamicUrl());
    },
    /**
     * @param {Object} param
     * @return {undefined}
     */
    initElement() {
        const html = this.tpl.apply({});
        let template;
        if (CJ.Utils.supportsTemplate()) {
            template = document.createElement('template');
            template.innerHTML = html;
            template = template.content;
        } else {
            template = document.createElement('div');
            template.innerHTML = html;
        }
        this.element = Ext.get(template.firstChild);
    },
    /**
     * @param {Ext.Element} element
     * @return {undefined}
     */
    renderTo(element) {
        element.insertFirst(this.element);
    },
    /**
     * @param {Boolean} state
     */
    displayShareButton(state) {
        if (!this.hasShareButton)
            return;
        const node = this.element.dom.querySelector('.d-share-button'), url = this.getUrl();
        node.classList[state ? 'remove' : 'add']('d-hidden');
        CJ.Clipboard.copy({
            cmp: this,
            text: url,
            delegate: '.d-share-button'
        });
    },
    /**
     * @return {String} An url to current page.
     */
    getUrl() {
        return CJ.Utils.unurlify(location.href);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        CJ.un('tags.change', this.onTagsChange, this);
        this.element.destroy();
    }
});