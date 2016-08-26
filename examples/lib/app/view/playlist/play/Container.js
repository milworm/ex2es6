import 'Ext/Container';
import 'app/view/playlist/play/Block';
import 'app/view/playlist/play/Navi';
import 'app/view/playlist/play/Carousel';
import 'app/view/playlist/play/JumpBar';
import 'app/view/playlist/exam/Result';

/**
 * The class provides component that display playlist items
 * and navigation between them.
 */
Ext.define('CJ.view.playlist.play.Container', {
    extend: 'Ext.Container',
    xtype: 'view-playlist-play-container',
    isPlaylistContainer: true,
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-playlist-play',
        /**
         * @inheritdoc
         */
        control: {
            '[isBlock]': {
                answersubmit: 'onAnswerSubmit',
                solutionsubmit: 'onAnswerSubmit'
            }
        },
        /**
         * @config {CJ.core.view.Popup} popup
         * Instance of the popup that wraps this component.
         */
        popup: null,
        /**
         * @config {CJ.view.playlist.Block} block
         */
        block: null,
        /**
         * @config {Array} playlistItems
         */
        playlistItems: null,
        /**
         * @config {Number} activeItemIndex
         * Index of the active item.
         */
        activeItemIndex: 0,
        /**
         * @config {Ext.Container} counter
         * Instance of the container component that displays
         * active number of the block in the playlist and total count of them.
         */
        counter: true,
        /**
         * @config {CJ.view.playlist.play.Navi} navi
         * Instance of the navi component.
         */
        navi: true,
        /**
         * @config {Ext.carousel.Carousel} carousel
         * Instance of the carousel component.
         */
        carousel: true,
        /**
         * @config {Boolean} navigateOnAnswer
         */
        navigateOnAnswer: true,
        /**
         * @config {Number} closeIntervalId
         */
        closeTimeoutId: null,
        /**
         * @config {CJ.view.playlist.play.JumpBar} jumpBar
         */
        jumpBar: null
    },
    updateBlock(block) {
        const items = Ext.clone(block.getPlaylist()), finishBlock = this.getFinishBlock(block);
        CJ.Ajax.patchDocumentXtype(items);
        Ext.each(items, item => {
            item.playlist = block;
            if (item.xtype != 'view-block-private-block')
                item.xtype = 'view-playlist-play-block';
        });
        items.push(finishBlock);
        this.setPlaylistItems(items);
    },
    getFinishBlock(block) {
        let config;
        if (block.isExamMode()) {
            config = {
                xtype: 'view-playlist-exam-result',
                block
            };
        } else {
            config = {
                xtype: 'core-view-component',
                type: 'light',
                cls: 'd-done',
                isDone: true,
                html: CJ.t('playlist-play-done')
            };
        }
        return config;
    },
    /**
     * Applies and initializes the playlist counter component.
     * @param {Boolean/Object} config
     * @returns {Ext.Container}
     */
    applyCounter(config, counter) {
        if (counter && counter.isComponent)
            counter.destroy();
        if (config == false)
            return false;
        if (config == true)
            config = {};
        const block = this.getBlock(), total = block.getLength(), renderTo = this.getPopup().element;
        config = Ext.apply({
            xtype: 'core-view-component',
            cls: 'playlist-counter',
            zIndex: CJ.ZIndexManager.getZIndex(),
            tpl: [
                '<span class="active">{activeItemIndex + 1}</span>',
                '/',
                '<span class="total">{total}</span>'
            ],
            data: {
                total,
                activeItemIndex: this.getActiveItemIndex()
            }
        }, config);
        config = Ext.factory(config, null, this.getCounter());
        config.renderTo(renderTo);
        config.element.onDom('touchstart', this.onCounterShowJump, this);
        config.element.onDom('mouseover', this.onCounterShowJump, this);
        return config;
    },
    onCounterShowJump() {
        this.setJumpBar(true);
    },
    /**
     * Applies and initializes the navigation component.
     * @param {Boolean/Object} config
     * @returns {CJ.view.playlist.play.Navi}
     */
    applyNavi(config) {
        if (config == false)
            return false;
        if (config == true)
            config = {};
        const block = this.getBlock();
        Ext.applyIf(config, {
            xtype: 'view-playlist-play-navi',
            block,
            activeItemIndex: this.getActiveItemIndex(),
            listeners: {
                tap: this.setActiveItemIndex,
                scope: this
            }
        });
        return Ext.factory(config, null, this.getNavi());
    },
    /**
     * Updates the navigation component.
     */
    updateNavi: Ext.Component.processUpdateComponent,
    /**
     * Applies and initializes the carousel component.
     * @param {Boolean/Object} config
     * @returns {Ext.carousel.Carousel/Boolean}
     */
    applyCarousel(config) {
        if (!config)
            return false;
        config = Ext.apply({
            xtype: 'view-playlist-play-carousel',
            height: '100%',
            indicator: false,
            animation: { duration: 1000 },
            examMode: this.getBlock().isExamMode(),
            directionLock: true,
            items: this.getPlaylistItems(),
            activeItem: this.getActiveItemIndex(),
            listeners: {
                activeitemchange: this.onActiveItemChange,
                removeitem: this.onRemoveItem,
                scope: this
            }
        }, config);
        return Ext.factory(config);
    },
    /**
     * Updates the carousel component.
     */
    updateCarousel: Ext.Component.processUpdateComponent,
    applyJumpBar(config) {
        if (!config)
            return false;
        config = Ext.factory(Ext.apply({
            xtype: 'view-playlist-play-jump-bar',
            container: this,
            zIndex: CJ.ZIndexManager.getZIndex(),
            data: {
                active: this.getActiveItemIndex(),
                items: this.getPlaylistItems(),
                isAnimating: false
            },
            listeners: {
                'item.set': this.onJumpBarSetItem,
                scope: this
            }
        }, config));
        config.renderTo(this.getPopup().element);
        return config;
    },
    onJumpBarSetItem(index) {
        const jumpBar = this.getJumpBar();
        const carousel = this.getCarousel();
        const activeIndex = this.getActiveItemIndex();
        let isAnimating = true;
        if (Math.abs(index - activeIndex) == 1) {
            if (index > activeIndex)
                carousel.next();
            else
                carousel.previous();
        } else {
            carousel.setActiveItem(index);
            carousel.listRenderToolsOnDemand(index);
            isAnimating = false;
        }
        if (jumpBar)
            jumpBar.setData({
                active: isAnimating ? activeIndex : index,
                items: this.getPlaylistItems(),
                isAnimating
            });
    },
    updateJumpBar(newJB, oldJB) {
        if (oldJB)
            oldJB.destroy();
    },
    /**
     * Applies and sets active item index.
     * @param {Number} index
     * @returns {Number}
     */
    applyActiveItemIndex(index) {
        if (this.rendered) {
            const carousel = this.getCarousel(), total = this.getBlock().getLength(), lastIndex = total - 1, closeTimeoutId = this.getCloseTimeoutId();
            if (closeTimeoutId)
                clearTimeout(closeTimeoutId);
            if (carousel.getActiveIndex() != index) {
                const activeItemIndex = this.getActiveItemIndex();
                if (activeItemIndex < index)
                    carousel.next();
                if (activeItemIndex > index)
                    carousel.previous();
            }
            this.getNavi().setNaviActiveItem(index);
            this.getCounter().setData({
                total,
                activeItemIndex: index >= lastIndex ? lastIndex : index
            });
        }
        return index;
    },
    onAnswerSubmit(question) {
        const block = question.getBlock(), validState = question.getAnswerType().getValidState();
        if (validState == 'wrong' && question.isRetryEnabled())
            return;
        if (question.hasFeedback())
            return;
        if (question.requiresSolution() && !question.hasSolution())
            return;
        if (this.getNavigateOnAnswer())
            Ext.defer(function () {
                const navi = this.getNavi(), playlist = this.getBlock(), activeItemIndex = this.getActiveItemIndex(), activeItemData = playlist.getItemData(activeItemIndex);
                if (block.getDocId() == activeItemData.docId)
                    navi.next();
            }, 1000, this);
    },
    onActiveItemChange(carousel, newItem, oldItem) {
        const playlist = this.getBlock();
        if (playlist.getState() != 'play')
            return;
        const index = carousel.indexOf(newItem);
        if (this.getActiveItemIndex() != index)
            this.setActiveItemIndex(index);
        if (oldItem)
            Ext.callback(oldItem.stopPlaying, oldItem);
        if (newItem.config && newItem.config.isDone)
            this.setCloseTimeoutId(Ext.defer(() => {
                if (carousel.getActiveItem() == newItem)
                    playlist.setState(null);
            }, 1000, this));
        const jumpBar = this.getJumpBar();
        if (jumpBar)
            jumpBar.setData({
                active: this.getActiveItemIndex(),
                items: this.getPlaylistItems(),
                isAnimating: false
            });
    },
    onRemoveItem(carosel, item) {
        const index = carosel.indexOf(item), block = this.getBlock(), total = this.getBlock().getLength(), lastIndex = total - 1, playlistItems = this.getPlaylistItems();
        if (total == 1)
            item.hide();
        else
            carosel.remove(item);
        block.getPlaylist().splice(index, 1);
        playlistItems.splice(index, 1);
        if (index == lastIndex) {
            if (lastIndex > 0)
                this.setActiveItemIndex(index - 1);
            else
                block.showIsEmpty();
        } else {
            this.applyActiveItemIndex(index);
        }
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setJumpBar(null);
        CJ.Block.requestCompleteness(this.getBlock());
        this.callParent(args);
    }
});