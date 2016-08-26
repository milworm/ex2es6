import 'app/core/view/Component';

/**
 */
Ext.define('CJ.view.login.ForgotPassword', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-login-forgot-password',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} contentConfig
         */
        popup(contentConfig) {
            return Ext.factory({
                xtype: 'core-view-popup',
                title: 'page-resetpassword-title',
                cls: 'd-popup-forgot-password d-popup-transparent',
                content: Ext.apply({ xtype: 'view-login-forgot-password' }, contentConfig),
                actionButton: { text: 'page-register-changepassword' }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-forgot-password',
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class="d-help">{helpMessage}</div>', '<input class="d-input d-email-field" placeholder="{emailPlaceholder}" name="email" type="text"/>'),
        /**
         * @cfg {Object} data
         */
        data: {}
    },
    constructor() {
        this.callParent(args);
        this.element.on({
            focus: this.onFocus,
            delegate: 'input',
            scope: this
        });
    },
    onFocus() {
        this.setErrors(false);
    },
    applyData(data) {
        Ext.apply(data, {
            helpMessage: CJ.t('page-resetpassword-help-message'),
            emailPlaceholder: CJ.t('page-resetpass-usernameoremail', true)
        });
        return data;
    },
    /**
     * @param {CJ.core.view.Popup} newPopup
     * @param {CJ.core.view.Popup} oldPopup
     */
    updatePopup(newPopup, oldPopup) {
        if (newPopup)
            newPopup.on('actionbuttontap', this.onSubmitButtonTap, this);
    },
    /**
     * Makes request to the server to reset password.
     * @param {Object} values Form values
     */
    onSubmitButtonTap() {
        this.setErrors(false);
        if (!this.getValues().email) {
            this.setErrors('page-resetpass-error-enterusernameoremail');
            return false;
        }
        this.setLoading(true);
        this.getPopup().setLoading(true);
        CJ.request({
            rpc: {
                model: 'PortalUser',
                method: 'pw_reset_req'
            },
            safe: true,
            scope: this,
            params: this.getValues(),
            success: this.onRequestResetSuccess,
            failure: this.onRequestResetFailure
        });
        return false;
    },
    /**
     * Handler of success response from server of reset password.
     */
    onRequestResetSuccess() {
        const title = 'page-resetpassword-alerttitle', content = 'page-resetpass-error-emailsent', popup = this.getPopup();
        this.setLoading(false);
        this.getPopup().setLoading(false);
        CJ.alert(title, content, () => {
            popup.hide();
        });
    },
    /**
     * Handler of failure response from server of reset password.
     * @param object response Contains server error code
     */
    onRequestResetFailure(response) {
        let code = 'fatal';
        switch (response.errCode) {
        case 'USERNOTFOUND':
            code = response.errCode.toLowerCase();
            break;
        }
        this.setLoading(false);
        this.getPopup().setLoading(false);
        this.setErrors(`page-resetpass-error-${ code }`);
    },
    setErrors(message) {
        const input = this.element.dom.querySelector('input');
        if (!message) {
            this.getPopup().setActionButtonErrorMsg(false);
            input.classList.remove('d-error');
        } else {
            this.getPopup().setActionButtonErrorMsg(message);
            input.classList.add('d-error');
        }
    },
    getValues() {
        return { email: this.element.dom.querySelector('[name="email"]').value };
    }
});