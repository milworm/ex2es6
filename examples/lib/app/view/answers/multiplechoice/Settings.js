import 'app/view/answers/base/Settings';

/**
 * Defines a component that allows edit answer's settings 
 * (like correct answers) etc...
 */
Ext.define('CJ.view.answers.multiplechoice.Settings', {
    extend: 'CJ.view.answers.base.Settings',
    alias: 'widget.view-answers-multiplechoice-settings',
    config: {
        cls: 'd-answer-settings d-multiplechoice d-scroll',
        scrollable: CJ.Utils.getScrollable(),
        /**
         * @cfg {Ext.Xtemplate} fieldTpl
         */
        fieldTpl: Ext.create('Ext.XTemplate', '<label class=\'d-radio\' for=\'{id}\'>', '<input type=\'radio\' name=\'option\' id=\'{id}\' {[ values.checked ? \'checked="checked"\' : \'\' ]} />', '<div class=\'d-icon\'></div>', '</label>', '<input type=\'text\' class=\'d-text d-input\' placeholder=\'{placeholder}\' value="{value}">', '<div class=\'d-delete\'></div>')
    },
    constructor() {
        this.callParent(args);
        this.on({
            tap: {
                element: 'element',
                fn: 'addNewItem',
                delegate: '.button'
            }
        });
        this.on({
            tap: {
                element: 'element',
                fn: 'onDeleteIconTap',
                delegate: '.d-delete'
            }
        });
    },
    /**
     * @param {Array} values
     */
    setValues(values undefined this.getDefaultValues()) {
        const items = [], correct = values.correct, options = values.options;
        for (let i = 0, l = options.length; i < l; i++) {
            const option = options[i];
            items.push(this.generateItemConfig({
                value: Ext.htmlEncode(option),
                index: i,
                correct: i === correct
            }));
        }
        items.push({
            ref: 'button',
            xtype: 'core-view-component',
            type: 'light',
            html: CJ.t('tool-question-shortanswer-options-addonemore'),
            cls: 'button'
        });
        this.removeAll();
        this.add(items);
    },
    /**
     * @return {Object}
     */
    getDefaultValues() {
        return {
            correct: null,
            options: [
                '',
                ''
            ]
        };
    },
    /**
     * @return {Object}
     */
    getValues() {
        const fields = this.query('[ref=option]'), values = { options: [] };
        for (let i = 0, field; field = fields[i]; i++) {
            const node = field.element.dom, correct = node.querySelector('[type=radio]').checked, value = node.querySelector('[type=text]').value;
            if (!value)
                continue;
            if (correct)
                values.correct = i;
            values.options.push(value);
        }
        return values;
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    generateItemConfig(config) {
        let cls = 'd-field';
        const config = config || {};
        if (config.index < 2)
            cls += ' d-undeletable';
        return {
            ref: 'option',
            xtype: 'core-view-component',
            cls,
            type: 'light',
            html: this.getFieldTpl().apply({
                value: config.value,
                checked: config.correct,
                placeholder: CJ.t('tool-question-multiplechoice-options-answer', true),
                id: CJ.Guid.generatePhantomId()
            })
        };
    },
    /**
     * @return {undefined}
     */
    addNewItem() {
        const count = this.getItems().getCount();
        this.insert(count - 1, this.generateItemConfig({ index: count }));    // max 10 items allowed
        // max 10 items allowed
        if (count == 10)
            this.down('[ref=\'button\']').hide();
        if (Ext.browser.is.IE)
            this.getPopup().recalculateHeight();
    },
    /**
     * @param {Ext.Evented} e
     */
    onDeleteIconTap(e) {
        const id = e.getTarget('.d-field', 10, true).id;
        Ext.getCmp(id).destroy();
        this.down('[ref=button]').show();
        if (Ext.browser.is.IE)
            this.getPopup().recalculateHeight();
    }
});