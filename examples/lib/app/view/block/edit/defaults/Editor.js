import 'Ext/Container';
import 'app/view/answers/TypeSelect';

/**
 * Defines a component that shows an interface to edit a block.
 */
Ext.define('CJ.view.block.edit.defaults.Editor', {
    extend: 'Ext.Container',
    alias: 'widget.view-block-edit-defaults-editor',
    /**
     * @property {Boolean} isEditor
     */
    isEditor: true,
    /**
     * @property {Boolean} isAutoFocus
     */
    isAutoFocus: true,
    config: {
        // @TODO need to ask JF to use d-editor-editor instead of unitTest
        cls: [
            'd-editor-editor',
            'unitTest'
        ],
        /**
         * @cfg {Ext.Component} activityTitle
         */
        activityTitle: null,
        /**
         * @cfg {Ext.Component} toolbar
         */
        toolbar: { xtype: 'view-block-edit-defaults-toolbar' },
        /**
         * @cfg {Ext.Component} list
         */
        list: null,
        /**
         * @cfg {Ext.Component} question
         */
        question: null,
        /**
         * @cfg {Ext.Component} block
         */
        block: {},
        /**
         * @cfg {Boolean} editing
         */
        editing: false,
        /**
         * @cfg {Ext.Component} popup
         */
        popup: null,
        /**
         * @cfg {Object} textSelection
         */
        textSelection: null,
        /**
         * @cfg {Object} listeners
         */
        listeners: {
            mouseup: {
                element: 'element',
                delegate: '.d-tool-text',
                fn: 'refreshToolbar'
            },
            tap: {
                element: 'element',
                delegate: '.d-tool-text',
                fn: 'refreshToolbar'
            }
        },
        /**
         * @cfg {Boolean} disabledEditing
         */
        disabledEditing: null,
        initialPlaylist: null,
        isDirty: false,
        /**
         * @cfg {Boolean} light
         * Should be true to transform an editor to it's light-version. For now light-version doesn't have a question.
         */
        light: null
    },
    constructor(config) {
        this.callParent(args);
        this.on('painted', this.onEditorPainted, this, { single: true });
        this.element.on('tap', this.onEditorListTap, this, { delegate: '.d-editor-list' });
    },
    /**
     * @return {HTMLElement}
     */
    getScrollEl() {
        return this.innerElement;
    },
    /**
     * @return {undefined}
     */
    onEditorPainted() {
        CJ.on('popupshow', this.onPopupShow, this);
        CJ.on('popuphide', this.onPopupHide, this);
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onPopupShow() {
        this.eachTextTool(tool => {
            tool.setHasTabIndex(false);
        });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onPopupHide() {
        this.eachTextTool(tool => {
            tool.setHasTabIndex(true);
        });
    },
    /**
     * @param {Function} callback
     */
    eachTextTool(callback) {
        Ext.each(this.query('[isText]'), tool => {
            callback(tool);
        });
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [
                {
                    reference: 'headerElement',
                    className: 'd-header'
                },
                {
                    reference: 'innerElement',
                    className: 'x-inner d-body d-scroll'
                }
            ]
        };
    },
    /**
     * @param {Object} config
     */
    applyToolbar(config) {
        if (!config)
            return false;
        Ext.apply(config, { editor: this });
        return Ext.factory(config);
    },
    /**
     * @param {Ext.Component} newToolbar
     * @param {Ext.Component} oldToolbar
     */
    updateToolbar(newToolbar, oldToolbar) {
        if (oldToolbar)
            oldToolbar.destroy();
        if (newToolbar) {
            newToolbar.renderTo(this.headerElement);
            newToolbar.setParent(this);
            newToolbar.setRendered(true);
        }
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyActivityTitle(config) {
        const hidden = !CJ.User.hasPremiumTools();
        if (config && config.isComponent) {
            config.setEditing(this.getEditing());
            config.setHidden(hidden);
        } else {
            config = Ext.isObject(config) ? config : {};
            config = Ext.apply({
                xtype: 'view-activity-title',
                editing: this.getEditing(),
                editor: this,
                hidden,
                listeners: {
                    change: this.onChange,
                    scope: this
                }
            }, config);
            config = Ext.factory(config);
        }
        return config;
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyList(config) {
        if (!config)
            return false;
        if (config.isComponent)
            return config;
        config = Ext.apply({
            xtype: 'core-view-list-editor',
            editing: this.getEditing(),
            items: { xtype: 'view-tool-text' }
        }, config);
        return Ext.factory(config);
    },
    /**
     * @param {Object} config
     */
    applyQuestion(config) {
        if (this.getLight())
            return false;
        this.getList();
        if (config && config.isComponent) {
            config.setEditor(this);
            config.setEditing(this.getEditing());
        } else {
            config = Ext.isObject(config) ? config : {};
            config = Ext.apply({
                xtype: 'view-question-question',
                block: this.getBlock(),
                answerType: null,
                editing: this.getEditing(),
                editor: this,
                listeners: {
                    change: this.onChange,
                    scope: this
                }
            }, config);
            config = Ext.factory(config);
        }
        return config;
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateActivityTitle(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (newComponent && CJ.User.hasPremiumTools())
            this.insert(0, newComponent);
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateList(newComponent, oldComponent) {
        if (oldComponent) {
            if (oldComponent.element.parent('.d-editor-editor'))
                oldComponent.destroy();
            else
                this.remove(oldComponent, false);
        }
        if (newComponent)
            this.insert(1, newComponent);
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateQuestion(newComponent, oldComponent) {
        if (oldComponent) {
            if (oldComponent.element.parent('.d-editor-editor'))
                oldComponent.destroy();
            else
                this.remove(oldComponent, false);
        }
        if (newComponent)
            this.insert(2, newComponent);
    },
    /**
     * @param {Boolean} state
     */
    updateEditing(state) {
        this.getActivityTitle();
        this.getList();
        this.getQuestion();
        this.getItems().each(item => {
            if (item.setEditing)
                item.setEditing(state);
        }, this);
        if (state && !this.getDisabledEditing())
            this.focus();
    },
    /**
     * saves current user's selection.
     */
    saveSelection() {
        const selection = window.getSelection(), focusNode = selection.focusNode;    // selection exists
        // selection exists
        if (!focusNode)
            return this.setTextSelection(false);
        const el = CJ.fly(focusNode);
        let tool;
        try {
            tool = Ext.getCmp(el.up('.d-tool-text').id);
        } catch (e) {
            tool = this.getList().getItems().first();    // first text tool
        }
        CJ.unFly(el);
        this.setTextSelection({
            tool,
            type: selection.type,
            focusNode,
            focusOffset: selection.focusOffset,
            range: selection.getRangeAt(0),
            isCollapsed: selection.isCollapsed,
            innerText: selection.toString()
        });
    },
    /**
     * @return {undefined}
     */
    refreshToolbar() {
        this.getToolbar().updateButtons();
    },
    applyChanges() {
        const changes = {};
        this.getItems().each(item => {
            if (!item.applyChanges)
                return;
            changes[item.getId()] = item.applyChanges();
        });
        return changes;
    },
    resetChanges() {
        Ext.Base.prototype.initConfig.call(this, this.initialConfig);
    },
    /**
     * @return {Boolean} true in case when editor is empty.
     */
    isEmpty() {
        const data = this.serialize(), listItems = data.list.items;
        return !(data.activityTitle || data.list.items.length || data.question);
    },
    /**
     * @param {Boolean} includeEmptyTools
     * @return {Object}
     */
    serialize(includeEmptyTools) {
        const question = this.getQuestion();
        let serializedQuestion = false;
        const title = this.getActivityTitle();
        if (question)
            serializedQuestion = question.serialize();
        this.applyChanges();
        return {
            activityTitle: title ? title.serialize() : null,
            list: this.getList().serialize(includeEmptyTools),
            question: serializedQuestion
        };
    },
    /**
     * @return {undefined}
     */
    onEditorListTap() {
        const list = this.getList(), hasMedia = list.element.dom.classList.contains('d-has-media');
        if (hasMedia || !list.getItems().first().isEmpty(true))
            return;
        this.focus(true);
    },
    /**
     * @param {Boolean} state
     */
    updateDisabledEditing(state) {
        this[state ? 'addCls' : 'removeCls']('d-disabled');
    },
    onChange() {
        // todo: check with initial value
        this.setIsDirty(true);
        this.fireEvent('change', this);
    },
    updateBlock(block) {
        if (block.isPlaylist)
            this.setInitialPlaylist(block.getPlaylist());
    },
    applyInitialPlaylist(playlist) {
        return Ext.clone(playlist);
    },
    applyItemData(index) {
        const block = this.getBlock();
        let data = block.getItemData(index);
        const isReused = data && data.reuseInfo && data.reuseInfo.reusesContent;
        data = Ext.clone(data);
        Ext.applyIf(data, {
            list: { items: [{ xtype: 'view-tool-text' }] },
            question: true
        });
        this.setActivityTitle(data.activityTitle);
        this.setList(data.list);
        this.setQuestion(data.question);
        this.setIsDirty(false);
        this.setDisabledEditing(isReused);
        this.updateEditing(true);
    },
    applyItemChanges(index) {
        const block = this.getBlock();
        if (Ext.isNumber(index))
            block.applyItemChanges(index);
        else if (!this.isEmpty())
            block.insertItem();
        this.setIsDirty(false);
    },
    cleanup() {
        this.setActivityTitle({});
        this.setList({});
        this.setQuestion({});
        this.setIsDirty(false);
        this.setDisabledEditing(false);
        this.focus();
    },
    focus(skipDelay) {
        Ext.defer(function () {
            this.down('[isText]').innerElement.dom.focus();
            Ext.defer(this.refreshToolbar, 50, this);
        }, skipDelay ? 0 : 200, this);
    },
    resetPlaylist() {
        const block = this.getBlock(), initialPlaylist = this.getInitialPlaylist();
        block.setPlaylist(initialPlaylist);
    },
    /**
     * Validates the editor. Validation rules are:
     * if question exists, it mustn't be empty.
     * if it's reused block inside of playlist, no matter what editor is always valid.
     * @return {Boolean}
     */
    validate() {
        const block = this.getBlock();
        if (block && block.isPlaylist) {
            const popup = this.getPopup(), activeItemIndex = popup.getActiveItemIndex(), data = block.getItemData(activeItemIndex), reuseInfo = data && data.reuseInfo;
            if (reuseInfo && reuseInfo.reusesContent)
                return true;
        }
        const question = this.getQuestion();
        if (question && !question.validate()) {
            // Show the faulty field in the case the question is not valid
            this.innerElement.dom.scrollTop = this.innerElement.dom.scrollHeight;
            return false;
        }
        return true;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        CJ.un('popupshow', this.onPopupShow, this);
        CJ.un('popuphide', this.onPopupHide, this);
        this.setToolbar(null);
        this.setList(null);
        this.setQuestion(null);
        this.callParent(args);
    }
});