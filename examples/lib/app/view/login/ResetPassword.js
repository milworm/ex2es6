import 'app/core/view/Component';

Ext.define('CJ.view.login.ResetPassword', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-login-reset-password',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @param {Object} config.content
         * @param {Object} config.popup
         */
        popup(config undefined {}) {
            return Ext.factory(Ext.apply({
                xtype: 'core-view-popup',
                title: 'page-resetpassword-title-setnewpassword',
                cls: 'd-popup-reset-password',
                type: 'light',
                description: CJ.app.t('page-resetpassword-reset-message'),
                isHistoryMember: true,
                content: Ext.apply({ xtype: 'view-login-reset-password' }, config.content),
                actionButton: { text: 'page-resetpassword-button-savepassword' }
            }, config.popup));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-reset-password',
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {String} username
         */
        username: null,
        /**
         * @cfg {String} token
         */
        token: null,
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<input placeHolder="{passwordLabel}" name="password" type="password" class="d-input"/>', '<input placeHolder="{passwordConfirmLabel}" name="passwordConfirm" type="password" class="d-input"/>'),
        /**
         * @cfg {Object} data
         */
        data: {}
    },
    /**
     * @param {CJ.core.view.Popup} newPopup
     * @param {CJ.core.view.Popup} oldPopup
     */
    updatePopup(newPopup, oldPopup) {
        if (newPopup)
            newPopup.on('actionbuttontap', this.onSubmitButtonTap, this);
    },
    applyData(data) {
        data = Ext.apply({
            passwordLabel: CJ.t('page-resetpass-newpassword', true),
            passwordConfirmLabel: CJ.t('page-resetpass-confirmnewpassword', true)
        }, data);
        return data;
    },
    /**
     * Makes request to the server to reset password.
     * @param {Object} values Form values
     */
    onSubmitButtonTap() {
        const data = this.getValues();
        this.setErrorMsg();
        if (!data.password || data.password.length < 6) {
            this.setErrorMsg('page-register-error-passwordlength');
            return false;
        }
        if (data.password != data.passwordConfirm) {
            this.setErrorMsg('page-register-error-passwordnotequal');
            return false;
        }
        this.setLoading(true);
        CJ.request({
            rpc: {
                model: 'PortalUser',
                method: 'pw_reset'
            },
            params: {
                password: data.password,
                token: this.getToken()
            },
            success: this.onSavePasswordSuccess,
            failure: this.onSavePasswordFailure,
            scope: this,
            safe: true
        });
        return false;
    },
    /**
     * Handler of success response from server of reset password.
     */
    onSavePasswordSuccess(response, request) {
        this.getPopup().hide();
        CJ.User.login({
            username: this.getUsername(),
            password: request.initialConfig.params.password
        }, { loadMask: true });
    },
    /**
     * Handler of failure response from server of reset password.
     * @param object response Contains server error code
     */
    onSavePasswordFailure(response) {
        // Default
        let code = 'fatal';
        switch (response.errCode) {
        case 'INVALIDTOKEN':
        case 'TOKENEXPIRED':
            code = response.errCode.toLowerCase();
            break;
        case 'FIELDUNDERFLOW':
        case 'FIELDOVERFLOW':
            code = 'invalidpassword';
            break;
        }
        this.setLoading(false);
        this.setErrorMsg(`page-resetpass-error-${ code }`);
    },
    getValues() {
        const fields = this.element.query('input'), data = {};
        for (let i = 0, ln = fields.length; i < ln; i++) {
            data[fields[i].getAttribute('name')] = fields[i].value;
        }
        return data;
    },
    setLoading(isLoading) {
        this.getPopup().setLoading(isLoading);
        return this.callParent(args);
    },
    setErrorMsg(message) {
        const input = this.element.dom.querySelector('[name="passwordConfirm"]');
        if (!message) {
            this.getPopup().setActionButtonErrorMsg(false);
            input.classList.remove('d-error');
        } else {
            this.getPopup().setActionButtonErrorMsg(message);
            input.classList.add('d-error');
        }
    }
});