import 'Ext/Component';

/**
 * Defines a base class for pending/confirm/private blocks.
 */
Ext.define('CJ.view.answers.InlineBlock', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-answers-inline-block',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @param {String} baseCls
         */
        baseCls: 'd-answers-inline-block',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-answers-inline-block-inner',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Object} userInfo
         */
        userInfo: null,
        /**
         * @cfg {Object} listeners
         */
        listeners: {
            tap: {
                fn: 'onTap',
                element: 'element'
            }
        }
    },
    /**
     * @return {undefined}
     */
    onTap() {
        CJ.app.redirectTo(`!u/${ CJ.Utils.urlify(this.getUserInfo().user) }`);
    }
});