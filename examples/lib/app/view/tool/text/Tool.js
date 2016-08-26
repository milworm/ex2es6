import 'app/view/tool/Base';

/**
 * Defines a component to show/edit simple text
 */
Ext.define('CJ.view.tool.text.Tool', {
    extend: 'CJ.view.tool.Base',
    alias: [
        'widget.view-tool-text',
        'widget.view-tool-text-tool'
    ],
    isText: true,
    /**
     * @property {Array} TAGS_ALLOWED_ON_PASTE List of tags that we allow users to paste, all other tags will be removed
     * before pasting.
     */
    TAGS_ALLOWED_ON_PASTE: [
        'iframe',
        'img',
        'object',
        'div',
        'strong',
        'em',
        'sup',
        'sub',
        'i',
        'u',
        'b',
        'br',
        'p',
        'ul',
        'ol',
        'li',
        'blockquote'
    ],
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-tool-text',
        /**
         * @cfg {String} content
         */
        content: null,
        /**
         * @cfg {Boolean} hasTabIndex
         */
        hasTabIndex: null,
        /**
         * @property {String} lastValue
         */
        lastValue: null
    },
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @property {Object} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<tpl if=\'content\'>', '<div class=\'d-tool d-tool-text\'>', '<div class=\'x-inner\'>', '{[this.replaceContent(values.content)]}', '</div>', '</div>', '</tpl>', {
            compiled: true,
            replaceContent(content) {
                content = CJ.Utils.decodeHtml(content || '');
                content = content.replace('target="_blank"', 'target="_blank" onclick="return false;"');
                return content;
            }
        })
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [{
                    reference: 'innerElement',
                    className: 'x-inner',
                    'data-placeholder': CJ.app.t('view-tool-text-placeholder', true)
                }]
        };
    },
    initialize() {
        this.callParent(args);
        this.element.onDom('paste', this.onPaste, this);
        this.element.onDom('keyup', this.onKeyUp, this);    // Fix for the content selection in IE
        // Fix for the content selection in IE
        if (!Ext.browser.is.IE)
            return;
        this.element.onDom('selectstart', this.onSelectStart, this);
    },
    /**
     * @param {Event} e
     */
    onSelectStart(e) {
        e.stopPropagation();
    },
    onKeyUp(e) {
        const content = this.getContent(), text = e.target.textContent;    // make sure text tool is at least one line tall
                                                                           // all works fine with out with code and fixes bug in IE about double row
        // make sure text tool is at least one line tall
        // all works fine with out with code and fixes bug in IE about double row
        if (content == '<div></div>')
            this.setContent('');
        this.refreshToolbar();
        clearTimeout(this.keyUpTimer);
        this.keyUpTimer = Ext.defer(function (e) {
            if (text != e.target.textContent || text == this.getLastValue())
                return;
            this.setLastValue(text);
            const editor = this.up('[isEditor]');
            if (editor)
                editor.onChange(this);
        }, 250, this, [e]);
    },
    /**
     * @param {Object} e
     */
    onPaste(e) {
        // @TODO for now, android is not supported
        if (Ext.os.is.Android)
            return;
        e.preventDefault();
        e.stopPropagation();
        const allowedTags = this.TAGS_ALLOWED_ON_PASTE;
        let pasted = CJ.Utils.getClipboardDataFromEvent(e);
        let pieces = [];
        if (CJ.Embed.detectEmbed(pasted)) {
            pieces = [{ url: pasted }];
        } else {
            // remove all non-allowed tags.
            pasted = pasted.replace(/<(\/?[^<>]+)>/gi, (a, b) => {
                const tagMatch = b.split(' ')[0], tagName = tagMatch.replace('/', '');
                if (allowedTags.indexOf(tagName) > -1) {
                    // for images, iframes, objects we need to keep their attributes
                    // like src.
                    if ([
                            'img',
                            'iframe',
                            'object'
                        ].indexOf(tagName) > -1)
                        return `<${ b }>`;
                    return `<${ tagMatch }>`;
                }
                return '';
            });    // break pasted text into segments of text and urls
            // break pasted text into segments of text and urls
            pieces = CJ.Embed.parseText(pasted);
        }
        if (pieces.length && pieces[0].url) {
            this.insertTool({
                xtype: 'view-tool-loader',
                values: { url: pasted }
            }, true);
            return;
        }
        const div = document.createElement('div');
        let imgs = [];
        div.innerHTML = pasted;
        imgs = div.querySelectorAll('img');    // IE doesn't start http request
                                               // to load an images in case when doe the rendering inside of
                                               // onpaste-event handler.
        // IE doesn't start http request
        // to load an images in case when doe the rendering inside of
        // onpaste-event handler.
        Ext.defer(function () {
            Ext.each(imgs, function (img) {
                this.insertTool({
                    editing: true,
                    xtype: 'view-tool-image-tool',
                    values: { cfg: { url: img.src } }
                });
            }, this);
        }, 1, this);    // removes inserted images
        // removes inserted images
        pasted = pasted.replace(/<\/?img[^<>]+>/gi, '');
        if (!Ext.browser.is.IE)
            return document.execCommand('insertHTML', false, pasted);
        const range = document.getSelection().getRangeAt(0), node = document.createElement('span');
        range.surroundContents(node);
        node.innerHTML = pasted;
    },
    /**
     * @param {Object} config
     * @param {Boolean} deferred
     */
    insertTool(config, deferred) {
        // basically defer is needed because IE doesn't start http request
        // to load an images in case when doe the rendering inside of
        // onpaste-event handler.
        Ext.defer(function () {
            const list = this.up('[isList]');
            list.getEditor().saveSelection();
            list.addListItem(config);
        }, deferred ? 1 : 0, this);
    },
    /**
     * calls focus on inner contenteditable element
     */
    focus() {
        this.innerElement.dom.focus();
    },
    pasteWebUrl(config) {
        const docId = CJ.Guid.generatePhantomId(), tool = Ext.factory({
                xtype: 'view-tool-embed',
                docId
            }), name = tool.self.determineDisplay(config), display = tool.getView(name);
        tool.setUrl(config);
        display.loadView();
        display.setEditing(true);
        this.up('[isToolList]').addListItem(display);
    },
    refreshToolbar(e) {
        this.up('[isEditor]').refreshToolbar();
    },
    /**
     * @param {Boolean} useRealContent
     * @return {Boolean} true in case when tool contains only whitespaces
     */
    isEmpty(useRealContent) {
        let content;
        if (useRealContent)
            content = this.getRealContent();
        else
            content = this.getContent();
        if (!content)
            return true;
        return content.replace(/(<div[^>]*>)|(<\/div>)/gim, '').replace(/<.*?>(.*?)[<.*?>]*/gi, '$1').replace(/\s/gi, '') == '';
    },
    /**
     * @param {String} content
     */
    updateContent(content) {
        content = CJ.Utils.decodeHtml(content || '');
        this.innerElement.setHtml(content);
    },
    toEditState() {
        this.innerElement.addCls('editor_mode editing');
        this.innerElement.set({ contenteditable: true });
    },
    toViewState(oldState) {
        if (!oldState)
            return;
        this.innerElement.removeCls('editor_mode editing');
        this.innerElement.set({ contenteditable: false });
    },
    /**
     * updates visible value using original value
     */
    resetChanges() {
        this.innerElement.setHtml(this.initialConfig.content);
    },
    /**
     * saves changes
     */
    applyChanges() {
        this._content = this.getRealContent();
        this.initialConfig.content = this._content;
        return { content: this._content };
    },
    /**
     * @return {Object}
     */
    serialize() {
        return {
            xtype: this.xtype,
            content: this.getContent()
        };
    },
    /**
     * @param {Boolean} state
     */
    updateHasTabIndex(state) {
        this.innerElement.set({ tabindex: state ? undefined : -1 });
    },
    /**
     * @return {String}
     */
    getRealContent() {
        return this.innerElement.getHtml();
    }
});