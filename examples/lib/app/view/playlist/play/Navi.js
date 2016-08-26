import 'Ext/Container';

/**
 * The class provides component
 * that give ability navigate between playlist items.
 */
Ext.define('CJ.view.playlist.play.Navi', {
    extend: 'Ext.Container',
    xtype: 'view-playlist-play-navi',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-playlist-play-navi',
        /**
         * @inheritdoc
         */
        tpl: [
            '<div class="x-button prev {[this.getPrevButtonCls(values)]}">',
            '<span class="x-button-icon"></span>',
            '<span class="x-button-label">{activeItemIndex}</span>',
            '</div>',
            '<div class="x-button next {[this.getNextButtonCls(values)]}">',
            '<span class="x-button-icon"></span>',
            '<span class="x-button-label">{activeItemIndex + 2}</span>',
            '</div>',
            {
                getPrevButtonCls(values) {
                    if (values.activeItemIndex == 0) {
                        return 'disabled';
                    }
                },
                getNextButtonCls(values) {
                    const activeItemIndex = values.activeItemIndex, lastItemIndex = values.total - 1;
                    if (activeItemIndex == lastItemIndex) {
                        return 'finish';
                    }
                    if (activeItemIndex > lastItemIndex) {
                        return 'disabled';
                    }
                }
            }
        ],
        /**
         * @config {CJ.view.playlist.Block}
         */
        block: null,
        /**
         * @config {Number} activeItemIndex
         * Index of the active item.
         */
        activeItemIndex: 0,
        /**
         * @config {Number} duration
         * Time of the playlist item sliding in milliseconds.
         */
        duration: 500
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        this.setData({
            activeItemIndex: this.getActiveItemIndex(),
            total: this.getBlock().getLength()
        });
        const innerHtmlElement = this.getInnerHtmlElement();
        innerHtmlElement.on({
            tap: this.prev,
            delegate: '.prev',
            scope: this
        });
        innerHtmlElement.on({
            tap: this.next,
            delegate: '.next',
            scope: this
        });
        Ext.getBody().on({
            keydown: this.onKeyDown,
            scope: this
        });
    },
    onKeyDown(e) {
        if (e.event.keyCode == 37)
            this.prev();
        if (e.event.keyCode == 39)
            this.next();
    },
    /**
     * Applies and sets active item index.
     * @param {Number} index
     */
    setNaviActiveItem(index) {
        this.disable();
        this.setData({
            activeItemIndex: index,
            total: this.getBlock().getLength()
        });
        Ext.defer(this.enable, this.getDuration(), this);
        this.setActiveItemIndex(index);
    },
    prev() {
        const buttonEl = this.element.down('.x-button.prev');
        if (!(this.getDisabled() || buttonEl.hasCls('disabled'))) {
            this.fireEvent('tap', this.getActiveItemIndex() - 1);
        }
    },
    next() {
        const buttonEl = this.element.down('.x-button.next');
        if (!(this.getDisabled() || buttonEl.hasCls('disabled'))) {
            this.fireEvent('tap', this.getActiveItemIndex() + 1);
        }
    }
});