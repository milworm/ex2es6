Ext.define('CJ.view.course.edit.section.list.Draggable', {
    mixins: ['Ext.mixin.Observable'],
    config: {
        /**
         * @cfg {Ext.Element} ghost
         */
        ghost: null,
        /**
         * @cfg {Object} targetPageBox
         */
        targetPageBox: null,
        /**
         * @cfg {Ext.Element} target
         */
        target: null,
        /**
         * @cfg {String} cls
         */
        cls: `${ Ext.baseCSSPrefix }draggable`,
        /**
         * @cfg {String} draggingCls
         */
        draggingCls: `${ Ext.baseCSSPrefix }dragging`,
        /**
         * @cfg {Ext.Element} element
         */
        element: null,
        /**
         * @cfg {Object} blockConfig
         */
        blockConfig: null,
        /**
         * @cfg {Ext.Element} blockEl
         */
        blockEl: null,
        /**
         * @cfg {Array} droppables
         */
        droppables: null,
        /**
         * @cfg {Object} lastDroppable
         */
        lastDroppable: null,
        /**
         * @cfg {Ext.Component} component
         */
        component: null,
        /**
         * @cfg {Object} currentEvent
         */
        currentEvent: null
    },
    /**
     * Creates new Draggable.
     * @param {Object} config The configuration object for this Draggable.
     */
    constructor(config) {
        this.callParent(args);
        this.listeners = {
            dragstart: 'onDragStart',
            drag: 'onDrag',
            dragend: 'onDragEnd',
            delegate: Ext.os.is.Tablet ? '.d-block-content' : '.d-dnd-overlay',
            scope: this
        };
        this.initConfig(config);
    },
    /**
     * @param {Ext.EventObject} e
     * @return {Object} return.pageX,
     *                  return.pageY
     */
    getPageXY(e) {
        const touches = e.event.touches;
        let pageX;
        let pageY;
        if (touches && touches.length > 0) {
            const touchEvent = touches[0];
            pageX = touchEvent.pageX;
            pageY = touchEvent.pageY;
        } else {
            pageX = e.event.pageX;
            pageY = e.event.pageY;
        }
        return {
            pageX,
            pageY
        };
    },
    /**
     * @param {Ext.Element} newElement
     * @param {Ext.Element} oldElement
     */
    updateElement(newElement, oldElement) {
        if (newElement) {
            newElement.on(this.listeners);
            newElement.addCls(this.getCls());
        }
        if (oldElement)
            oldElement.un(this.listeners);
    },
    /**
     * @param {Object} newDroppable
     * @param {Object} oldDroppable
     */
    applyLastDroppable(newDroppable, oldDroppable) {
        if (oldDroppable && !oldDroppable.el.isDestroyed)
            // oldDroppable could be destroyed, so #el will be undefined.
            oldDroppable.el.removeCls('d-drop-indicator-left d-drop-indicator-right');
        return newDroppable;
    },
    /**
     * @param {Ext.Element} newBlockEl
     * @param {Ext.Element} oldBlockEl
     */
    updateBlockEl(newBlockEl, oldBlockEl) {
        if (oldBlockEl && !oldBlockEl.isDestroyed)
            oldBlockEl.removeCls(this.getDraggingCls());
        if (newBlockEl)
            newBlockEl.addCls(this.getDraggingCls());
    },
    /**
     * @param {Ext.Evented} e description
     * @return {undefined}
     */
    onDragStart(e) {
        this.setCurrentEvent(e);
        this.initDragStart(e);
        this.fireEvent('dragstart', this, e);
    },
    /**
     * initializes ghost-node.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    initDragStart(e) {
        const target = Ext.get(e.getTarget());
        this.setTarget(target);
        this.setTargetPageBox(target.getPageBox());
        this.setBlockEl(target.up('.d-block'));
        this.setBlockConfig(Ext.getCmp(this.getBlockEl().id).initialConfig);
        this.initGhost();
        this.doScroll();    // this.initDroppables();
        // this.initDroppables();
        Ext.Viewport.fireEvent('draggable.dragstart');
    },
    initDroppables() {
        const blocks = this.getElement().select('.d-section-block, .d-block-creator'), items = [];
        for (let i = 0, item; item = blocks.elements[i]; i++) {
            item = Ext.get(item);
            items.push({
                el: item,
                region: item.getPageBox()
            });
        }
        this.setDroppables(items);
    },
    /**
     * @return {undefined}
     */
    initGhost() {
        const region = this.getTargetPageBox(), ghost = this.getGhost(), blockHeader = this.getBlockEl().dom.querySelector('.d-header');
        this.adjustGhost(region.left, region.top);
        ghost.dom.querySelector('.d-header').innerHTML = blockHeader.innerHTML;
        ghost.show();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onDrag(e) {
        this.setCurrentEvent(e);
        const coords = this.getPageXY(e), pageX = coords.pageX, pageY = coords.pageY;
        this.adjustGhost(pageX, pageY);
        this.initDroppables();
        const droppables = this.getDroppables();
        let droppable;
        for (let i = 0, item; item = droppables[i]; i++) {
            const region = item.region;
            const middle = region.left + region.width / 2;
            var side = 'left';
            if (pageY >= region.top && pageY <= region.bottom && pageX >= region.left && pageX <= region.right) {
                if (pageX >= middle)
                    side = 'right';
                droppable = item;
                break;
            }
        }
        if (!droppable)
            return;
        this.setLastDroppable(droppable);    // we can't drop block after block-creator.
        // we can't drop block after block-creator.
        if (droppable.el.hasCls('d-block-creator'))
            side = 'left';
        droppable.el.addCls(`d-drop-indicator-${ side }`);
    },
    /**
     * @param {Number} x
     * @param {Number} y
     */
    adjustGhost(x, y) {
        const ghost = this.getGhost();
        ghost.setLeft(x);
        ghost.setTop(y);
    },
    /**
     * hides a ghost-node and shows an original target node.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onDragEnd(e) {
        this.setCurrentEvent(null);
        const droppable = this.getLastDroppable();
        if (droppable)
            this.onDrop(droppable);
        this.setBlockEl(null);
        this.setBlockConfig(null);
        this.setLastDroppable(null);
        this.setDroppables(null);
        this.setTarget(null);
        this.getGhost().hide();
        this.stopScroll();
        Ext.Viewport.fireEvent('draggable.dragend');
    },
    /**
     * @param {Object} droppable
     */
    onDrop(droppable) {
        const el = droppable.el;
        let blockEl = this.getBlockEl();
        const position = el.hasCls('d-drop-indicator-right') ? 'after' : 'before';
        const droppableBlock = Ext.getCmp(el.id);
        let draggableBlock = Ext.getCmp(blockEl.id);
        if (!draggableBlock) {
            draggableBlock = Ext.factory(this.getBlockConfig());
            draggableBlock.sectionId = draggableBlock.initialConfig.sectionId;
            blockEl = draggableBlock.element;
        } else {
            draggableBlock.sectionId = Ext.getCmp(draggableBlock.element.up('.d-section').id).getDocId();
        }
        droppableBlock.sectionId = Ext.getCmp(droppableBlock.element.up('.d-section').id).getDocId();
        blockEl[position == 'after' ? 'insertAfter' : 'insertBefore'](el);
        this.fireEvent('drop', droppableBlock, draggableBlock, position);
    },
    /**
     * scrolls the list during dragging the element
     *
     * @return {undefined}
     */
    doScroll() {
        const component = this.getComponent();
        const event = this.getCurrentEvent();
        const screenCenter = Ext.getBody().getHeight() / 2;
        const centerDiff = event.touch.pageY - screenCenter;
        const ratio = centerDiff * 75 / screenCenter;
        let pixels = ratio / 5;
        const scrollY = component.getScrollTop();
        const maxScrollY = component.getMaxScrollTop();
        if (pixels > 5 || pixels < -5) {
            if (scrollY + pixels < 0)
                pixels = -scrollY;
            if (pixels + scrollY > maxScrollY)
                pixels = maxScrollY - scrollY;
            component.scrollTop(pixels, true);
        }
        this.scrollRafId = requestAnimationFrame(Ext.bind(function () {
            this.doScroll();
        }, this));
    },
    /**
     * @return {undefined}
     */
    stopScroll() {
        cancelAnimationFrame(this.scrollRafId);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setElement(null);
        this.callParent(args);
    }
});