import 'Ext/app/Controller';

/**
 * Manages everything related to comments in the whole app.
 */
Ext.define('CJ.controller.Comment', {
    extend: 'Ext.app.Controller',
    config: {
        control: {
            '[isStreamList=true] view-block-base-block': { commentstap: 'onMulticolumnBlockCommentsButtonTap' },
            '[isCourseSectionBlock=true]': { commentstap: 'onCourseSectionBlockCommentsButtonTap' },
            'view-block-content-block[isModal=true]': {
                commentcreate: 'onModalBlockCommentCreate',
                commentstap: 'onModalBlockCommentsButtonTap'
            },
            'view-block-answer-block[isModal=true]': { commentstap: 'onModalBlockCommentsButtonTap' },
            'view-answers-answers-list view-block-answer-block': {
                commentstap: 'onAnswerBlockCommentsButtonTap',
                inlinecommentstap: 'onAnswerBlockInlineCommentsTap'
            },
            'view-playlist-play-container view-block-default-block': { commentstap: 'onPlaylistItemCommentsButtonTap' }
        }
    },
    /**
     * @cjminify
     * @return {undefined}
     */
    onPlaylistItemCommentsButtonTap(block) {
        const url = `!m/${ block.getDocId() }/c`;
        if (Ext.os.is.Phone)
            return CJ.app.redirectTo(url);
        CJ.app.redirectTo(url, true);
        CJ.Block.popup({
            state: 'comments',
            blockId: block.getDocId()
        });
    },
    /**
	 * @cjminify
	 * method will be called when user taps on comments button of a block inside
	 * of multicolumn list. Shows block in a popup with comments tab opened.
	 * @param {CJ.view.block.BaseBlock} block
	 */
    onMulticolumnBlockCommentsButtonTap(block) {
        CJ.app.redirectTo(`!m/${ block.getDocId() }/c`);
    },
    /**
     * @cjminify
     * method will be called when user taps on comments button of a block inside
     * of course-section list. Shows block in a popup with comments tab opened.
     * @param {CJ.view.block.BaseBlock} block
     */
    onCourseSectionBlockCommentsButtonTap(block) {
        this.onPlaylistItemCommentsButtonTap(block);
    },
    /**
	 * @cjminify
	 * @param {CJ.core.view.block.Default} block
	 */
    onSinglecolumnBlockInlineCommentsTap(block) {
        CJ.app.redirectTo(`!c/${ block.getDocId() }`);
    },
    /**
	 * @cjminify
	 * method will be called when user taps on comments button of a block inside
	 * of popup. Switches to comments tab or opens it in case when block wasn't
	 * expanded.
	 * @param {CJ.view.block.BaseBlock} block
	 * @param {Ext.Component} bottomBar
	 */
    onModalBlockCommentsButtonTap(block, bottomBar) {
        const blockId = block.getDocId();
        let url;
        if (block.isAnswerBlock)
            url = CJ.tpl('!m/{0}/{0}/c', block.getActivityId(), blockId);
        else
            url = CJ.tpl('!m/{0}/c', blockId);
        CJ.History.replaceState(url);
        block.getPopup().setState('comments');
    },
    /**
	 * @cjminify
	 * method will be called when user taps on comments-button of answer block.
	 * @param {CJ.view.block.AnswerBlock}
	 */
    onAnswerBlockCommentsButtonTap(block) {
        const bar = block.getBottomBar();    // we use config here, as tab can be any component
                                             // with no type-config defined
        // we use config here, as tab can be any component
        // with no type-config defined
        if (bar.config.type == 'comments')
            return false;
        bar.setTab({
            type: 'comments',
            xtype: 'view-comments-list-inline'
        });    // as we are using answers as inner list, we need to prevent bubbling
               // in order to skip executing commentstap on parent block.
        // as we are using answers as inner list, we need to prevent bubbling
        // in order to skip executing commentstap on parent block.
        return false;
    },
    /**
	 * @cjminify
	 * method will be called when user taps on inline-comments list inside of
	 * answer-block.
	 * @param {CJ.view.block.AnswerBlock} block
	 */
    onAnswerBlockInlineCommentsTap(block) {
        const activityBlock = block.getParentList().getBlock(), activityId = activityBlock.getDocId(), answerId = block.getDocId();    // redirect to answer-block view-state with comments tab opened.
        // redirect to answer-block view-state with comments tab opened.
        if (!activityBlock.getIsModal())
            return CJ.app.redirectTo(CJ.tpl('!c/{0}', answerId));
        CJ.app.redirectTo(CJ.tpl('!m/{0}/a/{1}/c', activityId, answerId), true);
        block.popup('comments');
    },
    /**
	 * @cjminify
	 * @param {Number} count
	 * @param {CJ.view.block.BaseBlock} block
	 */
    onModalBlockCommentCreate(count, block) {
        if (block.locked)
            return;
        const selector = CJ.tpl('[docId={0}]', block.getDocId()), items = Ext.ComponentQuery.query(selector);
        for (let i = 0, item; item = items[i]; i++) {
            if (item == block)
                continue;
            item.locked = true;
            item.fireEvent('commentcreate', count, item);
            item.locked = false;
        }
    }
});