import 'Ext/Component';
import 'app/view/tool/Menu';

/**
 * Defines the base class for any kind of tool: text, image, video, url,
 * formula, audio, file etc.
 */
Ext.define('CJ.view.tool.Base', {
    extend: 'Ext.Component',
    /**
     * @property {Boolean} isTool Always true
     */
    isTool: true,
    isOptimized: true,
    /**
     * @cfg {Sstring} alias
     */
    alias: 'widget.view-tool-base',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    statics: {
        /**
         * method must be overriden in sub-class, should show an interfaces to
         * edit a tool.
         * @param {Object} config
         * @return {undefined}
         */
        showEditing: Ext.emptyFn
    },
    config: {
        /**
         * @cfg {Ext.Component} menu Defines a component that shows a menu in
         *                      editable state with buttons like: delete,
         *                      options.
         */
        menu: null,
        /**
         * @cfg {Ext.Component} preview
         */
        preview: null,
        /**
         * @cfg {Boolean} editing
         */
        editing: false,
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool',
        /**
         * @cfg {Object} values
         */
        values: {},
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.firstTimeEditing = true;    // these lines are needed because we need use parent
                                         // in case when tool initializes with editing: true
                                         // (e.g: empty text tools)
        // these lines are needed because we need use parent
        // in case when tool initializes with editing: true
        // (e.g: empty text tools)
        if (config && config.parent)
            this.parent = config.parent;
        this.callParent(args);
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyMenu(config) {
        if (!config)
            return false;
        return Ext.factory(config);
    },
    /**
     * @param {Ext.Component} newMenu
     * @param {Ext.Component} oldMenu
     * @return {undefined}
     */
    updateMenu(newMenu, oldMenu) {
        if (oldMenu)
            oldMenu.destroy();
        if (!newMenu)
            return;
        newMenu.renderTo(this.innerElement);
        newMenu.parent = this;
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyPreview(config) {
        if (!config)
            return false;
        return Ext.factory(config);
    },
    /**
     * @param {Ext.Component} newPreview
     * @param {Ext.Component} oldPreview
     * @return {undefined}
     */
    updatePreview(newPreview, oldPreview) {
        if (oldPreview)
            oldPreview.destroy();
        if (newPreview)
            newPreview.renderTo(this.innerElement);
    },
    /**
     * deletes current tool
     */
    onMenuDeleteTap() {
        const title = CJ.app.t('view-tool-base-delete-confirm-title'), message = CJ.app.t('view-tool-base-delete-confirm-message');
        CJ.confirm(title, message, function (result) {
            if (result != 'yes')
                return;
            this.getParent().removeListItem(this);
        }, this);
    },
    /**
     * shows tool's options.
     */
    onMenuOptionsTap() {
    },
    /**
     * shows a popup to edit a tool.
     */
    onMenuEditTap() {
        this.self.showEditing({
            values: this.getValues(),
            listeners: {
                scope: this,
                actionbuttontap: this.onEdited
            }
        });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onEdited(popup) {
        this.setValues(popup.getContent().applyChanges());
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                { className: 'd-draggable d-draghandle' },
                {
                    reference: 'innerElement',
                    className: 'x-inner'
                }
            ]
        };
    },
    /**
     * @param {HTMLElement} node
     * @return {undefined}
     */
    replaceFake(node) {
        node.parentNode.replaceChild(this.element.dom, node);
    },
    /**
     * if you have tools that need to be rendered when visible on dom
     * use this method in order to force a re render
     * (used by playlist to re render tools that need to be visible for styling)
     *
     * @return {undefined}
     */
    renderTemplateOnDemand: Ext.emptyFn,
    /**
     * @param {Boolean} newState
     * @param {Boolean} oldState
     */
    updateEditing(newState, oldState) {
        if (!newState)
            return this.toViewState(oldState);
        this.toEditState(oldState);
        if (!this.firstTimeEditing)
            return;
        this.firstTimeEditing = false;
        Ext.TaskQueue.requestWrite(function () {
            this.on({
                'aftersave': this.onAfterSave,
                'menu.delete': this.onMenuDeleteTap,
                'menu.options': this.onMenuOptionsTap,
                'menu.edit': this.onMenuEditTap,
                scope: this
            });
        }, this);
    },
    /**
     * @return {undefined}
     */
    removeAll() {
        // @NOTE NEW TOOL DESIGN IMPLEMENTATION
        // this.setToolOverlay(null);
        this.setMenu(null);
        this.setPreview(null);
    },
    /**
     * performs any logic that should be called when tool transforms to edit
     * state.
     */
    toEditState() {
        this.removeAll();
        this.renderPreviewTpl();
        this.setPreview(this.getPreviewConfig());
        this.setMenu(this.getMenuConfig());
    },
    /**
     * performs any logic that should be called when tool transforms to view
     * state.
     */
    toViewState() {
        this.removeAll();
        this.renderPreviewTpl();
        this.setPreview(this.getPreviewConfig());
    },
    /**
     * if previewTpl is not enought for developer to show tool's preview,
     * he can override this method to render an object, and in this
     * case it will be used to render the component.
     * @return {undefined}
     */
    getPreviewConfig() {
        return null;
    },
    /**
     * @return {Object}
     */
    getMenuConfig() {
        return { xtype: 'view-tool-menu' };
    },
    /**
     * @return {Ext.Component}
     */
    getContent() {
        return this.getPreview();
    },
    /**
     * can contain any logic that should be executed when tool will be saved.
     */
    onAfterSave: Ext.emptyFn,
    /**
     * renders preview tpl if it's present
     * @return {undefined}
     */
    renderPreviewTpl() {
        const tpl = this.getPreviewTpl();
        if (!tpl)
            return;
        const values = this.getValues(), data = Ext.apply({ scope: this }, values);
        this.setHtml(tpl.apply(data));
    },
    /**
     * @param {Object} values
     */
    updateValues(values) {
        if (!this.initialized)
            return;
        this.renderPreviewTpl();
        this.onValuesUpdated(values);
    },
    onValuesUpdated(values) {
        const content = this.getContent();
        if (content)
            content.setValues(values);
    },
    /**
     * @param {String} url
     */
    preloadImage(url) {
        delete this.isImageLoaded;
        const image = new Image();
        image.onload = Ext.bind(this.onPreloadImageSuccess, this);
        image.src = url;
    },
    /**
     * @return {undefined}
     */
    onPreloadImageSuccess(e) {
        if (this.isDestroyed)
            return;
        this.isImageLoaded = true;
        this.renderPreviewTpl();
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setMenu(null);
        this.setPreview(null);
    }
});