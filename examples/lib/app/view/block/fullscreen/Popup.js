import 'app/core/view/Popup';
import 'app/view/block/fullscreen/ActionBar';

/**
 * Defines a popup to show block in a fullscreen popup.
 */
Ext.define('CJ.view.block.fullscreen.Popup', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Popup',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-block-fullscreen-popup',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} tabBar
         */
        titleBar: false,
        /**
         * @cfg {String} showingCls
         */
        showingCls: 'd-block-fullscreen-popup-showing',
        /**
         * @cfg {String} showingCls
         */
        hidingCls: 'd-block-fullscreen-popup-hiding',
        /**
         * @cfg {String} cls
         */
        cls: 'd-block-fullscreen-popup',
        /**
         * @cfg {String} overlayCls
         */
        overlayCls: 'd-popup-overlay d-popup-fullscreen-overlay',
        /**
         * @cfg {Boolean} isHistoryMember
         */
        isHistoryMember: true,
        /**
         * @cfg {String} state Defines popup's state that can be one of:
         *                     closed, collapsed, comments, answers.
         */
        state: null,
        /**
         * @cfg {Boolean} loading
         */
        loading: null,
        /**
         * @cfg {Boolean} tabLoading
         */
        tabLoading: null,
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {Number} blockId
         */
        blockId: null,
        /**
         * @cfg {Ext.Component} tab
         */
        tab: null,
        /**
         * @cfg {Object} tabBar Contains buttons to switch current tab
         *                      (answers/comments)
         */
        tabBar: null,
        /**
         * @cfg {Object} actionBar Contains block's actions buttons, like:
         *                         add to group, share.
         */
        actionBar: null,
        /**
         * @cfg {Boolean} trackOverlayHover
         */
        trackOverlayHover: true,
        /**
         * @cfg {Object} blockListeners Contains any additional listeners
         *                              you want to add to a block.
         */
        blockListeners: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.onOverlayHover = Ext.bind(this.onOverlayHover, this);
        config.state = config.state || 'collapsed';
        const block = CJ.byDocId(config.blockId);
        if (block)
            Ext.apply(config, { block: block.serialize('local') });
        return this.callParent(args);
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
            children: [
                {
                    reference: 'innerElement',
                    className: 'x-inner',
                    children: [
                        {
                            reference: 'leftElement',
                            className: 'd-left-element'
                        },
                        {
                            reference: 'blockElement',
                            className: 'd-block-element'
                        },
                        {
                            reference: 'tabElement',
                            className: 'd-tab-element'
                        },
                        {
                            reference: 'rightElement',
                            className: 'd-right-element'
                        }
                    ]
                },
                {
                    reference: 'closeElement',
                    className: 'd-popup-close-button',
                    html: CJ.t('button-close-text')
                }
            ]
        };
    },
    /**
     * @param {Boolean} state
     */
    updateLoading(state) {
        this[state ? 'addCls' : 'removeCls']('d-loading');
    },
    /**
     * @param {Boolean} state
     */
    updateTabLoading(state) {
        this.tabElement[state ? 'addCls' : 'removeCls']('d-loading');
    },
    /**
     * @param {String} newState
     * @param {String} oldState
     */
    updateState(newState, oldState undefined 'closed') {
        const from = CJ.tpl('from{0}State', CJ.capitalize(oldState)), to = CJ.tpl('to{0}State', CJ.capitalize(newState)), me = this;
        if (!me[from])
            return Ext.callback(me[to], me, [oldState]);
        me[from](newState, () => {
            Ext.callback(me[to], me, [oldState]);
        });
    },
    /**
     * @param {String} newState
     * @param {Function} callback
     */
    fromClosedState(newState, callback) {
        const block = this.getBlock();
        if (block)
            return this.fromClosedStateEnd(newState, callback);
        this.setLoading(true);
        CJ.Block.load(this.getBlockId(), {
            scope: this,
            success(response) {
                this.setBlock(response.ret);
                this.fromClosedStateEnd(newState, callback);
            }
        });
    },
    /**
     * @param  {String} newState
     * @param  {Function} callback
     */
    fromClosedStateEnd(newState, callback) {
        this.setLoading(false);
        callback();
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
        this.removeCls([
            'd-state-collapsed',
            'd-state-collapsed-shown'
        ]);
        this.blockElement.removeCls('d-hiding-block');
        callback();
    },
    expand() {
        this.initBars();
        this.addCls('d-expanded');
        Ext.defer(function () {
            this.addCls('d-expanded-shown');
        }, 1500, this);
    },
    /**
     * @param {String} oldState
     */
    toCollapsedState(oldState) {
        this.addCls('d-state-collapsed');
        Ext.defer(function () {
            this.addCls('d-state-collapsed-shown');
        }, 500, this);
    },
    /**
     * @param {String} newState
     * @param {Function} callback
     */
    fromCommentsState(newState, callback) {
        this.getBlock().getBottomBar().setTab(null);
        this.removeCls('d-state-comments');
        callback();
    },
    /**
     * @param {String} oldState
     */
    toCommentsState(oldState) {
        this.expand();
        const wasClosed = [
            'closed',
            'collapsed'
        ].indexOf(oldState) > -1;
        Ext.defer(this.runToCommentsState, wasClosed ? 500 : 0, this);
    },
    /**
     * method will be called when popup's showing animation ends, starts loading comments.
     * @return {undefined}
     */
    runToCommentsState() {
        this.setTabLoading(true);
        this.addCls('d-state-comments');
        const blockId = this.getBlock().getDocId();
        return Promise.resolve().then(() => CJ.Comment.loadDefaultTab(blockId)).then(response => {
            this.onCommentsLoadSuccess(response);
        });
    },
    /**
     * @param {String} newState
     * @param {Function} callback
     */
    fromAnswersState(newState, callback) {
        this.getBlock().getBottomBar().setTab(null);
        this.removeCls('d-state-answers');
        callback();
    },
    /**
     * @param {String} oldState
     */
    toAnswersState(oldState) {
        this.expand();    // wait for expand-animation.
        // wait for expand-animation.
        Ext.defer(function () {
            this.setTabLoading(true);
            this.addCls('d-state-answers');
            CJ.view.answers.List.initialLoad(this.getBlock().getDocId(), {
                groupId: this.initialConfig.answersGroupId,
                loadMask: false,
                scope: this,
                success: this.onAnswersLoadSuccess
            });
            delete this.initialConfig.answersGroupId;
        }, [
            'closed',
            'collapsed'
        ].indexOf(oldState) > -1 ? 500 : 0, this);
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onAnswersLoadSuccess(response, request) {
        response.ret.request = request;
        this.addCls('d-showing-sidebars');
        this.setTabLoading(false);
        const tabBar = this.getTabBar();
        if (tabBar)
            tabBar.setValue('answers');
        this.setTab({
            type: 'answers',
            xtype: 'view-answers-fullscreen-list',
            answers: response.ret,
            renderTo: this.tabElement
        });    // if user opens this popup from gradetable
               // we need to set correct filtering key (if present)
        // if user opens this popup from gradetable
        // we need to set correct filtering key (if present)
        if (this.initialConfig.answersKey) {
            const filter = this.getTab().getFilter();
            filter.setKey(this.initialConfig.answersKey);
            delete this.initialConfig.answersKey;
        }    // @TODO seems that there is no another solution ...
             // as we need to show filter and list separately with animation,
             // we should have parent with overflow: visible, but when animation ends
             // we need to show scroll if needed so overflow: auto is needed.
        // @TODO seems that there is no another solution ...
        // as we need to show filter and list separately with animation,
        // we should have parent with overflow: visible, but when animation ends
        // we need to show scroll if needed so overflow: auto is needed.
        Ext.defer(function () {
            // user could close popup, or switch to another tab.
            try {
                this.getBlock().getBottomBar().getTab().addCls('d-shown');
            } catch (e) {
            }
        }, 1000, this);
    },
    /**
     * @param {Object} config
     * @param {String} config.type
     * @param {Object} config.ret
     * @param {undefined}
     */
    onCommentsLoadSuccess(config) {
        this.addCls('d-showing-sidebars');
        this.setTabLoading(false);
        const tabBar = this.getTabBar();
        if (tabBar)
            tabBar.setValue('comments');
        this.setTab({
            type: 'comments',
            xtype: 'view-comments-list-modal',
            renderTo: this.tabElement,
            activeTab: config.type,
            comments: config.ret
        });
    },
    /**
     * @param {Object} config
     */
    applyBlock(config) {
        if (!config)
            return false;
        config = Ext.apply(config, { isModal: true });
        const listeners = this.getBlockListeners();
        config = Ext.factory(config);
        config.setParent(this);
        config.on('saved', this.onBlockSaved, this);
        if (listeners)
            config.on(listeners);
        return config;
    },
    /**
     * @param {CJ.view.block.BaseBlock} newBlock
     * @param {CJ.view.block.BaseBlock} oldBlock
     */
    updateBlock(newBlock, oldBlock) {
        if (oldBlock)
            oldBlock.destroy();
        if (newBlock)
            newBlock.renderTo(this.blockElement);
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     */
    onBlockSaved(block) {
        const state = this.getState();
        if (state == 'collapsed')
            return;
        const questionExists = block.hasQuestion(true);
        this.getTabBar().setDisabledButtons(questionExists ? [] : ['answers']);
        switch (state) {
        case 'comments':
            return this.toCommentsState();
        case 'answers': {
                if (!questionExists) {
                    CJ.History.replaceState(CJ.tpl('!m/{0}/c', block.getDocId()));
                    return this.setState('comments');
                }
                return this.toAnswersState();
            }
        }
    },
    /**
     * @param {Object} newConfig
     * @param {Object} oldConfig
     */
    updateTab(newConfig, oldConfig) {
        this.getBlock().getBottomBar().setTab(newConfig);
    },
    /**
     * @return {Ext.Component}
     */
    getTab() {
        return this.getBlock().getBottomBar().getTab();
    },
    /**
     * @param {Object} newBar
     * @param {Object} oldBar
     */
    applyActionBar(newBar, oldBar) {
        if (!newBar)
            return false;
        return Ext.factory(Ext.apply({
            block: this.getBlock(),
            cls: 'd-left-bar',
            xtype: 'view-block-fullscreen-action-bar'
        }, newBar));
    },
    /**
     * @param {Ext.Component} newBar
     * @param {Ext.Component} oldBar
     */
    updateActionBar(newBar, oldBar) {
        if (oldBar)
            oldBar.destroy();
    },
    /**
     * @param {Object} newBar
     * @param {Object} oldBar
     */
    applyTabBar(newBar, oldBar) {
        if (!newBar)
            return false;
        const disabledButtons = [];
        if (!this.getBlock().hasQuestion(true))
            disabledButtons.push('answers');
        return Ext.factory(Ext.apply({
            xtype: 'view-light-segmented-button',
            cls: 'd-right-bar',
            disabledButtons,
            pressed: this.getState(),
            buttons: [
                {
                    value: 'answers',
                    cls: 'd-answers',
                    text: CJ.t('view-block-fullscreen-answers')
                },
                {
                    value: 'comments',
                    cls: 'd-comments',
                    text: CJ.t('view-block-fullscreen-comments')
                }
            ],
            listeners: {
                scope: this,
                itemtap: this.onTabBarItemTap
            }
        }, newBar));
    },
    /**
     * @param {Object} newBar
     * @param {Object} oldBar
     */
    updateTabBar(newBar, oldBar) {
        if (oldBar)
            oldBar.destroy();
    },
    /**
     * @param {Ext.Component} field
     * @param {String} type
     */
    onTabBarItemTap(field, type) {
        const block = this.getBlock();
        block.fireEvent(`${ type }tap`, block);
        this.setState(type);
    },
    /**
     * @param {Ext.Element} overlay
     */
    updateOverlay(newOverlay, oldOverlay) {
        const trackOverlayHover = this.getTrackOverlayHover();
        if (newOverlay) {
            newOverlay.on('tap', this.onOverlayTap, this);    // ST doesn't handle mouseevent, so need to use JS API here.
            // ST doesn't handle mouseevent, so need to use JS API here.
            if (trackOverlayHover)
                newOverlay.dom.addEventListener('mouseover', this.onOverlayHover);
        }
        if (oldOverlay && trackOverlayHover)
            oldOverlay.dom.removeEventListener('mouseover', this.onOverlayHover);
        this.callParent(args);
    },
    /**
     * simply closes popup in case when user taps on the overlay
     * @param {Ext.dom.Event} e
     */
    onOverlayTap(e) {
        // @TODO it's temporary.
        // .d-comments-list is needed because as we don't have the maximum level of replies, ST can't reach other
        // selectors
        if (e.getTarget('.d-block, .d-left-bar, .d-right-bar, .d-tab', '.d-comments-list'))
            return;
        this.onCloseButtonTap(e);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onCloseButtonTap(e) {
        e.stopEvent();
        this.hide();
    },
    /**
     * also destroyes non-children components
     */
    destroy() {
        this.setBlock(null);
        this.setActionBar(null);
        this.setTabBar(null);
        this.callParent(args);
    },
    /**
     * @param {Event} e
     */
    onOverlayHover(e) {
        e = new Ext.event.Dom(e);
        const overlay = this.getOverlay();
        if (e.getTarget('.d-block, .d-left-bar, .d-right-bar, .d-tab'))
            overlay.removeCls('d-hover');
        else
            overlay.addCls('d-hover');
    },
    /**
     * creates required action/tab bars
     * @return {[type]}
     */
    initBars() {
        if (!this.getActionBar())
            this.setActionBar({ renderTo: this.leftElement });
        if (!this.getTabBar())
            this.setTabBar({ renderTo: this.rightElement });
    }
});