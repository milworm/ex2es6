import 'Ext/Container';

/**
 * Class provides popup that wraps any component, just set config content.
 */
Ext.define('CJ.core.view.Popup', {
    extend: 'Ext.Container',
    xtype: 'core-view-popup',
    isPopup: true,
    config: {
        /**
         * @cfg {String} shownCls
         */
        shownCls: 'shown',
        /**
         * @cfg {String} showingCls Defines which className will be applied
         *                          to show the popup.
         */
        showingCls: 'showing',
        /**
         * @cfg {String} showingCls Defines which className will be applied
         *                          to hide the popup.
         */
        hidingCls: 'hiding',
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-popup',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-popup-inner',
        /**
         * @cfg {String} overlayCls
         */
        overlayCls: 'd-popup-overlay',
        /**
         * @cfg {Number} showingEndTimerId
         */
        showingEndTimerId: null,
        layout: 'fit',
        /**
         * @cfg {Boolean|Ext.dom.Element} overlay Popup's wrapper element.
         */
        overlay: true,
        title: null,
        description: null,
        titleBar: true,
        /**
         * @cfg {Ext.Component} content
         */
        content: null,
        bottomBar: false,
        /**
         * @cfg {String} closeButton
         */
        closeButton: 'button-close-text',
        closeConfirm: false,
        actionButton: false,
        fitMode: null,
        isHistoryMember: false,
        /**
         * @cfg {Boolean} isUrlLessHistoryMemeber
         * Should be true in case when popup #isHistoryMember: true, but it doesn't have it's own url. Will be used by
         * CJ.PopupManager in order to correctly manage browser's History system when user closes a popup.
         */
        isUrlLessHistoryMemeber: null,
        /**
         * @cfg {Boolean} isHiding
         * Hiding state of the popup.
         */
        isHiding: false,
        /**
         * @cfg {Boolean} closeOnTap
         */
        closeOnTap: null,
        /**
         * @cfg {String} closeOnTapSelectors
         */
        closeOnTapSelectors: '.d-popup',
        /**
         * @cfg {Boolean} loading Simple flag that adds loading-cls and deny
         *                        user to make a submit.
         */
        loading: null,
        hideAnimationTime: 750,
        showAnimationTime: 2500,
        /**
         * @cfg {Ext.XTemplate} titleBarTpl
         */
        titleBarTpl: Ext.create('Ext.XTemplate', '<tpl if=\'title\'>', '<div class=\'title\'>{title}</div>', '</tpl>', '<tpl if=\'closeButton\'>', '<div class=\'d-popup-close-button\'>{closeButton}</div>', '</tpl>', '<tpl if=\'description\'>', '<div class=\'description\'>{description}</div>', '</tpl>', { compiled: true })
    },
    /**
     * Initialize and show popup.
     */
    constructor() {
        this.onWindowBeforeUnload = this.onWindowBeforeUnload.bind(this);
        this.callParent(args);
        this.show();
        CJ.on('popup.visible', this.makeVisible, this);
        CJ.on('popup.invisible', this.makeInvisible, this);
    },
    /**
     * @param {Boolean} state
     */
    updateLoading(state) {
        this[state ? 'addCls' : 'removeCls']('d-loading');
        this[state ? 'denySubmit' : 'allowSubmit']();
    },
    /**
     * @param {Boolean} overlay
     * @return {Ext.dom.Element}
     */
    applyOverlay(overlay) {
        if (!overlay)
            return false;
        let html = '<div class=\'d-popup-overlay-inner\'></div>', cls = this.getOverlayCls();
        if (!this.getFitMode()) {
            cls += ' showing';
            html = `<div class='d-popup-overlay-mask'></div>${ html }`;
        }
        return Ext.Element.create({
            html,
            cls,
            style: { zIndex: CJ.ZIndexManager.getZIndex() }
        });
    },
    /**
     * @param {Ext.dom.Element} newOverlay
     * @param {Ext.dom.Element} oldOverlay
     */
    updateOverlay(newOverlay, oldOverlay) {
        if (oldOverlay)
            oldOverlay.destroy();
        if (!newOverlay)
            return;
        if (this.getCloseOnTap())
            newOverlay.on('tap', this.onOverlayTap, this);
    },
    /**
     * @param {Ext.Evented} e
     */
    onOverlayTap(e) {
        if (e.getTarget(this.getCloseOnTapSelectors()))
            return false;
        this.hide();
    },
    /**
     * makes popup and mask invisible
     */
    makeInvisible() {
        const el = this.getOverlay() || this.element;
        el.addCls('d-invisible');
    },
    /**
     * restores popup and mask visibility
     */
    makeVisible() {
        const el = this.getOverlay() || this.element;
        el.removeCls('d-invisible');
    },
    /**
     * @param {Boolean} state
     */
    updateFitMode(state) {
        this[state ? 'addCls' : 'removeCls']('fit-mode');
    },
    /**
     * @param {String} text
     * @returns {String}
     */
    applyCloseButton(text) {
        if (!text)
            return false;
        return CJ.app.t(text);
    },
    /**
     * @param {String} title
     */
    updateTitle(title) {
        const titleBar = this.getTitleBar();
        let data;
        if (!titleBar)
            return;
        data = titleBar.getData();
        Ext.apply(data, { title });
        titleBar.setData(data);
    },
    applyCloseConfirm(config) {
        if (!config)
            return false;
        return Ext.apply({
            fn: this.onCloseConfirmHandler,
            scope: this
        }, config);
    },
    /**
     * @param {Object} newConfig
     * @param {Object} oldConfig
     * @return {undefined}
     */
    updateCloseConfirm(newConfig, oldConfig) {
        if (oldConfig && window.onbeforeunload == this.onWindowBeforeUnload)
            window.onbeforeunload = null;
        if (newConfig && !window.onbeforeunload)
            window.onbeforeunload = this.onWindowBeforeUnload;
    },
    /**
     * shows browser's confirm popup to confirm user's action to exit.
     * @return {undefined}
     */
    onWindowBeforeUnload() {
        return CJ.t(this.getCloseConfirm().message, true);
    },
    /**
     * Handler of event 'tap' of close button.
     * Subscribed function should return false for prevent hide popup.
     */
    onCloseButtonTap(e) {
        e.stopEvent();
        this.fireEvent('closebuttontap', this) !== false && this.close();
    },
    close() {
        const closeConfirm = this.getCloseConfirm();
        if (closeConfirm)
            this.showCloseConfirm(closeConfirm);
        else
            this.fireEvent('close', this) !== false && this.hide();
    },
    showCloseConfirm(config undefined this.getCloseConfirm()) {
        CJ.confirm(config.title, config.message, config.fn, config.scope);
    },
    onCloseConfirmHandler(result) {
        if (result == 'yes')
            this.hide();    // if user made forward direction and clicked "yes" on this confirm
                            // we need to process all other popups behind this if needed.
        // if user made forward direction and clicked "yes" on this confirm
        // we need to process all other popups behind this if needed.
        if (this.hideReason == 'history' && CJ.app.getHistory().isHashUpdated())
            CJ.PopupManager.onForwardHistoryStep();
    },
    /**
     * Initialize title bar container.
     * @param {Object/Boolean} config
     * @returns {Ext.Toolbar/Boolean}
     */
    applyTitleBar(config) {
        if (!config)
            return false;
        const title = CJ.t(this.getTitle()), description = CJ.t(this.getDescription()), closeButton = CJ.t(this.getCloseButton());
        config = Ext.apply({
            xtype: 'core-view-component',
            cls: 'd-title-bar d-title-bar-standart description',
            type: 'light',
            tpl: this.getTitleBarTpl(),
            data: {
                title,
                description,
                closeButton
            }
        }, config);
        return Ext.factory(config);
    },
    /**
     * @param {Ext.Component} newBar
     * @param {Ext.Component} oldBar
     * @return {undefined}
     */
    updateTitleBar(newBar, oldBar) {
        if (oldBar)
            oldBar.destroy();
        if (newBar)
            this.insert(0, newBar);
    },
    /**
     * @param {Object} config
     */
    applyBottomBar(config) {
        this.getActionButton();
        if (!config)
            return false;
        return Ext.factory(config);
    },
    updateBottomBar: CJ.Utils.updateComponent,
    /**
     * Initialize action button.
     * @param {Object/Boolean} config
     * @returns {Ext.Button/Boolean}
     */
    applyActionButton(config) {
        if (!config)
            return false;
        config = Ext.apply({
            xtype: 'core-view-component',
            cls: 'action-button',
            type: 'light',
            listeners: {
                tap: this.onActionButtonTap,
                scope: this,
                element: 'element'
            }
        }, config);
        if (config.cls.indexOf('action-button') == -1)
            config.cls += ' ' + 'action-button';
        if (config.iconCls)
            config.cls += ` ${ config.iconCls }`;
        if (config.text)
            config.html = CJ.t(config.text);
        return Ext.factory(config);
    },
    updateActionButton: CJ.Utils.updateComponent,
    /**
     * Handler of event 'tap' of action button.
     * Subscribed function should return false for prevent hide popup.
     */
    onActionButtonTap(e) {
        if (this.getActionButton().getDisabled())
            return;
        this.fireEvent('actionbuttontap', this) !== false && this.hide();
    },
    /**
     * Initialize content component.
     * @param {Ext.Component/Object} config
     * @returns {Ext.Component}
     */
    applyContent(config) {
        if (!config)
            return false;
        if (config.isInstance) {
            Ext.callback(config.setPopup, config, [this]);
        } else {
            config.popup = this;
            config = Ext.factory(config);
        }
        config.addCls('d-popup-content');
        return config;
    },
    /**
     * @param {Ext.Component} newContent
     * @param {Ext.Component} oldContent
     */
    updateContent(newContent, oldContent) {
        if (oldContent)
            oldContent.destroy();
        if (!newContent)
            return;
        let index = 0;
        if (this.getTitleBar())
            index = 1;
        else
            index = 0;
        this.insert(index, newContent);
    },
    /**
     * renders the popup into created overlay node
     */
    overlayRender() {
        const overlay = this.getOverlay();
        this.renderTo(overlay.dom.lastChild);
        this.setParent(Ext.Viewport);
        Ext.Viewport.bodyElement.appendChild(overlay);
        this.setRendered(true);
    },
    /**
     * Show popup.
     */
    show() {
        CJ.fire('popupshow', this);
        Ext.Viewport.hideKbd();
        this.overlayRender();
        this.callParent(args);
        const focusedComponent = this.down('[isAutoFocus]');
        if (focusedComponent)
            focusedComponent.focus();
        CJ.PopupManager.onShow(this);
        const timerId = Ext.defer(this.onShown, this.getShowAnimationTime(), this);
        this.setShowingEndTimerId(timerId);
        this.addCls(this.getShowingCls());
    },
    /**
     * @return {undefined}
     */
    onShown() {
        this.replaceCls(this.getShowingCls(), this.getShownCls());
        if (!this.getFitMode())
            this.getOverlay().removeCls('showing');    // Because of bug in IE:
                                                       // During showing a popup IE shows the scrollbar(if needed),
                                                       // but right after IE removes the scrollbar (don't know why), so
                                                       // in order to ask IE to recalculate the height and show scrollbar
                                                       // we need to tigger redraw()
                                                       //     this.getContent().innerElement.redraw();
                                                       // if(Ext.browser.is.IE)
                                                       //     this.innerElement.setHeight(this.element.getHeight());
    },
    /**
     * Initialize hide animation.
     * @param {Number} delay
     */
    hide(delay) {
        if (this.getIsHiding())
            return;
        clearTimeout(this.getShowingEndTimerId());
        this.setIsHiding(true);
        CJ.fire('popuphide', this);
        CJ.PopupManager.onHide(this);
        Ext.defer(function () {
            CJ.Animation.animate({
                el: this.element,
                cls: this.getHidingCls(),
                before: this.beforeHideAnimation,
                after: this.onHideAnimationEnd,
                scope: this,
                maxDelay: this.getHideAnimationTime()
            });
        }, delay || 0, this);
    },
    /**
     * method will be called before we start hiding process.
     * @return {undefined}
     */
    beforeHideAnimation() {
        if (!this.getFitMode())
            this.getOverlay().addCls('hiding');
        this.element.removeCls(this.getShownCls());
    },
    /**
     * Callback of hide animation.
     */
    onHideAnimationEnd() {
        CJ.PopupManager.openPopupCount--;
        this.fireEvent('hide', this);
        this.setOverlay(false);
        this.destroy();
    },
    /**
     * Change action button to display error msg
     */
    setActionButtonErrorMsg(message) {
        const button = this.getActionButton();
        if (message) {
            button.pending = button.getHtml();
            button.addCls('error');
            button.setHtml(CJ.t(message));
        } else {
            if (button.pending) {
                button.setHtml(button.pending);
                button.pending = null;
            }
            button.removeCls('error');
        }
    },
    /**
     * simply disables an action button
     */
    denySubmit(message) {
        const actionButton = this.getActionButton();
        if (actionButton) {
            actionButton.setDisabled(true);
            actionButton.addCls('deny-submit');
            if (message)
                this.setActionButtonErrorMsg(message);
        }
    },
    /**
     * simply enables an action button
     */
    allowSubmit() {
        const actionButton = this.getActionButton();
        if (actionButton) {
            actionButton.setDisabled(false);
            actionButton.removeCls('deny-submit');
            this.setActionButtonErrorMsg(false);
        }
    },
    /**
     * @return {undefined}
     */
    destroy() {
        if (this.getIsHistoryMember())
            CJ.fire('historymember.hide', this);
        clearTimeout(this.getShowingEndTimerId());
        this.callParent(args);
        this.setContent(null);
        this.setTitleBar(null);
        this.setCloseConfirm(null);
        CJ.un('popup.visible', this.makeVisible, this);
        CJ.un('popup.invisible', this.makeInvisible, this);
    }
});