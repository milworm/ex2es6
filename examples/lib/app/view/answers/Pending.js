import 'app/view/answers/InlineBlock';

/**
 * Defines a component that is used to show that user didn't answer on a 
 * question.
 */
Ext.define('CJ.view.answers.Pending', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.answers.InlineBlock',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-answers-pending',
    /**
     * @property {Boolean} isAnswerBlock
     */
    isAnswerBlock: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @param {String} cls
         */
        cls: 'd-answers-inline-block d-pending',
        /**
         * @cfg {Array|String|Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class="d-user-icon" style="background-image: url({icon})"></div>', '<div class="d-title">{name} {label}</div>', { compiled: true })
    },
    /**
     * @param {Object} data
     */
    applyData(data) {
        const user = this.getUserInfo();
        Ext.apply(data, {
            name: user.name,
            icon: user.icon,
            label: CJ.t('view-answers-pending-label')
        });
        return this.callParent(args);
    },
    /**
     * @return {Number}
     */
    getDocId() {
        return this.getUserInfo().id;
    }
});