/**
 * Class defines a mixin that adds reusable functionallity
 */
Ext.define('CJ.view.mixins.Reusable', {
    isReusable: true,
    /**
     * 
     * @param {String} tags
     */
    reuse(tags) {
        Ext.Viewport.mask();
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'reuse_document'
            },
            params: {
                id: this.getDocId(),
                tags
            },
            success: this.onReuseSuccess,
            failure: this.onReuseFailure,
            scope: this
        });
    },
    /**
     * will be called when block have been successfully reused
     */
    onReuseSuccess(response, request) {
        Ext.Viewport.unmask();
        CJ.feedback();
    },
    /**
     * will be called when some errors occured during block creation
     */
    onReuseFailure() {
        Ext.Viewport.unmask();
        CJ.feedback(CJ.t('msg-feedback-failure'));
    },
    /**
     * @return {Boolean} true in case when current block is reused (not origin)
     */
    isReused() {
        return this.config.reuseInfo && this.config.reuseInfo.reusesContent;
    },
    /**
     * @return {Number}
     */
    getOriginalDocId() {
        return this.config.reuseInfo.docId;
    },
    /**
     * @return {String}
     */
    getOriginalUser() {
        const reuseInfo = this.config.reuseInfo;
        if (!reuseInfo || !reuseInfo.userInfo)
            return null;
        return reuseInfo.userInfo.user;
    },
    /**
     * @return {Number}
     */
    getReuseCount() {
        return this.config.reusedCount || 0;
    },
    /**
     * @return {Boolean} True in case when block's content wasn't really reused.
     */
    isShallowlyReused() {
        return this.isReused() && this.config.reuseInfo.shallowReuse;
    },
    /**
     * @return {Boolean} true in case when question had been changed
     *                   when real block's owner update the block.
     */
    isQuestionChanged() {
        const question = this.getQuestion && this.getQuestion();
        if (!question)
            return false;
        const reuseInfo = this.config.reuseInfo;
        if (!reuseInfo)
            return false;
        return reuseInfo.questionChanged;
    }
});