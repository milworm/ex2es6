import 'app/view/answers/base/Answer';
import 'app/view/answers/number/Settings';

/**
 * Defines an answer type, where the answer is just a number, 
 * that can be limited.
 */
Ext.define('CJ.view.answers.number.Answer', {
    extend: 'CJ.view.answers.base.Answer',
    alias: 'widget.view-answers-number-answer',
    statics: {
        /**
         * @property {Boolean} hasSettings
         */
        hasSettings: true,
        answerType: 'number'
    },
    config: {
        /**
         * @cfg {Object|Array} settings
         */
        settings: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-number-answer d-answer',
        /**
         * @cfg {Ext.Template} formTpl
         */
        formTpl: Ext.create('Ext.Template', '<div class=\'d-input-field-container\'>', '<input class=\'d-input-field d-input\' type=\'text\' placeholder=\'{placeHolder}\' value=\'{value}\' />', '</div>', '<input type=\'button\' class=\'d-submit-button\' value=\'{buttonText}\' />', { compiled: true }),
        /**
         * @cfg {Ext.Template} editTpl
         */
        editTpl: Ext.create('Ext.Template', '<div class=\'d-input-field-container\'>', '<input class=\'d-input-field\' type=\'text\' placeholder=\'{placeHolder}\' value=\'{value}\' disabled=\'disabled\' />', '</div>', '<input type=\'button\' class=\'d-submit-button\' value=\'{buttonText}\' disabled=\'disabled\' />', { compiled: true }),
        /**
         * @cfg {String} displayTpl
         */
        displayTpl: '<div class=\'d-display-field\'>{value}</div>'
    },
    constructor() {
        this.callParent(args);
        this.element.on('input', this.onUpdated, this, { delegate: '.d-input-field' });
        this.element.on('keypress', this.onFieldKeyPress, this, { delegate: '.d-input-field' });
    },
    /**
     * @inheritdoc
     */
    toEditState() {
        this.callParent(args);
        this.innerElement.setHtml(this.getEditTpl().apply({
            placeHolder: CJ.app.t('view-answers-number-answer-placeholder', true),
            buttonText: CJ.app.t('view-answers-number-answer-edit-state-submit', true)
        }));
    },
    /**
     * @inheritdoc
     */
    showForm() {
        this.callParent(args);
        this.innerElement.setHtml(this.getFormTpl().apply({
            placeHolder: CJ.app.t('view-answers-number-answer-placeholder', true),
            value: Ext.htmlDecode(this.getValue() || ''),
            buttonText: CJ.app.t('view-answers-number-answer-view-state-submit', true)
        }));
        this.onUpdated();
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
     * @return {undefined}
     */
    onUpdated() {
        const button = this.getButton();
        const field = this.getField();
        let value = field.value;
        if (!/^[0-9\.\-\+,%]+$/g.test(value)) {
            value = '';
            field.value = value;
        }
        button.disabled = Ext.isEmpty(value);
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
        if (!e.event.charCode)
            return;
        const symbol = String.fromCharCode(e.event.charCode);
        if (!/^[0-9\.\-\+,%]+$/g.test(symbol))
            e.stopEvent();
    },
    /**
     * @return {Boolean}
     */
    isAnswered() {
        return /^[0-9\.\-\+,%]+$/g.test(this.getValue());
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
    getButton() {
        return this.element.dom.querySelector('.d-submit-button');
    },
    /**
     * @return {HTMLElement}
     */
    getField() {
        return this.element.dom.querySelector('.d-input-field');
    }
});