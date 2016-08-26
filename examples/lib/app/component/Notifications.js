Ext.define('CJ.component.Notifications', {
    alternateClassName: 'CJ.Notifications',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    config: {
        /**
         * @cfg {Number} serverUpdateInterval
         */
        serverUpdateInterval: 60000,
        /**
         * @cfg {Number} unseen
         */
        unseen: 0,
        /**
         * @cfg {Number} serverUpdateInterval
         */
        timer: false,
        /**
         * @cfg {CJ.core.view.Popover} notificationFeedback
         */
        notificationFeedback: null,
        /**
         * @cfg {Boolean} showNotificationFeature
         */
        showNotificationFeature: false
    },
    /**
     * @inheritdoc
     */
    constructor(config) {
        this.callParent(args);
        this.initConfig(config);
        CJ.on('notifications.do', this.onNotificationsDo, this);
        CJ.on('language.change', this.onLanguageChange, this);
        CJ.User.on('session.reinit', this.toggleNotifications, this);
    },
    /**
     * @inheritdoc
     */
    destroy() {
        CJ.un('notifications.do', this.onNotificationsDo, this);
        CJ.un('language.change', this.onLanguageChange, this);
        CJ.User.un('session.reinit', this.toggleNotifications, this);
        this.setTimer(false);
        this.callParent(args);
    },
    /**
     * toggles the notification system ( on or off)
     * @returns {undefined}
     */
    toggleNotifications() {
        if (CJ.User.isLogged())
            this.onNotificationsStart();
        else
            this.onNotificationsStop();
    },
    /**
     * callback for the event listener
     * @param {String} action
     * @returns {undefined}
     */
    onNotificationsDo(action) {
        switch (action) {
        case 'toggle':
            this.toggleNotifications();
        case 'seen':
            this.onSeen();
            break;
        case 'show':
            this.showPopup();
            break;
        }
    },
    /*
     * this handles if language changed.
     * @returns {undefined}
     */
    onLanguageChange() {
        const me = this;
        Ext.defer(() => {
            Ext.callback(me.onShowFeedbackAgain, me, []);
        }, 50);
    },
    /**
     * this requests unseen from server and starts the timed request right away
     * @returns {undefined}
     */
    onNotificationsStart() {
        if (CJ.User.isFGA())
            this.setShowNotificationFeature(true);
        this.requestUnseen();
        this.setTimer(true);
    },
    /**
     * this stops the timed server request
     * @returns {undefined}
     */
    onNotificationsStop() {
        this.setTimer(false);
        this.setShowNotificationFeature(false);
        this.setNotificationFeedback(false);
    },
    /**
     * will reinitiate the popover.
     * @returns {undefined}
     */
    onShowFeedbackAgain() {
        const notificationPopover = this.getNotificationFeedback();
        if (this.getShowNotificationFeature() && notificationPopover && !notificationPopover.isDestroyed) {
            this.showNotificationsFeedback();
        }
    },
    /**
     * on seen notification will request right away a request unseen (so we are in sync with the server).
     * @returns {undefined}
     */
    onSeen() {
        this.requestUnseen();
    },
    /**
     * Updates the button and shows the feedback.
     * @NOTE we can't use update because it won't try to show the same number again
     * @param {Number} count
     * @param {Number} oldCount
     * @returns {Number}
     */
    applyUnseen(count, oldCount) {
        if (Ext.isNumber(count)) {
            // this updates the button in the sidemenu
            CJ.fire('notification.button.update', count);
            if (Ext.isNumber(oldCount) && this.getShowNotificationFeature())
                if (count > oldCount) {
                    this.showNotificationsFeedback(count);
                }
        }
        return count;
    },
    /**
     * timer cycles and updates the unseen count.
     * @returns {undefined}
     */
    timerCycle() {
        this.requestUnseen();
    },
    /**
     * Makes request to the server to get the count of 'unseen' notifications.
     */
    requestUnseen() {
        return CJ.request({
            method: 'GET',
            affectPendingRequestCount: false,
            rpc: {
                model: 'Notification',
                method: 'get_unseen_count'
            },
            params: {},
            success: this.onRequestUnseenSuccess,
            callback: this.onRequestUnseenCallback,
            scope: this
        });
    },
    /**
     * Callback of successful request of 'unseen' notifications.
     * @param {Object} response
     */
    onRequestUnseenSuccess(response) {
        this.setUnseen(response.ret);
    },
    /**
     * general callback of request of 'unseen' notifications.
     * @param {Object} response
     */
    onRequestUnseenCallback() {
    },
    /**
     * Sets timer for the request of the 'unseen' notifications.
     * Clears the old timer for the request of the 'unseen' notifications.
     * @param {Boolan} config
     * @returns {Boolan/Number} false or timer id.
     */
    applyTimer(config, oldConfig) {
        if (config == true)
            config = setInterval(this.timerCycle.bind(this), this.getServerUpdateInterval());
        if (oldConfig)
            clearInterval(oldConfig);
        return config;
    },
    /**
     * Show the notification list.
     * @returns {undefined}
     */
    showPopup() {
        Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-notifications',
            content: {
                xtype: 'view-notifications-list',
                unseen: this.getUnseen()
            },
            actionButton: { text: 'notification-mark-all-as-read' }
        });
    },
    /**
     * Show the notification feedback.
     * @returns {undefined}
     */
    showNotificationsFeedback(unseen undefined this.getUnseen()) {
        const text = CJ.tpl(CJ.t(CJ.Utils.pluralizeQuantity('view-notifications-feedback-message', unseen)), unseen);
        this.setNotificationFeedback(CJ.view.popovers.PopoverMenu.showTo({
            target: Ext.Viewport.element.dom,
            position: {
                x: 'right',
                y: 'bottom',
                inside: true
            },
            closeOnTap: false,
            offset: {
                x: -20,
                y: -10
            },
            innerComponent: {
                noTranslation: true,
                data: {
                    choices: [{
                            text,
                            value: 'open-notification'
                        }]
                },
                callbackScope: this,
                callbackFn: this.onNotificationFeedback
            }
        }));
    },
    /**
     * Closes old feedback
     * @param {CJ.core.view.Popover} newFeedback
     * @param {CJ.core.view.Popover} olFeedback
     * @returns {undefined}
     */
    updateNotificationFeedback(newFeedback, oldFeedback) {
        if (oldFeedback)
            oldFeedback.close();
    },
    /**
     * If user taps on the notification this will execute.
     * @param {String} action
     * @returns {undefined}
     */
    onNotificationFeedback(action) {
        this.showPopup();
    }
});