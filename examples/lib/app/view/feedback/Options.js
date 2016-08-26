import 'app/view/question/OptionItem';

/**
 * Defines a component that displays options for feedback feature.
 * completed: edit delete/add feedback
 * correct: edit delete/add feedback
 * wrong: edit delete/add feedback
 */
Ext.define('CJ.view.feedback.Options', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.question.OptionItem',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-feedback-options',
    /**
     * @property {Boolean} isFeedbackOptions
     */
    isFeedbackOptions: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} complete
         */
        complete: null,
        /**
         * @cfg {Number} correct
         */
        correct: null,
        /**
         * @cfg {Number} incorrect
         */
        incorrect: null,
        /**
         * @cfg {String} answerType
         */
        answerType: null,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-header\'>', '{[ CJ.t(\'view-feedback-options-title\') ]}', '</div>', '<tpl if=\'values.isValidatable\'>', '<div data-type=\'correct\' class=\'d-option {[ values.correct ? \'\' : \'d-empty\' ]}\'>', '<div class=\'d-hint\'>{[ CJ.t(\'view-feedback-options-correct\') ]}</div>', '<div class=\'d-button d-add\' data-action=\'add\'>{add}</div>', '<div class=\'d-edit-buttons\'>', '<div class=\'d-button d-edit {[ this.canEdit(values.correct) ? \'\' : \'d-disabled\']}\' data-action=\'edit\'>{edit}</div>', '<div class=\'d-button d-remove\' data-action=\'remove\'>{remove}</div>', '</div>', '<div class=\'d-link-icon\'></div>', '</div>', '<div data-type=\'incorrect\' class=\'d-option {[ values.incorrect ? \'\' : \'d-empty\' ]}\'>', '<div class=\'d-hint\'>{[ CJ.t(\'view-feedback-options-wrong\') ]}</div>', '<div class=\'d-button d-add\' data-action=\'add\'>{add}</div>', '<div class=\'d-edit-buttons\'>', '<div class=\'d-button d-edit {[ this.canEdit(values.incorrect) ? \'\' : \'d-disabled\']}\' data-action=\'edit\'>{edit}</div>', '<div class=\'d-button d-remove\' data-action=\'remove\'>{remove}</div>', '</div>', '<div class=\'d-link-icon\'></div>', '</div>', '<tpl else>', '<div data-type=\'complete\' class=\'d-option {[ values.complete ? \'\' : \'d-empty\' ]}\'>', '<div class=\'d-hint\'>{[ CJ.t(\'view-feedback-options-complete\') ]}</div>', '<div class=\'d-button d-add\' data-action=\'add\'>{add}</div>', '<div class=\'d-edit-buttons\'>', '<div class=\'d-button d-edit {[ this.canEdit(values.complete) ? \'\' : \'d-disabled\']}\' data-action=\'edit\'>{edit}</div>', '<div class=\'d-button d-remove\' data-action=\'remove\'>{remove}</div>', '</div>', '<div class=\'d-link-icon\'></div>', '</div>', '</tpl>', {
            canEdit(values) {
                return values && CJ.User.isMineTags(values.user);
            }
        }),
        /**
         * @cfg {Object} idPopupTitles
         */
        idPopupTitles: {
            title: 'view-feedback-id-popup',
            button: 'view-feedback-id-popup-submit'
        },
        /**
         * @cfg {Object} removeTitles
         */
        removeTitles: {
            title: 'view-feedback-options-remove-block-title',
            message: 'view-feedback-options-remove-block-message'
        }
    },
    /**
     * @return {Object}
     */
    applyData() {
        return {
            complete: this.getComplete(),
            correct: this.getCorrect(),
            incorrect: this.getIncorrect(),
            add: CJ.t('view-feedback-options-add'),
            edit: CJ.t('view-feedback-options-edit'),
            remove: CJ.t('view-feedback-options-remove'),
            isValidatable: this.isAnswerValidatable()
        };
    },
    /**
     * @return {Boolean}
     */
    isAnswerValidatable() {
        return [
            'short',
            'multiplechoice',
            'number'
        ].indexOf(this.getAnswerType()) > -1;
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    updateCorrect(config) {
        if (!this.initialized)
            return;
        this.updateOptionState('correct', !!config);
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    updateIncorrect(config) {
        if (!this.initialized)
            return;
        this.updateOptionState('incorrect', !!config);
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    updateComplete(config) {
        if (!this.initialized)
            return;
        this.updateOptionState('complete', !!config);
    },
    /**
     * @param {String} type correct, wrong, completed.
     * @return {undefined}
     */
    addBlock() {
        Ext.factory({
            xtype: 'view-block-edit-defaults-light-popup',
            title: 'view-feedback-options-editor-title',
            createButtonText: 'view-feedback-options-editor-button',
            editorType: 'feedback',
            block: {
                xtype: 'view-feedback-block',
                userInfo: CJ.User.getInfo(),
                listeners: {
                    saved: this.onAddBlockSuccess,
                    scope: this
                }
            }
        });
    },
    /**
     * @return {undefined}
     */
    editBlock() {
        const type = this.getActiveType(), id = this[`get${ CJ.capitalize(type) }`]().docId;
        CJ.LoadBar.run({ renderTo: Ext.Viewport.element });
        CJ.Block.load(id, {
            success(response) {
                const block = response.ret;
                block.xtype = 'view-feedback-block-block';
                Ext.factory(block).setEditing(true);
            },
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    /**
     * @return {undefined}
     */
    removeBlock() {
        const title = 'view-feedback-options-remove-block-title', message = 'view-feedback-options-remove-block-message';
        CJ.confirm(title, message, function (result) {
            if (result != 'yes')
                return;
            this.setOptionValue(this.getActiveType(), null);
        }, this);
    },
    /**
     * @return {Object}
     */
    getValues() {
        return {
            complete: this.getComplete(),
            correct: this.getCorrect(),
            incorrect: this.getIncorrect()
        };
    }
});