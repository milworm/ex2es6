import 'Ext/util/Region';

/**
 * Custom implementation of Ext.util.Droppable
 * ported from ST2 v1.1.1
 * 
 * Important!!! This is not official. This util is experimental only!
 * Look for next official release of Sencha and do not forget - api can be changed
 */
Ext.define('Ux.util.Droppable', {
    mixins: { observable: 'Ext.mixin.Observable' },
    /**
     * @event dropactivate
     * @param {Ext.ux.util.Droppable} this
     * @param {Ext.util.Draggable} draggable
     * @param {Ext.event.Event} e
     */
    /**
     * @event dropdeactivate
     * @param {Ext.ux.util.Droppable} this
     * @param {Ext.util.Draggable} draggable
     * @param {Ext.event.Event} e
     */
    /**
     * @event dropenter
     * @param {Ext.ux.util.Droppable} this
     * @param {Ext.util.Draggable} draggable
     * @param {Ext.event.Event} e
     */
    /**
     * @event dropleave
     * @param {Ext.ux.util.Droppable} this
     * @param {Ext.util.Draggable} draggable
     * @param {Ext.event.Event} e
     */
    /**
     * @event drop
     * @param {Ext.ux.util.Droppable} this
     * @param {Ext.util.Draggable} draggable
     * @param {Ext.event.Event} e
     */
    config: {
        baseCls: `${ Ext.baseCSSPrefix }droppable`,
        activeCls: `${ Ext.baseCSSPrefix }drop-active`,
        invalidCls: `${ Ext.baseCSSPrefix }drop-invalid`,
        hoverCls: `${ Ext.baseCSSPrefix }drop-hover`,
        dropRegion: 'mouse',
        //'element'
        element: null,
        cmp: null
    },
    /**
     * @cfg {String} validDropMode
     * Valid values are: 'intersects' or 'contains'
     */
    validDropMode: 'contains',
    /**
     * @cfg {Boolean} disabled
     */
    disabled: false,
    /**
     * @cfg {String} dragGroup
     * Draggable and Droppable objects can participate in a group which are
     * capable of interacting.
     */
    dragGroup: 'base',
    // not yet implemented
    tolerance: null,
    // @private
    monitoring: false,
    /**
     * Creates new Droppable
     * @param {Object} config Configuration options for this class.
     */
    constructor(config) {
        const me = this;
        let element;
        me.initialConfig = config;
        if (config && config.element) {
            element = config.element;
            delete config.element;
            this.setElement(element);
        }
        if (config.dragGroup)
            this.dragGroup = config.dragGroup;
        if (!config.disabled)
            me.enable();
        return me;
    },
    updateBaseCls(cls) {
        const me = this;
        Ext.TaskQueue.requestWrite(() => {
            const el = me.getElement();
            if (!el.isDestroyed)
                el.addCls(cls);
        });
    },
    applyDropRegion(mode) {
        switch (mode) {
        case 'mouse':
            return 'mouse';
        case 'element':
            return 'element';
        default:
            return 'mouse';
        }
    },
    applyElement(element) {
        if (!element)
            return;
        return Ext.get(element);
    },
    updateElement(element) {
        element.on(this.listeners);
        this.initConfig(this.initialConfig);
    },
    updateCls(cls) {
        this.getElement().addCls(cls);
    },
    // @private
    onDragStart(draggable, e) {
        const me = this, el = me.getElement(), cmp = Ext.getCmp(el.id);
        if (draggable.config.dragGroup == me.dragGroup) {
            me.monitoring = true;
            me.region = el.getPageBox(true);
            draggable.on({
                drag: me.onDrag,
                dragend: me.onDragEnd,
                scope: me
            });
            if (me.isDragOver(draggable)) {
                me.setCanDrop(true, draggable, e);
            }
            if (cmp && cmp.droppableOnDropActivate)
                cmp.droppableOnDropActivate(me, draggable, e);
            me.fireEvent('dropactivate', me, draggable, e);
        }
    },
    // @private
    isDragOver(draggable, e) {
        let dRegion;
        if (this.getDropRegion() == 'element')
            dRegion = draggable.getElement().getPageBox(true);
        if (this.getDropRegion() == 'mouse') {
            if (!e)
                return false;
            let sizes = [
                e.pageX,
                e.pageY
            ];    //In some cases on IOS getXY return 0,0
                  //when touch.pageX and touch.pageY are correct
            //In some cases on IOS getXY return 0,0
            //when touch.pageX and touch.pageY are correct
            if (sizes[0] == 0 && sizes[1] == 0 && Ext.os.is.iOS) {
                //get a second opinion
                sizes = [
                    e.touch.pageX,
                    e.touch.pageY
                ];
            }
            dRegion = {
                bottom: sizes[1] + 5,
                top: sizes[1],
                left: sizes[0],
                right: sizes[0] + 5
            };
        }
        return this.region[this.validDropMode](dRegion);
    },
    // @private
    onDrag(draggable, e) {
        const el = this.getElement(), cmp = Ext.getCmp(el.id);
        this.region = el.getPageBox(true);
        this.setCanDrop(this.isDragOver(draggable, e), draggable, e);
        if (cmp && cmp.droppableOnDropDrag)
            cmp.droppableOnDropDrag(this, draggable, e);
        this.fireEvent('dropdrag', this, draggable, e);
    },
    // @private
    setCanDrop(canDrop, draggable, e) {
        if (canDrop && !this.canDrop) {
            this.canDrop = true;
            this.fireEvent('dropenter', this, draggable, e);
        } else if (!canDrop && this.canDrop) {
            this.canDrop = false;
            this.fireEvent('dropleave', this, draggable, e);
        }
    },
    // @private
    onDragEnd(draggable, e) {
        this.monitoring = false;
        const cmp = Ext.getCmp(this.getElement().id);
        draggable.un({
            drag: this.onDrag,
            dragend: this.onDragEnd,
            scope: this
        });
        if (this.canDrop) {
            this.canDrop = false;
            if (cmp && cmp.droppableOnDrop)
                cmp.droppableOnDrop(this, draggable, e);
            this.fireEvent('drop', this, draggable, e);
        }
        if (cmp && cmp.droppableOnDropDeactivate)
            cmp.droppableOnDropDeactivate(this, draggable, e);
        this.fireEvent('dropdeactivate', this, draggable, e);
    },
    /**
     * Enable the Droppable target.
     * This is invoked immediately after constructing a Droppable if the
     * disabled parameter is NOT set to true.
     */
    enable() {
        //CJ.app.fireEvent("droppable.enable", this);
        const me = this, ownDragGroup = me.config.dragGroup, ownDragGroupId = me.config.dragGroupId;
        me.draggables = [];
        const publs = me.getEventDispatcher().activePublishers, elems = publs.element;
        for (const y in elems) {
            const elemItem = elems[y], subscribers = elemItem.subscribers['dragstart'];
            if (subscribers && subscribers.id) {
                const draggs = subscribers.id;
                for (const x in draggs) {
                    if (x != '$length') {
                        const cmp = Ext.getCmp(x);
                        if (!cmp || !cmp.config.draggable || !cmp.config.dragGroup) {
                            continue;
                        }
                        const cmpConf = cmp.config;
                        const dragGroup = cmpConf.dragGroup || cmpConf.draggable.dragGroup, dragGroupId = cmpConf.dragGroupId || cmpConf.draggable.dragGroupId, draggable = cmp.getDraggableBehavior().draggable;
                        if (draggable && ownDragGroup == dragGroup && ownDragGroupId == dragGroupId) {
                            draggable.on('dragstart', me.onDragStart, me);
                            if (draggable.isDragging)
                                me.onDragStart(draggable, draggable.lastDragEvt);
                            me.draggables.push(draggable);
                        }
                    }
                }
            }
        }
        this.disabled = false;
        CJ.app.on('draggableenabled', this.onDraggableEnabled, this);
    },
    /**
     * processes situation when new draggable will be enabled, in case when 
     * dragGroup and dragGroupId are the same adds required handler (so each 
     * droppable/me will be perform a check to know that draggable is over the
     * droppable/me or not.
     * @param {Ext.Class} draggable
     */
    onDraggableEnabled(draggable) {
        const dropGroup = this.config.dragGroup, dropGroupId = this.config.dragGroupId, initialConfig = draggable.initialConfig, dragGroup = initialConfig.dragGroup, dragGroupId = initialConfig.dragGroupId;
        if (dropGroup != dragGroup || dropGroupId != dragGroupId)
            return;
        draggable.on('dragstart', this.onDragStart, this);
        this.on('disabled', function () {
            draggable.un('dragstart', this.onDragStart, this);
        });
    },
    onDraggableEnabled(draggable) {
        const me = this;
        if (draggable.initialConfig.dragGroup == me.config.dragGroup) {
            if (draggable.initialConfig.dragGroupId == me.config.dragGroupId) {
                draggable.on({
                    scope: me,
                    dragstart: me.onDragStart
                });
                me.draggables.push(draggable);
            }
        }
    },
    /**
     * Destroy the Droppable
     */
    destroy() {
        this.disable();
        this.callParent(args);
    },
    /**
     * Disable the Droppable
     */
    disable() {
        this.disabled = true;
        CJ.app.un('draggableenabled', this.onDraggableEnabled, this);
        if (!this.draggables.length)
            return;
        for (let i = 0, item; item = this.draggables[i]; i++)
            item.un('dragstart', this.onDragStart, this);
    },
    /**
     * Method to determine whether this Component is currently disabled.
     * @return {Boolean} the disabled state of this Component.
     */
    isDisabled() {
        return this.disabled;
    },
    /**
     * Method to determine whether this Droppable is currently monitoring drag operations of Draggables.
     * @return {Boolean} the monitoring state of this Droppable
     */
    isMonitoring() {
        return this.monitoring;
    },
    getGroup() {
        return this.group;
    },
    getGroupId() {
        return 'id';
    }
});