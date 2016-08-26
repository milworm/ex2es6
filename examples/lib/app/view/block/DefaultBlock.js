import 'app/view/block/ContentBlock';
import 'app/core/view/list/Editor';
import 'app/view/block/Content';
import 'app/view/block/Repost';
import 'app/view/reuse/UpdatedOptions';
import 'app/view/block/options/Default';
import 'app/view/block/toolbar/LightBottomBar';
import 'app/view/block/toolbar/MulticolumnBottomBar';
import 'app/view/question/Question';
import 'app/view/activity/Title';

/**
 * Defines a class to show some information or/and to ask a question.
 */
Ext.define('CJ.view.block.DefaultBlock', {
    extend: 'CJ.view.block.ContentBlock',
    alias: 'widget.view-block-default-block',
    isDefaultBlock: true,
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-default',
        /**
         * @cfg {Ext.Component} activityTitle
         */
        activityTitle: null,
        /**
         * @cfg {Ext.Component} question
         */
        question: null,
        /**
         * @cfg {Ext.Component} list
         */
        list: {
            xtype: 'core-view-list-editor',
            items: { xtype: 'view-tool-text' }
        },
        /**
         * @cfg {Boolean} IsQuestionExpanded
         */
        isQuestionExpanded: null
    },
    /**
     * @return {Object}
     */
    getFooterTplData() {
        return {
            reuseCount: 0,
            commentTitle: CJ.Comment.createTitleFromCount(this.getCommentsCount())
        };
    },
    /**
     * @param {Object} config
     */
    constructor(config undefined {}) {
        // @TODO VERY TEMPORARY TO AVOID graphu-tool
        /*
        if(config.list) {
            var listItems = config.list.items,
                wrongXtypes = ["view-tool-graphu-tool", "view-tool-app-graphu"];

            for(var i = 0, item; item=listItems[i]; i++) {
                if(wrongXtypes.indexOf(item.xtype) > -1)
                    listItems.splice(i--, 1);
            }
        }
        */
        this.callParent(args);
        this.tapListeners = Ext.clone(this.tapListeners);
        this.tapListeners['.d-block-body-content .d-tool.d-fake'] = 'onFakeToolTap';
        this.tapListeners['.d-block-content > .d-body'] = 'onContentTap';
    },
    /**
     * @param {Boolean} state
     */
    applyIsQuestionExpanded(state) {
        this.getQuestion().setExpanded(state);
        if (!state)
            return false;
        return CJ.feedback({
            scope: this,
            message: CJ.t('view-block-default-block-tap-message'),
            cls: 'd-block-inline-feedback',
            duration: 3000,
            context: {
                element: this.element,
                position: 'tc-tc'
            },
            destroy() {
                this.setIsQuestionExpanded(false);
            }
        });
    },
    /**
     * @param {Ext.Component} newItem
     * @param {Ext.Component} oldItem
     */
    updateIsQuestionExpanded(newItem, oldItem) {
        if (oldItem)
            oldItem.hide();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onFakeToolTap(e) {
        this.getList().onFakeToolTap(e);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onContentTap(e) {
        if (this.getIsModal())
            return;
        if (Ext.os.is.Phone)
            return this.onPhoneMulticolumnBlockContentTap();
        if (Ext.os.is.Tablet)
            return this.onTabletMulticolumnBlockContentTap(e);
        this.fullscreen();
    },
    onTabletMulticolumnBlockContentTap(e) {
        const questionMessageTap = e.getTarget('.d-question .d-message');
        if (!questionMessageTap)
            return this.fullscreen();
        if (!this.getIsQuestionExpanded())
            return this.setIsQuestionExpanded(true);
        this.setIsQuestionExpanded(false);
        this.fullscreen();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onPhoneMulticolumnBlockContentTap(e) {
        this.element.addCls('d-expanded');
    },
    /**
     * @param {String} tags
     */
    applyTags(tags) {
        const tagType = CJ.Utils.getTagType(tags[0]);
        if (tagType == 'feed')
            tags = [CJ.User.get('user')];
        return tags;
    },
    /**
     * @param {Boolean} checkAnswerType
     * @return {Boolean} true will be returned in case when block has a question
     */
    hasQuestion(checkAnswerType) {
        const question = this.getQuestion();
        if (!checkAnswerType)
            return !!question;
        if (!question)
            return false;
        const answerType = question.getAnswerType();
        return answerType && answerType.isAnswer;
    },
    /**
     * @inheritdoc
     *
     */
    showOptions() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-popup-options-title',
            cls: 'd-menu-popup',
            layout: 'light',
            content: {
                xtype: 'view-block-options-default',
                block: this
            }
        });
    },
    /**
     * @param {Object} config
     */
    applyList(config) {
        if (!config)
            return false;
        const activityTitle = this.getActivityTitle();
        return Ext.factory({
            xtype: 'view-block-content',
            activityTitle,
            items: config.items
        });
    },
    /**
     * @param {Object} config
     */
    applyQuestion(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        this.getList();
        Ext.apply(config, {
            block: this,
            xtype: 'view-question-question'
        });
        return Ext.factory(config);
    },
    /**
     * @param {Ext.Component} newList
     * @param {Ext.Component} oldList
     */
    updateList(newList, oldList) {
        if (oldList)
            oldList.destroy();
        if (newList)
            newList.renderTo(this.innerElement);
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateQuestion(newComponent, oldComponent) {
        // editor is the only way to edit a block, so he is responsible of destroying a question.
        if (oldComponent)
            Ext.removeNode(oldComponent.element.dom);
        if (newComponent)
            newComponent.renderTo(this.innerElement);
    },
    applyEditor(editor) {
        if (editor)
            editor.setBlock(this);
        return editor;
    },
    /**
     * creates an edtior popup and moves block's content into editor
     */
    toEditState() {
        if (this.getEditor())
            return;
        const list = this.getList().serialize();
        const activityTitle = this.getActivityTitle();
        const question = this.getQuestion();
        let popup;
        this.setActivityTitle(null);
        this.setQuestion(null);
        popup = Ext.factory({
            xtype: 'view-block-edit-defaults-popup',
            title: CJ.app.t('nav-popup-block-title'),
            block: this,
            content: {
                xtype: 'view-block-edit-defaults-editor',
                block: this,
                activityTitle,
                list,
                question,
                // should be the last one in order to apply all items and
                // then set editing to each of them
                editing: true
            }
        });
        this.setEditor(popup.getContent());
    },
    /**
     * destroyes editor popup and moves block's content back to content
     */
    toViewState() {
        // we use editing: null in order to prevent ST execute toViewState when we render a block
        // (because of performance), but user is able to change publishing-options, which triggers #save-method
        // which will cause an error, because editor is null, so we need this check.
        // @TODO maybe the beter way will be to check oldEditingState in updateEditing-method.
        if (!this.getEditor())
            return;
        const editor = this.getEditor();
        let activityTitle = editor.getActivityTitle();
        const list = editor.getList();
        let question = editor.getQuestion();
        if (question)
            question = question.isEmpty() ? null : question;
        if (activityTitle)
            activityTitle = activityTitle.isEmpty() ? null : activityTitle.serialize();
        editor.setEditing(false);
        this.setActivityTitle(activityTitle);
        this.setList(list.serialize());
        this.setQuestion(question);
        this.setEditor(null);
    },
    resetChanges() {
        const initialConfig = this.initialConfig;
        this.setActivityTitle(initialConfig.activityTitle);
        this.setList(initialConfig.list);
        this.setQuestion(initialConfig.question);
        this._editing = false;
        this.getEditor().setEditing(false);
        this.setEditor(null);
    },
    /**
     * @param {String} mode Should be "local" to return all set of data
     *                      including comments/userInfo etc.., server by default
     * @return {Object}
     */
    serialize(mode undefined 'server') {
        const isEditing = this.getEditing();
        const component = isEditing ? this.getEditor() : this;
        const title = component.getActivityTitle();
        const list = component.getList();
        const question = component.getQuestion();
        let titleData = title;
        let listData = false;
        let questionData = false;
        const config = {};
        if (isEditing)
            titleData = title.serialize();
        if (question)
            questionData = question.serialize();
        if (list)
            listData = list.serialize();
        Ext.apply(config, {
            tags: this.getTags(),
            appVer: CJ.constant.appVer,
            xtype: this.xtype,
            activityTitle: titleData,
            list: listData,
            question: questionData,
            nodeCls: 'Document',
            // remove in v4
            docId: this.getDocId(),
            categories: this.getCategories(),
            groups: this.getGroups(),
            docVisibility: this.getDocVisibility() || CJ.User.getDefaultDocVisibility()
        });
        if (mode == 'local')
            Ext.apply(config, {
                createdDate: this.getCreatedDate(),
                userInfo: this.getUserInfo(),
                comments: this.getComments(),
                reuseInfo: this.getReuseInfo(),
                reusedCount: this.getReuseCount()
            });
        return config;
    },
    /**
     * @return {Object}
     */
    applyChanges() {
        if (!this.getEditing())
            return;
        this.getEditor().applyChanges();
    },
    save() {
        this.initGroups();
        this.applyChanges();
        this.setEditing(false);
        const data = this.serialize();    // sometimes block must be removed from stream when user changes it's tags.
                                          // When we remove block from stream we also destroy it, which leads to destroying #list-property,
                                          // so #serialize() call will return list: false, which is wrong. That's why before modifying the stream, we
                                          // need to serialize the block.
        // sometimes block must be removed from stream when user changes it's tags.
        // When we remove block from stream we also destroy it, which leads to destroying #list-property,
        // so #serialize() call will return list: false, which is wrong. That's why before modifying the stream, we
        // need to serialize the block.
        CJ.StreamHelper.adjustContaining(this);
        this.callParent([{
                rpc: {
                    model: 'Document',
                    method: 'save_documents'
                },
                params: { data: [data] }
            }]);
    },
    /**
     * @param {Object} values
     * @return {Boolean} returns true to render content-updated icon
     *                   for reused block.
     */
    getShowContentUpdatedIcon(values) {
        switch (this.xtype) {
        case 'view-block-private-block':
        case 'view-block-deleted-block':
            return false;
        }
        if (!values.reuseInfo)
            return false;
        return values.reuseInfo.contentUpdated && CJ.User.isMine(this);
    },
    /**
     * @return {String}
     */
    getMenuButtonCls() {
        if (this.getCanDelete())
            return '';
        return 'x-disabled';
    },
    /**
     * stops playing all components inside of this block
     */
    stopPlaying() {
        // private and default blocks don't have lists.
        if (!this.getList())
            return;
        const tools = this.getList().getTools();
        Ext.each(tools, tool => {
            Ext.callback(tool.stopPlaying, tool);
        });
    },
    /**
     * @return {undefined}
     */
    onBlockCreated() {
        this.callParent(args);
        if (this.hasPageTags())
            return CJ.feedback(CJ.t('activity-created'));
        const tags = CJ.Utils.tagsToPath(this.getTags());
        CJ.feedback({
            message: CJ.t('activity-created-with-check-out'),
            duration: 5000,
            tap(e) {
                if (e.getTarget('.d-button'))
                    CJ.app.redirectTo(tags);
            }
        });
    },
    /**
     * opens block in fullscreen-mode.
     * @return {undefined}
     */
    fullscreen() {
        CJ.History.keepPopups = true;
        CJ.app.redirectTo(`!m/${ this.getDocId() }`);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setActivityTitle(null);
        this.setQuestion(null);
        this.setList(null);
    }
});