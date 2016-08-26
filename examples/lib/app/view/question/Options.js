import 'Ext/Container';

/**
 * Defines a container that is used to show question's options.
 */
Ext.define('CJ.view.question.Options', {
    extend: 'Ext.Container',
    alias: 'widget.view-question-options',
    config: {
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {Object} options
         */
        defaults: {
            xtype: 'view-light-segmented-button',
            pressed: false
        },
        /**
         * @cfg {Object} values
         */
        values: {},
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {Object} hint
         */
        hint: null,
        /**
         * @cfg {Object} feedback
         */
        feedback: {},
        /**
         * @cfg {CJ.view.answers.base.Answer} answerType
         */
        answerType: null
    },
    /**
     * @param {Array} items
     */
    applyItems(items) {
        const values = this.getValues();
        const block = this.getBlock();
        let showFeedbackOptions = CJ.User.hasQuestionFeedbackOptions();
        if (block.isInstance)
            showFeedbackOptions = showFeedbackOptions && !block.isReused();
        items = [
            {
                pressed: values.isPublic,
                name: 'isPublic',
                booleanMode: true,
                fieldLabel: CJ.t('view-question-options-public-responses')
            },
            {
                pressed: values.autoCheck,
                disabled: this.isAutoCheckDisabled(),
                name: 'autoCheck',
                hidden: true,
                booleanMode: true,
                fieldLabel: CJ.t('view-question-options-auto-check')
            },
            {
                pressed: values.canResubmit,
                name: 'canResubmit',
                booleanMode: true,
                cls: 'd-light-segmented-button d-last-child',
                fieldLabel: CJ.t('view-question-options-allow-retry')
            },
            {
                xtype: 'view-question-hints-options',
                hint: this.getHint(),
                hidden: !CJ.User.isFGA()
            }
        ];
        if (showFeedbackOptions)
            items.push(Ext.apply({
                xtype: 'view-feedback-options',
                answerType: Ext.getClass(this.getAnswerType()).answerType
            }, this.getFeedback()));
        return this.callParent(args);
    },
    /**
     * @return {Boolean}
     */
    isAutoCheckDisabled() {
        const answerType = this.getAnswerType();
        if (!answerType)
            return false;
        return !answerType.isAutoCheckable();
    },
    /**
     * @return {Object}
     */
    getRealFeedback() {
        const component = this.down('[isFeedbackOptions]');
        if (component)
            return component.getValues();
        return {};
    },
    /**
     * @return {Object}
     */
    getRealHint() {
        const component = this.down('[isHintsOptions]');
        if (component)
            return component.getValues();
        return {};
    },
    /**
     * collects the values from child components.
     * @return {Object}
     */
    getRealValues() {
        const values = {}, fields = this.query('[name]');
        for (let i = 0, field; field = fields[i]; i++)
            values[field.getName()] = field.getValue();
        return values;
    }
});