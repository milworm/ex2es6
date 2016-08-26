import 'app/core/view/Component';

Ext.define('CJ.view.solution.SolutionUrl', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {Array} alias
     */
    alias: ['widget.view-solution-url'],
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} type
         */
        type: 'light',
        /**
         * @config {Object} solution
         */
        solution: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-solution-url',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} tpl
         */
        tpl: '<i></i>{title}'
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.showSolution, this);
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        data.title = CJ.t('view-solution-url-title');
        return data;
    },
    /**
     * opens solution block in a popup.
     * @return {undefined}
     */
    showSolution() {
        const docId = this.getSolution().docId;
        CJ.app.redirectTo(CJ.tpl('!m/{0}', docId), true);
        CJ.Block.popup({ blockId: docId });
    }
});