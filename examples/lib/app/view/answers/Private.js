import 'app/view/answers/InlineBlock';

/**
 * Defines a component that is used to show that answers in answer-list is
 * private and user cannot see them.
 */
Ext.define('CJ.view.answers.Private', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.answers.InlineBlock',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-answers-private',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @param {String} cls
         */
        baseCls: 'd-answers-inline-block d-private',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-answers-inline-block d-private-inner',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Array|String|Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class="d-icon"></div>', '<div class="d-title">{label}</div>', { compiled: true })
    },
    /**
     * @param {Object} data
     */
    applyData(data) {
        data.label = CJ.t('view-answers-private-title');
        return this.callParent(args);
    },
    // do nothing when user taps on private block.
    onTap: Ext.emptyFn
});