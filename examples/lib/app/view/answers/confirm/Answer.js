import 'app/view/answers/base/Answer';
import 'app/view/answers/confirm/Settings';

/**
 * Defines confirmation answer type
 */
Ext.define('CJ.view.answers.confirm.Answer', {
    extend: 'CJ.view.answers.base.Answer',
    alias: 'widget.view-answers-confirm-answer',
    statics: {
        /**
         * @property {Boolean} hasSettings
         */
        hasSettings: true,
        answerType: 'confirm',
        settingsTitle: 'view-answers-confirm-settings-title'
    },
    /**
     * @property {Boolean} isConfirm
     */
    isConfirm: true,
    config: {
        /**
         * @cfg {Object|Array} settings
         */
        settings: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-confirm-answer',
        /**
         * @cfg {Boolean} showValue
         */
        showValue: false,
        /**
         * @cfg {String} formTpl
         */
        formTpl: '<input type="button" class="d-submit-button" value="{button}" />',
        /**
         * @cfg {String} editTpl
         */
        editTpl: '<input type="button" class="d-submit-button" value="{button}" disabled="disabled" />',
        /**
         * @cfg {String} displayTpl
         */
        displayTpl: Ext.create('Ext.XTemplate', '{settings.title}', { compiled: true })
    },
    /**
     * @return {String}
     */
    getTitle() {
        return Ext.htmlEncode(this.getSettings().title);
    },
    /**
     * @inheritdoc
     */
    toEditState() {
        this.callParent(args);
        this.innerElement.setHtml(this.getEditTpl().replace('{button}', this.getTitle()));
    },
    /**
     * @inheritdoc
     */
    showForm() {
        this.callParent(args);
        this.innerElement.setHtml(this.getFormTpl().replace('{button}', this.getTitle()));
    },
    /**
     * @return {Boolean} always true
     */
    getEnteredValue() {
        return true;
    },
    /**
     * in case when user updates settings we should redraw button's text
     */
    updateSettings() {
        if (!this.initialized)
            return;
        this.updateEditing(this.getEditing());
    }
});