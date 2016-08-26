import 'Ext/carousel/Carousel';

Ext.define('CJ.view.playlist.play.Carousel', {
    extend: 'Ext.carousel.Carousel',
    xtype: 'view-playlist-play-carousel',
    isPlaylistCarousel: true,
    config: {
        /**
         * @cfg {Boolean} examMode
         */
        examMode: null,
        /**
         * @cfg {Number} keyboardScrollSpeed
         */
        keyboardScrollSpeed: 20
    },
    /**
     * @param {Boolean} state
     */
    updateExamMode(state) {
        if (!state)
            return;
        this.getItems().each(item => {
            if (item.isBlock && item.hasQuestion())
                item.getQuestion().denyRetry();
        });
    },
    beforeInitialize() {
        this.callParent(args);
        if (Ext.os.is.Desktop)
            this.element.un({
                dragstart: 'onDragStart',
                drag: 'onDrag',
                dragend: 'onDragEnd',
                scope: this
            });
    },
    constructor() {
        this.callParent(args);
        CJ.on('contentblock.deleted', this.onBlockDeleted, this);
        Ext.getBody().on({
            keydown: this.onKeyDown,
            scope: this
        });
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    onBlockDeleted(block) {
        const selector = CJ.tpl('[docId={0}]', block.getDocId());
        block = this.down(selector);
        if (!block)
            return;
        this.fireEvent('removeitem', this, block);
    },
    onKeyDown(e) {
        let scrollable, scrollSpeed;
        scrollable = this.getActiveItem().element.dom.parentNode;
        if (!scrollable)
            return;
        scrollSpeed = this.getKeyboardScrollSpeed();
        if (e.event.keyCode == 38) {
            scrollable.scrollTop = scrollable.scrollTop - scrollSpeed;
        }
        if (e.event.keyCode == 40) {
            scrollable.scrollTop = scrollable.scrollTop + scrollSpeed;
        }
    },
    /**
     * simply deletes all answers for blocks with questions and answer-types.
     * @return {undefined}
     */
    retryExam() {
        this.setActiveItem(0);
        this.getItems().each(item => {
            if (!item.isBlock || !item.hasQuestion())
                return;
            const answerType = item.getQuestion().getAnswerType();
            if (answerType)
                answerType.setValue(null);
        });
    },
    next() {
        this.callParent(args);
        if (this.activeIndex < this.getMaxItemIndex())
            this.listRenderToolsOnDemand(this.activeIndex + 1);
        return this;
    },
    previous() {
        this.callParent(args);
        if (this.activeIndex > 0)
            this.listRenderToolsOnDemand(this.activeIndex - 1);
        return this;
    },
    listRenderToolsOnDemand(index) {
        const innerItem = this.getInnerItemAt(index);
        let innerList;
        if (innerItem.isBlock) {
            innerList = innerItem.getList();
            if (innerList)
                innerList.renderToolsOnDemand();
        }
    },
    destroy() {
        this.callParent(args);
        CJ.un('contentblock.deleted', this.onBlockDeleted, this);
    }
});