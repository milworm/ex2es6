import 'app/view/course/base/section/List';
import 'app/view/course/edit/section/list/BlockCreator';
import 'app/view/course/edit/section/list/Store';
import 'app/view/course/edit/section/list/Section';
import 'app/view/course/edit/section/list/Draggable';
import 'app/view/course/edit/section/list/Menu';
import 'app/view/course/edit/section/block/EditPopup';
import 'app/view/course/edit/section/block/DefaultBlock';
import 'app/view/course/edit/section/block/PlaylistBlock';
import 'app/view/course/edit/section/block/MapBlock';

/**
 * Defines a component that is used to display list of sections including a 
 * content (list of blocks).
 */
Ext.define('CJ.view.course.edit.section.list.List', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.base.section.List',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-list-list',
    /**
     * @property {Number} emptySectionsCount Defines the total number of all
     *                                       sections without blocks. It's used
     *                                       to know do we need to insert new 
     *                                       untitled section, when user adds 
     *                                       new block.
     */
    emptySectionsCount: 0,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {CJ.view.course.edit.section.list.Draggable} draggable
         */
        draggable: {},
        /**
         * @cfg {Object} store
         */
        store: {},
        /**
         * @cfg {Object} editingSection
         */
        editingSection: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.callParent(args);
        this.bindHoverEvents();
        this.element.on('tap', this.onElementTap, this);
        CJ.on('course.block.publish', this.onCourseBlockPublish, this);
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: ['x-unsized'],
            html: [
                '<div class=\'d-dnd-overlay\'>',
                CJ.t('view-course-edit-section-list-dnd-hint'),
                '</div>',
                '<div class=\'d-block d-ghost\' style=\'display:none;\'>',
                '<div class=\'d-header\'></div>',
                '<div class=\'d-body\'></div>',
                '</div>'
            ].join('')
        };
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    bindHoverEvents() {
        if (!Ext.os.is.Desktop)
            return;
        this.innerElement.onDom('mouseover', this.onMouseOver, this);
        this.innerElement.onDom('mouseleave', this.onMouseLeave, this);
    },
    /**
     * @return {undefined}
     */
    onMouseOver(e) {
        e = new Ext.event.Dom(e);
        const blockEl = e.getTarget('.d-block.d-section-block', 10, true), lastMouseOverBlock = this.lastMouseOverBlock;
        if (!blockEl) {
            delete this.lastMouseOverBlock;
            if (lastMouseOverBlock) {
                if (lastMouseOverBlock.canDrag) {
                    this.displayDragDropOverlay(lastMouseOverBlock, false);
                } else {
                    clearTimeout(lastMouseOverBlock.mouseEnterTimerId);
                    delete lastMouseOverBlock.mouseEnterTimerId;
                }
            }
        } else {
            const block = Ext.getCmp(blockEl.id);
            if (block.getSaving())
                return;
            if (lastMouseOverBlock == block) {
                if (block.canDrag)
                    return;
                if (e.getTarget('.d-body')) {
                    if (!block.mouseEnterTimerId) {
                        block.mouseEnterTimerId = Ext.defer(this.onMouseEnterTimerEnds, 1000, this, [block]);
                    }
                } else {
                    clearTimeout(block.mouseEnterTimerId);
                    delete block.mouseEnterTimerId;
                }
            } else {
                if (lastMouseOverBlock) {
                    delete this.lastMouseOverBlock;
                    if (lastMouseOverBlock.canDrag) {
                        this.displayDragDropOverlay(lastMouseOverBlock, false);
                    } else {
                        clearTimeout(lastMouseOverBlock.mouseEnterTimerId);
                        delete lastMouseOverBlock.mouseEnterTimerId;
                    }
                }
                if (e.getTarget('.d-body')) {
                    block.mouseEnterTimerId = Ext.defer(this.onMouseEnterTimerEnds, 1000, this, [block]);
                    this.lastMouseOverBlock = block;
                }
            }
        }
    },
    /**
     * @param {Event} e
     */
    onMouseLeave(e) {
        this.onMouseOver(e);
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     */
    onMouseEnterTimerEnds(block) {
        CJ.Utils.clearSelection();
        this.displayDragDropOverlay(block, true);
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @param {Boolean} state Should be true to show dnd-overlay.
     * @return {undefined}
     */
    displayDragDropOverlay(block, state) {
        if (block.state == state)
            return;
        if (block.isDestroyed)
            return;
        block.canDrag = state;
        const el = block.element, rootNode = this.element.dom, ddNode = rootNode.querySelector('.d-dnd-overlay');
        if (state) {
            el.dom.querySelector('.d-block-content').appendChild(ddNode);
            ddNode.offsetTop;    // trigger layout in order to achive transition effect.
            // trigger layout in order to achive transition effect.
            el.addCls('d-show-can-drag');
            return;
        }
        el.replaceCls('d-show-can-drag', 'd-hide-can-drag');
        Ext.defer(() => {
            if (block.isDestroyed)
                return;
            el.removeCls('d-hide-can-drag');
            rootNode.appendChild(ddNode);
        }, 250, this);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-block-creator', 10))
            this.onBlockCreatorElementTap(e);
        else if (e.getTarget('.d-section .d-header .d-menu-icon', 10))
            this.onSectionMenuIconTap(e);
        return;
    },
    /**
     * @param {Object} config
     * @return {CJ.view.course.base.Store}
     */
    applyStore(config) {
        if (!config)
            return false;
        return Ext.create('CJ.view.course.edit.section.list.Store', Ext.apply(config, { blocks: this.getSectionBlocks() }));
    },
    /**
     * @param {Array} sections
     * @return {Array}
     */
    applySections(sections) {
        const result = [];
        this.emptySectionsCount = 0;
        CJ.CourseHelper.eachSection(sections, function (section, parentSection) {
            if (section.blocksLength == 0)
                this.emptySectionsCount++;
            if (parentSection) {
                parentSection.fullTitle = parentSection.fullTitle || [parentSection.title];
                section.fullTitle = [].concat(parentSection.fullTitle).concat(section.title);
            } else {
                section.fullTitle = [section.title];
            }
            result.push(this.cloneSection(section));
        }, this);
        return result;
    },
    /**
     * we need to clone a section, but keep blocks and sections arrays
     * as we don't want to use additonal memory.
     * @param {Object} section
     * @return {Object}
     */
    cloneSection(section) {
        const clone = Ext.applyIf({
            blocks: [],
            sections: []
        }, section);
        clone.blocks = section.blocks || [];
        if (!clone.blocks.hasBlockCreatoror) {
            clone.blocks.hasBlockCreatoror = true;
            clone.blocksLength += 1;
            clone.blocks.push({
                docId: CJ.Guid.generatePhantomId(),
                xtype: 'view-course-edit-section-list-block-creator'
            });
        }
        return clone;
    },
    /**
     * @param {Object} config
     * @return {CJ.view.course.edit.section.list.Draggable}
     */
    applyDraggable(config) {
        if (!config)
            return false;
        return Ext.create('CJ.view.course.edit.section.list.Draggable', Ext.apply({
            component: this,
            element: this.element,
            ghost: this.element.down('.d-ghost'),
            listeners: {
                scope: this,
                drop: this.onDrop
            }
        }, config));
    },
    /**
     * @param {CJ.view.block.BaseBlock} droppableBlock
     * @param {CJ.view.block.BaseBlock} draggableBlock
     * @param {String} position
     */
    onDrop(droppableBlock, draggableBlock, position) {
        const droppableBlockId = droppableBlock.getDocId();
        const draggableBlockId = draggableBlock.getDocId();
        const dropSection = this.getSectionComponentById(droppableBlock.sectionId);
        let dragSection = this.getSectionComponentById(draggableBlock.sectionId);
        const dragBlockData = this.getBlockDataFromBlock(draggableBlock);
        let dragSectionIsPhantom;
        let dragBlock;
        let dropBlock;
        if (draggableBlockId == droppableBlockId)
            return;
        if (!dragSection) {
            dragSection = this.createSection(draggableBlock.sectionId);
            dragSectionIsPhantom = true;
        }
        draggableBlock.sectionId = droppableBlock.sectionId;
        dragBlock = dragSection.getBlockById(draggableBlock.getDocId());
        if (position == 'before') {
            const dropSectionItems = dropSection.getItems(), index = dropSectionItems.indexOf(droppableBlock);
            if (dropSectionItems[index - 1])
                droppableBlock = dropSectionItems[index - 1];
            else
                droppableBlock = 'start';
        }
        this.getStore().reorderBlock(draggableBlockId, droppableBlockId, position);
        dragSection.removeBlockData(dragBlockData);
        dropSection.insertBlockData(dragBlockData, droppableBlockId, position);
        dragSection.removeBlock(draggableBlock);
        dropSection.insertBlock(draggableBlock, droppableBlockId, position);
        if (Ext.isString(droppableBlock))
            dropBlock = droppableBlock;
        else
            dropBlock = dropSection.getBlockById(droppableBlock.getDocId());
        this.getEditor().reorderBlock(dropSection.getSection(), dragBlock, dropBlock);
        if (dragSectionIsPhantom)
            dragSection.destroy();
    },
    /**
     * @param {CJ.view.course.edit.section.list.Draggable} newDraggable
     * @param {CJ.view.course.edit.section.list.Draggable} oldDraggable
     */
    updateDraggable(newDraggable, oldDraggable) {
        if (oldDraggable)
            oldDraggable.destroy();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onBlockCreatorElementTap(e) {
        const section = Ext.getCmp(e.getTarget('.d-section').id);
        this.getEditor().setActiveSectionId(section.getDocId());
        Ext.factory({
            xtype: 'view-course-edit-section-block-edit-popup',
            block: {
                tags: [CJ.User.get('user')],
                userInfo: CJ.User.getInfo()
            }
        });
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    onCourseBlockPublish(block) {
        const courseEditor = this.getEditor(), section = this.getSectionById(courseEditor.getActiveSectionId());
        if (block.isPhantom())
            courseEditor.onAddBlockToSection(block, section);
        else
            // @TODO need to add saving mask for non-phantom block which is a part of playlist.
            courseEditor.onEditBlockFromSection(block, section);
        if (!block.isPlaylist)
            return;    // removing old block from course.
        // removing old block from course.
        const originalBlock = CJ.CourseHelper.byDocId(block.getOriginalBlockDocId());
        if (!originalBlock)
            return;
        const course = courseEditor.getBlock();
        this.getEditor().deleteBlockFromCourseConfirmed(originalBlock, course);
    },
    /**
     * adds the block the the blocks.length - 1 (ignoring block's creator)
     * @param {CJ.view.block.BaseBlock} block
     * @param {Object} section
     */
    addBlockToSection(block, section) {
        const sectionId = section.docId, data = block.serialize(), blocks = section.blocks, store = this.getStore(), paging = this.getPaging();
        block.sectionId = sectionId;
        data.sectionId = sectionId;
        data.saving = block.getSaving();
        blocks.splice(blocks.length - 1, 0, data);
        store.addBlock(data);
        section.blocksLength++;
        paging.setVisibleCount(paging.getVisibleCount() + 1);
        this.getSectionComponentById(sectionId).appendBlock(block);
        if (blocks.length == 2)
            this.emptySectionsCount--;
        this.addEmptySection();
        return data;
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @param {Object} section
     * @param {String|Number} ref
     */
    insertBlockToSection(block, section, ref) {
        const sectionId = section.docId, data = block.serialize();
        block.sectionId = sectionId;
        data.sectionId = sectionId;
        data.saving = block.getSaving();
        this.getPaging().incVisibleCount();
        this.getStore().insertBlock(data, ref);
        this.insertBlockToSectionData(data, section, ref);
        this.getSectionComponentById(sectionId).insertBlock(block, ref, 'after');
        if (section.blocks.length == 2)
            this.emptySectionsCount--;
        this.addEmptySection();
        return data;
    },
    /**
     * inserts block at specific position in section's data object.
     * @param {Object} data
     * @param {Object} section
     * @param {String|Number} ref
     * @return {undefined}
     */
    insertBlockToSectionData(data, section, ref) {
        const blocks = section.blocks;
        let insertIndex;
        switch (ref) {
        case 'start':
            blocks.unshift(data);
            return;
        case 'end':
            blocks.push(data);
            return;
        }
        Ext.each(blocks, (block, i) => {
            if (block.docId == ref) {
                blocks.splice(i + 1, 0, data);
                return false;
            }
        });
    },
    /**
     * @param {Ext.Component} block
     * @return {Object}
     */
    getBlockDataFromBlock(block) {
        const blockId = block.getDocId(), section = this.getSectionById(block.sectionId);
        for (let i = 0, block; block = section.blocks[i]; i++)
            if (block.docId == blockId)
                return block;
        return null;
    },
    /**
     * @return {Boolean}
     */
    hasEmptySection() {
        return this.emptySectionsCount > 0;
    },
    /**
     * @param {Array} sections
     * @param {Array} section
     * @return {undefined}
     */
    onSectionOrderChange(sections, section) {
        this.setSections(sections);
        this.refresh({
            scope: this,
            onHide() {
                this.getStore().setBlocks(this.getSectionBlocks());
                this.getPaging().onShowSection(section.docId);
            }
        });
    },
    /**
     * @param {String} tempId
     * @param {Object} data
     */
    onSectionSave(tempId, data) {
        const sectionId = data.docId, data = this.getSectionById(tempId), section = this.getSectionComponentById(tempId);
        data.docId = sectionId;
        if (section)
            section.setDocId(sectionId);
        this.syncSectionBlocks(sectionId);
        CJ.fire('course.section.save', tempId, data);
    },
    /**
     * @param {Number} sectionId
     */
    syncSectionBlocks(sectionId) {
        const sectionData = this.getSectionById(sectionId), section = this.getSectionComponentById(sectionId);    // let's update every block in our memory.
        // let's update every block in our memory.
        Ext.each(sectionData.blocks, block => {
            block.sectionId = sectionId;
        });    // let's update every rendered block.
        // let's update every rendered block.
        Ext.each(section.getItems(), block => {
            block.sectionId = sectionId;
        });
    },
    /**
     * @param {Object} section
     * @return {undefined}
     */
    addSection(section) {
        const store = this.getStore();
        const paging = this.getPaging();
        const data = this.cloneSection(section);
        let item;
        this.emptySectionsCount++;
        this.getSections().push(data);
        store.addBlocks(this.getSectionBlocks([data]));
        item = this.createSection(data.docId);
        item.appendBlocks(data.blocks);
        item.renderTo(this.element);
        paging.getVisibleSections().push(item);
        paging.setVisibleCount(paging.getVisibleCount() + 1);
    },
    /**
     * @return {undefined}
     */
    onSectionMenuIconTap(e) {
        const section = Ext.getCmp(e.getTarget('.d-section').id);
        Ext.factory({
            editor: this.getEditor(),
            sectionList: this,
            section,
            xtype: 'view-course-edit-section-list-menu',
            renderTo: e.getTarget('.d-header').querySelector('.d-menu-container')
        });
    },
    /**
     * @param {Number} sectionId
     * @return {undefined}
     */
    showRenamePopup(section) {
        CJ.view.course.edit.section.list.Rename.popup({
            section,
            listeners: {
                scope: this,
                actionbuttontap: this.onRenameSectionPopupSubmitTap
            }
        });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     * @return {undefined}
     */
    onRenameSectionPopupSubmitTap(popup) {
        const content = popup.getContent(), value = content.getInputValue(), sectionId = content.getSection().getDocId();
        this.getEditor().onSectionRename(sectionId, value);
    },
    /**
     * @param {Ext.Component} section
     * @return {undefined}
     */
    onSectionDelete(section) {
        const title = 'view-course-edit-section-delete-confirm-title', message = 'view-course-edit-section-delete-confirm-message';
        CJ.confirm(title, message, function (result) {
            if (result == 'no')
                return;
            this.getEditor().onSectionDelete(section.getSection());
        }, this);
    },
    /**
     * @param {Object} data Section's data.
     * @return {undefined}
     */
    deleteSection(data) {
        const sectionId = data.docId, section = this.getSectionComponentById(sectionId), store = this.getStore();
        store.deleteSection(sectionId);
        section.destroy();
    },
    /**
     * @param {Number} sectionId
     * @param {String} title
     */
    renameSection(sectionId, title) {
        let component = this.getSectionComponentById(sectionId);
        const section = this.getEditor().getSectionById(sectionId);
        const level = this.getSectionLevel(component.getSection());
        component.setTitle(title);
        CJ.CourseHelper.eachSection(section.sections, function (section) {
            section.fullTitle.splice(level, 1, title);
            component = this.getSectionComponentById(section.docId);
            if (component)
                component.refreshTitleEl();
        }, this, section);
    },
    /**
     * @param {Object} section
     * @return {Number}
     */
    getSectionLevel(section) {
        return section.fullTitle.length - 1;
    },
    /**
     * @param {Number} id
     * @return {Ext.Component}
     */
    createSection(id) {
        const section = this.getSectionById(id);
        let config;
        config = Ext.apply({}, section);
        config.blocks = [];
        config.sections = [];
        config.section = section;
        config.xtype = 'view-course-edit-section-list-section';
        return Ext.factory(config);
    },
    /**
     * @param {Array} sections
     * @return {Array}
     */
    getSectionBlocks(sections) {
        const sections = sections || this.getSections(), blocks = [];
        for (let i = 0, section; section = sections[i]; i++) {
            for (let j = 0, block; block = section.blocks[j]; j++) {
                blocks.push(block);
                block.sectionId = section.docId;
            }
        }
        return blocks;
    },
    /**
     * @param {Object} oldData
     * @param {Object} newData
     */
    onBlockSave(oldData, newData) {
        const oldId = oldData.docId, newId = newData.docId;
        delete oldData.saving;
        this.getStore().onBlockSave(oldData, newData);
        this.reinitBlockById(oldId, newData);
        Ext.apply(oldData, newData);
        console.log(CJ.tpl('block #{0} saved', newId));
    },
    /**
     * @param {Number|String} id
     * @param {Object} data
     * @return {undefined}
     */
    reinitBlockById(id, data) {
        const block = this.getBlockById(id);
        if (!block)
            return;
        block.reinit(data);
        block.setSaving(false);
    },
    /**
     * @param {Number} docId
     * @return {CJ.view.block.BaseBlock}
     */
    getBlockById(docId) {
        const root = this.element.dom, node = root.querySelector(CJ.tpl('.d-block[docid=\'{0}\']', docId));
        if (node)
            return Ext.getCmp(node.id);
        return null;
    },
    /**
     * method adds new section, so there is at least one empty section.
     * @return {undefined}
     */
    addEmptySection() {
    }    // @TODO https://redmine.iqria.com/issues/8800
         // if(! this.hasEmptySection())
         //     this.getEditor().onSectionAdd();
,
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        CJ.un('course.block.publish', this.onCourseBlockPublish, this);
    }
});