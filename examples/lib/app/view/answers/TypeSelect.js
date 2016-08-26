import 'app/core/view/Component';
import 'app/view/answers/AnswerTypes';

/**
 * Defines a component that allows user to select question's answer type.
 */
Ext.define('CJ.view.answers.TypeSelect', {
    extend: 'CJ.core.view.Component',
    alias: 'widget.view-answers-type-select',
    mixins: { editable: 'CJ.view.mixins.Editable' },
    /**
     * @property {Boolean} isTypeSelect
     */
    isTypeSelect: true,
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config) {
            return Ext.factory({
                xtype: 'core-view-popup',
                title: 'tool-menu-questions-title',
                cls: 'd-menu-popup d-answer-types-popup',
                layout: 'light',
                content: {
                    xtype: 'view-answer-types',
                    listeners: config.listeners
                }
            });
        }
    },
    config: {
        /**
         * @inheritdoc
         */
        type: 'light',
        /**
         * @cfg {String} html Translation key.
         */
        html: 'answers-type-select-title',
        /**
         * @inheritdoc
         */
        cls: 'd-answers-type-select',
        /**
         * @cfg {CJ.view.block.edit.defaults.Editor} editor
         */
        editor: null,
        /**
         * @cfg {Object} tap
         */
        listeners: {
            tap: {
                element: 'element',
                fn: 'showAnswerTypes'
            }
        }
    },
    /**
     * @param {String} html
     * @return {String}
     */
    applyHtml(html) {
        return CJ.app.t(html);
    },
    /**
     * shows a popup to select an answer type.
     */
    showAnswerTypes(e) {
        e.stopEvent();
        CJ.view.answers.TypeSelect.popup({
            listeners: {
                scope: this,
                select: this.onAnswerTypeSelected
            }
        });
    },
    /**
     * will be called when user selects an answer type
     * @param {Object} contains 2 variables: 
     *          |----type E.g: short, numeric etc ...
     *          |----app E.g: graphu, boomath2 etc ...
     */
    onAnswerTypeSelected(data) {
        const me = this;
        type = data.type;
        answerClass = CJ.view.answers[type].Answer, //[TODO] When backend will hold the external apps this will be changed to match the addres , until then this will be here 
        apps = Core.externalApps, appHasSettings = false;
        if (apps[data.app])
            appHasSettings = apps[data.app].answer ? apps[data.app].answer.hasSettings ? true : false : false;
        if (answerClass.hasSettings || appHasSettings) {
            if (appHasSettings)
                return CJ.view.tool.app.Tool.onAppSelected(tool => {
                    me.createAnswerType(tool, null, null, type, data.app);
                }, { app: data.app });
            return answerClass.showSettings({
                app: data.app,
                listeners: {
                    scope: this,
                    actionbuttontap: Ext.bind(this.createAnswerType, this, [type], true)
                }
            });
        }
        const editor = this.getEditor();
        const question = editor.getQuestion();
        let settings = {
            xtype: this.getXtypeFromAnswerType(type),
            block: editor.getBlock(),
            editing: true
        };
        if (data.app && data.app != '')
            settings = Ext.apply(settings, { app: data.app });
        question.setTypeSelect(null);
        question.setAnswerType(settings);
    },
    /**
     * will be called after user sets answer's settings.
     *
     * @param {Object} settings
     * @param {Object} d
     * @param {Ext.Evented} e
     * @param {String} answerType
     */
    createAnswerType(popup, d, e, answerType, appType) {
        const settings = popup.isPopup ? popup.getContent().getValues() : popup.getValues(), editor = this.getEditor(), question = editor.getQuestion();
        question.setTypeSelect(null);
        question.setAnswerType({
            settings,
            app: appType,
            xtype: this.getXtypeFromAnswerType(answerType),
            block: editor.getBlock(),
            editing: true
        });
    },
    /**
     * @param {String} answerType
     * @return {String}
     */
    getXtypeFromAnswerType(answerType) {
        return CJ.tpl('view-answers-{0}-answer', answerType);
    }
});