import 'app/view/tool/Base';
import 'app/view/tool/formula/Editing';

Ext.define('CJ.view.tool.formula.Tool', {
    extend: 'CJ.view.tool.Base',
    alias: 'widget.view-tool-formula-tool',
    statics: {
        /**
         * @param {Object} config
         */
        showEditing(config) {
            return Ext.factory(Ext.applyIf(config, {
                xtype: 'core-view-popup',
                cls: 'd-formula-editing d-popup-transparent',
                title: 'view-tool-formula-tool-editing-title',
                content: {
                    values: config.values,
                    xtype: 'view-tool-formula-editing'
                },
                actionButton: {
                    cls: 'action-button okButton',
                    text: 'tool-formula-edit-submit'
                }
            }));
        },
        /**
         * @param {Object} config
         * @param {String} config.formula
         * @param {String} config.preview
         * @return {String}
         */
        encode(config) {
            return CJ.tpl('encoded_{0}', CJ.Utils.urlify(config.formula));
        },
        /**
         * @param {Object} config
         * @param {String} config.formula
         * @param {String} config.preview
         * @return {String}
         */
        decode(config) {
            let formula = config.formula;    //validate it's not already a latex formula if theres a preview
            //validate it's not already a latex formula if theres a preview
            if (config.preview && !/[{}\\}]/.test(formula))
                formula = Ux.FormulaLatexConverter.convert(formula);
            if (formula.indexOf('encoded_') === 0)
                return CJ.Utils.unurlify(formula.split('encoded_')[1]);
            return formula;
        },
        /**
         * @property {Ext.Template} previewTpl
         */
        previewTpl: Ext.create('Ext.Template', '<div class=\'d-tool d-formula d-fake\' data-tool-index=\'{toolIndex}\'></div>', { compiled: true })
    },
    config: {
        /**
         * @cfg {Object} mathQuill MathQuill instance reference
         */
        mathQuill: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-formula',
        /**
         * @cfg {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.Template', '<span class=\'formula\'>{formula}</span>', { compiled: true })
    },
    renderPreviewTpl() {
        this.callParent(args);
        if (this.rendered)
            return this.setMathQuill(true);    // can't use painted as it will fire after some delay, so next frame is
                                               // the best choice here (also this way prevents any scroll-jumps during
                                               // restoring list state)
        // can't use painted as it will fire after some delay, so next frame is
        // the best choice here (also this way prevents any scroll-jumps during
        // restoring list state)
        Ext.TaskQueue.requestWrite(function () {
            if (this.isDestroyed)
                return;
            this.setMathQuill(true);
        }, this);
    },
    /**
     * calls focus on mathquill field
     */
    focus() {
        const instance = this.getMathQuill();
        if (instance)
            instance.focus();
    },
    /**
     * @return {undefined}
     */
    renderTemplateOnDemand() {
        Ext.TaskQueue.requestWrite(function () {
            this.getMathQuill().latex(this.getValues().formula);
        }, this);
    },
    /**
     * @param {Boolean} state
     * @return {Object}
     */
    applyMathQuill(state) {
        if (!state)
            return false;
        return MathQuill.StaticMath(this.element.dom.querySelector('.formula'));
    },
    /**
     * @param {Object} newInstance
     * @param {Object} oldInstance
     */
    updateMathQuill(newInstance, oldInstance) {
        if (oldInstance)
            oldInstance.revert();
        if (newInstance)
            newInstance.latex(this.getValues().formula);
    },
    /**
     * also remves mathquill
     * @return {undefined}
     */
    destroy() {
        this.setMathQuill(false);
        this.callParent(args);
    },
    /**
     * @return {Object}
     */
    serialize() {
        this.applyChanges();
        return {
            xtype: this.xtype,
            values: { formula: this.self.encode(this.getValues()) }
        };
    },
    applyValues(values undefined {}) {
        if (values.formula)
            values.formula = this.self.decode(values);
        return this.callParent(args);
    }
});