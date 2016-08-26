Ext.define('CJ.view.course.edit.section.tree.Draggable', {
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
        element: null
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
     * @param {Ext.Element} newTarget
     * @param {Ext.Element} oldTarget
     */
    updateTarget(newTarget, oldTarget) {
        if (newTarget) {
            newTarget.addCls(this.getDraggingCls());
            this.setTargetPageBox(newTarget.getPageBox());
        }
    },
    /**
     * @param {Ext.Evented} e description
     * @return {undefined}
     */
    onDragStart(e) {
        this.initDragStart(e);
        this.fireEvent('dragstart', this, e);
        Ext.Viewport.fireEvent('draggable.dragstart');
    },
    /**
     * initializes ghost-node.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    initDragStart(e) {
        this.setTarget(e.getTarget('.d-item', 10, true));
        const ghost = this.getGhost(), targetPageBox = this.getTargetPageBox();
        this.adjustGhost(targetPageBox.left, targetPageBox.top);
        ghost.setHtml(this.getTarget().dom.innerHTML);
        ghost.show();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onDrag(e) {
        if (!e && this.lastDragEvt)
            e = this.lastDragEvt;
        const coords = this.getPageXY(e), pageX = coords.pageX, pageY = coords.pageY;
        this.lastCoords = null;
        this.fireAction('drag', [
            this,
            e,
            pageX,
            pageY
        ], this.doDrag);
    },
    /**
     * @param {CJ.view.course.edit.section.tree.Draggable} draggable
     * @param {Ext.Evented} e
     * @param {Number} pageX
     * @param {Number} pageY
     */
    doDrag(draggable, e, pageX, pageY) {
        this.adjustGhost(pageX, pageY);
    },
    /**
     * @param {Number} x
     * @param {Number} y
     */
    adjustGhost(x, y) {
        const ghost = this.getGhost();
        ghost.setLeft(x - 10);
        ghost.setTop(y - 20);
    },
    /**
     * hides a ghost-node and shows an original target node.
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onDragEnd(e) {
        delete this.droppable;
        this.fireEvent('dragend', this, e);
        Ext.Viewport.fireEvent('draggable.dragend');
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setElement(null);
        this.callParent(args);
    }
});