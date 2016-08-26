import 'app/view/answers/base/Settings';

/**
 * Defines a component that allows edit answer's settings 
 * (like correct answers) etc...
 */
Ext.define('CJ.view.answers.short.Settings', {
    extend: 'CJ.view.answers.base.Settings',
    alias: 'widget.view-answers-short-settings',
    config: {
        cls: 'd-answer-settings d-short d-scroll',
        scrollable: CJ.Utils.getScrollable(),
        listeners: {
            tap: {
                element: 'element',
                fn: 'addNewItem',
                delegate: '.button'
            }
        }
    },
    /**
     * @param {Object} values
     */
    setValues(values undefined {}) {
        const items = [];
        let settingsItems = values.correct;
        if (!settingsItems || settingsItems.length == 0)
            settingsItems = [''];
        for (let i = 0, l = settingsItems.length; i < l; i++)
            items.push(this.generateItemConfig({ value: settingsItems[i] }));
        items.push({
            ref: 'button',
            xtype: 'core-view-component',
            type: 'light',
            html: CJ.app.t('tool-question-shortanswer-options-addonemore'),
            cls: 'button'
        });
        this.removeAll();
        this.add(items);
    },
    /**
     * @return {Object}
     */
    getValues() {
        const fields = this.query('textfield'), values = [];
        for (let i = 0, field; field = fields[i]; i++) {
            const value = field.getValue();
            if (value)
                values.push(value);
        }
        return { correct: values };
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    generateItemConfig(config) {
        return Ext.apply(config || {}, {
            xtype: 'textfield',
            clearIcon: false,
            placeHolder: 'tool-question-shortanswer-options-entergoodanswer'
        });
    },
    /**
     * @return {undefined}
     */
    addNewItem() {
        // insert before button
        this.insert(this.getItems().getCount() - 1, this.generateItemConfig());
        if (Ext.browser.is.IE)
            this.getPopup().recalculateHeight();
    }
});