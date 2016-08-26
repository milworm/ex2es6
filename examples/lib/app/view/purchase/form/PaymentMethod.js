import 'app/core/view/Component';

Ext.define('CJ.view.purchase.form.PaymentMethod', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-form-payment-method',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} values
         */
        values: null,
        /**
         * @property {Boolean} type
         */
        type: 'light',
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Number} card
         */
        card: null,
        /**
         * @cfg {String} type
         */
        cardType: null,
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-purchase-form-payment-method\'>', '<div class=\'d-block-title\'>{title}</div>', '<div class=\'d-form-title\'>TOTAL ${total}</div>', '<input type=\'text\' class=\'d-input\' name=\'name\' placeholder=\'{namePlaceholder}\' value=\'{name}\' autocomplete=\'cc-name\'>', '<div class=\'d-card-field\'>', '<input type=\'text\' class=\'d-input d-card-input\' name=\'number\' maxlength=\'19\' placeholder=\'{numberPlaceholder}\' autocomplete=\'cc-number\'>', '</div>', '<div class=\'d-card-info d-hbox\'>', '<input type=\'text\' class=\'d-input\' placeholder=\'{monthPlaceholder}\' maxlength=\'2\' name=\'exp_month\' autocomplete=\'cc-exp-month\'>', '<input type=\'text\' class=\'d-input\' placeholder=\'{yearPlaceholder}\' maxlength=\'4\' name=\'exp_year\' autocomplete=\'cc-exp-year\'>', '<input type=\'text\' class=\'d-input\' placeholder=\'{cvcPlaceholder}\' maxlength=\'3\' name=\'cvc\' autocomplete=\'cc-exp-csc\'>', '</div>', '<label class=\'d-checkbox\'>', '<input type=\'checkbox\' checked=\'checked\'>', '<div class=\'d-icon\'></div>', '<span>{saveBilling}</span>', '</label>', '<div class=\'d-button d-active\'>{confirmButton}</div>', '</div>', { compiled: true })
    },
    constructor() {
        this.callParent(args);
        this.element.on({
            input: this.onCardFieldInput,
            keydown: this.onCardFieldKeyDown,
            scope: this,
            delegate: '.d-card-input'
        });
        this.element.on('tap', this.onButtonTap, this, { delegate: '.d-button' });
    },
    /**
     * @param {Object} values
     * @return {undefined}
     */
    updateValues(values) {
        this.setData(values);
    },
    /**
     * @param {Boolean} state
     */
    updateLoading(state) {
        const node = this.element.dom.querySelector('.d-purchase-form-payment-method');
        node.classList[state ? 'add' : 'remove']('d-loading');
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        return Ext.apply(data, {
            saveBilling: CJ.t('view-purchase-form-payment-method-save-billing'),
            numberPlaceholder: CJ.t('view-purchase-form-payment-method-number-placeholder', true),
            namePlaceholder: CJ.t('view-purchase-form-payment-method-name-placeholder', true),
            monthPlaceholder: CJ.t('view-purchase-form-payment-method-month-placeholder', true),
            yearPlaceholder: CJ.t('view-purchase-form-payment-method-year-placeholder', true),
            cvcPlaceholder: CJ.t('view-purchase-form-payment-method-cvc-placeholder', true),
            confirmButton: CJ.t('view-purchase-form-payment-method-confirm-button'),
            name: CJ.User.get('name')
        });
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onCardFieldInput(e) {
        const target = e.target;
        let number = target.value;
        const length = number.length;
        number = number.replace(/[^0-9]/g, '');
        if (!number.length) {
            this.setCardType(false);
            target.value = '';
            return;
        }
        const index = target.selectionStart;
        let type = false;
        if (number[0] == '4')
            type = 'visa';
        else if (number[0] == '5')
            type = 'mastercard';
        else if (/^(34|37)/.test(number))
            type = 'amex';
        this.setCardType(type);
        switch (type) {
        case 'amex': {
                number = [
                    number.substr(0, 4),
                    number.substr(4, 6),
                    number.substr(10, 5)
                ];
                break;
            }
        default: {
                number = number.match(/.{1,4}/g);
                break;
            }
        }
        number = number.filter(s => !!s).join(' ');
        target.value = number;
        const lengthDiff = number.length - length;
        target.setSelectionRange(index + lengthDiff, index + lengthDiff);
        target.maxLength = type == 'amex' ? 17 : 19;
    },
    /**
     * handles keydown-event, used only to move cursor to correct position when user hits backspace-key.
     * @param {Ext.Evented} e
     */
    onCardFieldKeyDown(e) {
        if (e.browserEvent.keyCode != 8)
            return;
        const target = e.target, value = target.value, index = target.selectionStart;
        if (value[index - 1] != ' ')
            return;
        target.setSelectionRange(index - 1, index - 1);
        e.stopEvent();
    },
    /**
     * @param {String} type
     * @return {undefined}
     */
    updateCardType(newType, oldType) {
        const element = this.element.dom.querySelector('.d-card-field');
        if (oldType)
            element.classList.remove(`d-${ oldType }`);
        if (newType)
            element.classList.add(`d-${ newType }`);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onButtonTap(e) {
        const data = this.collectPaymentData();
        Stripe.setPublishableKey(CJ.constant.STRIPE_KEY);
        Stripe.card.createToken(data, this.onCreateTokenCallback.bind(this));
        this.setLoading(true);
    },
    /**
     * @return {Object}
     */
    collectPaymentData() {
        const inputs = this.element.dom.querySelectorAll('[name]'), data = {};
        for (let i = 0, input; input = inputs[i]; i++) {
            // some field is missing.
            if (!input.value)
                continue;
            data[input.name] = input.value;
        }
        return data;
    },
    /**
     * method will be called when we receive a response from Stripe back-end.
     * @return {undefined}
     */
    onCreateTokenCallback(status, response) {
        this.resetInvalid();
        if (response.error) {
            this.setLoading(false);
            const param = response.error.param;
            if (Ext.Array.contains([
                    'number',
                    'exp_year',
                    'exp_month',
                    'cvc'
                ], param))
                this.makeInvalid(param);
            else
                CJ.alert(CJ.t('msg-feedback-failure'), CJ.t('view-purchase-form-payment-method-error'));
            return;
        }
        const token = response.id, values = this.getValues(), docId = values.blockId, quantity = values.quantity, promoCode = values.promoCode;
        CJ.License.purchase(docId, token, quantity, promoCode, {
            scope: this,
            success: this.onLicensePurchaseSuccess,
            failure: this.onLicensePurchaseFailure
        });
    },
    /**
     * @param {String} name
     */
    makeInvalid(name) {
        const selector = CJ.tpl('[name={0}]', name), input = this.element.dom.querySelector(selector);
        input.classList.add('d-invalid');
    },
    /**
     * clears all invalid fields on the form.
     * @return {undefined}
     */
    resetInvalid() {
        const fields = this.element.dom.querySelectorAll('.d-invalid');
        for (let i = 0, field; field = fields[i]; i++)
            field.classList.remove('d-invalid');
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onLicensePurchaseSuccess(response) {
        const blockId = this.getValues().blockId, block = CJ.byDocId(blockId);
        CJ.License.setData({
            license: response.ret,
            blockId
        });
        this.initialConfig.parent.nextStep();    // block could be just a reused activity (when user uses buys more).
        // block could be just a reused activity (when user uses buys more).
        if (block && block.isLicensedBlock)
            block.replaceWithRealBlock();
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onLicensePurchaseFailure(response) {
        let msg = '';
        switch (response.errCode) {
        case 'NOTPERMITTED':
            msg = 'notpermited';
            break;
        case 'PAYMENTREFUSED':
            msg = 'paymentrefused';
            break;
        }
        this.setLoading(false);
        CJ.alert(CJ.t('msg-feedback-failure'), CJ.t(`view-purchase-form-payment-method-error-${ msg }`));
    }
});