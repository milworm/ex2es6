import 'app/view/profile/Address';

Ext.define('CJ.view.purchase.form.Address', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.profile.Address',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-purchase-form-address',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-purchase-form-address',
        /**
         * @inheritdoc
         */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-purchase-form-address-inner d-vbox">', '<div class="d-form-title">{title}</div>', '<div class="d-field d-hbox d-vcenter">', '<input type="text" class="d-input d-name" name="name" placeholder="{nameLabel}" value="{name}" maxlength="70">', '</div>', '<div class="d-field d-hbox d-vcenter">', '<input type="text" class="d-input d-address" name="line1" placeholder="{addressLabel}" value="{line1}" maxlength="255" autocomplete="address-line1">', '</div>', '<div class="d-field d-hbox d-vcenter">', '<input type="text" class="d-input d-address2" name="line2" placeholder="{address2Label}" value="{line2}" maxlength="255" data-optional="true" autocomplete="address-line2">', '</div>', '<div class="d-field d-select-field d-hbox d-vcenter">', '<select class="d-input d-country" name="country">', '<option value="" {[values.country ? "":"selected"]} disabled>{countryLabel}</option>', '<tpl for="countryOptions">', '<option value="{[values[0]]}" {[values[0] == parent.country ? "selected": ""]}>{[values[1]]}</option>', '</tpl>', '</select>', '<i></i>', '</div>', '<div class="d-field d-select-field d-hbox d-vcenter">', '<select class="d-input d-state" name="province">', '<option value="" {[values.state ? "":"selected"]} disabled>{stateLabel}</option>', '<tpl for="provinceOptions">', '<option value="{[values[0]]}" {[values[0] == parent.province ? "selected": ""]}>{[values[1]]}</option>', '</tpl>', '</select>', '<i></i>', '</div>', '<div class="d-field d-hbox d-vcenter">', '<input type="text" class="d-input d-city" name="city" placeholder="{cityLabel}" value="{city}" maxlength="25">', '</div>', '<div class="d-field d-hbox d-vcenter">', '<input type="text" class="d-input d-zip-code" name="zip" placeholder="{zipCodeLabel}" value="{zip}" maxlength="15">', '</div>', '<button class="d-button">{button}</button>', '</div>', { compiled: true })
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onButtonTap, this, {
            delegate: '.d-button',
            delay: 250    // user could click to fast, so mandatory fields could be empty.
        });
        this.element.on('input', this.onChange, this, {
            delegate: '.d-input',
            delay: 250
        });
        this.element.on('change', this.onChange, this, {
            delegate: 'select',
            delay: 250
        });
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        Ext.apply(data, {
            title: CJ.t('view-purchase-form-address-title'),
            button: CJ.t('view-purchase-form-address-button', true)
        });
        return this.callParent(args);
    },
    /**
     * @param {Object} values
     * @return {undefined}
     */
    updateValues() {
        this.callParent(args);
        this.onChange();
    },
    /**
     * @param {Ext.Evented} e
     */
    onChange(e) {
        this.getButton().disabled = !this.isValid();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onButtonTap(e) {
        if (e.target.disabled)
            return;
        const address = this.serialize();
        this.setLoading(true);
        CJ.User.saveBillingAddress(address, {
            stash: { address },
            scope: this,
            success: this.onSaveAddressSuccess
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onSaveAddressSuccess(response, request) {
        Ext.apply(this.getValues(), request.stash.address);
        this.setLoading(false);
        this.initialConfig.parent.nextStep();
    },
    /**
     * @return {HTMLElement}
     */
    getButton() {
        return this.element.dom.querySelector('.d-button');
    }
});