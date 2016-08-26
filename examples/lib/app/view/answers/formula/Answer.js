import 'app/view/answers/base/Answer';
import 'app/view/tool/formula/Tool';

/**
 * Defines a Formula-type answer.
 */
Ext.define('CJ.view.answers.formula.Answer', {
    extend: 'CJ.view.answers.base.Answer',
    alias: 'widget.view-answers-formula-answer',
    statics: { answerType: 'formula' },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-formula-answer d-answer',
        /**
         * @cfg {String} formTpl
         */
        formTpl: '<input type=\'button\' class=\'d-submit-button\' value=\'{button}\' />',
        /**
         * @cfg {String} editTpl
         */
        editTpl: '<input type=\'button\' class=\'d-submit-button\' value=\'{button}\' disabled=\'disabled\' />',
        /**
         * @cfg {String} displayTpl
         */
        displayTpl: '<div class=\'d-display-field\'><span class=\'formula\'>{formula}</span></div>'
    },
    /**
     * formula answer-type doesn't have settings
     */
    editSettings() {
    },
    /**
     * @return {String} state
     */
    toEditState() {
        this.callParent(args);
        this.innerElement.setHtml(this.getEditTpl().replace('{button}', CJ.app.t('view-answers-formula-answer-submit', true)));
    },
    /**
     * @return {mixed} dom node or mathquill instance if already initiated
     */
    initMathquillSpan() {
        return MathQuill.StaticMath(this.element.dom.querySelector('span.formula'));
    },
    /**
     * @inheritdoc
     */
    showForm() {
        this.callParent(args);
        this.innerElement.setHtml(this.getFormTpl().replace('{button}', CJ.app.t('view-answers-formula-answer-submit', true)));
    },
    /**
     * @inheritdoc
     */
    showResult() {
        const html = [];
        const value = this.getValue();
        let formula = value.formula;    //validate it's not already a latex formula if theres a preview
        //validate it's not already a latex formula if theres a preview
        if (value.preview && !/[{}\\}]/.test(formula))
            formula = Ux.FormulaLatexConverter.convert(formula);
        if (this.getShowValue())
            html.push(this.getDisplayTpl().replace('{formula}', formula));
        if (this.getShowResult())
            html.push(this.getResultTpl().apply({
                answer: this.getValue(),
                type: this.getValidState(),
                canRetry: this.getQuestionOptions().canResubmit,
                removeButton: CJ.User.isMine(this.getBlock())
            }));
        this.innerElement.setHtml(html.join(''));
        if (this.rendered)
            return this.initMathquillSpan();    // can't use painted as it will fire after some delay, so next frame is
                                                // the best choice here (also this way prevents any scroll-jumps during
                                                // restoring list state)
        // can't use painted as it will fire after some delay, so next frame is
        // the best choice here (also this way prevents any scroll-jumps during
        // restoring list state)
        Ext.TaskQueue.requestWrite(function () {
            this.initMathquillSpan();
        }, this);
    },
    /**
     * method will be called when user taps on answer's submit-button
     * @param {Ext.Evented} e
     */
    onSubmitButtonTap(e) {
        CJ.view.tool.formula.Tool.showEditing({
            listeners: {
                scope: this,
                actionbuttontap: this.onAnswered,
                order: 'after'
            }
        });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onAnswered(popup) {
        this.save(popup.getContent().getValues());
    },
    /**
     * @param {Object} value
     * @return {Object}
     */
    applyValue(value) {
        if (value)
            value.formula = CJ.view.tool.formula.Tool.decode(value);
        return value;
    },
    /**
     * @param {Object} value
     */
    save(value) {
        if (value)
            value = { formula: CJ.view.tool.formula.Tool.encode(value) };
        return this.callParent(args);
    },
    /**
     * @return {Object}
     */
    serialize() {
        this.applyChanges();
        let value = this.getValue();
        if (value)
            value = { formula: CJ.view.tool.formula.Tool.encode(value) };
        return {
            settings: this.getSettings(),
            xtype: this.xtype,
            value,
            docId: this.getDocId(),
            appVer: CJ.constant.appVer
        };
    }
});