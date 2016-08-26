/**
 * Defines block's bottom-bar of default block for multicolumn feed.
 */
Ext.define('CJ.view.block.toolbar.MulticolumnBottomBar', {
    alias: 'widget.view-block-toolbar-multicolumn-bottom-bar',
    /**
     * @property {Ext.XTemplate} tpl
     */
    tpl: Ext.create('Ext.XTemplate', '<div class="d-bottom-bar d-light-bottom-bar d-multicolumn-bottom-bar">', '<div class="d-html">', '<tpl if="isReusable">', '<div class="d-button d-reuse-button" data-type="reuse">{reuseCount}</div>', '</tpl>', '<tpl if="hasQuestion">', '<a class="d-button d-answers-button" data-type="answers" href="#!m/{blockId}/a" onclick="return false;">', '{answersCount} <span>{answerTitle}</span>', '</a>', '</tpl>', '<tpl if="hasAnswers && values.isMine">', '<div class="d-button d-answers-button d-no-count" data-type="answers"></div>', '</tpl>', '<a class="d-button d-comments-button" data-type="comments" href="#!m/{blockId}/c" onclick="return false;">', '{commentTitle}', '</a>', '</div>', '</div>'),
    getData() {
        const config = this.initialConfig, block = config.block;
        return {
            blockId: block.getDocId(),
            answersCount: this.answersCount,
            commentsCount: this.commentsCount,
            reuseCount: '',
            hasQuestion: block.hasQuestion(true),
            answerTitle: this.generateAnswerTitle(),
            commentTitle: this.generateCommentTitle(),
            isReusable: block.isReusable,
            hasAnswers: block.isPlaylist || block.isCourse || block.isMapBlock,
            isMine: CJ.User.isMine(block) || CJ.User.isFgaTeacher()
        };
    },
    update() {
        if (!this.rendered)
            return;
        this.element.innerHTML = this.tpl.apply(this.getData());
    },
    initBlock(block undefined this.initialConfig.block) {
        if (!block)
            return;
        block.on({
            scope: this,
            answersubmit: this.onAnswerSubmit,
            answerdelete: this.onAnswerDelete,
            commentcreate: this.onCommentCreate
        });
        this.block = block;
    },
    constructor(config) {
        this.initialConfig = config;
        this.initBlock();
        this.answersCount = this.block.getAnswersCount();
        this.commentsCount = this.block.getCommentsCount();
        this.renderTo();
    },
    renderTo(element undefined this.initialConfig.renderTo) {
        if (!element)
            return;
        element.innerHTML = this.tpl.apply(this.getData());
        this.element = element.querySelector('.d-multicolumn-bottom-bar');
        this.rendered = true;
    },
    /**
     * @param {Ext.dom.Event} e
     * @param {HTMLElement} button
     */
    onButtonTap(e, button) {
        e.stopEvent();
        const type = CJ.Utils.getNodeData(button, 'type'), name = CJ.tpl('{0}tap', type), block = this.block, fn = CJ.tpl('on{0}ButtonTap', CJ.capitalize(type));
        block.fireEvent(name, block, this);
        if (this[fn])
            this[fn]();
    },
    /**
     * @return {undefined}
     */
    onReuseButtonTap() {
        if (this.block.isPlaylist)
            CJ.view.block.Assign.popup({ block: this.block });
        else
            CJ.view.block.Repost.popup({ block: this.block });
    },
    /**
     * @return {String}
     */
    generateCommentTitle() {
        return CJ.Comment.createTitleFromCount(this.commentsCount);
    },
    /**
     * @return {String}
     */
    generateAnswerTitle() {
        const count = this.answersCount;
        let title;
        if (count < 2)
            title = 'tool-list-answer';
        else
            title = 'tool-list-answers';
        return CJ.app.t(title);
    },
    /**
     * @param {CJ.view.question.Question} question
     * @param {Number} count
     */
    onAnswerSubmit(question, count) {
        this.answersCount = count;
        this.update();
    },
    /**
     * @param {CJ.view.question.Question} question
     * @param {Number} count
     */
    onAnswerDelete(question, count) {
        this.answersCount = count;
        this.update();
    },
    /**
     * @param {Number} count
     */
    onCommentCreate(count) {
        this.commentsCount = count;
        this.update();
    },
    /**
     * @return {undefined}
     */
    destroy() {
        if (this.block)
            this.block.un({
                scope: this,
                answersubmit: this.onAnswerSubmit,
                answerdelete: this.onAnswerDelete,
                commentcreate: this.onCommentCreate
            });
        this.tpl.destroy();
        delete this.element;
        delete this.block;
        delete this.tpl;
    }
});