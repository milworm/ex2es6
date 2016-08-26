import 'Ext/Component';

Ext.define('CJ.view.viewport.LanguageSwitcher', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-viewport-language-switcher',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-language-switcher',
        /**
         * @cfg {String} tpl
         */
        tpl: '<div class=\'d-icon d-{language}\'></div>',
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {String} language
         */
        language: null,
        /**
         * @cfg {Object} listeners
         */
        listeners: {
            tap: {
                element: 'element',
                fn: 'onElementTap'
            }
        }
    },
    constructor() {
        this.callParent(args);
        this.setLanguage(CJ.User.getLanguage());
        CJ.on('language.change', this.onLanguageChange, this);
    },
    /**
     * @param {String} str
     * @return {String}
     */
    applyTpl(str) {
        return str;
    },
    /**
     * @param {String} language
     * @return {undefined}
     */
    updateLanguage(language) {
        this.setData({ language });
    },
    /**
     * @return {undefined}
     */
    onElementTap() {
        CJ.view.viewport.LanguageSelect.popup({
            listeners: {
                scope: this,
                selected: this.onLanguageSelected
            }
        });
    },
    /**
     * @param {String} language
     */
    onLanguageSelected(language) {
        CJ.User.setLanguage(language);
    },
    /**
     * @param {String} language
     */
    onLanguageChange(language) {
        this.setLanguage(language);
        const stream = CJ.Stream;
        if (stream)
            stream.onLanguageChange();
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().replace('{language}', data.language));
    },
    /**
     * @return {undefined}
     */
    destroy() {
        CJ.un('language.change', this.onLanguageChange, this);
        this.callParent(args);
    }
});