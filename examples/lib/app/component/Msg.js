/**
 * Class is wrapper of Ext.Msg, that provides ability to show messages in app.
 */
Ext.define('CJ.component.Msg', {
    alternateClassName: 'CJ.Msg',
    singleton: true,
    /**
     * Shows keyboard and sets state before show message.
     */
    beforeDialogShow() {
        Ext.Viewport.hideKbd();
    },
    /**
     * Shows message dialog.
     * @param {String} title Locale's key for title of dialog
     * @param {String} message Locale's key for message of dialog
     * @param {Function} handler Callback function that will be called when the dialog is closed.
     * @param {Object} scope Scope for callback function, by default it's instance of app.
     */
    alert(title, message, handler, scope) {
        Ext.Msg.alert(CJ.app.t(title), CJ.app.t(message), function () {
            CJ.PopupManager.onHide(Ext.Msg);
            if (handler)
                handler.apply(scope || this, arguments);
        }, this);
        CJ.PopupManager.onShow(Ext.Msg);
    },
    /**
     * Shows confirm message dialog.
     * @param {String} title Locale's key for title of dialog
     * @param {String} message Locale's key for message of dialog
     * @param {Function} handler - callback function that will be called when the dialog is closed.
     * @param {Object} scope - scope for callback function, by default it's instance of app.
     */
    confirm(title, message, handler, scope) {
        title = CJ.t(title);
        message = CJ.t(message);
        const config = {
            title,
            message,
            buttons: Ext.MessageBox.YESNO,
            promptConfig: false,
            fn(answer) {
                Ext.Msg.lastAnswer = answer;
                CJ.PopupManager.onHide(Ext.Msg);
                delete Ext.Msg.lastAnswer;    //[todo] - make this more robust
                //[todo] - make this more robust
                Ext.defer(() => {
                    CJ.PopupManager.openPopupCount--;
                }, 250);
                handler.call(scope || CJ.app, answer);
                scope = null;
            }
        };
        this.beforeDialogShow();
        Ext.Msg.show(config);
        CJ.PopupManager.onShow(Ext.Msg);
    },
    /**
     * simply renders feedback-message at the top
     * @param {String} message
     */
    feedback(config) {
        if (!config)
            config = CJ.t('msg-feedback-success');
        if (Ext.isString(config))
            config = { message: config };
        const message = config.message, duration = config.duration || 1000, context = config.context || this.getFeedbackDefaultContext(), onTap = config.tap, onDestroy = config.destroy, scope = config.scope || this, cls = config.cls || '', container = Ext.factory({
                xtype: 'component',
                cls: `feedback-message ${ cls }`,
                html: CJ.tpl('<div class=\'content\'>{0}</div>', message),
                zIndex: CJ.ZIndexManager.getZIndex()
            });
        if (Ext.isFunction(onDestroy))
            container.on('destroy', onDestroy, scope);
        if (Ext.isFunction(onTap))
            container.element.on('tap', function (e) {
                Ext.callback(onTap, scope || this, [e]);
                this.hideFeedback(container);
            }, this);
        container.showBy(context.element, context.position);
        Ext.defer(() => {
            if (container.isDestroyed)
                return;
            CJ.Animation.animate({
                el: container.element.down('.content'),
                cls: 'hiding',
                after: container.destroy,
                scope: container
            });
        }, duration);
        return container;
    },
    /**
     * @return {Object}
     */
    getFeedbackDefaultContext() {
        return {
            element: Ext.Viewport,
            position: 'tc-tc'
        };
        Ext.defer(this.hideFeedback, duration, this, [container]);
    },
    hideFeedback(container) {
        if (!container || container.isHiding)
            return;
        container.isHiding = true;
        CJ.Animation.animate({
            el: container.element.down('.content'),
            cls: 'hiding',
            after: container.destroy,
            scope: container
        });
    }
});