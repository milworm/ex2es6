/**
 * Defines a component that represents a Comment.
 */
Ext.define('CJ.model.Comment', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.Comment',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @property {Number} MAX_INLINE_ITEMS
     */
    MAX_INLINE_ITEMS: 2,
    /**
     * @property {Number} MAX_REPLY_ITEMS
     */
    MAX_REPLY_ITEMS: 5,
    /**
     * @property {Number} MAX_FULL_ITEMS
     */
    MAX_FULL_ITEMS: 50,
    /**
     * @param {Number} count
     * @return {String}
     */
    createTitleFromCount(count) {
        let title;
        if (count < 2)
            title = 'view-comments-comment';
        else
            title = 'view-comments-comments';
        return CJ.tpl('{0} <span>{1}</span>', count, CJ.app.t(title));
    },
    /**
     * @param {Number} docId
     * @param {Object} config
     * @param {String} config.comments
     * @param {Object} config.attachment
     * @param {Object} config.success
     * @param {Object} config.scope
     * @return {undefined}
     */
    create(docId, config) {
        const attachment = config.attachment;
        if (attachment)
            config.attachment = CJ.tpl('/u/{0}/{1}', attachment.uuid, attachment.fileName);
        CJ.request(Ext.apply({
            rpc: {
                id: docId,
                model: 'Document',
                method: 'add_comment'
            },
            args: {
                content: config.comment,
                attachment: config.attachment
            }
        }, config));
    },
    /**
     * @param {Number} commentId
     * @param {Object} config
     * @param {String} config.comment
     * @param {Object} config.attachment
     * @param {Object} config.success
     * @param {Object} config.scope
     * @return {undefined}
     */
    update(commentId, config) {
        let attachment = config.attachment;
        const content = config.comment;
        if (attachment)
            attachment = CJ.tpl('/u/{0}/{1}', attachment.uuid, attachment.fileName);
        CJ.request(Ext.apply({
            rpc: {
                id: commentId,
                model: 'Comment',
                method: 'set_content'
            },
            args: {
                content,
                attachment
            }
        }, config));
    },
    /**
     * simply sends request in order to flag comment.
     * @param {Number} commentId
     */
    flag(commentId) {
        CJ.request({
            url: CJ.constant.request.flagComment,
            params: { docId: commentId }
        });
    },
    /**
     * makes a request to delete a comment.
     * @param {Number} commentId
     * @param {Object} config
     */
    destroy(commentId, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'Comment',
                method: 'delete',
                id: commentId
            }
        }, config));
    },
    /**
     * makes a request to moderate/unmoderate a comment.
     * @param {Boolean} moderate
     * @param {Number} commentId
     * @param {Object} config
     */
    moderate(moderate, commentId, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'Comment',
                method: moderate ? 'moderate' : 'unmoderate',
                id: commentId
            }
        }, config));
    },
    /**
     * simply loads inline comments list.
     * @param {Number} blockId
     * @param {Object} config
     */
    loadInlineItems(blockId, config) {
        CJ.request(Ext.apply({
            method: 'GET',
            rpc: {
                model: 'Document',
                method: 'load_comments',
                id: blockId
            },
            params: {
                refId: null,
                levels: 1,
                limit: [this.MAX_INLINE_ITEMS]
            }
        }, config));
    },
    /**
     * @param {Number} blockId
     * @param {Object} config
     */
    loadItems(blockId, config undefined {}) {
        if (this.hasContext()) {
            if (config.success)
                return this.loadContextItems(blockId, config);
            return new Promise((resolve, reject) => {
                config = Ext.apply(config, {
                    success: resolve,
                    failure: reject
                });
                this.loadContextItems(blockId, config);
            });
        }
        const commentId = CJ.app.getRouteParam('commentId');
        let refMode = 'after';
        let refId = null;
        if (commentId) {
            refMode = 'midpoint';
            refId = commentId;
        }
        config = Ext.apply({
            refMode,
            refId
        }, config);
        if (config.success)
            return this.loadFullItems(blockId, config);
        return new Promise((resolve, reject) => {
            config = Ext.apply(config, {
                success: resolve,
                failure: reject
            });
            this.loadFullItems(blockId, config);
        });
    },
    /**
     * @return {Boolean} true in case when current page should displays reply
     *                   to some comment (comment has a context(parent comment))
     */
    hasContext() {
        return !!CJ.app.getRouteParam('parentId');
    },
    /**
     * @return {Boolean} true in case when there is commentId that should be highlighted.
     */
    hasHighlightedComment() {
        return CJ.app.getRouteParam('commentId') || CJ.app.getRouteParam('replyId');
    },
    /**
     * @param {Number} blockId
     */
    loadContextItems(blockId, config) {
        CJ.request(Ext.apply({
            method: 'GET',
            rpc: {
                model: 'Document',
                method: 'search'
            },
            params: {
                id: CJ.app.getRouteParam('parentId'),
                commRefId: CJ.app.getRouteParam('replyId'),
                commRefMode: 'midpoint',
                commLim: 1,
                commLvl: 1
            }
        }, config));
    },
    /**
     * @param {Number} blockId
     */
    loadFullItems(blockId, config undefined {}) {
        const refId = config.refId || null, refMode = config.refMode || 'after', scored = config.scored ? true : null, success = config.success;
        delete config.success;
        CJ.request(Ext.apply({
            method: 'GET',
            rpc: {
                model: 'Document',
                method: 'load_comments',
                id: blockId
            },
            params: {
                levels: 3,
                refId,
                refMode,
                scored,
                limit: [
                    this.MAX_FULL_ITEMS,
                    5,
                    5
                ]
            },
            success(response, request) {
                response.request = request;
                Ext.callback(success, config.scope, [
                    response,
                    request
                ]);
            }
        }, config));
    },
    /**
     * @param {Number} commentId
     * @param {Object} config
     */
    loadReplyItems(commentId, config) {
        CJ.request(Ext.apply({
            method: 'GET',
            rpc: {
                model: 'Document',
                method: 'load_comments',
                id: commentId
            },
            params: {
                levels: 1,
                limit: [this.MAX_REPLY_ITEMS]
            }
        }, config));
    },
    /**
     * @param {Number} blockId
     * @param {Number} lastCommentId
     * @param {Object} config
     */
    loadMoreReplies(blockId, lastCommentId, config) {
        CJ.request(Ext.apply({
            method: 'GET',
            rpc: {
                model: 'Document',
                method: 'load_comments',
                id: blockId
            },
            params: {
                levels: 1,
                refId: lastCommentId,
                refMode: 'after',
                limit: [5]
            }
        }, config));
    },
    /**
     * @param {String} id Comment's id
     * @return {Promise}
     */
    pin(id) {
        const me = this;
        return Promise.resolve().then(() => me.changeScore(id, 1)).then(() => {
            CJ.feedback();
        });
    },
    /**
     * @param {String} id Comment's id
     * @return {Promise}
     */
    unpin(id) {
        const me = this;
        return Promise.resolve().then(() => me.changeScore(id, null)).then(() => {
            CJ.feedback();
        });
    },
    /**
     * @param {String} id Comment's id
     * @param {Number} score
     * @return {Promise}
     */
    changeScore(id, score) {
        return new Promise((resolve, reject) => {
            CJ.request({
                method: 'POST',
                rpc: {
                    model: 'Comment',
                    method: 'set_score',
                    id
                },
                params: { score },
                success: resolve,
                failure: reject
            });
        });
    },
    /**
     * @param {String} blockId
     * @return {Promise} will be resolved with an object that contains {type, ret: {items, order}}
     */
    loadDefaultTab(blockId) {
        const hasHighlighted = this.hasHighlightedComment();
        return Promise.all([
            this.loadItems(blockId),
            this.loadItems(blockId, { scored: true })
        ]).then(responses => {
            const allResponse = responses[0];
            const faqResponse = responses[1];
            let result;
            let type;
            if (faqResponse.ret.items.length && !hasHighlighted) {
                result = faqResponse;
                type = 'faq';
            } else {
                type = 'all';
                result = allResponse;
            }    // result.ret.items.request = result.request;
            // result.ret.items.request = result.request;
            result.ret.request = result.request;
            result.type = type;
            return result;
        });
    }
});