import 'Ext/Component';

/**
 * Class defines a component to edit the formula (value, preview image)
 */
Ext.define('CJ.view.tool.formula.Form', {
    extend: 'Ext.Component',
    alias: 'widget.view-tool-formula-form',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    config: {
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {String} cls
         */
        cls: 'd-formula-form',
        /**
         * @cfg {Boolean} isLoading
         */
        isLoading: null
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                {
                    reference: 'title',
                    className: 'd-label',
                    html: CJ.app.t('tool-formula-edit-title')
                },
                {
                    className: 'd-preview',
                    children: [{
                            reference: 'formula',
                            tag: 'span'
                        }]
                }
            ]
        };
    },
    /**
     * @param {String} formula Latex formula
     */
    showPreview(formula) {
        this.formula.setHtml(formula);
        this.formula.mathquill = MathQuill.MathField(this.formula.dom);
    },
    /**
     * @param {Object} values
     */
    setValues(values undefined {}) {
        this.showPreview(values.formula || '');
    },
    /**
     * @return {Object}
     */
    getValues() {
        return { formula: this.formula.mathquill.latex() };
    },
    /**
     * @return {Boolean}
     */
    isEmpty() {
        return Ext.isEmpty(this.formula.mathquill.text());
    }
});