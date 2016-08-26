import 'app/view/course/edit/section/tree/Draggable';
import 'app/view/course/edit/section/tree/Droppable';

/**
 * Defines a plugin that adds drag and drop functionality to section-tree. 
 */
Ext.define('CJ.view.course.edit.section.tree.DDPlugin', {
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} invisibleNode A temporary and invisible node that is
         *                             used to show an animation where the user
         *                             can drop dragging section.
         */
        invisibleNode: null
    },
    /**
     * @param {Ext.Component} component
     */
    init(component) {
        this.setComponent(component);
    },
    /**
     * @param {Ext.Component} component
     */
    setComponent(component) {
        const element = component.element;
        this.component = component;
        this.component.on({
            scope: this,
            nodecreated: this.createDroppable
        });    // initialize draggable.
        // initialize draggable.
        this.draggable = Ext.create('CJ.view.course.edit.section.tree.Draggable', {
            element,
            ghost: element.down('.d-ghost'),
            listeners: {
                scope: this,
                dragstart: {
                    fn: this.onDraggableAfterDragStart,
                    order: 'after'
                },
                drag: {
                    fn: this.onDraggableAfterDrag,
                    order: 'after'
                },
                dragend: this.onDraggableDragEnd
            }
        });    // initialize droppables.
        // initialize droppables.
        this.droppables = [];
        Ext.each(element.query('.d-title'), function (node) {
            this.droppables.push(this.createDroppable(node));
        }, this);
    },
    /**
     * @param {HTMLElement} node
     * @return {CJ.view.course.edit.Droppable}
     */
    createDroppable(node) {
        return Ext.create('CJ.view.course.edit.section.tree.Droppable', {
            element: node,
            draggable: this.draggable
        });
    },
    /**
     * replaces oldInvisible node with a newly created 
     * @param {Ext.Element} oldInvisibleNode
     */
    swapInivisibleNode(oldInvisibleNode) {
        const newInvisibleNode = this.getInvisibleNode();
        this.isSwapping = true;
        Ext.TaskQueue.requestWrite(function () {
            if (newInvisibleNode.isDestroyed) {
                delete this.isSwapping;
                return;
            }
            newInvisibleNode.setHeight(oldInvisibleNode.getHeight());
            oldInvisibleNode.setHeight(0);
            Ext.defer(function () {
                delete this.isSwapping;
                if (oldInvisibleNode.hasCls('d-empty-box'))
                    oldInvisibleNode.destroy();    // this line is needed, in order to run swapInvisibleNode
                                                   // again, in case when user moves too fast, so draggable node
                                                   // is on another place.
                // this line is needed, in order to run swapInvisibleNode
                // again, in case when user moves too fast, so draggable node
                // is on another place.
                this.onDraggableAfterDrag(this.draggable);
            }, 255, this);
        }, this);
    },
    /**
     * @param {Ext.Element} parentEl
     * @param {String} position
     */
    createInvisibleNode(parentEl, position) {
        let el = document.createElement('div');
        el.className = 'd-empty-box';
        el = Ext.get(el);
        switch (position) {
        case 'before':
            el.insertBefore(parentEl);
            break;
        default:
            // we can't just append item, as last node will be always dd-helper
            el.insertBefore(parentEl.last());
            break;
        }
        this.setInvisibleNode(el);
    },
    /**
     * @param {Object} draggable
     * @return {undefined}
     */
    onDraggableAfterDragStart(draggable) {
        this.onDraggableAfterDrag(draggable);
    },
    /**
     * @param {Object} draggable
     * @return {Boolean}
     */
    canSwap(draggable) {
        if (this.isSwapping || !draggable.droppable)
            return false;
        const oldDroppable = this.activeDroppable, oldPosition = this.activeDroppablePosition, newDroppable = draggable.droppable, newPosition = newDroppable && newDroppable.position, samePosition = newPosition == oldPosition, sameDroppable = newDroppable == oldDroppable;    // so if we are dragging something above the same droppable and
                                                                                                                                                                                                                                                                                    // at the same position, we prevents from swapping the boxes.
        // so if we are dragging something above the same droppable and
        // at the same position, we prevents from swapping the boxes.
        return !(sameDroppable && samePosition);
    },
    /**
     * @param {Object} draggable
     * @return {undefined}
     */
    onDraggableAfterDrag(draggable) {
        if (!this.canSwap(draggable))
            return;
        const droppable = draggable.droppable;
        let invisibleNode;
        this.setActiveDroppable(droppable);
        if (!this.getInvisibleNode())
            this.createFirstInvisibleNode(draggable);
        invisibleNode = this.getInvisibleNode();
        switch (this.activeDroppablePosition) {
        case 'before':
            this.createInvisibleNode(droppable.getElement().up('.d-item'), 'before');
            break;
        case 'middle':
            this.createInvisibleNode(droppable.getElement().up('.d-item').down('.d-sections'));
            break;
        }
        this.swapInivisibleNode(invisibleNode);
    },
    /**
     * @return {undefined}
     */
    createFirstInvisibleNode(draggable) {
        let div = document.createElement('div');
        const target = draggable.getTarget();
        const targetPageBox = draggable.getTargetPageBox();
        target.hide();
        div.className = 'd-empty-box';
        div = Ext.get(div);
        div.setHeight(targetPageBox.height);
        div.insertBefore(target);
        this.setInvisibleNode(div);
    },
    /**
     * @param {Ext.Base} droppable
     */
    setActiveDroppable(droppable) {
        if (this.activeDropTarget) {
            if (this.activeDropTarget)
                this.activeDropTarget.removeCls('d-drop-target');
            delete this.activeDropTarget;
            delete this.activeDroppable;
            delete this.activeDroppablePosition;
        }    // we need this check, because even in case when user
             // moves a mouse out of dnd parent's box, we still need droppable.
        // we need this check, because even in case when user
        // moves a mouse out of dnd parent's box, we still need droppable.
        if (droppable) {
            this.activeDroppable = droppable;
            this.activeDropTarget = droppable.getActiveDropTarget();
            this.activeDroppablePosition = droppable.position;
            if (this.activeDropTarget)
                this.activeDropTarget.addCls('d-drop-target');
        }
    },
    /**
     * @return {undefined}
     */
    onDraggableDragEnd() {
        const draggable = this.draggable, target = draggable.getTarget(), invisibleNode = this.getInvisibleNode();
        this.setInvisibleNode(null);
        if (this.activeDroppable) {
            if (this.canDrop()) {
                if (invisibleNode) {
                    const sectionEl = target.up('.d-item'), sectionId = sectionEl && CJ.getNodeData(sectionEl.dom, 'id');
                    draggable.oldParentSectionId = sectionId;
                    invisibleNode.replaceWith(target);
                    invisibleNode.destroy();
                }
            } else {
                delete this.activeDroppable;
                if (invisibleNode)
                    invisibleNode.destroy();
                CJ.feedback(CJ.t('view-course-edit-section-tree-dd-plugin-drop-invalid'));
            }
        }
        target.show();
        draggable.getGhost().addCls('d-hide-opacity-animated');    // wait for transition end
        // wait for transition end
        Ext.defer(this.onDragEndAnimationEnd, 255, this);
    },
    /**
     * user is able to drop section only if newly created node fits level limit.
     * @return {Boolean}
     */
    canDrop() {
        const component = this.component;
        const draggableEl = this.draggable.getTarget();
        const draggableLevels = component.getSectionLevels(draggableEl);
        let droppableEl = this.activeDroppable.getElement().up('.d-item');
        let droppableLevel = 0;
        if (this.activeDroppable.position != 'middle')
            droppableEl = droppableEl.up('.d-item');
        if (droppableEl)
            droppableLevel = component.getSectionLevel(droppableEl);
        return droppableLevel + draggableLevels + 1 < 5;
    },
    /**
     * @return {undefined}
     */
    onDragEndAnimationEnd() {
        const draggable = this.draggable;
        const target = draggable.getTarget();
        const ghost = draggable.getGhost();
        const droppable = this.activeDroppable;
        const dropTarget = this.activeDropTarget;
        let position = this.activeDroppablePosition;
        target.removeCls(draggable.getDraggingCls());
        ghost.setHtml('');
        ghost.hide();
        ghost.removeCls('d-hide-opacity-animated');
        if (dropTarget)
            dropTarget.removeCls('d-drop-target');
        draggable.setTarget(null);
        Ext.defer(function () {
            delete this.activeDropTarget;
            delete this.activeDroppable;
            delete this.activeDroppablePosition;
            if (!droppable)
                return;
            let droppableSectionEl = droppable.getElement();
            let droppableSectionId;
            const oldParentSectionId = draggable.oldParentSectionId;
            let parentSectionId;
            let sectionId;
            droppableSectionEl = droppableSectionEl.up('.d-item');
            droppableSectionId = CJ.getNodeData(droppableSectionEl.dom, 'id');
            sectionId = CJ.getNodeData(target.dom, 'id');
            if (droppableSectionId == 'dd-helper') {
                droppableSectionId = null;    // root
                // root
                position = 'middle';
            }
            switch (position) {
            case 'middle':
                this.appendSection(sectionId, droppableSectionId, oldParentSectionId);
                break;
            case 'before':
                this.insertSectionBefore(sectionId, droppableSectionId, oldParentSectionId);
                break;
            }
        }, 255, this);
    },
    /**
     * @param {Object} section
     * @param {Object} parentSection
     * @param {Boolean} position end or insert
     * @return {Boolean}
     */
    isSectionPositionChanged(section, parentSection, position) {
        const parentSections = parentSection.sections;
        let result = true;
        switch (position) {
        case 'append': {
                if (parentSections[parentSections.length - 1] == section)
                    result = false;
                break;
            }
        case 'insert': {
                result = false;
                break;
            }
        }
        return result;
    },
    /**
     * @param {Number} sectionId
     * @param {Number} parentSectionId
     * @param {Number} oldParentSectionId
     */
    appendSection(sectionId, parentSectionId, oldParentSectionId) {
        const component = this.component;
        const parentSection = component.getSectionById(parentSectionId);
        const childSection = component.getSectionById(sectionId);
        let parentSections;
        if (parentSection)
            parentSections = parentSection.sections;
        else
            parentSections = component.getSections();
        if (parentSections[parentSections.length - 1] == childSection)
            return;    // insert child section to new parent's UI and sections-array.
        // insert child section to new parent's UI and sections-array.
        parentSections.push(childSection);
        if (oldParentSectionId) {
            // remove child section from old parent.
            const oldParentSection = component.getSectionById(oldParentSectionId);
            Ext.Array.remove(oldParentSection.sections, childSection);
        } else {
            // remove child section from sections-root array.
            Ext.Array.remove(component.getSections(), childSection);
        }
        component.saveSectionPosition(childSection, parentSection, 'end');
    },
    /**
     * @param {Number} sectionId
     * @param {Number} siblingSectionId
     * @param {Number} oldParentSectionId
     */
    insertSectionBefore(sectionId, siblingSectionId, oldParentSectionId) {
        const component = this.component;
        const section = component.getSectionById(sectionId);
        const siblingSection = component.getSectionById(siblingSectionId);
        let parentSectionId;
        let parentSection;
        let sections;
        parentSection = component.getParentSectionById(siblingSection.docId);
        if (parentSection)
            parentSectionId = parentSection.docId;
        if (parentSection)
            sections = parentSection.sections;
        else
            sections = component.getSections();
        if (oldParentSectionId == parentSectionId && sections[sections.indexOf(siblingSection) - 1] == section)
            return;
        component.removeSectionFromParent(section, oldParentSectionId);
        const siblingSectionIndex = sections.indexOf(siblingSection);
        let prevSiblingSection = sections[siblingSectionIndex - 1];
        if (!prevSiblingSection)
            prevSiblingSection = 'start';
        Ext.Array.insert(sections, siblingSectionIndex, [section]);
        component.saveSectionPosition(section, parentSection, prevSiblingSection);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        let droppable;
        while (droppable = this.droppables.pop())
            droppable.destroy();
        this.draggable.destroy();
        this.setInvisibleNode(null);
        this.callParent(args);
        delete this.draggable;
        delete this.activeDroppable;
        delete this.activeDropTarget;
    }
});