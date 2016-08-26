import 'Ext/util/Draggable';

Ext.define('CJ.view.playlist.review.Draggable', {
    extend: 'Ext.util.Draggable',
    config: {
        ghost: null,
        target: null
    },
    updateTarget(target, current) {
        if (current) {
            current.dom = null;
            current.destroy();
        }
    },
    onDragStart(e) {
        e.stopEvent();
        if (this.getDisabled()) {
            return false;
        }
        const offset = this.offset;
        this.setTarget(e.getTarget('li', null, true));    // looks like a bug, fireAction is not preventable here.
        // looks like a bug, fireAction is not preventable here.
        if (this.fireEvent('dragstart', this, e, offset.x, offset.y))
            this.initDragStart(this, e, offset.x, offset.y);
    },
    initDragStart() {
        this.callParent(args);
        const el = this.getTarget(), ghost = this.getGhost();
        if (el.hasCls('add-button'))
            ghost.addCls('add-button');
        el.addCls('x-dragging');
        ghost.setHtml(el.dom.textContent);
        ghost.show();
        this.alignGhost();
    },
    onDrag(e) {
        if (!this.isDragging || this.config.locked)
            return;
        if (!e && this.lastDragEvt)
            e = this.lastDragEvt;
        const coords = this.getPageXY(e), pageX = coords.pageX, pageY = coords.pageY;
        this.fireAction('drag', [
            this,
            e,
            pageX,
            pageY
        ], this.doDrag);
    },
    doDrag(draggable, e, pageX, pageY) {
        const ghost = this.getGhost();
        ghost.setTop(pageY);
        ghost.setLeft(pageX);
    },
    onDragEnd(e) {
        if (!this.isDragging)
            return;
        if (this.relatedDroppable)
            return this.doDragEnd(e);
        const el = this.getTarget(), ghost = this.getGhost();
        el.addCls('revert');
        ghost.addCls('transition');
        this.alignGhost();    // wait for transition end
        // wait for transition end
        Ext.defer(function () {
            el.removeCls('revert');
            this.doDragEnd();
            this.setTarget(null);
        }, 255, this);
    },
    doDragEnd(e) {
        const ghost = this.getGhost();
        ghost.removeCls('transition');
        ghost.hide();
        if (ghost.hasCls('add-button'))
            ghost.removeCls('add-button');
        this.isDragging = false;
        this.getTarget().removeCls('x-dragging');
        this.fireEvent('dragend', this, e, this.offset.x, this.offset.y);
    },
    alignGhost() {
        const el = this.getTarget();
        const ghost = this.getGhost();
        const isAddButton = ghost.hasCls('add-button');
        const offsetY = el.getY() + 11;
        let offsetX = el.getX();
        if (isAddButton)
            offsetX += 11;
        else if (!el.hasCls('revert') || el.up('.x-innerhtml').hasCls('align-start'))
            offsetX += 24;
        ghost.setTop(offsetY);
        ghost.setLeft(offsetX);
    }
});