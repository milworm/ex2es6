import 'app/core/view/Component';

Ext.define('CJ.view.login.Register', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-login-register',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config undefined {}) {
            return Ext.factory(Ext.apply({
                xtype: 'core-view-popup',
                cls: 'd-popup-register d-popup-transparent',
                title: 'view-login-register-popup-title',
                closeOnTap: true,
                actionButton: { text: 'view-login-register-submit-button-text' },
                content: Ext.apply({ xtype: 'view-login-register' }, config.content)
            }, config.popup));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} isAutoFocus
         */
        isAutoFocus: true,
        /**
         * @cfg {String} cls
         */
        cls: 'd-register d-scroll',
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {CJ.core.view.form.Icon} iconUploader
         */
        iconUploader: {},
        tpl: Ext.create('Ext.Template', '<div class="d-section">', '<div class="d-logo">', '<div class="d-show-preview"></div>', '</div>', '<div class="d-row">', '<input class="d-input" type="text" name="alias" maxlength="20" placeholder="{usernameLabel}">', '</div>', '<div class="d-row">', '<input class="d-input" type="password" name="password" maxlength="30" placeholder="{passwordLabel}">', '</div>', '<div class="d-row">', '<input class="d-input d-with-note" type="password" name="passwordConfirm" maxlength="30" placeholder="{passwordLabel}">', '<div class="d-note">{confirmLabel}</div>', '</div>', '<div class="d-row">', '<input type="text" class="d-input d-half" name="first_name" maxlength="30" placeholder="{firstNameLabel}">', '<input type="text" class="d-input d-half d-border" name="last_name" maxlength="30" placeholder="{lastNameLabel}">', '</div>', '<div class="d-row">', '<input type="text" class="d-input" name="email" placeholder="{emailLabel}">', '</div>', '<div class="d-row">', '<input type="text" class="d-input d-with-note" name="company" placeholder="{companyLabel}">', '<div class="d-note">{optionalLabel}</div>', '</div>', '<div class="d-row">', '<input type="text" class="d-input d-with-note" name="role"placeholder="{roleLabel}">', '<div class="d-note">{optionalLabel}</div>', '</div>', '</div>', '<div class="d-section d-no-margin">', '<div class="d-row d-no-border">', '<div class="d-checkbox d-subscribed" name="subscribed" data-checked="false"></div>', '<div class="d-checkbox-label">{subscribedCheckboxLabel}</div>', '</div>', '<div class="d-row d-different-bg d-hidden">', '<div class="d-checkbox d-is-teacher" name="is_teacher" data-checked="false"></div>', '<div class="d-checkbox-label">{teacherCheckboxLabel}</div>', '</div>', '</div>', '<div class="d-help">', '{descriptionLabel} ', '<a href="http://info.challengeu.com/terms" target="_blank">{termsLabel}</a>', '{separatorLabel}', '<a href="http://info.challengeu.com/policy" target="_blank">{privacyLabel}</a>', '</div>')
    },
    constructor() {
        this.callParent(args);
        this.element.on({
            tap: this.onCheckboxTap,
            keypress: this.onKeyPress,
            keyup: this.onKeyUp,
            delegate: '.d-checkbox, [name]',
            scope: this
        });
    },
    applyIconUploader(data) {
        if (!data)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-form-icon',
            name: 'iconCfg',
            listeners: {
                scope: this,
                uploadstart: this.denySubmit,
                uploadfailure: this.allowSubmit,
                uploadsuccess: this.onUploadSuccess
            }
        }), data);
    },
    updateIconUploader(newIconUploader, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (!newIconUploader)
            return;
        const el = this.element.dom.querySelector('.d-logo');
        newIconUploader.renderTo(el);
    },
    applyData(data) {
        Ext.apply(data, {
            usernameLabel: CJ.t('page-register-form-username', true),
            passwordLabel: CJ.t('page-register-form-password', true),
            firstNameLabel: CJ.t('page-register-form-firstname', true),
            lastNameLabel: CJ.t('page-register-form-lastname', true),
            companyLabel: CJ.t('page-register-form-company', true),
            emailLabel: CJ.t('page-register-form-email', true),
            roleLabel: CJ.t('page-register-form-role', true),
            confirmLabel: CJ.t('page-register-form-hint-confirm', true),
            optionalLabel: CJ.t('page-register-form-hint-optional', true),
            descriptionLabel: CJ.t('page-register-form-description'),
            termsLabel: CJ.t('page-register-form-terms'),
            separatorLabel: CJ.t('page-register-form-acceptterms-separator'),
            privacyLabel: CJ.t('page-register-form-privacy'),
            teacherCheckboxLabel: CJ.t('view-login-register-is-teacher'),
            subscribedCheckboxLabel: CJ.t('view-login-subscribed')
        });
        return data;
    },
    /**
     * @param {CJ.core.view.Popup} newPopup
     * @param {CJ.core.view.Popup} oldPopup
     * @return {undefined}
     */
    updatePopup(newPopup, oldPopup) {
        if (newPopup)
            newPopup.on('actionbuttontap', this.onSubmitButtonTap, this);
    },
    onKeyPress(e) {
        const input = e.target.getAttribute('name');
        if (input == 'alias') {
            //This is needed because firefox would not allow the backspace or delete
            //also this allows key navigation
            if (Ext.browser.is.Firefox && [
                    8,
                    9,
                    37,
                    39,
                    16,
                    46
                ].indexOf(e.browserEvent.keyCode) > -1)
                return;
            var character = String.fromCharCode(e.browserEvent.charCode);
            if (!/[\w\u00C0-\u017F-]/.test(character))
                e.stopEvent();
        }
        if ([
                'alias',
                'first_name',
                'last_name'
            ].indexOf(input) != -1) {
            var character = String.fromCharCode(e.browserEvent.charCode);
            if (/[@#%&!\$\?\*\^\t]/.test(character))
                e.stopEvent();
        }
    },
    onKeyUp() {
        this.clearErrors();
        this.validateConfirm();
    },
    allowSubmit() {
        this.getParent().allowSubmit();
    },
    denySubmit() {
        this.getParent().denySubmit();
    },
    focus() {
        // https://redmine.iqria.com/issues/8616
        if (Ext.os.is.iOS)
            return;
        Ext.defer(function () {
            this.element.dom.querySelector('[name=\'alias\']').focus();
        }, 500, this);
    },
    onCheckboxTap(evt) {
        if (!evt.getTarget('.d-checkbox'))
            return;
        const checked = CJ.Utils.getNodeData(evt.target, 'checked');
        CJ.Utils.setNodeData(evt.target, 'checked', checked == 'true' ? 'false' : 'true');
        if (evt.getTarget('[name="subscribed"]')) {
            const element = this.element.dom.querySelector('.d-hidden');
            if (element)
                element.classList.remove('d-hidden');
        }
    },
    /**
     * @param {Ext.Component} field
     * @param {Object} response
     * @param {Object} iconCfg
     * @return {undefined}
     */
    onUploadSuccess(field, response, iconCfg) {
        const element = this.element.dom.querySelector('.d-show-preview');
        this.allowSubmit();
        element.setAttribute('style', CJ.Utils.makeIcon(iconCfg.preview));
        element.classList.add('d-preview-shown');
    },
    /**
     * @return {undefined}
     */
    onSubmitButtonTap() {
        this.clearErrors();
        if (this.validateForm()) {
            this.setLoading(true);
            this.getParent().setLoading(true);
            this.register();
        }
        return false;
    },
    /**
     * performs ajax-request in order to register user.
     */
    register() {
        const values = this.getValues();    // set default language for user
        // set default language for user
        values.language = CJ.User.getLanguage();    // do not need to send
        // do not need to send
        delete values.passwordConfirm;
        CJ.request({
            rpc: {
                model: 'PortalUser',
                method: 'register'
            },
            safe: true,
            scope: this,
            params: values,
            success: this.onRegisterSuccess,
            failure: this.onRegisterFailure
        });
    },
    /**
     * Handler of success response from server.
     * Makes redirect to user home page.
     * @param {Object} response
     * @param {Object} request
     */
    onRegisterSuccess(response, request) {
        this.setLoading(false);
        this.getParent().setLoading(false);
        if (response.ret > 0)
            return this.onRegisterFailure(response.ret);
        CJ.LocalStorage.setItem('isNewUser', true);
        CJ.User.onLoginSuccess(response, request);
    },
    /**
     * Handler of failure response from server.
     * Shows error message.
     * @param {Object} response
     */
    onRegisterFailure(response) {
        this.setLoading(false);
        this.getParent().setLoading(false);
        let errorMsg = 'page-register-error-error', field;
        switch (response.errCode) {
        case 'FIELDUNDERFLOW':
            field = response.errField;
            if (field === 'password')
                errorMsg = 'page-register-error-passwordlength';
            else if (field === 'alias' || field === 'first_name' || field === 'last_name' || field === 'email')
                errorMsg = 'page-register-error-missingvalues';
            else
                errorMsg = 'page-register-error-error';
            break;
        case 'FIELDOVERFLOW':
            field = response.errField;
            if (field === 'first_name')
                errorMsg = 'page-register-error-firstnamemaxchar';
            else if (field === 'last_name')
                errorMsg = 'page-register-error-lastnamemaxchar';
            else if (field === 'alias')
                errorMsg = 'page-register-error-error';
            else if (field === 'password')
                errorMsg = 'page-register-error-error';
            break;
        case 'INVALIDCHAR':
            field = response.errField;
            if (field === 'first_name')
                errorMsg = 'page-register-error-firstnamemaxchar';
            else if (field === 'last_name')
                errorMsg = 'page-register-error-lastnamemaxchar';
            else if (field === 'alias')
                errorMsg = 'page-register-error-invalidusername';
            break;
        case 'INVALIDEMAIL':
            field = 'email';
            errorMsg = 'page-register-error-invalidemail';
            break;
        case 'TERMSNOPTACCEPTED':
            errorMsg = 'page-register-error-acceptterms';
            break;
        case 'ALIASEXISTS':
            errorMsg = 'page-register-error-usedusername';
            field = 'alias';
            break;
        case 'EMAILEXISTS':
            errorMsg = 'page-register-error-usedemail';
            field = 'email';
            break;
        }
        this.getParent().setActionButtonErrorMsg(errorMsg);
        if (field)
            this.markFields(field);
    },
    validateForm() {
        const data = this.getValues();
        let error;    /*
         * @NOTE order is important or it will show like validating last elements first
         * for the client that might look weird...
         * [[ starting at the last required field and ending with the first required field ]]
         */
        /*
         * @NOTE order is important or it will show like validating last elements first
         * for the client that might look weird...
         * [[ starting at the last required field and ending with the first required field ]]
         */
        if (!CJ.Utils.validateEmail(data.email))
            error = [
                'email',
                'invalidemail'
            ];
        if (!data.first_name)
            error = [
                'first_name',
                'missingvalues'
            ];
        if (!data.last_name)
            error = [
                'last_name',
                'missingvalues'
            ];
        if (data.password != data.passwordConfirm)
            error = [
                'passwordConfirm',
                'passwordnotequal'
            ];
        if (!data.password)
            error = [
                'password',
                'missingvalues'
            ];
        if (data.password.length < 6)
            error = [
                'password',
                'passwordlength'
            ];
        if (!data.alias)
            error = [
                'alias',
                'invalidusername'
            ];
        if (error) {
            this.markFields(error[0]);
            this.getParent().setActionButtonErrorMsg(`page-register-error-${ error[1] }`);
            return false;
        }
        return true;
    },
    validateConfirm() {
        const dom = this.element.dom, password = dom.querySelector('[name="password"]'), passwordConfirm = dom.querySelector('[name="passwordConfirm"]');
        if (password.value != passwordConfirm.value) {
            this.markFields('passwordConfirm');
            this.getParent().setActionButtonErrorMsg('page-register-error-passwordnotequal');
        } else {
            this.clearErrors();
        }
    },
    clearErrors() {
        const elements = this.element.dom.querySelectorAll('.d-error');
        for (let i = 0, ln = elements.length; i < ln; i++)
            elements[i].classList.remove('d-error');
        this.getParent().setActionButtonErrorMsg(false);
    },
    markFields(field) {
        const element = this.element.dom.querySelector(`[name="${ field }"]`);
        if (element)
            element.classList.add('d-error');
    },
    getValues() {
        const elements = this.element.dom.querySelectorAll('[name]');
        const data = {};
        let value;
        for (let i = 0, ln = elements.length, currentElement, fieldName; i < ln; i++) {
            currentElement = elements[i];
            value = currentElement.value;
            fieldName = currentElement.getAttribute('name');
            if (Ext.isDefined(value))
                data[fieldName] = value;
            else
                data[fieldName] = CJ.Utils.getNodeData(currentElement, 'checked') == 'true' ? true : false;
        }
        data.iconCfg = this.getIconUploader().getValue();
        return data;
    },
    destroy() {
        this.callParent(args);
        this.setIconUploader(false);
    }
});