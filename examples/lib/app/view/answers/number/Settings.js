import 'app/view/answers/text/Settings';

/**
 * Defines a component that allows edit answer's settings 
 * (like correct answers) etc...
 */
Ext.define('CJ.view.answers.number.Settings', {
    extend: 'CJ.view.answers.text.Settings',
    alias: 'widget.view-answers-number-settings',
    config: {
        cls: 'd-number d-answer-settings d-scroll',
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
            placeHolder: '0'
        },
        valueRE: '^[0-9\\.\\-\\+,%]+$'
    },
    /**
     * @return {Array}
     */
    getItemsConfig() {
        return [
            {
                flex: 1,
                name: 'min',
                listeners: {
                    scope: this,
                    keypress: {
                        element: 'element',
                        delegate: 'input',
                        fn: this.onFieldKeyPress
                    }
                }
            },
            {
                cls: 'd-center',
                xtype: 'core-view-component',
                type: 'light',
                html: CJ.app.t('view-answers-number-settings-and')
            },
            {
                flex: 1,
                name: 'max',
                listeners: {
                    scope: this,
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
                    html: CJ.app.t('view-answers-number-settings-field-title'),
                    className: 'd-title'
                },
                {
                    reference: 'innerElement',
                    className: 'x-inner'
                }
            ]
        };
    }
});