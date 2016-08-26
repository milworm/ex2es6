import 'Ext/Component';
import 'app/view/answers/base/Settings';

/**
 * Base class for all kind of answers, e.g: numeric, short, multichoice etc ...
 */
Ext.define('CJ.view.answers.base.Answer', {
    extend: 'Ext.Component',
    /**
     * @property {Object} mixins
     */
    mixins: { editable: 'CJ.view.mixins.Editable' },
    /**
     * @property {Boolean} isAnswerType
     */
    isAnswer: true,
    /**
     * @property {Boolean} isOptimized
     */
    isOptimized: true,
    inheritableStatics: {
        /**
         * @property {String} settingsTitle
         */
        settingsTitle: 'view-answers-base-options-title',
        /**
         * shows answer's settings popup
         * @param {Object} config
         * @param {Object} config.listeners
         * @param {Object} config.values
         * @return {CJ.core.view.Popup} 
         */
        showSettings(config) {
            const xtype = 'view-answers-{0}-settings', title = this.settingsTitle;
            return Ext.factory(Ext.applyIf(config, {
                xtype: 'core-view-popup',
                title,
                content: {
                    values: config.values,
                    xtype: Ext.String.format(xtype, this.answerType)
                },
                actionButton: {
                    iconCls: 'icon-progress-continue',
                    cls: 'action-button okButton',
                    text: ''
                }
            }));
        }
    },
    config: {
        /**
         * @cfg {Boolean} editing
         */
        editing: false,
        /**
         * @cfg {Object} settings
         */
        settings: {},
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer',
        /**
         * @cfg {String|Number|Object} value
         */
        value: null,
        /**
         * @cfg {String} docId
         */
        docId: false,
        /**
         * @cfg {Ext.Component} editor
         */
        editor: null,
        /**
         * @cfg {Boolean} isCorrect
         */
        isCorrect: false,
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {Ext.Component} question
         */
        question: null,
        /**
         * @cfg {Boolean} showResult Flag that should be true if answer needs
         *                           to display it's result 
         *                           (correct, wrong, completed).
         */
        showResult: true,
        /**
         * @cfg {Boolean} showValue Flag that should be true if answer needs
         *                          to display submitted value.
         */
        showValue: true,
        /**
         * @cfg {String} displayTpl
         */
        displayTpl: null,
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Ext.Template} resultTpl
         */
        resultTpl: Ext.create('Ext.XTemplate', '<div class=\'d-answer-result\'>', '<div class=\'answer-result\'>', '<tpl if=\'type == "correct"\'>', '<div class=\'answer-result-correct\'>', '{[ CJ.app.t(\'view-answers-base-result-correct\')]} ', '</div>', '<tpl if=\'canRetry\'>', '<div class=\'answer-result-retry\'>', '{[ CJ.app.t(\'view-answers-base-result-retry\')]} ', '</div>', '</tpl>', '<tpl elseif=\'type == "wrong"\'>', '<div class=\'answer-result-wrong\'>', '{[ CJ.app.t(\'view-answers-base-result-wrong\')]} ', '</div>', '<tpl if=\'canRetry\'>', '<div class=\'answer-result-retry\'>', '{[ CJ.app.t(\'view-answers-base-result-retry\')]} ', '</div>', '</tpl>', '<tpl if=\'hasCorrectAnswers\'>', '<div> {[CJ.app.t(\'view-tool-view-answer-result-or\')]} </div>', '<div class=\'answer-result-see-correct\'>', '{[ CJ.app.t(\'view-answers-base-result-see-correct\')]} ', '</div>', '</tpl>', '<tpl elseif=\'type == "done"\'>', '<div class=\'answer-result-done\'>', '{[ CJ.app.t(\'view-answers-base-result-done\')]} ', '</div>', '<tpl if=\'canRetry\'>', '<div class=\'answer-result-retry\'>', '{[ CJ.app.t(\'view-answers-base-result-retry\')]} ', '</div>', '</tpl>', '</tpl>', '</div>', '<tpl if=\'removeButton\'>', '<div class=\'d-inline-menu-item d-delete-button\'>', '{[ CJ.app.t(\'view-answers-base-result-delete\') ]}', '</div>', '</tpl>', '</div>', { compiled: true })
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        if (!this.self.noAccessTpl)
            this.self.noAccessTpl = CJ.Utils.templates.noAccess;
        this.callParent(args);
    },
    /**
     * @param {Evented} e
     */
    onElementTap(e) {
        if (e.getTarget('.d-submit-button', 10))
            this.onSubmitButtonTap(e);
        else if (e.getTarget('.d-answer-result', 10))
            this.onAnswerResultButtonTap(e);
    },
    /**
     * @param {Ext.Evented} e
     */
    onAnswerResultButtonTap(e) {
        e.stopEvent();
        if (e.getTarget('.d-delete-button'))
            this.doDelete();
        else if (e.getTarget('.answer-result-retry'))
            this.doRetry();
    },
    /**
     * @param {Number|Boolean} docId
     * @return {Number|String}
     */
    applyDocId(docId) {
        return docId || CJ.Guid.generatePhantomId();
    },
    /**
     * method will be called when user taps on answer's submit-button
     * @param {Ext.Evented} e
     */
    onSubmitButtonTap(e) {
        this.save(this.getEnteredValue());
    },
    /**
     * @param {String|Object} value
     */
    save(value) {
        const question = this.getQuestion();
        question.setSaving(true);
        CJ.request({
            rpc: {
                model: 'Question',
                method: 'save_answer',
                id: question.getDocId()
            },
            // @TODO remove data when Ivo is ready
            params: {
                data: {
                    appVer: CJ.constant.appVer,
                    xtype: this.xtype,
                    // only needed for Ivo
                    value,
                    docId: null
                }
            },
            scope: this,
            success: this.onSaveSuccess,
            callback: this.onSaveCallback
        });
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onSaveSuccess(response) {
        // we are updating 2 properties: isCorrect and value, so this line
        // is needed to avoid double calling #toViewState
        delete this.initialized;
        const response = response.ret, data = response.saved, count = response.count, question = this.getQuestion(), block = question.getBlock();
        this.setDocId(data.docId);
        this.setValue(data.value);
        this.setIsCorrect(data.isCorrect);
        this.initialized = true;
        this.toViewState();
        question.onAnswerSubmit(count);
        block.fireEvent('answeraftersave', block, question, response);
    },
    /**
     * @return {undefined}
     */
    onSaveCallback() {
        this.getQuestion().setSaving(false);
    },
    /**
     * @param {Ext.Component} popup
     */
    onSettingsPopupButtonTap(popup) {
        this.setSettings(popup.getContent().getValues());
    },
    /**
     * @return {Boolean}
     */
    isAnswered() {
        return !Ext.isEmpty(this.getValue());
    },
    /**
     * @param {Boolean} state
     */
    updateEditing(state) {
        this.getData();
        if (state)
            this.toEditState();
        else
            this.toViewState();
    },
    toEditState: Ext.emptyFn,
    /**
     *
     */
    toViewState() {
        const isAnswered = this.isAnswered();
        if (isAnswered)
            return this.showResult();
        this.showForm();
        if (!CJ.User.isLogged())
            this.showNoAccessElement();
    },
    /**
     * @return {undefined}
     */
    showNoAccessElement() {
        this.innerElement.dom.innerHTML += this.self.noAccessTpl;
    },
    /**
     * method should be overriden in subclass
     * shows a form to enter an answer
     */
    showForm: Ext.emptyFn,
    /**
     * renders a component to display result of submitted answer:
     * correct/wrong etc ...
     */
    showResult() {
        const html = [], value = this.getValue();
        if (this.getShowValue()) {
            const displayTpl = this.getDisplayTpl();
            let displayHtml;
            if (displayTpl.isTemplate)
                displayHtml = displayTpl.apply({
                    settings: this.getSettings(),
                    value: this.getValue()
                });
            else
                displayHtml = displayTpl.replace('{value}', value);
            html.push(displayHtml);
        }
        if (this.getShowResult())
            html.push(this.getResultTpl().apply({
                answer: this.getValue(),
                type: this.getValidState(),
                canRetry: this.getQuestionOptions().canResubmit,
                removeButton: CJ.User.isMine(this.getBlock())
            }));
        this.innerElement.setHtml(html.join(''));
    },
    /**
     * method will be called when user taps on retry-label in answer-result
     */
    doRetry() {
        this.showForm();
    },
    /**
     * @param {Function} callback
     * @return {undefined}
     */
    doDelete(callback) {
        const isEditing = this.getEditing();
        const confirmTitle = 'confirm-title';
        let confirmMessage = 'view-tool-view-answer-remove-confirm';    // removing an answer-type
        // removing an answer-type
        if (isEditing && this.getQuestion().getAnswers())
            confirmMessage = 'view-answers-base-answer-reused-confirm';
        CJ.confirm(confirmTitle, confirmMessage, function (result) {
            if (result != 'yes')
                return;
            if (isEditing)
                this.destroy();
            else
                this.doServerDelete();
            Ext.callback(callback);
        }, this);
    },
    /**
     * deletes answer's value
     */
    doServerDelete() {
        CJ.request({
            rpc: {
                model: 'Answer',
                method: 'delete_answer'
            },
            params: { docId: this.getDocId() },
            scope: this,
            success: this.onServerDeleteSuccess
        });
    },
    /**
     * @return {undefined}
     */
    onServerDeleteSuccess() {
        this.setValue(null);
        this.getQuestion().onAnswerDelete(this.getDocId());
        this.getBlock().fireEvent('reloadanswers');
    },
    /**
     * @param {Boolean} state
     */
    updateIsCorrect(state) {
        if (!this.initialized || this.getEditing())
            return;
        this.toViewState();
    },
    /**
     * @param {String|Object} value
     */
    updateValue(value) {
        if (!this.initialized || this.getEditing())
            return;
        this.toViewState();
    },
    /**
     * @return {String} correct/wrong/done
     */
    getValidState() {
        if (!this.getQuestionOptions().autoCheck)
            return 'done';
        if (this.getIsCorrect())
            return 'correct';
        else
            return 'wrong';
    },
    /**
     * shows settings popup and saves resulting update
     */
    editSettings() {
        this.self.showSettings({
            values: this.getSettings(),
            listeners: {
                scope: this,
                actionbuttontap(popup) {
                    this.setSettings(popup.getContent().getValues());
                }
            }
        });
    },
    /**
     * @return {Object}
     */
    getQuestionOptions() {
        return this.getQuestion().getOptions();
    },
    /**
     * @return {Object}
     */
    serialize() {
        this.applyChanges();
        return {
            settings: this.getSettings(),
            isCorrect: this.getIsCorrect(),
            xtype: this.xtype,
            value: this.getValue(),
            docId: this.getDocId(),
            appVer: CJ.constant.appVer
        };
    },
    /**
     * @return {String|Number|Object} value from answer's form
     */
    getEnteredValue() {
        return null;
    },
    /**
     * @return {Boolean} true in case when it's possible to automatically check 
     *                   the answer.
     */
    isAutoCheckable() {
        return [
            'video',
            'audio',
            'file',
            'link',
            'text',
            'formula',
            'confirm',
            'image',
            'video',
            'audio'
        ].indexOf(this.self.answerType) == -1;
    },
    /**
     * updates visible value using original value
     * must be overriden in sub-class
     */
    resetChanges: Ext.emptyFn,
    /**
     * saves changes
     * must be overriden in sub-class
     */
    applyChanges: Ext.emptyFn,
    /**
     * @return {HTMLElement}
     */
    getButton() {
        return this.element.dom.querySelector('.d-submit-button');
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.getResultTpl().destroy();
        this.setResultTpl(null);
        this.setEditor(null);
        this.setBlock(null);
        this.setQuestion(null);
        this.callParent(args);
        Ext.destroy(this.innerElement);
    }
});