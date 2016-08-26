import 'Ux/util/Droppable';

Ext.define('CJ.view.course.edit.section.tree.Droppable', {
    extend: 'Ux.util.Droppable',
    config: {
        /**
         * @cfg {Object} draggable
         */
        draggable: null
    },
    // @private
    isDragOver(draggable, e) {
        if (!e)
            return false;
        let y = e.pageY, x = e.pageX, result;    //In some cases on IOS getXY return 0,0
                                                 //when touch.pageX and touch.pageY are correct
        //In some cases on IOS getXY return 0,0
        //when touch.pageX and touch.pageY are correct
        if (y == 0 && Ext.os.is.iOS) {
            //get a second opinion
            y = e.touch.pageY;
            x = e.touch.pageX;
        }
        if (!(y >= this.region.top && y < this.region.bottom && x >= this.region.left && x < this.region.right))
            return false;
        if (!draggable.lastCoords)
            draggable.lastCoords = [
                this.region.left,
                this.region.right
            ];
        const coords = draggable.lastCoords;
        if (this.region.left >= coords[0]) {
            draggable.lastCoords = [
                this.region.left,
                this.region.right
            ];
            return true;
        }
        return false;
    },
    updateDraggable(newDraggable, oldDraggable) {
        newDraggable.on('dragstart', this.onDragStart, this);
    },
    enable() {
        this.draggables = [];
    },
    // @private
    onDragStart(draggable, e) {
        if (this.isDragging())
            return;
        this.region = this.getElement().getPageBox();
        this.setCanDrop(this.isDragOver(draggable, e), draggable, e);
        this.initPosition(draggable, e);
        draggable.on({
            drag: this.onDrag,
            dragend: this.onDragEnd,
            scope: this
        });
    },
    // @private
    onDrag(draggable, e) {
        // we need to renew the region, as it might be already changed
        // because of swapEmptyBoxes.
        this.region = this.getElement().getPageBox();
        this.setCanDrop(this.isDragOver(draggable, e), draggable, e);
        if (!this.canDrop)
            return;
        this.initPosition(draggable, e);
        this.fireEvent('dropdrag', this, draggable, e);
        console.log(this.getElement().dom.innerHTML);
    },
    initPosition(draggable, e) {
        const coords = draggable.getPageXY(e);
        let position = 'middle';
        const pageY = coords.pageY;
        const regionY = this.region.top;    // 17px is itemHeight / 2
        // 17px is itemHeight / 2
        if (pageY >= regionY && pageY < regionY + 17)
            position = 'before';
        if (this.getElement().hasCls('dd-helper-section-title'))
            position = 'before';
        this.position = position;
    },
    // @private
    onDragEnd(draggable, e) {
        draggable.un({
            drag: this.onDrag,
            dragend: this.onDragEnd,
            scope: this
        });
    },
    // @private
    setCanDrop(canDrop, draggable, e) {
        this.canDrop = canDrop;
        if (this.canDrop)
            draggable.droppable = this;
    },
    /**
     * @return {Boolean}
     */
    isDragging() {
        return this.getElement().up('.x-dragging');
    },
    /**
     * @return {Ext.Element}
     */
    getActiveDropTarget() {
        const el = this.getElement().up('.d-item');
        if (this.position == 'before')
            return el.up('.d-item');
        return el;
    }
});