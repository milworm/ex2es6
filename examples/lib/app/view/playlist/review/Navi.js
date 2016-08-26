import 'Ext/Container';
import 'app/view/playlist/review/Draggable';

/**
 * The class provides component
 * that give ability navigate between playlist items and reorder them.
 */
Ext.define('CJ.view.playlist.review.Navi', {
    extend: 'Ext.Container',
    xtype: 'view-playlist-review-navi',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-playlist-review-navi',
        /**
         * @inheritdoc
         */
        tpl: [
            '<ul>',
            '<li class="drop-helper before"></li>',
            '<tpl for="items">',
            '<li class="navi-item {[this.getCls(xindex, parent)]}"><span>{[xindex]}</span></li>',
            '</tpl>',
            '<li class="add-button"></li>',
            '<li class="drop-helper after"></li>',
            '</ul>',
            '<div class="ghost"></div>',
            '<tpl if="!this.isAware()">',
            '<div class="explaining">',
            '<span class="close"></span>',
            '<div class="text">',
            '{[CJ.t(values.explainingText)]}',
            '</div>',
            '</div> ',
            '</tpl>',
            {
                getCls(xindex, parent) {
                    if (xindex - 1 == parent.activeItemIndex) {
                        return 'active';
                    }
                },
                isAware() {
                    return CJ.LocalStorage.getItem('playlistReorderAware');
                }
            }
        ],
        /**
         * @config {CJ.view.playlist.Block} block
         */
        block: null,
        /**
         * @config {Number} activeItemIndex
         * Index of active item.
         */
        activeItemIndex: 0,
        /**
         * @config {String} explainingText
         */
        explainingText: 'playlist-review-navi-explaining-text',
        /**
         * @config {String} mouseWheelEventName
         * Name of mousewheel event.
         */
        mouseWheelEventName: 'mousewheel',
        /**
         * @config {Function} mouseWheelHandler
         * Callback function of mousewheel event.
         */
        mouseWheelHandler: Ext.emptyFn,
        /**
         * @config {Boolean} isScrollEventsBinded
         * Binding state on events that makes scrolling.
         */
        isScrollEventsBinded: false,
        /**
         * @config {Boolean} isDragScrollingLocked
         */
        isDragScrollingLocked: false,
        /**
         * @config {Number} scrollOffset
         */
        scrollOffset: null,
        /**
         * @config {Number} touchStartX
         */
        touchStartX: null,
        /**
         * @config {Boolean} isTouchDragLocked
         */
        isTouchDragLocked: false,
        /**
         * @config {Boolean} isTouchProcessed
         */
        isTouchProcessed: false,
        /**
         * @config {Ext.event.Event} pendingTapEvent
         */
        pendingTapEvent: null,
        /**
         * @config {Ext.util.Translatable} translator
         */
        translator: {},
        listElement: null,
        ghostElement: null,
        draggables: null,
        droppables: null,
        tapListeners: {
            'li': 'onNaviItemTap',
            '.explaining .close': 'onExplainingClose'
        }
    },
    initialize() {
        this.callParent(args);
        this.setData({
            items: this.getBlock().getPlaylist(),
            activeItemIndex: this.getActiveItemIndex()
        });
    },
    destroy() {
        this.callParent(args);
        this.setListElement(null);
        this.getGhostElement(null);
        this.setTranslator(null);
        this.setDraggables(null);
        this.setDroppables(null);
    },
    applyData(data) {
        Ext.applyIf(data, { explainingText: this.getExplainingText() });
        return data;
    },
    updateData() {
        this.callParent(args);
        const el = this.element, listElement = el.down('ul'), ghostElement = el.down('.ghost');
        this.setListElement(listElement);
        this.setGhostElement(ghostElement);
        this.getTranslator().setElement(listElement);
        this.initDND();
        this.applyAlignment();
    },
    initDND() {
        const el = this.element, droppablesEl = el.query('li.navi-item, li.drop-helper'), droppables = [];
        Ext.each(droppablesEl, function (el) {
            droppables.push(Ext.create(Ux.util.Droppable, {
                element: el,
                dragGroup: 'playlistNavi',
                listeners: {
                    dropenter: this.onDropEnter,
                    dropleave: this.onDropLeave,
                    drop: this.onDrop,
                    scope: this
                }
            }));
        }, this);
        this.setDroppables(droppables);
        this.setDraggables(Ext.create(CJ.view.playlist.review.Draggable, {
            element: this.getListElement(),
            ghost: this.getGhostElement(),
            dragGroup: 'playlistNavi',
            constraint: false,
            revert: true,
            listeners: {
                dragstart: this.onDragStart,
                dragend: this.onDragEnd,
                scope: this
            }
        }));
    },
    updateDraggables(draggables, current) {
        if (current)
            current.destroy();
    },
    updateDroppables(droppables, currents) {
        Ext.each(currents, droppable => {
            droppable.destroy();
            droppable.getElement().destroy();
        });
    },
    updateListElement(listElement, current) {
        if (current)
            current.destroy();
    },
    updateGhostElement(ghostElement, current) {
        if (current)
            current.destroy();
    },
    applyExplainingText(text) {
        if (text) {
            if (CJ.LocalStorage.getItem('playlistReorderAware'))
                return text;
            this.addCls('explain-shown');
        }
        return text;
    },
    applyMouseWheelEventName(eventName) {
        if (Ext.browser.is.Firefox)
            eventName = 'DOMMouseScroll';
        return eventName;
    },
    applyMouseWheelHandler(config) {
        if (!config)
            return false;
        return Ext.bind(this.onMouseWheel, this);
    },
    onMouseWheel(e) {
        const delta = Ext.browser.is.Firefox ? e.detail * -1 : e.wheelDelta, direction = delta > 0 ? 1 : -1;
        this.doScroll(direction);
    },
    applyTranslator(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        return Ext.factory(config, Ext.util.Translatable);
    },
    updateTranslator(translator, current) {
        if (current) {
            current.destroy();
        }
    },
    applyAlignment() {
        const innerHtmlEl = this.getInnerHtmlElement(), listEl = this.getListElement();
        if (this.isAdjustmentNeeded()) {
            this.adjustActiveItem();
            this.bindScrollEvents();
            listEl.addCls('transition');
            innerHtmlEl.replaceCls('align-center', 'align-start');
        } else {
            this.unBindScrollEvents();
            listEl.removeCls('transition');
            innerHtmlEl.replaceCls('align-start', 'align-center');
        }
    },
    isAdjustmentNeeded() {
        const innerHtmlEl = this.getInnerHtmlElement(), listEl = this.getListElement();
        return listEl.getWidth() > innerHtmlEl.getWidth();
    },
    bindScrollEvents() {
        if (this.getIsScrollEventsBinded())
            return;
        const innerHtmlEl = this.getInnerHtmlElement(), mouseWheelEventName = this.getMouseWheelEventName(), mouseWheelEventHandler = this.getMouseWheelHandler();
        innerHtmlEl.dom.addEventListener(mouseWheelEventName, mouseWheelEventHandler);
        innerHtmlEl.on({
            touchstart: this.onTouchStart,
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            scope: this
        });
        this.setIsScrollEventsBinded(true);
    },
    unBindScrollEvents() {
        if (!this.getIsScrollEventsBinded())
            return;
        const innerHtmlEl = this.getInnerHtmlElement(), mouseWheelEventName = this.getMouseWheelEventName(), mouseWheelEventHandler = this.getMouseWheelHandler();
        innerHtmlEl.dom.removeEventListener(mouseWheelEventName, mouseWheelEventHandler);
        innerHtmlEl.un({
            touchstart: this.onTouchStart,
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            scope: this
        });
        this.setIsScrollEventsBinded(false);
    },
    onTouchStart(e) {
        let pageX;
        if (e.touches && e.touches[0])
            pageX = e.touches[0].pageX;
        this.setTouchStartX(pageX);
        this.setIsTouchDragLocked(true);
        Ext.defer(function () {
            if (!this.getIsTouchProcessed()) {
                const pendingTapEvent = this.getPendingTapEvent();
                this.setIsTouchDragLocked(false);
                if (pendingTapEvent)
                    this.onNaviItemTap(pendingTapEvent);
            }
            this.setPendingTapEvent(null);
        }, 100, this);
    },
    onTouchMove(e) {
        const isTouchDragLocked = this.getIsTouchDragLocked();
        if (this.getIsTouchProcessed()) {
            if (isTouchDragLocked)
                return e.stopPropagation();
            return;
        }
        if (isTouchDragLocked) {
            e.stopPropagation();
            if (e.touches && e.touches[0]) {
                const pageX = e.touches[0].pageX, deltaX = this.getTouchStartX() - pageX, direction = deltaX > 0 ? -1 : 1;
                this.doScroll(direction, 200, true);
            }
        }
        this.setIsTouchProcessed(true);
    },
    onTouchEnd() {
        Ext.defer(function () {
            this.setIsTouchDragLocked(false);
            this.setIsTouchProcessed(false);
        }, 100, this);
    },
    onDragStart(draggable) {
        const draggableEl = draggable.getTarget(), dragEvents = {
                drag: this.onDragDrag,
                scope: this
            };
        if (this.getIsTouchDragLocked()) {
            return false;
        }
        if (this.isAdjustmentNeeded())
            draggable.on(dragEvents);
        else
            draggable.un(dragEvents);
        this.addCls(draggableEl.hasCls('add-button') ? 'button-dragging' : 'item-dragging');
        Ext.Viewport.fireEvent('draggable.dragstart');
    },
    onDragDrag(draggable, e, pageX) {
        const innerHtmlElWidth = this.innerElement.getWidth();
        if (this.getIsDragScrollingLocked())
            return;
        if (pageX < innerHtmlElWidth * 0.25) {
            this.startDragScrolling(draggable, 1);
        } else if (pageX > innerHtmlElWidth * 0.75) {
            this.startDragScrolling(draggable, -1);
        } else {
            this.stopDragScrolling(draggable);
        }
    },
    onDragEnd(draggable) {
        draggable.qwerty = false;
        if (draggable.scrollingInterval)
            this.stopDragScrolling(draggable);
        this.removeCls([
            'button-dragging',
            'item-dragging'
        ]);
        Ext.Viewport.fireEvent('draggable.dragend');
    },
    startDragScrolling(draggable, direction) {
        this.stopDragScrolling(draggable);
        this.getListElement().removeCls('transition');
        draggable.scrollingInterval = setInterval(Ext.bind(this.doScroll, this, [
            direction,
            5,
            true
        ]), 25);
    },
    stopDragScrolling(draggable) {
        draggable.scrollingInterval = clearInterval(draggable.scrollingInterval);
        this.getListElement().addCls('transition');
    },
    lockDragScrolling(draggable) {
        if (draggable && draggable.scrollingInterval)
            this.stopDragScrolling(draggable);
        this.setIsDragScrollingLocked(true);
    },
    unlockDragScrolling() {
        this.setIsDragScrollingLocked(false);
    },
    /**
     * Handler of the event 'dropenter' of the droppable component.
     * @param {Ux.util.Droppable} droppable
     * @param {CJ.view.playlist.review.Draggable} draggable
     */
    onDropEnter(droppable, draggable) {
        const droppableEl = droppable.getElement(), draggableEl = draggable.getTarget();
        if (droppableEl != draggableEl) {
            draggable.on('drag', this.onDragInDroppable, this);
            draggable.relatedDroppable = droppable;
            droppableEl.addCls('x-drop-hover');
            draggableEl.addCls('x-drop-active');
        }
    },
    onDragInDroppable(draggable) {
        const relatedDroppable = draggable.relatedDroppable;
        if (!relatedDroppable)
            return;
        this.lockDragScrolling(draggable);
        const droppableEl = relatedDroppable.getElement();
        if (droppableEl.hasCls('drop-helper'))
            return;
        const droppableX = droppableEl.getX(), droppableWidth = droppableEl.getWidth(), offset = draggable.getGhost().getLeft() - droppableX, directionCls = offset < droppableWidth / 2 ? 'before' : 'after';
        droppableEl.replaceCls([
            'before',
            'after'
        ], directionCls);
    },
    /**
     * Handler of the event 'dropleave' of the droppable component.
     * @param {Ux.util.Droppable} droppable
     * @param {CJ.view.playlist.review.Draggable} draggable
     */
    onDropLeave(droppable, draggable) {
        droppable.getElement().removeCls(['x-drop-hover']);
        draggable.getTarget().removeCls('x-drop-active');
        this.unlockDragScrolling(draggable);
        if (droppable == draggable.relatedDroppable) {
            draggable.un('drag', this.onDragInDroppable, this);
            draggable.relatedDroppable = null;
        }
    },
    /**
     * Handler of the event 'dropleave' of the droppable component.
     * Fires the event 'moveitem' with indexes of the from to position.
     * @param {Ux.util.Droppable} droppable
     * @param {Ext.util.Draggable} draggable
     */
    onDrop(droppable, draggable) {
        const naviItems = this.element.query('li.navi-item');
        const draggableEl = draggable.getTarget();
        const droppableEl = droppable.getElement();
        const draggableIndex = naviItems.indexOf(draggableEl.dom);
        const droppableIndex = naviItems.indexOf(droppableEl.dom);
        let destIndex = droppableIndex;
        if (droppableEl.id == draggableEl.id)
            return;
        draggableEl.removeCls('x-drop-active');
        droppableEl.removeCls('x-drop-hover');
        if (droppableEl.hasCls('drop-helper')) {
            const isBefore = droppableEl.hasCls('before');
            if (draggableEl.hasCls('add-button'))
                return this.fireEvent('add', isBefore ? 0 : false);
            destIndex = isBefore ? 0 : naviItems.length - 1;
            if (draggableIndex == destIndex)
                return;
            return this.fireEvent('moveitem', draggableIndex, destIndex);
        }
        if (draggableEl.hasCls('add-button')) {
            if (droppableEl.hasCls('after'))
                ++destIndex;
            if (destIndex == naviItems.length)
                destIndex = false;
            return this.fireEvent('add', destIndex);
        }
        if (droppableEl.hasCls('after') && draggableIndex > destIndex)
            ++destIndex;
        if (droppableEl.hasCls('before') && draggableIndex < destIndex)
            --destIndex;
        if (draggableIndex != destIndex) {
            this.fireEvent('moveitem', draggableIndex, destIndex);
        }
    },
    /**
     * Handler of the event 'tap' of the navi item.
     * @param {Ext.event.Event} e
     */
    onNaviItemTap(e) {
        if (this.getIsTouchDragLocked())
            return this.setPendingTapEvent(e);
        const target = e.getTarget('li'), classList = target.classList;
        if (classList.contains('add-button')) {
            return this.fireEvent('add', false);
        }
        if (classList.contains('navi-item')) {
            const naviItems = this.element.query('li.navi-item'), index = naviItems.indexOf(target);
            this.fireEvent('tap', index);
        }
    },
    onExplainingClose(e) {
        const explainingEl = e.getTarget('.explaining');
        explainingEl.parentNode.removeChild(explainingEl);
        this.removeCls('explain-shown');
        CJ.LocalStorage.setItem('playlistReorderAware', true);
    },
    /**
     * Applies and sets active item index.
     * @param {Number} index
     */
    setNaviActiveItem(index) {
        const naviItems = this.element.query('li.navi-item'), activeItemIndex = this.getActiveItemIndex(), currActiveEl = naviItems[activeItemIndex], destActiveEl = naviItems[index];
        if (currActiveEl)
            currActiveEl.classList.remove('active');
        if (destActiveEl)
            destActiveEl.classList.add('active');
        this.setActiveItemIndex(index);
        this.adjustActiveItem(index);
    },
    adjustActiveItem(index) {
        if (!this.isAdjustmentNeeded())
            return;
        index = Ext.isNumber(index) ? index : this.getActiveItemIndex();
        const innerHtmlEl = this.getInnerHtmlElement(), listEl = this.getListElement(), selector = CJ.tpl(':nth-child({0})', index + 2), item = listEl.child(selector), itemBox = item.getBox(), listOffset = innerHtmlEl.getWidth() / 2 + listEl.getX() - itemBox.x - itemBox.width / 2;
        this.getTranslator().translate(listOffset);
    },
    doScroll: function fn(direction, step, skipGrow) {
        const innerHtmlElWidth = this.getInnerHtmlElement().getWidth();
        const offset = this.getListElement().getX();
        const step = (step || 100) * direction;
        let newOffset = offset + step;
        const maxOffset = innerHtmlElWidth / 2 - 22;
        const minOffset = innerHtmlElWidth / 2 + 22 - list.getWidth();
        const lastOffset = this.getScrollOffset();
        if (!skipGrow && Ext.isNumber(lastOffset) && lastOffset != offset)
            newOffset = lastOffset + step;
        if (newOffset > maxOffset)
            newOffset = maxOffset;
        if (newOffset < minOffset)
            newOffset = minOffset;
        this.getTranslator().translate(newOffset);
        this.setScrollOffset(newOffset);
    }
});