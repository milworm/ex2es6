import 'Ext/Evented';

/**
 * Class is used to manage/use popups with history
 * The workflow:
 * onpopstate - will trigger ...
 * Before executing controller's action app will call #cancelPopups method
 * to close visible popups. In order to do it #cancelPopups method will use 
 * PopupManager by calling #hideActive, which finds the top-most popup in 
 * stack and tries to hide it using #hide method where the #onHide method
 * stats acting.
 * So, #onHide method will just remove the currently active popup from stack and
 * 
 */
Ext.define('CJ.core.PopupManager', {
    extend: 'Ext.Evented',
    alternateClassName: 'CJ.PopupManager',
    singleton: true,
    openPopupCount: 0,
    config: {
        /**
         * @cfg {Array} stack
         */
        stack: [],
        /**
         * @cfg {CJ.view.nav.popup.Base} active
         */
        active: null
    },
    /**
     * @return {undefined}
     */
    init() {
        CJ.app.on('urlchange', this.onUrlChange, this);
    },
    /**
     * @param {String} direction
     */
    onUrlChange(direction) {
        if (CJ.History.keepPopups) {
            delete CJ.History.keepPopups;
            return;
        }    // do nothing in case when no popups found.
        // do nothing in case when no popups found.
        if (!this.exists())
            return;
        if (direction == 'backward')
            this.onBackwardHistoryStep();
        else
            this.onForwardHistoryStep();
        return false;
    },
    /**
     * @param {Object} item
     */
    push(item) {
        this.setActive(item);
        this.getStack().push(item);
    },
    /**
     * @param {Boolean} silent
     */
    pop(silent) {
        const stack = this.getStack();
        stack.pop();
        this.setActive(stack[stack.length - 1]);
    },
    /**
     * @param {Ext.Component} popup
     */
    onShow(popup) {
        this.openPopupCount++;
        this.push(popup);
    },
    /**
     * method will be called when user entered new url in address bar,
     * so user moved forward in browser's history.
     * @return {undefined}
     */
    onForwardHistoryStep() {
        const appHistory = CJ.History;
        while (this.exists()) {
            const popup = this.getActive();
            popup.hideReason = 'history';    // some popups like tag-search doesn't have this method
            // some popups like tag-search doesn't have this method
            if (Ext.ComponentQuery.is(popup, '[closeConfirm]'))
                return popup.showCloseConfirm();
            popup.hide();    // for Ext.Msg we need to call it manually
            // for Ext.Msg we need to call it manually
            if (popup == Ext.Msg)
                this.onHide(popup);
        }    // popup manager performs all required actions to close all popups
             // and now it's ready to process forwarder url.
        // popup manager performs all required actions to close all popups
        // and now it's ready to process forwarder url.
        CJ.History.processCurrentUrl();
    },
    /**
     * method will be called when user pressed browser's back button.
     * so user moved backward in browser's history.
     * @return {undefined}
     */
    onBackwardHistoryStep() {
        const popup = this.getActive(), appHistory = CJ.History, isHistoryMember = Ext.ComponentQuery.is(popup, '[isHistoryMember]'), isUrlLessHistoryMemeber = Ext.ComponentQuery.is(popup, '[isUrlLessHistoryMemeber]');    // it's not a history-member popup, so as user clicked browser's back
                                                                                                                                                                                                                              // button we just need to return location to correct previous state,
                                                                                                                                                                                                                              // by doing forward, but without executing controller's action.
        // it's not a history-member popup, so as user clicked browser's back
        // button we just need to return location to correct previous state,
        // by doing forward, but without executing controller's action.
        if (!(isHistoryMember && !isUrlLessHistoryMemeber)) {
            appHistory.preventAction = true;
            appHistory.toNextState();
        }
        popup.hideReason = 'history';    // some popups like tag-search doesn't have this method
        // some popups like tag-search doesn't have this method
        if (Ext.ComponentQuery.is(popup, '[closeConfirm]'))
            return popup.showCloseConfirm();
        popup.hide();    // for Ext.Msg we need to call it manually
        // for Ext.Msg we need to call it manually
        if (popup == Ext.Msg)
            this.onHide(popup);
    },
    /**
     * @param {CJ.core.view.Popup} popup
     * @param {Boolean} fromHistory True in case when we are current processing
     *                              changing a state.
     */
    onHide(popup) {
        this.pop();
        const appHistory = CJ.History, direction = appHistory.getDirection(), declined = popup.lastAnswer == Ext.MessageBox.NO.itemId, hideReason = popup.hideReason;
        delete popup.hideReason;    // user typed new url and pressed enter, we shown confirmation,
                                    // user pressed "no" in confirmation popup, so we need to return
                                    // the url back to it's previous state.
        // user typed new url and pressed enter, we shown confirmation,
        // user pressed "no" in confirmation popup, so we need to return
        // the url back to it's previous state.
        if (CJ.History.isHashUpdated()) {
            if (popup == Ext.Msg && direction == 'forward' && declined) {
                appHistory.preventAction = true;
                appHistory.toPrevState();
            }
        }
        if (!Ext.ComponentQuery.is(popup, '[isHistoryMember]'))
            return;
        if (Ext.ComponentQuery.is(popup, '[isUrlLessHistoryMemeber]'))
            return;
        if (hideReason == 'history' && direction == 'backward') {
            CJ.HISTORY_MEMBER_CLOSED = true;    // for example course|map|playlist editor or viewer.
            // for example course|map|playlist editor or viewer.
            if (!this.isHistoryMemberActive())
                appHistory.processCurrentUrl();
        } else if (hideReason != 'history') {
            CJ.HISTORY_MEMBER_CLOSED = true;    // for example course|map|playlist editor or viewer exists.
            // for example course|map|playlist editor or viewer exists.
            if (this.isHistoryMemberActive())
                appHistory.preventAction = true;
            appHistory.toPrevState();
        }
    },
    /**
     * @return {Number} count of avaible popups.
     */
    exists() {
        return this.getStack().length > 0;
    },
    /**
     * hides current popup.
     */
    hideActive() {
        const popup = this.getActive();
        popup && popup.hide();
    },
    /**
     * Return number of open popups
     * @returns {Number}
     */
    getOpenPopupCount() {
        return this.openPopupCount;
    },
    /**
     * hides all opened popups.
     * method uses some delay before executing #hide(), 
     * it's so because of 2 reasons:
     *  to don't break the history, as some popups can be a history members,
     *  so hiding a popup will change the url and in order to give browser some
     *  time to fire hashchange-event, we need to wait a bit.
     *  to avoid running all animations at once.
     * @param {Function} callback
     */
    hideAll(callback) {
        const manager = CJ.PopupManager, stack = manager.getStack();
        for (var i = 0, l = stack.length; i < l; i++) {
            Ext.defer(() => {
                manager.hideActive();
            }, i * 500);
        }
        if (callback)
            Ext.defer(callback, i * 500);
    },
    /**
     * @return {Boolean} true in case when active popup is active and it has url.
     */
    isHistoryMemberActive() {
        if (!this.exists())
            return false;
        const popup = this.getActive(), isHistoryMember = Ext.ComponentQuery.is(popup, '[isHistoryMember]'), isUrllessHistoryMemeber = Ext.ComponentQuery.is(popup, '[isUrlLessHistoryMemeber]');
        return isHistoryMember || isUrllessHistoryMemeber;
    }
});