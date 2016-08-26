Ext.define('Ux.util.Draggable', {
    override: 'Ext.util.Draggable',
    constructor(config) {
        this.callParent(args);
        if (!config.disabled)
            this.enable();
    },
    onDragStart(e) {
        if (this.config.locked)
            return;    //CJ.app.fireEvent("draggable.dragsart", this);
        //CJ.app.fireEvent("draggable.dragsart", this);
        this.lastDragCoords = {
            x: e.event.pageX,
            y: e.event.pageY
        };
        this.lastDragEvent = e;
        this.dragDelta = {};
        this.callParent(args);
    },
    onDrag(e) {
        if (!this.isDragging || this.config.locked)
            return;
        if (!e && this.lastDragEvt)
            e = this.lastDragEvt;
        this.dragDelta.x = e.event.pageX - this.lastDragCoords.x;
        this.dragDelta.y = e.event.pageY - this.lastDragCoords.y;    //Keep a reference to the event
        //Keep a reference to the event
        this.lastDragEvt = e;
        const startOffset = this.dragStartOffset, dragDelta = this.dragDelta;
        this.fireAction('drag', [
            this,
            e,
            startOffset.x + dragDelta.x,
            startOffset.y + dragDelta.y
        ], this.doDrag);
    },
    onDragEnd(e) {
        if (!this.isDragging)
            return;
        this.onDrag(e);
        if (this.revert || this.config.revert)
            this.setOffset(this.dragStartOffset.x, this.dragStartOffset.y, { duration: 150 });
        this.isDragging = false;    //this.getElement().removeCls(this.getDraggingCls());
        //this.getElement().removeCls(this.getDraggingCls());
        this.fireEvent('dragend', this, e, this.offset.x, this.offset.y);
    },
    enable() {
        CJ.app.fireEvent('draggableenabled', this);
    },
    getGroup() {
        return this.group;
    },
    getGroupId() {
        return 'id';
    }
});