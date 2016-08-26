import 'Ext/Component';

/**
 * Defines a component that can be used to show labelable segmented button
 */
Ext.define('CJ.core.view.LightSegmentedButton', {
    extend: 'Ext.Component',
    alias: 'widget.view-light-segmented-button',
    config: {
        cls: 'd-light-segmented-button',
        /**
         * @param {Array} buttons
         */
        buttons: null,
        /**
         * @cfg {String} fieldLabel
         */
        fieldLabel: null,
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {String} pressed
         */
        pressed: null,
        /**
         * @cfg {String} name
         */
        name: null,
        /**
         * @cfg {Boolean} booleanMode
         */
        booleanMode: false,
        /**
         * @cfg {Array} disabledButtons List of values for all buttons that 
         *                              should be disabled.
         */
        disabledButtons: [],
        /**
         * @cfg {Array} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<tpl if="fieldLabel">', '<span class="d-label">{fieldLabel}</span>', '</tpl>', '<div class="d-buttons">', '<tpl for="buttons">', '<div class="{[ this.getButtonCls(values, parent) ]}" data-value="{value}">', '<span>{text}</span>', '</div>', '</tpl>', '</div>', {
            compiled: true,
            getButtonCls(values, parent) {
                const cls = ['d-button'];
                if (values.hidden)
                    cls.push('d-hidden');
                if (parent.pressed == values.value)
                    cls.push('d-pressed');
                if (values.cls)
                    cls.push(values.cls);
                if (parent.disabledButtons.indexOf(values.value) > -1)
                    cls.push('d-disabled');
                return cls.join(' ');
            }
        }),
        listeners: {
            tap: {
                element: 'element',
                fn: 'onElementTap',
                delegate: '.d-button'
            }
        }
    },
    constructor() {
        this.callParent(args);
        const pressed = this.getPressed();
        this.setData({
            disabledButtons: this.getDisabledButtons(),
            buttons: this.getButtons(),
            fieldLabel: this.getFieldLabel(),
            pressed
        });
        if (!Ext.isEmpty(pressed))
            this.fireChangeEvent();
    },
    /**
     * @param {Array} disabledButtons
     * @return {Array}
     */
    applyDisabledButtons(disabledButtons) {
        return disabledButtons || [];
    },
    /**
     * @param {Array} disabledButtons
     */
    updateDisabledButtons(disabledButtons) {
        if (!this.initialized)
            return;
        this.setData(Ext.apply(this.getData(), { disabledButtons }));
    },
    applyBooleanMode(config) {
        if (!config)
            return false;
        const buttons = this.getButtons();
        if (buttons)
            return config;
        this.setButtons([
            {
                text: CJ.app.t('yes'),
                value: 1
            },
            {
                text: CJ.app.t('no'),
                value: 0
            }
        ]);
        return config;
    },
    /**
     * @param {Array} buttons
     */
    updateButtons(buttons) {
        if (!this.initialized)
            return;
        this.setData(Ext.apply(this.getData(), { buttons }));
    },
    /**
     * @param {String} fieldLabel
     */
    updateFieldLabel(fieldLabel) {
        if (!this.initialized)
            return;
        this.setData(Ext.apply(this.getData(), { fieldLabel }));
    },
    applyPressed(config) {
        const booleanMode = this.getBooleanMode();
        if (booleanMode)
            config = +config ? 1 : 0;
        return config;
    },
    /**
     * @param {String} pressed
     */
    updatePressed(pressed) {
        if (!this.initialized)
            return;
        this.setData(Ext.apply(this.getData(), { pressed }));
        this.fireChangeEvent();
    },
    /**
     * @param {Object} e
     */
    onElementTap(e) {
        const button = e.getTarget('.d-button', 5), value = CJ.getNodeData(button, 'value');
        if (this.canPress(value))
            return;
        this.setPressed(value);
        this.fireEvent('itemtap', this, this.getPressed(), this.getPressedButton());
    },
    /**
     * @param {String} value
     * @return {Boolean} true if user is able to presss on #value button.
     */
    canPress(value) {
        if (this.getDisabled())
            return false;
        return this.getDisabledButtons().indexOf(value) > -1;
    },
    /**
     * @return {String} value
     */
    getValue() {
        let pressed = this.getPressed();
        if (this.getBooleanMode())
            pressed = !!pressed;
        return pressed;
    },
    /**
     * @param {String} value
     */
    setValue(value) {
        if (this.getBooleanMode())
            value = value ? 1 : 0;
        this.setPressed(value);
    },
    /**
     * @return {Array} list of button-nodes
     */
    getButtonNodes() {
        return this.element.query('.d-button');
    },
    /**
     * @return {Ext.Element}
     */
    getPressedButton() {
        return this.element.down('.d-pressed');
    },
    /**
     * @return {undefined}
     */
    destroy() {
        Ext.each(this.element.query('[id]'), node => {
            delete Ext.cache[node.id];
        });
        return this.callParent(args);
    },
    /**
     * @return {undefined}
     */
    fireChangeEvent() {
        this.fireEvent('change', this, this.getPressed());
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    }
});