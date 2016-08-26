import 'Ext/Component';
import 'app/view/question/Options';
import 'app/view/question/hints/Options';
import 'app/view/question/hints/Carousel';

/**
 * Defines a component to show question's container.
 * Contains question message, answer-field and menu.
 */
Ext.define('CJ.view.question.Question', {
    extend: 'Ext.Component',
    alias: 'widget.view-question-question',
    mixins: { editable: 'CJ.view.mixins.Editable' },
    /**
     * @cfg {Boolean} isQuestion Always true
     */
    isQuestion: true,
    /**
     * @see overrides.Component#isOptimized
     */
    isOptimized: true,
    /**
     * @see overrides.Component#isTranslated
     */
    isTranslated: false,
    /**
     * @cfg {Object} answerTypeCssClasses Needed by minify-css.rb
     */
    answerTypeCssClasses: {
        'audio': 'd-answer-type-audio',
        'confirm': 'd-answer-type-confirm',
        'file': 'd-answer-type-file',
        'filter': 'd-answer-type-filter',
        'formula': 'd-answer-type-formula',
        'image': 'd-answer-type-image',
        'media': 'd-answer-type-media',
        'multiplechoice': 'd-answer-type-multiplechoice',
        'number': 'd-answer-type-number',
        'short': 'd-answer-type-short',
        'text': 'd-answer-type-text',
        'link': 'd-answer-type-link',
        'video': 'd-answer-type-video',
        'app': 'd-answer-type-app'
    },
    config: {
        /**
         * @cfg {Object} options
         */
        options: {
            /**
             * defines a visibility of an answer
             */
            isPublic: false,
            /**
             * will be true in case when user can resubmit an answer
             */
            canResubmit: true,
            /**
             * if true application will try to figure out, did user answered
             * correctly or not, and will show appropriate message, otherwise
             * user's feedback will see just "Done"
             */
            autoCheck: true
        },
        /**
         * @cfg {Object} hint
         */
        hint: {},
        /**
         * @cfg {Object} feedback
         */
        feedback: {
            correctId: null,
            wrongId: null,
            completedId: null
        },
        /**
         * @cfg {String} message
         */
        message: null,
        /**
         * @cfg {Object} answer
         */
        answer: null,
        /**
         * @cfg {Object} answerType
         */
        answerType: null,
        /**
         * @cfg {Object} solution
         */
        solution: null,
        /**
         * @cfg {Object} solutionSelect
         */
        solutionSelect: null,
        /**
         * @cfg {Ext.Component} typeSelect
         */
        typeSelect: null,
        /**
         * @cfg {Ext.Component} messageField
         */
        messageField: null,
        /**
         * @cfg {Ext.Component} menu
         */
        menu: null,
        /**
         * @cfg {Boolean} editing
         */
        editing: null,
        /**
         * @cfg {Boolean} cls
         */
        cls: 'd-question',
        /**
         * @cfg {Ext.Component} editor
         */
        editor: null,
        /**
         * @cfg {Ext.Component} block
         */
        block: null,
        /**
         * @cfg {Number} docId
         */
        docId: false,
        /**
         * @cfg {Number} answers Count of answers
         */
        answers: 0,
        /**
         * @cfg {Boolean} isValid
         */
        isValid: null,
        /**
         * @cfg {Boolean} saving
         */
        saving: null,
        /**
         * @cfg {Boolean} expanded
         */
        expanded: null
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
                { className: 'd-message d-display' },
                {
                    reference: 'innerElement',
                    className: 'x-inner'
                },
                {
                    reference: 'solutionElement',
                    className: 'd-solution-element'
                },
                {
                    reference: 'hintElement',
                    className: 'd-hint-element'
                }
            ]
        };
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.transformConfig(config);
        this.callParent(args);
        if (!config.editing)
            this.firstToViewState();
    },
    /**
     * updates config in order to place solution info to correct position.
     * @param {Object} config
     * @return {undefined}
     */
    transformConfig(config undefined {}) {
        const options = config.options || {}, solution = config.solution || {};
        if (options.requiresSolution)
            config.solution = solution;
    },
    /**
     * @param {Boolean} state
     */
    updateExpanded(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-expanded');
    },
    /**
     * @param {Number|Boolean} docId
     * @return {Number|String}
     */
    applyDocId(docId) {
        return docId || CJ.Guid.generatePhantomId();
    },
    /**
     * shows answer's options popup
     */
    editOptions() {
        const answerType = this.getAnswerType(), options = this.getOptions(), feedback = this.getFeedback(), hint = this.getHint();
        return Ext.factory({
            xtype: 'core-view-popup',
            title: 'view-question-options-title',
            cls: 'd-popup d-popup-transparent d-question-options',
            content: {
                answerType: answerType.isAnswer && answerType,
                values: options,
                feedback,
                hint,
                block: this.getBlock(),
                xtype: 'view-question-options'
            },
            actionButton: { text: 'view-question-options-save' },
            listeners: {
                scope: this,
                actionbuttontap: this.onEditOptionsSuccess
            }
        });
    },
    /**
     * method will be called when user taps on action-button in options popup.
     * @param {CJ.core.view.Popup} popup
     * @return {undefined}
     */
    onEditOptionsSuccess(popup) {
        const content = popup.getContent(), questionOptions = content.getRealValues(), feedbackOptions = content.getRealFeedback(), hintOptions = content.getRealHint();
        this.setOptions(questionOptions);
        this.setFeedback(feedbackOptions);
        this.setHint(hintOptions);
    },
    /**
     * @param {Object} config
     */
    applyAnswerType(config) {
        if (!config)
            return false;    // need to save settings before applying info from answer.
        // need to save settings before applying info from answer.
        const settings = config.settings;
        Ext.apply(config, this.getAnswer() || {});
        config.settings = settings;
        config = Ext.factory(Ext.apply(config, {
            question: this,
            block: this.getBlock()
        }));
        return config;
    },
    /**
     * @param {Ext.Component} newType
     * @param {Ext.Component} oldType
     */
    updateAnswerType(newType, oldType) {
        const clsConfig = this.answerTypeCssClasses;    // @TODO need to remove this part and make question editing-switchable.
        // @TODO need to remove this part and make question editing-switchable.
        if (this.getEditor() && this.isRendered())
            this.validate();
        if (oldType)
            this.removeCls(clsConfig[Ext.getClass(oldType).answerType]);
        if (newType)
            this.addCls(clsConfig[Ext.getClass(newType).answerType]);
        if (oldType)
            oldType.destroy();
        if (newType)
            newType.renderTo(this.innerElement);
        if (!this.initialized)
            return;
        this.resetOptions();
    },
    /**
     * @param {Object} config
     */
    updateHint(config) {
        if (!config || !CJ.User.isFGA())
            return;
        let message = '';
        if (config.docId)
            message = CJ.t('view-question-question-hint');
        this.hintElement.setHtml(message);
    },
    /**
     * @param {Object} config
     * @param {Ext.Component} oldSolution
     * @return {Ext.Component}
     */
    applySolution(config, oldSolution) {
        if (oldSolution)
            oldSolution.destroy();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-solution',
            renderTo: this.solutionElement,
            // editing: this.getEditing(),
            question: this
        }, config));
    },
    /**
     * @param {Object} config
     * @param {Ext.Component} oldSolution
     * @return {Ext.Component}
     */
    applySolutionSelect(config, oldSelect) {
        if (oldSelect)
            oldSelect.destroy();
        if (!(config && CJ.User.isFGA()))
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-component',
            type: 'light',
            html: CJ.t('view-question-solution-select'),
            cls: 'd-solution-select',
            renderTo: this.solutionElement,
            listeners: {
                scope: this,
                element: 'element',
                tap: this.onSolutionSelect
            }
        }, config));
    },
    /**
     * Method will be called when user clicks on select-solution component.
     * @return {undefined}
     */
    onSolutionSelect() {
        this.setSolutionSelect(null);
        this.setSolution({ editing: true });
    },
    /**
     * @return {undefined}
     */
    showSolutionSelect() {
        this.getOptions().requiresSolution = false;
        this.setSolution(null);
        this.setSolutionSelect({});
    },
    /**
     * @param {Object} config
     * @return {Ext.Component|Boolean}
     */
    applyTypeSelect(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-answers-type-select',
            editor: this.getEditor(),
            editing: this.getEditing()
        }, config));
    },
    /**
     * @param {Ext.component} newSelect
     * @param {Ext.component} oldSelect
     * @return {undefined}
     */
    updateTypeSelect(newSelect, oldSelect) {
        if (newSelect)
            newSelect.renderTo(this.innerElement);
        if (oldSelect)
            oldSelect.destroy();
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyMenu(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({ xtype: 'view-tool-menu' }, config));
    },
    /**
     * @param {Ext.Component} newMenu
     * @param {Ext.Component} oldMenu
     */
    updateMenu(newMenu, oldMenu) {
        if (oldMenu)
            oldMenu.destroy();
        if (newMenu) {
            newMenu.parent = this;
            newMenu.renderTo(this.innerElement);
        }
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyMessageField(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'textfield',
            isMessage: true,
            maxLength: 250,
            name: 'message',
            cls: 'd-message',
            labelAlign: 'right',
            labelWidth: false,
            clearIcon: false,
            // server replaces "<" and ">" with html-entity code
            // (XSS protection), and we need to show html-entities in
            // input field.
            value: CJ.Utils.decodeHtml(this.getMessage()),
            placeHolder: CJ.t('view-question-question-placeholder', true),
            label: CJ.t('view-question-question-label'),
            listeners: {
                input: {
                    scope: this,
                    delegate: 'input',
                    element: 'element',
                    fn: this.onMessageUpdate
                }
            }
        }, config));
    },
    /**
     * @param {Ext.Component} newField
     * @param {Ext.Component} oldField
     */
    updateMessageField(newField, oldField) {
        if (oldField)
            oldField.destroy();
        if (newField) {
            newField.setRendered(true);
            this.innerElement.insertFirst(newField.element);
        }
    },
    /**
     * resets options to the default state
     * @return {undefined}
     */
    resetOptions() {
        const answerType = this.getAnswerType(), options = this.getOptions(), initialOptions = Ext.clone(this.getInitialConfig().options);
        if (!answerType.isAnswer)
            return this.setOptions(initialOptions);
        if (!this.getMenu())
            this.setMenu({});
        this.setOptions(Ext.apply(initialOptions, { autoCheck: answerType.isAutoCheckable() }));
    },
    /**
     * processes situation when user taps on menu's "delete" button.
     * deletes current answer's component.
     */
    onMenuDeleteTap() {
        this.getAnswerType().doDelete(Ext.bind(function () {
            this.setMenu(null);
            this.setAnswer(null);
            this.setAnswerType(null);
            this.setTypeSelect({});
        }, this));
    },
    /**
     * processes situation when user taps on menu's "options" button.
     * shows answer's settings popup.
     */
    onMenuEditTap() {
        const answerType = this.getAnswerType();
        if (answerType.isAnswer)
            answerType.editSettings();
    },
    /**
     * processes situation when user taps on menu's "options" button.
     * shows answer's options popup.
     */
    onMenuOptionsTap() {
        this.editOptions();
    },
    /**
     * @param {Boolean} state
     */
    updateEditing(state) {
        if (state)
            this.toEditState();
        else
            this.toViewState();
        this[state ? 'on' : 'un']({
            scope: this,
            'menu.delete': this.onMenuDeleteTap,
            'menu.options': this.onMenuOptionsTap,
            'menu.edit': this.onMenuEditTap
        });
    },
    /**
     * @return {undefined}
     */
    toEditState() {
        this.element.dom.querySelector('.d-message').innerHTML = '';
        this.setMessageField({});
        this.convertAnswerToEditState();
        this.convertSolutionToEditState();
    },
    /**
     * simply changes an area of type-select/answer-type to edit-state.
     * @return {undefined}
     */
    convertAnswerToEditState() {
        const answerType = this.getAnswerType();
        if (!answerType)
            return this.setTypeSelect({});
        answerType.setEditing(true);
        this.setMenu({});
    },
    /**
     * convers solution-area(solution-type/solution) to edit-state.
     * @return {undefined}
     */
    convertSolutionToEditState() {
        const solution = this.getSolution();
        if (solution)
            solution.setEditing(true);
        else
            this.setSolutionSelect({});
    },
    onMessageUpdate() {
        clearTimeout(this.keyPressTimer);
        this.keyPressTimer = Ext.defer(function () {
            this.validate();
            this.fireEvent('change', this);
        }, 20, this);
    },
    /**
     * @return {undefined}
     */
    firstToViewState() {
        this._editing = false;
        const answerType = this.getAnswerType(), message = this.getMessage();
        this.element.dom.querySelector('.d-message').innerHTML = message;
        if (!answerType)
            return;
        answerType.setEditing(false);
    },
    /**
     * transforms component to view-state.
     */
    toViewState() {
        const answerType = this.getAnswerType(), message = this.getMessage();
        this.element.dom.querySelector('.d-message').innerHTML = message;
        this.setTypeSelect(null);
        this.setMessageField(null);
        this.setMenu(null);
        if (!answerType)
            return;
        answerType.setEditing(false);
    },
    /**
     * @return {Boolean}
     */
    isEmpty() {
        return Ext.isEmpty(this.getMessage());
    },
    resetChanges() {
        this.down('[name=message]').setValue(this.getMessage());
    },
    /**
     * @return {undefined}
     */
    applyChanges() {
        this._message = this.getMessageField().getValue();
        return { message: this._message };
    },
    /**
     * @see CJ.view.mixins.Editable#serialize
     */
    serialize() {
        if (this.isEmpty())
            return false;
        const data = {
            message: this.getMessage(),
            options: this.getOptions(),
            docId: this.getDocId(),
            appVer: CJ.constant.appVer,
            answerType: null,
            answer: this.getAnswer(),
            answers: this.getAnswers(),
            feedback: this.getFeedback(),
            hint: this.getHint()
        };
        const answerType = this.getAnswerType();    // user could use question's messsage with an answer-type.
        // user could use question's messsage with an answer-type.
        if (answerType) {
            data.answerType = answerType.serialize();    // it's because the anwer and answer-type are both instances of the
                                                         // same class, but for answer-type we don't need to save #value.
            // it's because the anwer and answer-type are both instances of the
            // same class, but for answer-type we don't need to save #value.
            delete data.answerType.value;
        }
        const solution = this.getSolution();
        if (data.answer && solution)
            data.solution = solution.serialize();
        data.options.requiresSolution = !!solution;
        return data;
    },
    /**
     * makes simple rpc call to save question's options
     */
    saveOptions() {
        CJ.request({
            rpc: {
                model: 'Question',
                method: 'save_options',
                id: this.getDocId()
            },
            params: { data: this.getOptions() },
            success: this.onOptionsSaveSuccess
        });
    },
    /**
     * @return {undefined}
     */
    onOptionsSaveSuccess() {
        CJ.feedback();
    },
    /**
     * @return {Boolean} true in case when autoCheck-option property is ON.
     */
    isAutoCheckEnabled() {
        return this.getOptions().autoCheck;
    },
    /**
     * @return {Boolean}
     */
    isAnswersPublic() {
        return this.getOptions()['isPublic'];
    },
    /**
     * @param {Number} answerId
     * @return {undefined}
     */
    onAnswerDelete(answerId) {
        const count = this.getAnswers() - 1;
        if (this.getAnswerId() == answerId) {
            this.setAnswer(null);
            this.getAnswerType().setValue(null);
            if (this.requiresSolution())
                this.getSolution().setValue(null);
        }
        this.setAnswers(count);
        this.getBlock().fireEvent('answerdelete', this, count, answerId);
        this.fireEvent('answerdelete', this);
    },
    /**
     * @return {undefined}
     */
    onAnswerSubmit(count) {
        const block = this.getBlock();
        this.setAnswers(count);
        this.setAnswer(this.getAnswerType().serialize());
        if (block.getIsOriginal())
            this.onOriginalBlockAnswerSubmit();
        block.fireEvent('answersubmit', this, count, block);
    },
    /**
     * method is called only when answer is submitted whitin a user's interacted block.
     */
    onOriginalBlockAnswerSubmit() {
        this.fireEvent('answersubmit', this);
        if (!CJ.view.solution.Editing.isOpened())
            this.showFeedback();
    },
    /**
     * method will be called by a solution when it's saved.
     * @param {String} value
     * @return {undefined}
     */
    onSolutionSubmit(value) {
        this.getBlock().fireEvent('solutionsubmit', this);
    },
    /**
     * @param {Boolean} state
     */
    updateIsValid(state) {
        const invalidCls = 'd-invalid';
        if (state)
            this.removeCls(invalidCls);
        else
            this.addCls(invalidCls);
    },
    /**
     * @return {Boolean}
     */
    validate() {
        this.applyChanges();
        let isValid = true;
        const message = this.getMessageField().getValue();
        const answerType = this.getAnswerType();
        if (Ext.isEmpty(message) && answerType && answerType.isAnswer)
            isValid = false;
        this.setIsValid(isValid);
        return isValid;
    },
    /**
     * @inheritdoc
     */
    destroy() {
        this.isDestroying = true;
        this.setSolutionSelect(null);
        this.setAnswerType(null);
        this.callParent(args);
        this.isDestroying = false;
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateSaving(state) {
        if (state)
            this.mask();
        else
            this.unmask();
    },
    /**
     * @return {Boolean}
     */
    isRetryEnabled() {
        return this.getOptions().canResubmit;
    },
    /**
     * this method is needed, as we cannot use useBodyElement == false
     * because ST ignores it for example while adding a mask
     */
    updateUseBodyElement: Ext.emptyFn,
    /**
     * @return {Number}
     */
    getAnswerId() {
        const field = this.getAnswerType();
        if (!field)
            return null;
        return field.getDocId();
    },
    /**
     * @param {Ext.Component} item
     * @return {undefined}
     */
    applyActiveItem(item) {
        return item;
    },
    /**
     * @return {Array}
     */
    getFeedbackBlockIds() {
        let answer = this.getAnswerType().getValidState();
        const feedback = this.getFeedback();
        const ids = [];    // @TODO in 1.7 let's change validState from "wrong" -> "incorrect" everywhere, because of server.
        // @TODO in 1.7 let's change validState from "wrong" -> "incorrect" everywhere, because of server.
        if (answer == 'wrong')
            answer = 'incorrect';
        if (feedback.complete)
            ids.push(feedback.complete.docId);
        if (feedback[answer])
            ids.push(feedback[answer].docId);
        return ids;
    },
    /**
     * shows completed, correct or wrong block in fullscreen popup.
     */
    showFeedback() {
        const ids = this.getFeedbackBlockIds();
        if (ids.length == 0)
            return;
        CJ.Ajax.initBatch();
        CJ.LoadBar.run();
        for (let i = 0, id; id = ids[i]; i++)
            CJ.Block.load(id);
        const me = this;
        CJ.Ajax.runBatch(config => {
            me.showFeedbackBlocks(config.responses);
            CJ.LoadBar.finish();
        });
    },
    /**
     * @param {Object} responses
     * @return {undefined}
     */
    showFeedbackBlocks(responses) {
        for (let i = 0, response; response = responses[i]; i++) {
            const block = response.ret;
            block.xtype = 'view-feedback-block-block';
            block.type = this.getFeedbackTypeFromAnswer();
            Ext.factory(block).popup();
        }
    },
    /**
     * @param {Number} docId
     * @return {Number}
     * @TODO when getFeedbackTypeFromAnswer is approved ( this to be removed )
     */
    getFeedbackTypeById(docId) {
        const feedback = this.getFeedback();
        for (const key in feedback) {
            const value = feedback[key];
            if (value && value.docId == docId)
                return key;
        }
    },
    /**
     * @return {String}
     */
    getFeedbackTypeFromAnswer() {
        const answer = this.getAnswer(), isCorrect = answer.isCorrect;
        if (!Ext.isDefined(isCorrect))
            return 'complete';
        if (isCorrect)
            return 'correct';
        else
            return 'incorrect';
    },
    /**
     * @return {Boolean}
     */
    hasFeedback() {
        return this.getFeedbackBlockIds().length > 0;
    },
    /**
     * disables retry-functionality.
     */
    denyRetry() {
        this.getOptions().canResubmit = false;
    },
    /**
     * @return {Boolean}
     */
    requiresSolution() {
        return this.getOptions().requiresSolution;
    },
    /**
     * @return {Boolean}
     */
    hasSolution() {
        return !!this.getSolution().getValue();
    },
    /**
     * renders hints-popup.
     * @see CJ.view.viewport.Viewport#onHintElementTap
     */
    onHintElementTap() {
        const docId = this.getHint().docId;
        CJ.view.question.hints.Carousel.show(docId);
    }
});