import 'app/view/answers/base/Answer';
import 'app/view/answers/multiplechoice/Settings';

/**
 * Defines an answer type, where the answer is a multiplechoice,
 * that can be limited.
 */
Ext.define('CJ.view.answers.multiplechoice.Answer', {
    extend: 'CJ.view.answers.base.Answer',
    alias: 'widget.view-answers-multiplechoice-answer',
    statics: {
        /**
         * @property {Boolean} hasSettings
         */
        hasSettings: true,
        answerType: 'multiplechoice'
    },
    config: {
        /**
         * @cfg {Object} settings
         * @cfg {Number|undefined} settings.correct
         * @cfg {Array} settings.options
         */
        settings: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-multiplechoice-answer d-answer',
        /**
         * @cfg {Ext.XTemplate} formTpl
         */
        formTpl: Ext.create('Ext.XTemplate', '<div class=\'d-form-field\'>', '<tpl for=\'options\'>', '<div class=\'d-item d-hbox d-vcenter d-input\'>', '<input class=\'d-radio\' type=\'radio\' name=\'{parent.name}\' id=\'{[ parent.name + xindex ]}\' {[ xindex - 1 == parent.value ? \'checked="checked"\' : \'\' ]}>', '<label for=\'{[ parent.name + xindex ]}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-title\'>{.}</div>', '</label>', '</div>', '</tpl>', '</div>', '<input type=\'button\' class=\'d-submit-button\' value=\'{buttonText}\' />', { compiled: true }),
        /**
         * @cfg {Ext.XTemplate} editTpl
         */
        editTpl: Ext.create('Ext.XTemplate', '<div class=\'d-edit-field\'>', '<tpl for=\'options\'>', '<div class=\'d-item d-hbox d-vcenter\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-title\'>{.}</div>', '</div>', '</tpl>', '</div>', '<input type=\'button\' class=\'d-submit-button\' value=\'{buttonText}\' disabled=\'disabled\' />', { compiled: true }),
        /**
         * @cfg {Ext.XTemplate} displayTpl
         */
        displayTpl: Ext.create('Ext.XTemplate', '<div class=\'d-display-field\'>', '<tpl for=\'settings.options\'>', '<div class=\'d-item d-hbox d-vcenter {[xindex == parent.value + 1 ? \'d-checked\' : \'\']}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-title\'>{.}</div>', '</div>', '</tpl>', '</div>', { compiled: true })
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.callParent(args);
        this.element.on('change', this.onUpdated, this, { delegate: '.d-radio' });
    },
    /**
     * @inheritdoc
     */
    toEditState() {
        const html = this.getEditTpl().apply({
            options: this.getSettings().options,
            buttonText: CJ.app.t('view-answers-multiplechoice-answer-view-state-submit', true)
        });
        this.innerElement.setHtml(html);
    },
    /**
     * @inheritdoc
     */
    showForm() {
        const html = this.getFormTpl().apply({
            options: this.getSettings().options,
            value: this.getValue(),
            name: Ext.String.format('multiplechoice-field-{0}', this.getId().split('-').reverse()[0]),
            buttonText: CJ.app.t('view-answers-multiplechoice-answer-view-state-submit', true)
        });
        this.innerElement.setHtml(html);
        this.onUpdated();
    },
    /**
     * @return {undefined}
     */
    onUpdated() {
        const isEmpty = this.getEnteredValue() == -1;
        this.getButton().disabled = isEmpty;
    },
    /**
     * @param {Object} settings
     */
    updateSettings(settings) {
        if (!this.initialized)
            return;
        this.toEditState();
    },
    /**
     * @return {Number}
     */
    getEnteredValue() {
        const node = this.innerElement.dom, fields = node.querySelectorAll('.d-radio'), field = node.querySelector('.d-radio:checked');
        return [].slice.call(fields).indexOf(field);
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
     * @return {Boolean} true in case when it's possible to automatically check
     *                   the answer.
     */
    isAutoCheckable() {
        return Ext.isNumeric(this.getSettings().correct);
    },
    /**
     * shows settings popup and saves resulting update
     */
    editSettings() {
        this.self.showSettings({
            values: this.getSettings(),
            listeners: {
                scope: this,
                actionbuttontap: this.onSettingsEdit
            }
        });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onSettingsEdit(popup) {
        const newSettings = popup.getContent().getValues(), oldSettings = this.getSettings(), question = this.getQuestion(), answersCount = question.getAnswers(), block = this.getBlock(), needsConfirm = block.isInstance && block.getReuseCount() || answersCount;
        if (newSettings.options.length >= oldSettings.options.length || !needsConfirm) {
            this.setSettings(newSettings);
            question.getOptions().autoCheck = this.isAutoCheckable();
            return true;
        }
        const confirmTitle = 'confirm-title', confirmMessage = 'view-answers-base-answer-reused-confirm';
        CJ.confirm(confirmTitle, confirmMessage, function (result) {
            if (result != 'yes')
                return;
            this.setSettings(newSettings);
            question.setAnswer(null);
            question.getOptions().autoCheck = this.isAutoCheckable();
            popup.hide();
        }, this);
        return false;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.getDisplayTpl().destroy();
        this.getFormTpl().destroy();
        this.getEditTpl().destroy();
        this.setDisplayTpl(null);
        this.setFormTpl(null);
        this.setEditTpl(null);
        this.callParent(args);
    }
});