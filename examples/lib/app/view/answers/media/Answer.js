import 'app/view/answers/base/Answer';

/**
 * @class CJ.view.answers.embed.MediaAnswer
 * @abstract
 */
Ext.define('CJ.view.answers.media.Answer', {
    extend: 'CJ.view.answers.base.Answer',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-answers-media-answer',
    config: {
        /**
         * @cfg {Boolean|Object} urlField
         */
        urlField: true,
        /**
         * @cfg {Boolean|Object} fileField
         */
        fileField: true,
        /**
         * @cfg {Boolean} showValue
         */
        showValue: false,
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-media-answer',
        /**
         * @cfg {String} editTpl
         */
        formTpl: '<input type="button" class="d-submit-button" value="{buttonText}" />',
        /**
         * @cfg {String} editTpl
         */
        editTpl: '<input type="button" class="d-submit-button" value="{buttonText}" disabled="disabled" />',
        /**
         * @cfg {Ext.Component} displayComponent
         */
        displayComponent: null
    },
    /**
     * @return {undefined}
     */
    onSubmitButtonTap() {
        const type = this.self.answerType;
        CJ.view.tool[type].Tool.showEditing({
            popup: {
                title: CJ.tpl('view-answer-type-{0}-popup-title', type),
                listeners: {
                    actionbuttontap: this.doSubmit,
                    scope: this
                }
            },
            content: {
                urlField: this.getUrlField(),
                fileField: this.getFileField()
            }
        });
    },
    doSubmit(popup) {
        const tool = popup.getContent().getPreview(), data = tool.serialize();
        this.save(data.values);
    },
    /**
     * renders a component to display result of submitted answer:
     * correct/wrong etc ...
     */
    showResult() {
        this.cleanup();
        if (this.getShowValue())
            this.setDisplayComponent({});
        if (this.getShowResult())
            this.innerElement.setHtml(this.getResultTpl().apply({
                answer: this.getValue(),
                type: this.getValidState(),
                canRetry: this.getQuestionOptions().canResubmit,
                removeButton: CJ.User.isMine(this.getBlock())
            }));
    },
    /**
     * embed's answer types doesn't have settings
     */
    editSettings() {
    },
    /**
     * @return {String} state
     */
    toEditState() {
        this.cleanup();
        const answerType = this.self.answerType, buttonText = CJ.tpl('view-answers-{0}-answer-submit', answerType);
        this.innerElement.setHtml(this.getEditTpl().replace('{buttonText}', CJ.t(buttonText, true)));
    },
    /**
     * @inheritdoc
     */
    showForm() {
        this.cleanup();
        const answerType = this.self.answerType;
        const buttonText = CJ.tpl('view-answers-{0}-answer-submit', answerType);
        let html;
        html = this.getFormTpl().replace('{buttonText}', CJ.t(buttonText, true));
        this.innerElement.setHtml(html);
    },
    /**
     * returns a component to display submitted tool:
     * correct/wrong etc ...
     */
    applyDisplayComponent(config) {
        if (!config)
            return false;
        const values = this.getValue(), type = values.type == 'custom_card' ? 'custom' : values.type;
        return Ext.factory(Ext.apply({
            xtype: CJ.tpl('view-tool-{0}-tool', type),
            values
        }, config));
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateDisplayComponent(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
        if (newComponent)
            newComponent.renderTo(this.innerElement.dom);
    },
    /**
     * @return {undefined}
     */
    cleanup() {
        this.setDisplayComponent(false);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.cleanup();
    }
});