import 'app/core/view/Component';

//@TODO set limit on fields ( if any)
/**
 * Class provides an interface to display login page.
 */
Ext.define('CJ.view.login.Login', {
    extend: 'CJ.core.view.Component',
    xtype: 'view-login-login',
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.Login',
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
                closeOnTap: true,
                cls: 'd-popup-login',
                content: Ext.apply({ xtype: 'view-login-login' }, config.content)
            }, config.popup));
        }
    },
    config: {
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} layout
         */
        //layout: "light",
        tpl: Ext.create('Ext.Template', '<div class="d-logo">', '</div>', '<div class="d-field d-vbox d-vcenter">', '<input class="d-input" type="text" name="username"', ' placeholder="{usernameLabel}" autocomplete="on" autocapitalize="off" autocorrect="off">', '</div>', '<div class="d-field d-vbox d-vcenter">', '<input class="d-input" type="password" name="password"', ' placeholder="{passwordLabel}" autocomplete="on" autocapitalize="off" autocorrect="off">', '</div>', '<div class="d-button d-light-button d-login-button">{connectLabel}</div>', '<div class="d-footer">', '<div class="d-help">', '{helpLabel} ', '<a href="mailto:support@challengeu.com">support@challengeu.com</a>', '</div>', '<a href="javascript:void(0)" class="d-button d-register-button">{registerLabel}<a>', '<a href="javascript:void(0)" class="d-button d-forgot-password-button">{resetPassLabel}<a>', '</div>')
    },
    applyData(data) {
        Ext.apply(data, {
            usernameLabel: CJ.t('page-login-username', true),
            passwordLabel: CJ.t('page-login-password', true),
            connectLabel: CJ.t('page-login-connect'),
            registerLabel: CJ.t('page-login-register'),
            resetPassLabel: CJ.t('page-login-resetpass-button'),
            helpLabel: CJ.t('page-login-help')
        });
        return data;
    },
    /**
     * Initialize component.
     */
    constructor() {
        this.callParent(args);
        this.element.on({
            tap: this.onElementTap,
            keypress: this.onKeyPress,
            delegate: [
                '.d-button',
                '.d-input'
            ],
            scope: this
        });
    },
    onElementTap(e) {
        if (e.getTarget('.d-register-button', 3))
            return CJ.view.login.Register.popup();
        if (e.getTarget('.d-forgot-password-button', 3))
            return CJ.view.login.ForgotPassword.popup();
        if (e.getTarget('.d-login-button', 3)) {
            return this.onLoginTap();
        }
    },
    onKeyPress(e) {
        if (e.browserEvent.keyCode == 13)
            return this.onLoginTap();
    },
    onLoginTap() {
        const values = this.getValues();
        if (!this.validate(values))
            return;
        this.setLoading(true);
        this.login(values);
    },
    /**
     * @return {undefined}
     */
    login(values) {
        CJ.User.login(values, {
            success: this.onLoginSuccess,
            failure: this.onLoginFailure,
            scope: this
        });
    },
    getValues() {
        const fields = this.element.query('input'), data = {};
        for (let i = 0, ln = fields.length; i < ln; i++) {
            data[fields[i].getAttribute('name')] = fields[i].value;
        }
        return data;
    },
    onLoginSuccess() {
        this.getParent().hide();
    },
    validate(values) {
        let validated = true;
        for (const key in values)
            if (!values[key])
                validated = false;
        this.setErrorMsg(validated ? false : 'page-login-error-101');
        return validated;
    },
    setErrorMsg(errorCode) {
        const element = this.element.dom.querySelector('.d-login-button');
        if (!errorCode) {
            errorCode = 'page-login-connect';
            element.classList.remove('error');
        } else {
            element.classList.add('error');
        }
        element.innerHTML = CJ.t(errorCode);
    },
    /**
     * Handler of failure response of login request.
     */
    onLoginFailure() {
        this.setLoading(false);
        this.setErrorMsg('page-login-error-104');
    },
    onPasswordFieldKeyPress(e) {
        if (e.browserEvent.keyCode == 13)
            this.onSubmitButtonTap();
    }
});