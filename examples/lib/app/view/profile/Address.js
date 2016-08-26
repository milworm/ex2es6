import 'app/core/view/Component';

Ext.define('CJ.view.profile.Address', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-profile-address',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @param {Object} config.listeners
         * @returns {Object}
         */
        popup(config) {
            const values = config.values || {}, listeners = config.listeners || {};
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-address-popup',
                title: 'view-profile-address-title',
                content: {
                    xtype: 'view-profile-address',
                    cls: 'd-address-form d-vbox',
                    type: 'light',
                    values
                },
                actionButton: { text: 'view-profile-address-submit' },
                listeners
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        tpl: Ext.create('Ext.XTemplate', '<input type="text" class="d-input d-name" name="name" placeholder="{nameLabel}" value="{name}" maxlength="70">', '<input type="text" class="d-input d-address" name="line1" placeholder="{addressLabel}" value="{line1}" maxlength="255">', '<input type="text" class="d-input d-address2" name="line2" placeholder="{address2Label}" value="{line2}" maxlength="255" data-optional="true">', '<div class="d-address-input-row d-hbox">', '<input type="text" class="d-input d-city" name="city" placeholder="{cityLabel}" value="{city}" maxlength="25">', '<select class="d-input d-state" name="province">', '<option disabled value="" {[values.province ? "":"selected"]}>{stateLabel}</option>', '<tpl for="provinceOptions">', '<option value="{[values[0]]}" {[values[0] == parent.province ? "selected": ""]}>{[values[1]]}</option>', '</tpl>', '</select>', '</div>', '<div class="d-address-input-row d-hbox">', '<select class="d-input d-country" name="country">', '<option disabled value="" {[values.country ? "":"selected"]}>{countryLabel}</option>', '<tpl for="countryOptions">', '<option value="{[values[0]]}" {[values[0] == parent.country ? "selected": ""]}>{[values[1]]}</option>', '</tpl>', '</select>', '<input type="text" class="d-input d-zip-code" name="zip" placeholder="{zipCodeLabel}" value="{zip}" maxlength="15">', '</div>'),
        statesTpl: Ext.create('Ext.XTemplate', '<option value="{optionValue}" disabled>{selectState}</option>', '<tpl for="states">', '<option value="{[values[0]]}">{[values[1]]}</option>', '</tpl>'),
        /**
         * @cfg {Object} popup
         */
        popup: null,
        /**
         * @cfg {Object} values
         */
        values: null
    },
    /**
     * @param {Object} config
     * @returns {undefined}
     */
    constructor(config) {
        this.callParent(args);
        this.element.on({
            input: this.onFieldChange,
            change: this.onFieldChange,
            scope: this,
            delegate: [
                '.d-zip-code',
                '.d-country'
            ]
        });
    },
    /**
     * @param {Object} data
     * @returns {Object}
     */
    applyData(data) {
        return Ext.apply({
            nameLabel: CJ.t('view-profile-address-name', true),
            addressLabel: CJ.t('view-profile-address-address', true),
            address2Label: CJ.t('view-profile-address-address-2', true),
            cityLabel: CJ.t('view-profile-address-city', true),
            stateLabel: CJ.t('view-profile-address-state'),
            countryLabel: CJ.t('view-profile-address-country'),
            zipCodeLabel: CJ.t('view-profile-address-zip-code', true)
        }, data);
    },
    /**
     * @param {Object} values
     * @return {undefined}
     */
    updateValues(values) {
        this.setData(values);
    },
    /**
     * @param {Event} e
     * @returns {undefined}
     */
    onFieldChange(e) {
        const country = e.getTarget('.d-country', 3), zipCode = e.getTarget('.d-zip-code', 3);
        if (country) {
            if (!country.value)
                return this.onStatesLoaded({ ret: [] });
            this.loadStates();
            this.validateZipCode();
        }
        if (zipCode)
            this.validateZipCode(zipCode);
    },
    /**
     * @param {String} selector
     * @returns {HTMLElement}
     */
    getDomElement(selector) {
        return this.element.dom.querySelector(selector);
    },
    /**
     * @param {HTMLElement} element
     * @returns {Boolean}
     */
    validateZipCode(element) {
        let eValue;
        element = element || this.getDomElement('.d-zip-code');
        eValue = element.value.toUpperCase();
        if (eValue.match(this.regexFromString(this.getCountryZipcode()))) {
            element.classList.remove('d-incorrect');
            return true;
        }
        element.classList.add('d-incorrect');
        return false;
    },
    /**
     * @returns {String}
     */
    getCountryZipcode() {
        const country = this.getDomElement('.d-country').value, countries = this.getValues().countryOptions;
        for (let i = 0, ln = countries.length; i < ln; i++)
            if (countries[i][0] == country)
                return countries[i][2] || '.*';
        return '.*';
    },
    /**
     * @param {String} str
     * @returns {RegExp}
     */
    regexFromString(str) {
        str = str.replace(/@/g, '[A-Z]');
        str = str.replace(/#/g, '[0-9]');
        str = `^${ str }$`;
        return new RegExp(str);
    },
    /**
     * @return {Object}
     */
    serialize() {
        const elements = this.element.query('[name]'), values = {};
        for (let i = 0, ln = elements.length; i < ln; i++)
            values[elements[i].name] = elements[i].value;
        return values;
    },
    /**
     * @returns {Boolean}
     */
    isValid() {
        const elements = this.element.query('[name]:not([data-optional])');
        let pass = true;
        for (let i = 0, ln = elements.length; i < ln; i++) {
            if (!elements[i].value) {
                elements[i].classList.add('d-incorrect');
                pass = false;
            } else
                elements[i].classList.remove('d-incorrect');
        }
        return pass;
    },
    /**
     * @param {Array} states
     * @returns {undefined}
     */
    populateStates(states) {
        const stateDropDown = this.getDomElement('[name=province]');
        stateDropDown.innerHTML = this.getStatesTpl().apply({
            selectState: CJ.t('view-profile-address-state'),
            states
        });
    },
    /**
     * @returns {undefined}
     */
    loadStates() {
        this.setLoading(true);
        CJ.request({
            rpc: {
                model: 'Country',
                method: 'get_province_options'
            },
            params: { country_code: this.getDomElement('[name=country]').value },
            success: this.onStatesLoaded,
            scope: this
        });
    },
    /**
     * @param {Object} response
     * @returns {undefined}
     */
    onStatesLoaded(response) {
        this.populateStates(response.ret);
        this.getDomElement('[name=province]').value = '';
        this.setLoading(false);
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @inheritdoc
     */
    updateLoading(state) {
        const popup = this.getPopup();
        popup && popup.setLoading(state);
        this.callParent(args);
    }
});