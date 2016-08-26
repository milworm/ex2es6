Ext.define('CJ.core.view.list.Draggable', {
    mixins: ['Ext.mixin.Observable'],
    config: {
        /**
         * @cfg {Ext.Element} element
         */
        element: null,
        /**
         * @cfg {Ext.Element} target
         */
        target: null,
        /**
         * @cfg {Object} targetPageBox
         */
        targetPageBox: null,
        /**
         * @cfg {Ext.Element} ghost
         */
        ghost: true,
        /**
         * @cfg {String} cls
         */
        cls: `${ Ext.baseCSSPrefix }draggable`,
        /**
         * @cfg {String} draggingCls
         */
        draggingCls: `${ Ext.baseCSSPrefix }dragging`,
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
            delegate: '.d-draghandle',
            scope: this
        };
        this.initConfig(config);
    },
    /**
     * @param {Boolean} config
     * @return {undefined}
     */
    applyGhost(config) {
        if (!config)
            return false;
        const node = document.createElement('div');
        node.className = 'd-tool-ghost';
        return Ext.get(node);
    },
    /**
     * @param {Ext.Element} newElement
     * @param {Ext.Element} oldElement
     * @return {undefined}
     */
    updateGhost(newElement, oldElement) {
        if (oldElement)
            oldElement.destroy();
        if (newElement)
            Ext.getBody().append(newElement);
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
        if (oldDroppable)
            oldDroppable.el.removeCls('d-drop-indicator-top d-drop-indicator-bottom');
        return newDroppable;
    },
    /**
     * @param {Ext.Element} newBlockEl
     * @param {Ext.Element} oldBlockEl
     */
    updateBlockEl(newBlockEl, oldBlockEl) {
        if (oldBlockEl)
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
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    initDragStart(e) {
        const target = Ext.get(e.getTarget('.d-tool'));
        this.setTarget(target);
        this.setTargetPageBox(target.getPageBox());
        this.initGhost();
        this.doScroll();
        this.initDroppables();
        Ext.Viewport.fireEvent('draggable.dragstart');
    },
    initDroppables() {
        const items = this.getElement().select('.d-tool-text'), droppables = [];
        for (let i = 0, item; item = items.elements[i]; i++) {
            item = Ext.get(item);
            droppables.push({
                el: item,
                region: item.getPageBox()
            });
        }
        this.setDroppables(droppables);
    },
    /**
     * @return {undefined}
     */
    initGhost() {
        const region = this.getTargetPageBox(), ghost = this.getGhost();
        this.adjustGhost(region.left, region.top);
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
            const middle = region.top + region.height / 2;
            var position = 'top';
            if (pageY >= region.top && pageY <= region.bottom) {
                if (pageY >= middle)
                    position = 'bottom';
                droppable = item;
                break;
            }
        }
        if (!droppable)
            return;
        this.setLastDroppable(droppable);
        droppable.el.addCls(`d-drop-indicator-${ position }`);
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
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onDragEnd(e) {
        const droppable = this.getLastDroppable(), target = this.getTarget();
        this.setLastDroppable(null);
        if (droppable)
            this.onDrop(droppable);
        this.setTarget(null);
        this.setCurrentEvent(null);
        this.setDroppables(null);
        this.getGhost().hide();
        this.stopScroll();
        Ext.Viewport.fireEvent('draggable.dragend');
        if (!Ext.browser.is.IE10)
            return;    // all browsers remove :active css-class, but IE10 doesn't
                       // https://redmine.iqria.com/issues/8319
        // all browsers remove :active css-class, but IE10 doesn't
        // https://redmine.iqria.com/issues/8319
        const dragHandle = target.dom.querySelector('.d-draghandle');
        dragHandle.parentNode.replaceChild(dragHandle.cloneNode(), dragHandle);
    },
    /**
     * @param {Object} droppable
     */
    onDrop(droppable) {
        const el = droppable.el, target = this.getTarget(), position = el.hasCls('d-drop-indicator-top') ? 'before' : 'after', droppableItem = Ext.getCmp(el.id), draggableItem = Ext.getCmp(target.getId());
        this.fireEvent('drop', droppableItem, draggableItem, position);
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
        this.setGhost(false);
        this.setElement(null);
        this.callParent(args);
    }
});