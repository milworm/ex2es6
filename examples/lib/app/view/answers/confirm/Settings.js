import 'app/view/answers/base/Settings';

/**
 * Defines an interface to create/edit a confirm-answer-type.
 */
Ext.define('CJ.view.answers.confirm.Settings', {
    extend: 'CJ.view.answers.base.Settings',
    alias: 'widget.view-answers-confirm-settings',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer-settings d-confirm',
        /**
         * @cfg {Array} items
         */
        items: [],
        values: {}
    },
    /**
     * @param {Array} items
     */
    applyItems(items) {
        items = [{
                xtype: 'textfield',
                clearIcon: false,
                name: 'title',
                placeHolder: CJ.app.t('view-answers-confirm-settings-placeholder', true)
            }];
        return this.callParent(args);
    },
    setValues(values undefined {}) {
        if (values.title)
            this.down('[name=title]').setValue(values.title);
    },
    /**
     * @return {Object}
     */
    getValues() {
        const titleField = this.down('[name=title]');
        return { title: titleField.getValue() || titleField.getPlaceHolder() };
    }
});