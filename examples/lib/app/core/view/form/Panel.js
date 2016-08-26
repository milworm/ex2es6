import 'Ext/form/Panel';

/**
 * Class provides form with validations ability.
 */
Ext.define('CJ.core.view.form.Panel', {
    extend: 'Ext.form.Panel',
    xtype: 'core-view-form-panel',
    config: {
        baseCls: 'd-form-panel',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-form-panel-inner',
        cls: 'fields',
        //        width: 450,
        scrollable: null,
        layout: {
            type: 'vbox',
            align: 'center'
        },
        defaults: {
            xtype: 'textfield',
            clearIcon: false,
            cls: 'd-field',
            autoCapitalize: false,
            autoComplete: false,
            autoCorrect: false
        },
        editableFields: true,
        errorMsg: null,
        submitButton: true,
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null
    },
    /**
     * @return {Ext.Component} container where all fields exist
     */
    getContent() {
        return this;
    },
    /**
     * Initialize component.
     */
    initialize() {
        this.callParent(args);
        this.bindFieldFocus();
        this.bindFieldAction();
    },
    /**
     * @param {Object} newButton
     * @param {Object} oldButton
     */
    updateSubmitButton(newButton, oldButton) {
        if (oldButton)
            oldButton.destroy();
        if (newButton)
            this.getContent().add(newButton);
    },
    /**
     * Initialize errors container.
     * @param {String} message
     * @returns {Ext.Container}
     */
    applyErrorMsg(message) {
        if (!message)
            return false;
        return message;    // return Ext.factory({
                           //     xtype: 'container',
                           //     html: Ext.isString(message) ? CJ.app.t(message) : null,
                           //     cls: 'errors'
                           // });
    },
    setSubmitButtonErrorMsg(message) {
        const popup = this.getPopup();
        if (popup) {
            return popup.setActionButtonErrorMsg(message);
        }
        const button = this.getSubmitButton();
        button[`${ message ? 'add' : 'remove' }Cls`]('error');
        button.setText(CJ.app.t(message || button.initialConfig.text));
    },
    /**
     * Updates errors container.
     * @param {Ext.Container} newConfig
     * @param {Ext.Container} oldConfig
     */
    updateErrorMsg(newConfig, oldConfig) {
        this.setSubmitButtonErrorMsg(newConfig);
    },
    /**
     * Initialize submit button.
     * @param {Boolean/Object} config
     * @returns {Ext.Button}
     */
    applySubmitButton(config) {
        if (!config)
            return false;
        if (config == true)
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            cls: 'submit login d-popup-toolbar',
            handler: this.onFormSubmit,
            scope: this
        });
        return Ext.factory(config);
    },
    /**
     * Bind handler on event 'focus' for all editable fields.
     */
    bindFieldFocus() {
        Ext.each(this.getEditableFields(), function (field) {
            field.on('focus', this.onFieldFocus, this);
        }, this);
    },
    /**
     * Handle of event 'focus' of field.
     * Clears form errors.
     */
    onFieldFocus() {
        this.clearErrors();
    },
    /**
     * Bind handler on event 'action' for all editable fields.
     */
    bindFieldAction() {
        Ext.each(this.getEditableFields(), function (field) {
            field.on('action', this.onFieldAction, this);
        }, this);
    },
    /**
     * Handle of event 'action' of field.
     * Sets focus to next editable field or makes submit if it is last of them.
     */
    onFieldAction(field) {
        const editableField = this.getEditableFields(), lastEditableIndex = editableField.length - 1, fieldIndex = editableField.indexOf(field);
        if (fieldIndex < lastEditableIndex) {
            let i, nextField;
            for (i = fieldIndex + 1; i <= lastEditableIndex; i++) {
                nextField = editableField[i];
                if (Ext.isFunction(nextField.focus)) {
                    nextField.focus();
                    return;
                }
            }
        }
        this.onFormSubmit();
    },
    /**
     * Sets editable fields of form.
     * @returns {Array}
     */
    applyEditableFields() {
        const editableField = [];
        Ext.each(this.query('[isField]'), function (field) {
            if (this.isEditableField(field)) {
                editableField.push(field);
            }
        }, this);
        return editableField;
    },
    /**
     * Returns true if field is editable.
     * @param {Ext.field.Field} field
     * @returns {Boolean}
     */
    isEditableField(field) {
        return !(Ext.isFunction(field.getReadOnly) && field.getReadOnly() || field.isHidden() || field.isDisabled() || field.isXType('hiddenfield'));
    },
    /**
     * Handler of event 'tap' of submit button.
     * Validates and submits form.
     */
    onFormSubmit() {
        if (document.activeElement)
            document.activeElement.blur();
        if (this.isValidForm())
            this.doSubmit();
    },
    /**
     * Validates form
     * @returns {Boolean}
     */
    isValidForm() {
        const fields = this.query('[isField]');
        let isValid = true;
        Ext.each(fields, function (field) {
            const errorMsg = this.validateField(field);
            if (!Ext.isEmpty(errorMsg) && isValid) {
                isValid = false;
                this.setErrorMsg(errorMsg);
                return false;
            }
        }, this);
        return isValid;
    },
    /**
     * Validates field.
     * Returns error message if it's not valid.
     * @param {Ext.field.Field} field
     * @returns {String}
     */
    validateField(field) {
        const validations = field.initialConfig.validations;
        let errorMsg = '';
        if (Ext.isArray(validations)) {
            const value = field.getValue();
            Ext.each(validations, function (config) {
                let result;
                switch (config.type) {
                case 'present':
                    result = !Ext.isEmpty(Ext.isString(value) ? value.trim() : value);
                    break;
                case 'checked':
                    result = field.isXType('checkboxfield') && field.isChecked();
                    break;
                case 'email':
                    result = Ext.data.validations.emailRe.test(value);
                    break;
                case 'length':
                    result = value ? Ext.data.validations.length(config, value) : true;
                    break;
                case 'regexp':
                    result = config.regexp.test(value);
                    break;
                case 'confirm':
                    result = value === this.down(`[name=${ config.confirmFieldName }]`).getValue();
                    break;
                }
                if (!result) {
                    errorMsg = config.message;
                    return false;
                }
            }, this);
        }
        this.markFields(field, !errorMsg);
        return errorMsg;
    },
    /**
     * Mark fields as invalid if state is false or valid otherwise.
     * @param {Ext.field.Field/Array/String} fields Array or single instance or name of field.
     * @param {Boolean} state State of validate.
     */
    markFields(fields, state) {
        fields = Ext.isArray(fields) ? fields : [fields];
        Ext.each(fields, function (field) {
            if (Ext.isString(field)) {
                field = this.down(`[name=${ field }]`);
            }
            if (!(field && field.isField)) {
                return true;
            }
            field[state ? 'removeCls' : 'addCls']('invalid');
        }, this);
    },
    /**
     * Clears errors container and unmark fields.
     */
    clearErrors() {
        this.setErrorMsg(false);
        this.markFields(this.query('[isField]'), true);
    },
    /**
     * Fire event 'dosubmit' with form values.
     */
    doSubmit() {
        this.fireEvent('dosubmit', this.getValues());
    },
    mask() {
        this.denySubmit();
        this.callParent(args);
    },
    unmask() {
        this.allowSubmit();
        this.callParent(args);
    },
    /**
     * @return {undefined}
     */
    denySubmit() {
        const popup = this.getPopup();
        if (popup)
            return popup.denySubmit();
        const button = this.getSubmitButton();
        if (button)
            button.setDisabled(true);
    },
    /**
     * @return {undefined}
     */
    allowSubmit() {
        const popup = this.getPopup();
        if (popup)
            return popup.allowSubmit();
        const button = this.getSubmitButton();
        if (button)
            button.setDisabled(false);
    }
});