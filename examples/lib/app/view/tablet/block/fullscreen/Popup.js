import 'app/view/block/fullscreen/Popup';

Ext.define('CJ.view.tablet.block.fullscreen.Popup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.fullscreen.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-tablet-block-fullscreen-popup',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} trackOverlayHover
         */
        trackOverlayHover: false,
        /**
         * @cfg {Ext.Component} answersList
         */
        answersList: null,
        /**
         * @cfg {Ext.Component} commentsList
         */
        commentsList: null
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [{
                    reference: 'innerElement',
                    className: 'x-inner',
                    children: [
                        {
                            reference: 'topElement',
                            className: 'd-top-element',
                            children: [
                                { className: 'd-left-element' },
                                {
                                    className: 'd-right-element',
                                    children: [
                                        {
                                            reference: 'answersFilterElement',
                                            className: 'd-answer-filter-element d-left'
                                        },
                                        {
                                            className: 'd-popup-close-button d-right',
                                            html: CJ.t('button-close-text')
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            reference: 'contentElement',
                            className: 'd-content-element',
                            children: [
                                {
                                    reference: 'blockElement',
                                    className: 'd-block-element'
                                },
                                {
                                    reference: 'tabElement',
                                    className: 'd-tab-element'
                                }
                            ]
                        },
                        {
                            reference: 'bottomElement',
                            className: 'd-bottom-element',
                            children: [
                                {
                                    reference: 'bottomButtonElement',
                                    className: 'd-bottom-button-element'
                                },
                                {
                                    reference: 'bottomContentElement',
                                    className: 'd-bottom-content-element'
                                }
                            ]
                        }
                    ]
                }]
        };
    },
    constructor() {
        this.callParent(args);
        this.bottomButtonElement.on('tap', this.onBottomButtonElementTap, this);
    },
    /**
     * @param  {String} newState
     * @param  {Function} callback
     */
    fromClosedStateEnd(newState, callback) {
        if (newState == 'collapsed') {
            this.setLoading(false);
            callback();
        } else {
            // load comments and answers (if needed);
            this.load(callback);
        }
    },
    /**
     * @return {undefined}
     */
    initBars() {
        if (this.getActionBar())
            return;
        this.setActionBar({ renderTo: this.element.dom.querySelector('.d-left-element') });
    },
    /**
     * @param  {CJ.view.block.BaseBlock} newBlock
     */
    updateBlock(newBlock) {
        this.callParent(args);
        if (newBlock)
            this.onCommentCreate(newBlock.getCommentsCount());
    },
    /**
     * @param {Ext.Evented} e
     */
    onBottomButtonElementTap(e) {
        let url, state;
        if (this.getState() == 'comments') {
            state = 'answers';
            url = '!m/{0}/a';
        } else {
            state = 'comments';
            url = '!m/{0}/c';
        }
        CJ.History.replaceState(CJ.tpl(url, this.getBlockId()));
        this.setState(state);
    },
    /**
     * @param  {CJ.view.block.BaseBlock} newBlock
     * @param  {CJ.view.block.BaseBlock} oldBlock
     * @return {CJ.view.block.BaseBlock}
     */
    applyBlock(newBlock, oldBlock) {
        newBlock = this.callParent(args);
        if (newBlock)
            newBlock.on('commentcreate', this.onCommentCreate, this);
        return newBlock;
    },
    /**
     * @param  {Number} count
     * @return {undefined}
     */
    onCommentCreate(count) {
        this.bottomButtonElement.setHtml(CJ.Comment.createTitleFromCount(count));
    },
    /**
     * simply closes popup in case when user taps on the overlay
     * @param {Ext.dom.Event} e
     */
    onOverlayTap(e) {
        if (e.getTarget('.d-block, .d-top-element, .d-bottom-element, .d-tab-element'))
            return;
        this.hide();
    },
    /**
     * @param  {String}   newState
     * @param  {Function} callback
     * @return {undefined}
     */
    fromCollapsedState(newState, callback) {
        const blockElement = this.blockElement;
        CJ.Animation.animate({
            el: blockElement,
            cls: 'd-hiding-block',
            scope: this,
            maxDelay: 500,
            after() {
                this.fromCollapsedStateEnd(newState, callback);
            }
        });
    },
    /**
     * @param  {String}   newState
     * @param  {Function} callback
     */
    fromCollapsedStateEnd(newState, callback) {
        this.removeCls('d-state-collapsed');
        this.blockElement.removeCls('d-hiding-block');
        this.load(callback);
    },
    /**
     * Loads comments and answers.
     * @param  {Function} callback
     */
    load(callback) {
        this.setLoading(true);
        const block = this.getBlock(), blockId = this.getBlockId(), questionExists = block.hasQuestion(true);
        CJ.Ajax.initBatch();
        if (questionExists)
            CJ.view.answers.List.initialLoad(blockId, { loadMask: false });
        CJ.Comment.loadItems(blockId);
        CJ.Ajax.runBatch(Ext.bind(function (batch) {
            const responses = batch.responses;
            let index = 0;
            if (questionExists)
                this.setAnswersList({
                    answers: batch.responses[index++].ret,
                    block
                });
            this.setCommentsList({
                comments: batch.responses[index++].ret,
                block
            });
            this.setLoading(false);
            callback();
        }, this));
    },
    /**
     * @param {String} newState
     * @param {Function} callback
     */
    fromAnswersState(newState, callback) {
        callback();
    },
    /**
     * @param {String} oldState
     */
    toAnswersState(oldState) {
        this.expand();
    },
    /**
     * @param {String} newState
     * @param {Function} callback
     */
    fromCommentsState(newState, callback) {
        this.removeCls('d-state-comments');
        callback();
    },
    /**
     * @param  {String} oldState
     */
    toCommentsState(oldState) {
        this.expand();
        Ext.defer(function () {
            this.addCls('d-state-comments');
        }, [
            'closed',
            'collapsed'
        ].indexOf(oldState) > -1 ? 2000 : 0, this);
    },
    expand() {
        this.initBars();
        this.addCls('d-expanded');
        Ext.defer(function () {
            this.addCls('d-expanded-shown');
        }, 1500, this);
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    applyCommentsList(config, oldList) {
        if (oldList)
            oldList.destroy();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            type: 'comments',
            xtype: 'view-comments-list-modal',
            renderTo: this.bottomContentElement
        }, config));
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    applyAnswersList(config, oldList) {
        if (oldList)
            oldList.destroy();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            type: 'answers',
            xtype: 'view-answers-fullscreen-list',
            filterRenderTo: this.answersFilterElement,
            renderTo: this.tabElement
        }, config));
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setCommentsList(null);
        this.setAnswersList(null);
    }
});