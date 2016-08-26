/**
 * Class is used to incapsulate all ajax-requests logic for badges.
 */
Ext.define('CJ.model.Badge', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.Badge',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @param {Number} examId
     * @param {Object} config
     * @return {undefined}
     */
    pin(examId, config undefined {}, subConfig undefined {}) {
        CJ.Ajax.request(Ext.apply({
            rpc: {
                model: 'PortalUser',
                method: 'update_badge'
            },
            params: Ext.apply({
                examId,
                display: true
            }, subConfig),
            success() {
                CJ.feedback();
            }
        }, config));
    },
    unPin(examId, config) {
        this.pin(examId, config, { display: false });
    },
    deleteBadge(examId, config) {
        this.pin(examId, config, {
            display: false,
            'delete': true
        });
    }
});