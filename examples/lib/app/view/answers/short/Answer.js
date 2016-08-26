import 'app/view/answers/base/Answer';
import 'app/view/answers/short/Settings';

/**
 * Defines a ShortAnswer.
 */
Ext.define('CJ.view.answers.short.Answer', {
    extend: 'CJ.view.answers.base.Answer',
    alias: 'widget.view-answers-short-answer',
    statics: {
        /**
         * @property {Boolean} hasSettings
         */
        hasSettings: true,
        answerType: 'short'
    },
    config: {
        /**
         * @cfg {Object|Array} settings
         */
        settings: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-short-answer d-answer',
        /**
         * @cfg {Ext.Template} formTpl
         */
        formTpl: Ext.create('Ext.Template', '<div class=\'d-input-field-container\'>', '<input class=\'d-input-field d-input\' type=\'text\' placeholder=\'{placeHolder}\' value="{value}" />', '</div>', '<input type=\'button\' class=\'d-submit-button\' value=\'{buttonText}\' />', { compiled: true }),
        /**
         * @cfg {Ext.Template} editTpl
         */
        editTpl: Ext.create('Ext.Template', '<div class=\'d-input-field-container\'>', '<input class=\'d-input-field\' type=\'text\' placeholder=\'{placeHolder}\' disabled=\'disabled\' />', '</div>', '<input type=\'button\' class=\'d-submit-button\' value=\'{buttonText}\' disabled=\'disabled\' />', { compiled: true }),
        /**
         * @cfg {String} displayTpl
         */
        displayTpl: '<div class=\'d-display-field\'>{value}</div>'
    },
    /**
     * @param {Object} config
     */
    constructor() {
        this.callParent(args);
        this.element.on('input', this.onUpdated, this, { delegate: '.d-input-field' });
    },
    /**
     * @inheritdoc
     */
    toEditState() {
        this.callParent(args);
        this.innerElement.setHtml(this.getEditTpl().apply({
            placeHolder: CJ.app.t('view-answers-short-answer-placeholder', true),
            buttonText: CJ.app.t('view-answers-short-answer-edit-state-submit', true)
        }));
    },
    /**
     * @inheritdoc
     */
    showForm() {
        this.callParent(args);
        this.innerElement.setHtml(this.getFormTpl().apply({
            placeHolder: CJ.app.t('view-answers-short-answer-placeholder', true),
            value: Ext.htmlDecode(this.getValue() || ''),
            buttonText: CJ.app.t('view-answers-short-answer-view-state-submit', true)
        }));
        this.onUpdated();
    },
    /**
     * @param {Boolean} state
     */
    updateIsCorrect(state) {
        const answered = this.isAnswered();
        if (answered) {
            if (state)
                this.element.replaceCls('d-wrong', 'd-correct');
            else
                this.element.replaceCls('d-correct', 'd-wrong');
        }
        return this.callParent(args);
    },
    /**
     * method will be called when user taps on answer's submit-button
     * @param {Ext.Evented} e
     */
    onSubmitButtonTap(e) {
        if (this.getButton().disabled)
            return;
        this.save(this.getEnteredValue());
    },
    /**
     * disables/enables submit-button after text-field update.
     * @return {undefined}
     */
    onUpdated() {
        this.getButton().disabled = Ext.isEmpty(this.getEnteredValue());
    },
    /**
     * @return {String}
     */
    getEnteredValue() {
        return this.getField().value;
    },
    /**
     * @return {HTMLElement}
     */
    getField() {
        return this.element.dom.querySelector('.d-input-field');
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.getFormTpl().destroy();
        this.getEditTpl().destroy();
        this.setFormTpl(null);
        this.setEditTpl(null);
        this.callParent(args);
    }
});