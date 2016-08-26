import 'app/view/answers/base/Answer';
import 'app/view/answers/text/Settings';

/**
 * Defines an answer type, where the answer is just a text,
 * that can be limited.
 */
Ext.define('CJ.view.answers.text.Answer', {
    extend: 'CJ.view.answers.base.Answer',
    alias: 'widget.view-answers-text-answer',
    isTextAnswer: true,
    statics: {
        /**
         * @property {Boolean} hasSettings
         */
        hasSettings: true,
        answerType: 'text'
    },
    config: {
        /**
         * @cfg {Object|Array} settings
         */
        settings: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-answer d-text-answer',
        /**
         * @cfg {Ext.Component} minMaxTip
         */
        minMaxTip: null,
        /**
         * @cfg {Ext.Component} field
         */
        field: null,
        /**
         * @cfg {Ext.Component} button
         */
        button: null,
        /**
         * @cfg {Ext.XTemplate} buttonTpl
         */
        buttonTpl: Ext.create('Ext.XTemplate', [
            '<span>{[ CJ.app.t(values.title) ]} {wordsCount}</span> ',
            '<span>',
            '<tpl if=\'min\'>',
            '<tpl if=\'Ext.os.is.Phone\'>',
            '{min}',
            '<tpl else>',
            '{[ CJ.app.t(\'view-answers-text-answer-min-upper\') ]} {min}',
            '</tpl>',
            '</tpl>',
            '<tpl if=\'min && max\'> : </tpl>',
            '<tpl if=\'max\'>',
            '<tpl if=\'Ext.os.is.Phone\'>',
            '{max}',
            '<tpl else>',
            '{[ CJ.app.t(\'view-answers-text-answer-max-upper\') ]} {max}',
            '</tpl>',
            '</tpl>',
            '</span>',
            { compiled: true }
        ]),
        /**
         * @cfg {Ext.XTemplate} displayTpl
         */
        displayTpl: '<div class=\'d-display-field\'>{value}</div>',
        /**
         * @cfg {Ext.Template} editTpl
         */
        editTpl: Ext.create('Ext.Template', '<div class=\'d-input-field-container\'>', '<input class=\'d-input-field\' type=\'text\' placeholder=\'{placeHolder}\' disabled=\'disabled\' />', '</div>', '<input type=\'button\' class=\'d-submit-button\' value=\'{buttonText}\' disabled=\'disabled\' />', { compiled: true })
    },
    /**
     * @param {Object} config
     */
    constructor() {
        this.callParent(args);
        this.element.on('input', this.onUpdated, this, { delegate: '.d-input-field' });
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyField(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-form-growfield',
            minFieldHeight: 41,
            maxFieldHeight: 94,
            maxLength: false,
            placeHolder: 'view-answers-text-answer-placeholder',
            value: this.getValue(),
            renderTo: this.innerElement,
            listeners: {
                input: this.onUpdated,
                scope: this
            }
        }, config));
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateField(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyButton(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-component',
            type: 'light',
            cls: 'd-submit-button',
            html: CJ.t('view-answers-text-answer-view-state-submit'),
            renderTo: this.innerElement
        }, config));
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateButton(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyMinMaxTip(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-component',
            tpl: [
                '{[ Ext.isNumber(values.min) && values.min > 0 ? CJ.app.t(\'view-answers-text-answer-min\') + \' \' + values.min + \' \' : \'\' ]}',
                '{[ Ext.isNumber(values.max) ? CJ.app.t(\'view-answers-text-answer-max\') + \' \' + values.max : \'\']}'
            ],
            data: this.getSettings(),
            cls: 'd-min-max-tip',
            renderTo: this.innerElement
        }, config));
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     */
    updateMinMaxTip(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
    },
    /**
     * @return {String|Number|Object} value from answer's form
     */
    getEnteredValue() {
        if (this.getButton().getDisabled())
            return '';
        return this.getField().getValue();
    },
    /**
     * @inheritdoc
     */
    toEditState() {
        this.removeAll();
        this.innerElement.setHtml(this.getEditTpl().apply({
            placeHolder: CJ.app.t('view-answers-text-answer-placeholder', true),
            buttonText: CJ.app.t('view-answers-text-answer-edit-state-submit', true)
        }));
        this.setMinMaxTip({});
    },
    /**
     * @inheritdoc
     */
    showForm() {
        this.removeAll();
        this.innerElement.setHtml('');
        this.setField({});
        this.setButton({});
        this.setMinMaxTip({});
        this.onUpdated();
    },
    /**
     * @return {undefined}
     */
    showResult() {
        this.removeAll();
        this.callParent(args);
    },
    /**
     * @return {undefined}
     */
    onUpdated() {
        const minMaxTip = this.getMinMaxTip();
        const button = this.getButton();
        let value = this.getField().getValue();
        const settings = this.getSettings();
        const min = Ext.isNumber(settings.min) && settings.min;
        const max = Ext.isNumber(settings.max) && settings.max;
        let words;
        value = value.replace(/\n/g, ' ');
        words = value ? value.split(' ') : [];
        minMaxTip[value ? 'hide' : 'show']();
        if (Ext.isEmpty(value)) {
            button.setDisabled(true);
        } else {
            if (min && words.length < min)
                button.setDisabled(true);
            else if (max && words.length > max)
                button.setDisabled(true);
            else
                button.setDisabled(false);
        }
        button.setHtml(this.getButtonTpl().apply({
            title: 'view-answers-text-answer-view-state-submit',
            wordsCount: words.length,
            min,
            max
        }));
    },
    /**
     * @param {Object} settings
     */
    applySettings(settings) {
        if (this.initialized)
            this.getMinMaxTip().setData(settings);
        settings = {
            min: +settings.min,
            max: +settings.max
        };
        return settings;
    },
    /**
     * @return {Boolean}
     */
    isAnswered() {
        return !Ext.isEmpty(this.getValue(), true);
    },
    /**
     * @return {undefined}
     */
    removeAll() {
        this.setField(false);
        this.setButton(false);
        this.setMinMaxTip(false);
    },
    /**
     * method will be called when user taps on answer's submit-button
     * @param {Ext.Evented} e
     */
    onSubmitButtonTap() {
        if (this.getButton().getDisabled())
            return;
        this.save(this.getEnteredValue());
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.removeAll();
    }
});