import 'app/view/answers/base/Settings';

/**
 * Defines a component that allows edit answer's settings 
 * (like correct answers) etc...
 */
Ext.define('CJ.view.answers.text.Settings', {
    extend: 'CJ.view.answers.base.Settings',
    alias: 'widget.view-answers-text-settings',
    config: {
        cls: 'd-text d-answer-settings d-scroll',
        listeners: {
            tap: {
                element: 'element',
                fn: 'addNewItem',
                delegate: '.button'
            }
        },
        layout: {
            type: 'hbox',
            align: 'end'
        },
        defaults: {
            width: 105,
            xtype: 'textfield',
            clearIcon: false,
            placeHolder: '0',
            labelWidth: false,
            flex: 1
        },
        items: [],
        valueRE: '^\\d+$'
    },
    /**
     * @param {Array} items
     */
    applyItems(items) {
        items = this.getItemsConfig();
        return this.callParent(args);
    },
    /**
     * @return {Array}
     */
    getItemsConfig() {
        return [
            {
                name: 'min',
                label: CJ.app.t('view-answers-text-settings-optional'),
                placeHolder: CJ.app.t('view-answers-text-settings-min-placeholder'),
                listeners: {
                    scope: this,
                    change: this.onMinValueChanged,
                    keypress: {
                        element: 'element',
                        delegate: 'input',
                        fn: this.onFieldKeyPress
                    }
                }
            },
            {
                name: 'max',
                label: CJ.app.t('view-answers-text-settings-optional'),
                placeHolder: CJ.app.t('view-answers-text-settings-max-placeholder'),
                listeners: {
                    scope: this,
                    change: this.onMaxValueChanged,
                    keypress: {
                        element: 'element',
                        delegate: 'input',
                        fn: this.onFieldKeyPress
                    }
                }
            }
        ];
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: [
                'x-container',
                'x-unsized'
            ],
            children: [
                {
                    reference: 'label',
                    html: CJ.app.t('view-answers-text-settings-field-title'),
                    className: 'd-title'
                },
                {
                    reference: 'innerElement',
                    className: 'x-inner'
                }
            ]
        };
    },
    /**
     * @param {Array} values
     */
    setValues(values undefined {}) {
        for (const k in values) {
            const name = Ext.String.format('[name={0}]', k), value = values[k];
            if (value)
                this.down(name).setValue(value);
        }
    },
    /**
     * @return {Object}
     */
    getValues() {
        const fields = this.query('[name]'), values = {};
        for (let i = 0, field; field = fields[i]; i++) {
            let value = field.getValue();
            const re = new RegExp(this.getValueRE(), 'g');
            if (!re.test(value))
                value = false;
            values[field.getName()] = value;
        }
        return values;
    },
    onMinValueChanged(field, minValue) {
        const maxField = this.down('[name=max]');
        let maxValue = maxField.getValue();
        minValue = parseInt(minValue);
        maxValue = parseInt(maxValue);
        if (!Ext.isNumeric(minValue) || !Ext.isNumeric(maxValue))
            return;
        if (minValue > maxValue) {
            maxField.suspendEvents();
            maxField.setValue(minValue);
            maxField.resumeEvents(true);
        }
    },
    onMaxValueChanged(field, maxValue) {
        const minField = this.down('[name=min]');
        let minValue = minField.getValue();
        minValue = parseInt(minValue);
        maxValue = parseInt(maxValue);
        if (!Ext.isNumeric(minValue) || !Ext.isNumeric(maxValue))
            return;
        if (minValue > maxValue) {
            minField.suspendEvents();
            minField.setValue(maxValue);
            minField.resumeEvents(true);
        }
    },
    /**
     * strips all non-numeric symbols
     * @param {Ext.Evented} e
     */
    onFieldKeyPress(e) {
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
        const symbol = String.fromCharCode(e.event.charCode), re = new RegExp(this.getValueRE(), 'g');
        if (!re.test(symbol)) {
            e.stopEvent();
        }
    }
});