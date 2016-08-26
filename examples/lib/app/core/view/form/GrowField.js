import 'Ext/Component';

/**
 * Class that provides autogrow textarea.
 */
Ext.define('CJ.core.view.form.GrowField', {
    extend: 'Ext.Component',
    xtype: 'core-view-form-growfield',
    isGrowField: true,
    config: {
        /**
         * @cfg {Boolean} modern True in order to use contenteditable-div,
         *                       false to use textarea.
         * [BugFix][#9659](iOS not working if someone writes one very long line ( no line break))
         */
        modern: !Ext.os.is.iOS,
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-growfield-base',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-growfield-base-inner',
        /**
         * @cfg {String} cls
         */
        cls: 'd-growfield',
        /**
         * @cfg {Number} minFieldHeight
         */
        minFieldHeight: 20,
        /**
         * @cfg {Number} maxFieldHeight
         */
        maxFieldHeight: 80,
        /**
         * @cfg {Boolean} allowNewRow
         */
        allowNewRow: true,
        /**
         * @cfg {String} name
         */
        name: null,
        /**
         * @cfg {String} label
         */
        label: null,
        /**
         * @cfg {String} hint
         */
        hint: null,
        /**
         * @cfg {String} placeHolder
         */
        placeHolder: null,
        /**
         * @cfg {Number} maxLength
         */
        maxLength: 1000,
        /**
         * @cfg {String} value
         */
        value: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-label\'>{label}</div>', '<tpl if=\'modern\'>', '<div class=\'d-field-content\' data-placeholder=\'{placeholder}\' contenteditable=\'true\'></div>', '<tpl else>', '<textarea class=\'d-field-content d-input\' placeholder=\'{placeholder}\' maxlength=\'{maxLength}\' rows=\'1\'></textarea>', '<textarea class=\'d-field-content d-shadow\' rows=\'1\' tabindex=\'-1\'></textarea>', '</tpl>', '<div class=\'d-hint\'>{hint}</div>', { compiled: true })
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        Ext.apply(data, {
            placeholder: this.getPlaceHolder() || '',
            label: this.getLabel() || '',
            hint: this.getHint() || '',
            modern: this.getModern(),
            maxLength: this.getMaxLength()
        });
        this.element.setHtml(this.getTpl().apply(data));
        this.initContent();
    },
    /**
     * initializes contenteditable or textarea element, depending on OS.
     * @return {undefined}
     */
    initContent() {
        const content = this.element.down('.d-field-content');
        content.setStyle({
            'min-height': `${ this.getMinFieldHeight() }px`,
            'max-height': `${ this.getMaxFieldHeight() }px`
        });
        this.relayEvents(content, [
            'input',
            'keyup',
            'keydown',
            'keypress',
            'focus',
            'blur',
            'paste'
        ]);
        this.content = content;
    },
    /**
     * @param {Boolean} state
     */
    updateModern(state) {
        this.getData();
        if (state) {
            this.on({
                keypress: this.onKeyPress,
                input: this.onInput,
                scope: this
            });    // by unknown reasons handler on event 'paste' of Ext.dom.Element
                   // calls only first time.
            // by unknown reasons handler on event 'paste' of Ext.dom.Element
            // calls only first time.
            this.content.dom.addEventListener('paste', Ext.bind(this.onPaste, this));
            return;
        }    // init shadow element.
        // init shadow element.
        const node = this.getShadowNode();
        node.style.minHeight = `${ this.getMinFieldHeight() }px`;
        node.style.maxHeight = `${ this.getMaxFieldHeight() }px`;
        this.on({
            keypress: this.onKeyPress,
            input: this.adjustTextareaHeight,
            scope: this
        });
    },
    /**
     * @param {String} text
     * @return {String}
     */
    applyPlaceHolder(text) {
        return CJ.t(text, true);
    },
    /**
     * @param {String} text
     * @return {String}
     */
    applyLabel(text) {
        return CJ.t(text, true);
    },
    /**
     * @param {String} text
     * @return {String}
     */
    applyHint(text) {
        return CJ.t(text, true);
    },
    /**
     * @param {String} value
     * @return {undefined}
     */
    applyValue(value) {
        this.getData();
        let valueProp = 'innerText';
        const value = value || '';
        if (this.getModern()) {
            if (Ext.browser.is.Firefox) {
                value = value.replace(/\n/g, '<br>');
                valueProp = 'innerHTML';
            }
        } else {
            valueProp = 'value';
            Ext.TaskQueue.requestWrite(this.adjustTextareaHeight, this);
        }
        value = CJ.Utils.decodeHtml(value);
        return this.content.dom[valueProp] = value;
    },
    /**
     * @return {String} value from HTMLElement.
     */
    getValue() {
        const dom = this.content.dom;
        let value;
        if (this.getModern()) {
            value = dom.innerText;
            if (Ext.browser.is.IE)
                value = value.replace(/\r\n\r\n/g, '\n');
            if (Ext.browser.is.Firefox)
                value = dom.innerHTML.replace(/<br>/g, '\n');
        } else {
            value = dom.value;
        }
        return Ext.String.trim(value);
    },
    /**
     * @return {undefined}
     */
    focus() {
        this.content.dom.focus();
    },
    /**
     * @return {undefined}
     */
    reset() {
        this.setValue(this.initialConfig.value);
    },
    /**
     * @param {Event} e
     * @return {undefined}
     */
    onKeyPress(e) {
        // some browsers fire keypress event event for backspace!
        if (e.browserEvent.keyCode == 8)
            return false;
        if (e.browserEvent.keyCode == 13 && !this.getAllowNewRow())
            return e.stopEvent();
        if (!this.getModern())
            return;
        if (document.queryCommandState('Bold'))
            document.execCommand('Bold', false, null);
        if (document.queryCommandState('Italic'))
            document.execCommand('Italic', false, null);
        if (document.queryCommandState('Underline'))
            document.execCommand('Underline', false, null);
        const maxLength = this.getMaxLength();
        if (maxLength && this.getValue().length >= maxLength)
            return e.stopEvent();
        if (Ext.browser.is.IE)
            this.fireEvent('input');
    },
    onInput() {
        if (!this.getModern())
            return;
        if (Ext.browser.is.Firefox && !this.getValue())
            this.setValue('');
    },
    /**
     * @return {undefined}
     */
    adjustTextareaHeight() {
        const shadowNode = this.getShadowNode(), inputNode = this.content.dom;
        shadowNode.value = inputNode.value;
        this.content.setHeight(shadowNode.scrollHeight);
    },
    /**
     * @return {HTMLElement}
     */
    getShadowNode() {
        return this.element.dom.querySelector('.d-shadow');
    },
    /**
     * @param {Event} e
     * @return {undefined}
     */
    onPaste(e) {
        e.preventDefault();
        const value = this.getValue(), pasted = CJ.Utils.getClipboardDataFromEvent(e), maxLength = this.getMaxLength();
        if (maxLength && value.length + pasted.length > this.getMaxLength())
            return;
        if (!Ext.browser.is.IE)
            return document.execCommand('insertText', false, pasted);
        const range = document.getSelection().getRangeAt(0), node = document.createElement('span');
        range.surroundContents(node);
        node.innerText = pasted;
        Ext.TaskQueue.requestWrite(this.fireEvent, this, ['input']);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.content.destroy();
        this.callParent(args);
    }
});