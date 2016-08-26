import 'app/view/profile/Address';
import 'app/view/profile/InvoiceList';

//[TODO] handle saved bank account info storage and manipulation
Ext.define('CJ.view.profile.Profile', {
    /**
     * @property {String} alias
     */
    alias: 'widget.view-profile-profile',
    /**
     * @property {Object} htmlElement
     */
    htmlElement: null,
    /**
     * @property {Object} innerHtmlElement
     */
    innerHtmlElement: null,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-profile d-scroll',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'x-inner d-vertical-double-list',
        /**
         * @cfg {Boolean} rendered
         */
        rendered: false,
        /**
         * @cfg {Object} parent
         */
        parent: null,
        /**
         * @cfg {Object} values
         */
        values: {},
        /**
         * @cfg {Array} purchases
         */
        purchases: null,
        /**
         * @cfg {Object} ownerAddress
         */
        ownerAddress: null,
        /**
         * @property {Object} notificationIsBusy
         */
        notificationIsBusy: false
    },
    /**
     * @property {Object|Ext.XTemplate} tpl
     */
    tpl: Ext.create('Ext.XTemplate', '<div class="d-group">', '<div class="d-item d-vbox d-basic-profile">', '<div class="d-item-title">', '{basicProfileBlockLabel}', '</div>', '<div class="d-inner">', '<label class="d-inner-item d-title-field d-readonly">', '<div class="d-title">', '{userNameLabel}', '</div>', '<input type="text" class="d-input  d-user-name-field" value="{values.user}" readonly>', '</label>', '<div class="d-single-row d-hbox">', '<label class="d-inner-item d-title-field ">', '<div class="d-title">', '{firstNameLabel}', '</div>', '<input type="text" class="d-input  d-first-name-field" value="{values.first_name}" maxlength="30">', '</label>', '<label class="d-inner-item d-title-field ">', '<div class="d-title">', '{lastNameLabel}', '</div>', '<input type="text" class="d-input  d-last-name-field" value="{values.last_name}" maxlength="30">', '</label>', '</div>', '<label class="d-inner-item d-title-field">', '<div class="d-title">', '{emailLabel}', '</div>', '<input type="text" class="d-input  d-email-field" value="{values.email}" maxlength="255">', '</label>', '</div>', '</div>', '<div class="d-item d-vbox d-network">', '<div class="d-item-title">', '{networkBlockLabel}', '</div>', '<div class="d-inner">', '<label class="d-inner-item d-title-field ">', '<div class="d-title">', '{organizationLabel}', '</div>', '<input type="text" class="d-input  d-company-field" value="{values.company}" maxlength="255">', '</label>', '<label class="d-inner-item d-title-field ">', '<div class="d-title">', '{roleLabel}', '</div>', '<input type="text" class="d-input  d-role-field" value="{values.role}" maxlength="40">', '</label>', '<label class="d-inner-item d-title-field d-readonly">', '<div class="d-title">', '{portalLabel}', '</div>', '<input type="text" class="d-input  d-portal-field" value="{portalData}" readonly>', '</label>', '</div>', '</div>', '</div>', '<div class="d-group">', '<div class="d-item d-vbox d-purchased-content">', '<div class="d-item-title">', '{purchasedContentBlock}', '</div>', '<div class="d-inner d-list-block d-vbox">', '<div class="d-list">', '<tpl for="purchases">', '<div data-purchase-id="{id}" class="d-inner-item d-descriptive-item d-purchased-item d-hbox">', '<div class="d-purchase-details d-vbox">', '<div class="d-title">{title}</div>', '<div class="d-details d-hbox">', '<div class="d-icon" style="background-image: url(\'{imageUrl}\')"></div>', '<div class="d-owner">{author}</div>', '<div class="d-expiration">{expires}</div>', '</div>', '</div>', '<div class="d-purchase-amout">{total}</div>', '</div>', '</tpl>', '</div>', '<div class="d-bottom-side">', '<div class="d-inner-item d-bottom-button d-purchased-content-button ">', '{seeCompleteListButton}', '</div>', '</div>', '</div>', '</div>', '<div class="d-item d-vbox d-invoice-method">', '<div class="d-item-title">', '{billingBlockLabel}', '</div>', '<div class="d-inner">', '<div class="d-inner-item d-descriptive-item d-hbox d-address d-change-address-button">', '<div class="d-title">', '{billingDetailsLabel}', '</div>', '<tpl if="hasAddress">', '<div class="d-owner">{ownerAddress.name}</div>', '<div class="d-address">', '{ownerAddress.line1}, {ownerAddress.line2},<br>', '{ownerAddress.city}, {ownerAddress.province},<br>', '{ownerAddress.country}, {ownerAddress.zip}', '</div>', '<tpl else>', '<div class="d-owner">{noBillingDetailsLabel}</div>', '<div class="d-address"></div>', '</tpl>', '</div>', '</div>', '</div>', '</div>', '<div class="d-group">', '<div class="d-item d-vbox d-password">', '<div class="d-item-title">', '{passwordBlockLabel}', '</div>', '<div class="d-inner">', '<div class="d-inner-item d-placeholder-field ">', '<input type="password" class="d-input d-password d-current-password" placeholder="{currentPassLabel}" maxlength="30">', '</div>', '<div class="d-inner-item d-placeholder-field ">', '<input type="password" class="d-input d-password d-new-password" placeholder="{newPassLabel}" maxlength="30">', '</div>', '<div class="d-inner-item d-placeholder-field ">', '<input type="password" class="d-input d-password d-new-password-confirm" placeholder="{confirmPassLabel}" maxlength="30">', '</div>', '</div>', '<div class="d-extra-inner">', '<div class="d-inner-item d-button d-password-save-button ">', '{changePasswordButton}', '</div>', '</div>', '</div>', '<div class="d-item d-vbox d-language">', '<div class="d-item-title">', '{languageBlockLabel}', '</div>', '<div class="d-inner d-list-block d-vbox">', '<div class="d-list">', '<div data-language="fr" class="d-inner-item d-descriptive-item d-hbox d-language-item {[values.values.language == "fr" ? "d-selected": "" ]}">', '<div class="d-icon" style="background-image: url(\'{frIcon}\')"></div>', '<div class="d-details">', '{frenchLanguage}', '</div>', '</div>', '<div data-language="en" class="d-inner-item d-descriptive-item d-hbox d-language-item {[values.values.language == "en" ? "d-selected": "" ]}">', '<div class="d-icon" style="background-image: url(\'{enIcon}\')"></div>', '<div class="d-details">', '{englishLanguage}', '</div>', '</div>', '</div>', '</div>', '</div>', '</div>', '<tpl if="mergeable">', '<div class="d-group">', '<div class="d-item d-vbox d-merge">', '<div class="d-item-title">', '{accountMergeBlockLabel}', '</div>', '<div class="d-extra-inner">', '<div class="d-merge-description">', '{mergeLabel}', '</div>', '<div class="d-inner-item d-button d-merge-button ">', '<a href="#merge" onclick="return false;">', '{mergeButton}', '</a>', '</div>', '</div>', '</div>', '</div>', '</tpl>'),
    /**
     * @param {Object} config
     * @returns {undefined}
     */
    constructor(config) {
        this.initConfig(config);
        this.initElement();
        this.setValues(CJ.User.getProfileInfo());
        this.attachListeners();
        CJ.Ajax.initBatch();
        CJ.LoadBar.run();
        CJ.User.listPurhcasedLicenses({
            scope: this,
            success: this.onPurchasesLoaded
        });
        CJ.User.loadBillingAddress({
            scope: this,
            success: this.onBillingAddressLoaded
        });
        CJ.Ajax.runBatch(Ext.bind(this.renderTpl, this));    // sets the search bar to new settings location
        // sets the search bar to new settings location
        Ext.Viewport.getSearchBar().setTags('%profile');
    },
    /**
     * @returns {undefined}
     */
    initElement() {
        const element = document.createElement('div'), innerElement = document.createElement('div');
        innerElement.className = this.getInnerCls();
        this.innerHtmlElement = Ext.get(innerElement);
        element.appendChild(this.innerHtmlElement.dom);
        element.className = this.getCls();
        return this.htmlElement = Ext.get(element);
    },
    /**
     * @returns {undefined}
     */
    renderTpl() {
        const values = this.getValues();
        const purchases = this.getPurchases();
        const ownerAddress = this.getOwnerAddress();
        const config = {
            values,
            purchases,
            ownerAddress
        };
        let hasAddress;
        if (ownerAddress.name || ownerAddress.line1 || ownerAddress.line2 || ownerAddress.city || ownerAddress.province || ownerAddress.country || ownerAddress.zip)
            hasAddress = true;
        this.innerHtmlElement.dom.innerHTML = this.tpl.apply(Ext.apply({
            basicProfileBlockLabel: CJ.t('view-profile-settings-basic-title'),
            userNameLabel: CJ.t('view-profile-settings-basic-username'),
            firstNameLabel: CJ.t('view-profile-settings-basic-firstname'),
            lastNameLabel: CJ.t('view-profile-settings-basic-lastname'),
            emailLabel: CJ.t('view-profile-settings-basic-email'),
            networkBlockLabel: CJ.t('view-profile-settings-network-title'),
            organizationLabel: CJ.t('view-profile-settings-network-organization'),
            roleLabel: CJ.t('view-profile-settings-network-role'),
            portalLabel: CJ.t('view-profile-settings-network-portal'),
            portalData: CJ.User.getPortalName(),
            purchasedContentBlock: CJ.t('view-profile-settings-purchased-title'),
            seeCompleteListButton: CJ.t('view-profile-settings-purchased-complete-list-button'),
            billingBlockLabel: CJ.t('view-profile-settings-billing-details-title'),
            billingDetailsLabel: CJ.t('view-profile-settings-billing-address-title'),
            noBillingDetailsLabel: CJ.t('view-profile-settings-billing-address-noaddress'),
            passwordBlockLabel: CJ.t('view-profile-settings-password-title'),
            currentPassLabel: CJ.t('view-profile-settings-password-current', true),
            newPassLabel: CJ.t('view-profile-settings-password-new', true),
            confirmPassLabel: CJ.t('view-profile-settings-password-new-confirm', true),
            changePasswordButton: CJ.t('view-profile-settings-password-save-button'),
            languageBlockLabel: CJ.t('view-profile-settings-languages-title'),
            frenchLanguage: CJ.t('fr'),
            englishLanguage: CJ.t('en'),
            frIcon: `${ Core.opts.resources_root }resources/images/icons/languages/FR.png`,
            enIcon: `${ Core.opts.resources_root }resources/images/icons/languages/US.png`,
            accountMergeBlockLabel: CJ.t('page-merge-page-title'),
            mergeLabel: CJ.t('page-merge-page-title-label'),
            mergeButton: CJ.t('page-merge-form-submit-button'),
            mergeable: CJ.User.isPortal(),
            hasAddress
        }, config));
        CJ.LoadBar.finish();
    },
    /**
     * @param {HTMLElement} element
     * @returns {undefined}
     */
    renderTo(element undefined this.initialConfig.renderTo) {
        if (!element)
            return;
        element.appendChild(this.htmlElement.dom);
    },
    /**
     * @returns {Boolean}
     */
    validatePassword() {
        const oldPassword = this.getDomElement('.d-current-password'), newPassword = this.getDomElement('.d-new-password'), newPasswordConfirm = this.getDomElement('.d-new-password-confirm');
        if (newPassword.value.length < 6) {
            this.getDomElement('.d-password-save-button').classList.add('d-error');
            return this.showNotification('page-register-error-passwordlength', false);
        }
        if (newPassword.value != newPasswordConfirm.value) {
            this.getDomElement('.d-password-save-button').classList.add('d-error');
            return this.showNotification('page-register-error-passwordnotequal', false);
        }
        return true;
    },
    /**
     * @returns {Boolean}
     */
    validateBasics() {
        const email = this.getDomElement('.d-email-field'), userName = this.getDomElement('.d-user-name-field'), lastName = this.getDomElement('.d-last-name-field'), firstName = this.getDomElement('.d-first-name-field'), company = this.getDomElement('.d-company-field'), role = this.getDomElement('.d-role-field'), values = this.getValues();
        email.value = email.value.replace(/\s/g, '');    // error clearout
        // error clearout
        this.flagField(userName);
        this.flagField(lastName);
        this.flagField(firstName);
        this.flagField(email);    // field validation, error showout
        // field validation, error showout
        if (userName.value.length < 1) {
            this.flagField(userName, true);
        }
        if (lastName.value.length < 1) {
            this.flagField(lastName, true);
        }
        if (firstName.value.length < 1) {
            this.flagField(firstName, true);
        }
        if (!CJ.Utils.validateEmail(email.value)) {
            this.flagField(email, true);
        }    // value store
        // value store
        values.first_name = firstName.value;
        values.last_name = lastName.value;
        values.email = email.value;
        values.company = company.value;
        values.role = role.value;
        return true;
    },
    /**
     * @param {Event} e
     * @returns {undefined}
     */
    onTap(e) {
        let titledField, language, address, purchaseId;
        this.flagField(e.target);
        if (e.getTarget('.d-merge-button', 5))
            return CJ.app.redirectTo('#merge');
        if (e.getTarget('.d-language-item', 5)) {
            language = CJ.Utils.getNodeData(e.getTarget('.d-language-item'), 'language');
            return this.onLanguageSelected(language);
        }
        if (e.getTarget('.d-purchased-item', 5)) {
            purchaseId = CJ.Utils.getNodeData(e.getTarget('.d-purchased-item'), 'purchaseId');
            CJ.view.profile.InvoiceList.popup({ content: { providedInvoiceId: purchaseId } });
            return;
        }
        if (e.getTarget('.d-purchased-content-button', 5))
            return CJ.view.profile.InvoiceList.popup({ content: { ownerAddress: this.getOwnerAddress() } });
        if (e.getTarget('.d-password-save-button', 5) && this.validatePassword())
            return this.savePassword();
        if (e.getTarget('.d-change-address-button', 5) && !e.getTarget('.d-loading'))
            return CJ.view.profile.Address.popup({
                values: this.getOwnerAddress(),
                listeners: {
                    scope: this,
                    actionbuttontap: this.onAddressPopupButtonTap
                }
            });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     * @return {undefined}
     */
    onAddressPopupButtonTap(popup) {
        const form = popup.getContent();
        if (!form.isValid())
            return false;
        CJ.User.saveBillingAddress(form.serialize(), {
            scope: this,
            success: this.onAddressSaveSuccess
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onAddressSaveSuccess(response, request) {
        CJ.User.loadBillingAddress({
            scope: this,
            success: this.onBillingAddressLoaded
        });
        this.getDomElement('.d-change-address-button').classList.add('d-loading');
    },
    /**
     * @param {Object} response
     * @returns {undefined}
     */
    onPurchasesLoaded(response) {
        this.setPurchases(response.ret);
    },
    /**
     * @param {Object} response
     * @returns {undefined}
     */
    onBillingAddressLoaded(response) {
        const element = this.getDomElement('.d-change-address-button'), billAddress = response.ret, address = [
                billAddress.line1,
                billAddress.line2,
                ',\n',
                billAddress.city,
                billAddress.province,
                ',\n',
                billAddress.country,
                billAddress.zip
            ].join(' ');
        this.setOwnerAddress(response.ret);
        if (!element)
            return;
        element.querySelector('.d-owner').innerText = billAddress.name;
        element.querySelector('.d-address').innerText = address;
        element.classList.remove('d-loading');
    },
    /**
     * @returns {undefined}
     */
    savePassword() {
        CJ.User.savePassword(this.getDomElement('.d-current-password').value, this.getDomElement('.d-new-password').value, this.onSavePasswordSuccess, this.onSavePasswordFailure, this);
    },
    /**
     * @returns {undefined}
     */
    onSavePasswordSuccess() {
        this.showNotification('page-register-passwordchanged');
        this.getDomElement('.d-current-password').value = '';
        this.getDomElement('.d-new-password').value = '';
        this.getDomElement('.d-new-password-confirm').value = '';
        this.getDomElement('.d-password-save-button').classList.remove('d-error');
    },
    /**
     * @returns {undefined}
     */
    onSavePasswordFailure() {
        this.showNotification('page-register-passwordnotchanged');
        this.getDomElement('.d-password-save-button').classList.add('d-error');
    },
    /**
     * @param {String} value
     * @returns {undefined}
     */
    onLanguageSelected(value) {
        this.getValues().language = value;
        this.doSubmit(true);
    },
    /**
     * @param {String} value
     * @returns {undefined}
     */
    highlightLanguage(value) {
        const elements = this.innerHtmlElement.dom.querySelectorAll('.d-language-item');
        let elementValue;
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove('d-selected');
            elementValue = CJ.Utils.getNodeData(elements[i], 'language');
            if (elementValue.indexOf(value) > -1)
                elements[i].classList.add('d-selected');
        }
    },
    updateUntranslatableElements() {
        const currentPassField = this.getDomElement('.d-current-password'), newPassField = this.getDomElement('.d-new-password'), newPassConfirmField = this.getDomElement('.d-new-password-confirm');
        currentPassField.placeholder = CJ.t('view-profile-settings-password-current', true);
        newPassField.placeholder = CJ.t('view-profile-settings-password-new', true);
        newPassConfirmField.placeholder = CJ.t('view-profile-settings-password-new-confirm', true);
    },
    /**
     * @param {Event} e
     * @returns {undefined}
     */
    onInput(e) {
        const me = this;
        if (!e.getTarget('.d-basic-profile', 5) && !e.getTarget('.d-network', 5))
            return;
        if (me.validateBasics())
            me.doSubmit(false);
    },
    /**
     * @param {Boolean} loadmask
     * @returns {undefined}
     */
    doSubmit(loadmask) {
        CJ.LoadBar.run();
        CJ.User.update(this.getValues(), this.onUserUpdate, this);
    },
    /**
     * @returns {undefined}
     */
    onUserUpdate(success, data) {
        CJ.LoadBar.finish();
        if (success) {
            this.highlightLanguage(data.language);
            this.updateUntranslatableElements();
            return this.showNotification('view-profile-settings-save-done');
        }    //handling server errors also flagging according fields.
        //handling server errors also flagging according fields.
        switch (data) {
        case 5:
            // wrong email
            return this.flagField(this.getDomElement('.d-email-field'), true);
            break;
        case 6:
            // email already used
            return this.flagField(this.getDomElement('.d-email-field'), true);
            break;
        }
        return this.showNotification('view-profile-settings-save-error');
    },
    /**
     * @param {String} message
     * @param {Boolean} returnValue
     * @returns {Boolean} returns the returnValue parameter
     */
    showNotification(message, returnValue) {
        if (this.getNotificationIsBusy())
            return !!returnValue;
        this.setNotificationIsBusy(true);
        CJ.feedback({ message: CJ.t(message) });
        Ext.defer(function () {
            this.setNotificationIsBusy(false);
        }, 3000, this);
        return !!returnValue;
    },
    /**
     * @param {HTMLElement} element
     * @param {Boolean} incorrect
     * @returns {undefined}
     */
    flagField(element, incorrect) {
        const parentField = Ext.fly(element).findParent('.d-inner-item', 5);
        if (!parentField)
            return;
        parentField.classList.remove('d-incorrect');
        if (incorrect)
            parentField.classList.add('d-incorrect');
    },
    /**
     * @param {String} selector
     * @returns {HTMLElement}
     */
    getDomElement(selector) {
        return this.htmlElement.dom.querySelector(selector);
    },
    /**
     * @returns {undefined}
     */
    attachListeners() {
        this.htmlElement.on('tap', this.onTap, this);
        this.htmlElement.on('input', this.onInput, this, {
            delegate: '.d-input',
            buffer: 200
        });
    },
    /**
     * @returns {undefined}
     */
    destroy() {
        this.innerHtmlElement.destroy();
        this.htmlElement.destroy();
        this.callParent(args);
    }
});