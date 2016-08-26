import 'Ext/Component';

/**
 * Defines block's bottom-bar that can render a tab in inline-mode (inline-comments).
 * Currently used for blocks in answer feeds and modal-block.
 */
Ext.define('CJ.view.block.toolbar.LightBottomBar', {
    extend: 'Ext.Component',
    alias: 'widget.view-block-toolbar-light-bottom-bar',
    isOptimized: true,
    config: {
        /**
         * @cfg {Object} tabElement
         */
        tabElement: null,
        /**
         * @cfg {Number} reuseCount
         */
        reuseCount: '',
        // @TODO https://redmine.iqria.com/issues/8265
        /**
         * @cfg {Number} commentsCount
         */
        commentsCount: 0,
        /**
         * @cfg {Number} answersCount
         */
        answersCount: 0,
        /**
         * @cfg {String} cls
         */
        cls: 'd-bottom-bar d-light-bottom-bar d-single-column-bottom-bar',
        /**
         * @cfg {Object} block
         */
        block: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Object} tab
         */
        tab: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<tpl if="isReusable">', '<div class="d-button d-reuse-button" data-type="reuse">{reuseCount}</div>', '</tpl>', '<tpl if="hasQuestion">', '<a class="d-button d-answers-button {[values.activeTab == "answers" ? "d-active" : "" ]}" data-type="answers" href="#!a/{blockId}" onclick="return false;">', '{answersCount} <span>{answerTitle}</span>', '</a>', '</tpl>', '<tpl if="hasAnswers && values.isMine">', '<div class="d-button d-answers-button d-no-count" data-type="answers"></div>', '</tpl>', '<a class="d-button d-comments-button {[ values.activeTab == "comments" ? "d-active" : "" ]}" data-type="comments" onclick="return false;">', '{commentTitle}', '</a>', { compiled: true })
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     */
    updateBlock(block) {
        block.on({
            scope: this,
            answersubmit: this.onAnswerSubmit,
            answerdelete: this.onAnswerDelete,
            commentcreate: this.onCommentCreate
        });
        this.setAnswersCount(block.getAnswersCount());
        this.setCommentsCount(block.getCommentsCount());
    },
    /**
     * @param {Object} data
     */
    applyData(data) {
        const block = this.getBlock();
        let activeTab = this.getTab();
        if (activeTab)
            activeTab = activeTab.config.type;
        data = Ext.apply(data, {
            activeTab,
            blockId: block.getDocId(),
            answersCount: this.getAnswersCount(),
            commentsCount: this.getCommentsCount(),
            reuseCount: this.getReuseCount(),
            hasQuestion: block.hasQuestion(true),
            answerTitle: this.generateAnswerTitle(),
            commentTitle: this.generateCommentTitle(),
            isReusable: block.isReusable,
            hasAnswers: block.isPlaylist || block.isCourse || block.isMapBlock,
            isMine: CJ.User.isMine(block) || CJ.User.isFgaTeacher()
        });
        return this.callParent(args);
    },
    /**
     * @param {Ext.dom.Event} e
     */
    onElementTap(e) {
        const button = e.getTarget('.d-button', 2);
        if (!button)
            return;
        e.stopEvent();
        const type = CJ.Utils.getNodeData(button, 'type'), name = CJ.tpl('{0}tap', type), block = this.getBlock(), fn = CJ.tpl('on{0}ButtonTap', CJ.capitalize(type));
        block.fireEvent(name, block, this);
        if (this[fn])
            this[fn]();
    },
    /**
     * @return {undefined}
     */
    onReuseButtonTap() {
        const block = this.getBlock();
        if (block.isPlaylist)
            CJ.view.block.Assign.popup({ block });
        else
            CJ.view.block.Repost.popup({ block });
    },
    /**
     * @param {Number} count
     */
    updateCommentsCount(count) {
        if (!this.initialized)
            return;
        this.setData({});
    },
    /**
     * @param {Number} count
     */
    updateAnswersCount(count) {
        if (!this.initialized)
            return;
        this.setData({});
    },
    /**
     * @return {String}
     */
    generateCommentTitle() {
        return CJ.Comment.createTitleFromCount(this.getCommentsCount());
    },
    /**
     * @return {String}
     */
    generateAnswerTitle() {
        const count = this.getAnswersCount();
        let title;
        if (count < 2)
            title = 'tool-list-answer';
        else
            title = 'tool-list-answers';
        return CJ.app.t(title);
    },
    /**
     * @param {Object} newData
     */
    updateData(newData) {
        if (!newData)
            return;
        this.headerElement.setHtml(this.getTpl().apply(newData));
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: ['x-unsized'],
            children: [
                {
                    className: 'd-html',
                    reference: 'headerElement'
                },
                {
                    className: 'd-inner',
                    reference: 'innerElement'
                }
            ]
        };
    },
    /**
     * @param {Object} tab
     */
    applyTab(config) {
        if (!config)
            return false;
        const type = config.type;
        let xtype;
        if (type == 'answers')
            xtype = 'view-answers-answers-list';
        else
            xtype = 'view-comments-list-full';
        config = Ext.apply({
            xtype,
            block: this.getBlock()
        }, config);
        return Ext.factory(config);
    },
    /**
     * @param {Ext.Component} newTab
     * @param {Ext.Component} oldTab
     */
    updateTab(newTab, oldTab) {
        const element = this.element;
        if (oldTab) {
            element.removeCls(`tab-${ oldTab.config.type }`);
            oldTab.destroy();
        }
        if (newTab) {
            newTab.addCls('d-tab');
            element.addCls(`tab-${ newTab.config.type }`);
            if (!newTab.config.renderTo)
                newTab.renderTo(this.innerElement);
        }
        this.setData({});
    },
    /**
     * @param {CJ.view.question.Question} question
     * @param {Number} count
     */
    onAnswerSubmit(question, count) {
        this.setAnswersCount(count);
    },
    /**
     * @param {CJ.view.question.Question} question
     * @param {Number} count
     */
    onAnswerDelete(question, count) {
        this.setAnswersCount(count);
    },
    /**
     * @param {Number} count
     */
    onCommentCreate(count) {
        this.setCommentsCount(count);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.getBlock(null);
        const tab = this.getTab();
        if (tab)
            tab.destroy();
        this.callParent(args);
    }
});