import 'app/view/answers/media/Answer';
import 'app/view/solution/Block';
import 'app/view/solution/Editing';

Ext.define('CJ.view.solution.Solution', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.answers.media.Answer',
    /**
     * @property {String} alias
     */
    alias: [
        'widget.view-solution',
        'widget.view-solution-solution'
    ],
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} showResult
         */
        showResult: false,
        /**
         * @cfg {Boolean} showValue
         */
        showValue: true,
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-solution',
        /**
         * @cfg {String} formTpl
         */
        formTpl: '<div class="d-solution-form">{0} <span class="d-upload-action">{1}</span></div>',
        /**
         * @cfg {String} editTpl
         */
        editTpl: [
            '<input type="button" class="d-submit-button" value="{0}" disabled="disabled" />',
            '<div class="d-hbox d-menu">',
            '<div class="d-item d-delete">{1}</div>',
            '</div>'
        ].join(''),
        /**
         * @cfg {String} displayTpl
         */
        displayTpl: Ext.create('Ext.XTemplate', '<div class=\'d-solution-display\'>', '<span class=\'d-see\'>', '{[ CJ.t(\'view-solution-solution-see\') ]}', '</span>', ' - ', '<span class=\'d-remove\'>', '{[ CJ.t(\'view-solution-solution-remove\') ]}', '</span>', '</div>')
    },
    onElementTap(e) {
        if (e.getTarget('.d-menu .d-delete'))
            return this.destroySolutionComponent();
        else if (e.getTarget('.d-see'))
            return this.openSolution();
        else if (e.getTarget('.d-remove'))
            return this.showForm();
        else if (e.getTarget('.d-upload-action'))
            return this.openEditingPopup();
        this.callParent(args);
    },
    openSolution() {
        const value = this.getValue(), type = value.type == 'custom_card' ? 'custom' : value.type, config = { xtype: 'view-solution-block' };
        if (value.xtype == 'view-solution-block') {
            config.list = value.list;
        } else {
            config.list = {
                xtype: 'core-view-list-editor',
                items: [{
                        xtype: CJ.tpl('view-tool-{0}-tool', type),
                        values: value
                    }]
            };
        }
        Ext.factory(config).popup();
    },
    openSolutionBlock(response) {
        Ext.factory(response.ret).popup();
    },
    /**
     * @return {undefined}
     */
    destroySolutionComponent() {
        const question = this.getQuestion();
        this.doDelete(() => {
            question.showSolutionSelect();
        });
    },
    /**
     * @inheritdoc
     */
    toEditState() {
        const button = CJ.t('view-solution-solution-submit', true), remove = CJ.t('view-solution-solution-menu-delete');
        this.callParent(args);
        this.innerElement.setHtml(CJ.tpl(this.getEditTpl(), button, remove));
    },
    /**
     * @inheritdoc
     */
    showForm() {
        this.cleanup();
        if (!this.isQuestionAnswered())
            return;
        const text = CJ.t('view-solution-solution-empty-text'), action = CJ.t('view-solution-solution-empty-action'), html = CJ.tpl(this.getFormTpl(), text, action);
        this.innerElement.setHtml(html);
    },
    /**
     * renders a component to display result of submitted answer:
     * correct/wrong etc ...
     */
    showResult() {
        CJ.view.answers.base.Answer.prototype.showResult.call(this);
    },
    /**
     * @param {Function} callback
     * @return {undefined}
     */
    doDelete(callback) {
        const isEditing = this.getEditing(), confirmTitle = 'confirm-title', confirmMessage = 'view-solution-solution-remove-confirm';
        CJ.confirm(confirmTitle, confirmMessage, function (result) {
            if (result != 'yes')
                return;
            this.destroy();
            Ext.callback(callback);
        }, this);
    },
    /**
     * @inheritdoc
     */
    serialize() {
        const value = this.getValue();
        if (!value)
            return false;
        return {
            value,
            docId: this.getDocId(),
            appVer: CJ.constant.appVer
        };
    },
    /**
     * @param {String|Object} value
     */
    save(value) {
        const question = this.getQuestion();
        CJ.request({
            rpc: {
                model: 'Question',
                method: 'save_solution',
                id: question.getDocId()
            },
            params: {
                data: {
                    appVer: CJ.constant.appVer,
                    xtype: this.xtype,
                    // only needed for Ivo
                    nodeCls: 'Solution',
                    value,
                    docId: this.getDocId()
                }
            },
            scope: this,
            success: this.onSaveSuccess
        });
    },
    /**
     * @return {undefined}
     */
    onSaveSuccess(response) {
        const response = response.ret, data = response.saved, question = this.getQuestion(), block = question.getBlock(), value = data.value, isPhantom = CJ.Block.isPhantom(this.getDocId());
        this.setDocId(data.docId);
        this.setValue(value);
        this.toViewState();
        question.onSolutionSubmit(value);
        block.fireEvent('solutionaftersave', block, question, value);
        if (isPhantom)
            question.showFeedback();
    },
    /**
     * @return {Boolean}
     */
    isQuestionAnswered() {
        return this.getQuestion().getAnswer();
    },
    /**
     * @param {CJ.view.question.Question} question
     */
    updateQuestion(question) {
        if (!question)
            return;
        question.on({
            scope: this,
            answersubmit: this.onAnswerSubmit
        });
    },
    /**
     * shows "show work" popup
     */
    onAnswerSubmit() {
        if (this.isAnswered())
            // solution exists
            return;
        this.toViewState();
        this.openEditingPopup();
    },
    /**
     * shows a popup that allows to add url/file
     */
    openEditingPopup() {
        CJ.view.solution.Editing.popup({
            listeners: {
                scope: this,
                actionbuttontap: this.doSubmit
            }
        });
    },
    /**
     * @param {Ext.Component} popup
     */
    doSubmit(popup) {
        const data = popup.getContent().serialize();
        if (!data)
            return;
        this.save(data.values);
    }
});