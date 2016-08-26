import 'app/view/course/base/Editor';
import 'app/view/course/edit/Popup';
import 'app/view/course/edit/menu/Menu';
import 'app/view/course/edit/section/list/List';
import 'app/view/course/edit/Queue';

/**
 * Defines a component that allows user to create and edit a course.
 */
Ext.define('CJ.view.course.edit.Editor', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.base.Editor',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-editor',
    /**
     * @property {Object} statics
     */
    inheritableStatics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config undefined {}) {
            return Ext.factory({
                xtype: 'view-course-edit-popup',
                content: {
                    block: config.block,
                    xtype: this.xtype
                }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {CJ.view.course.edit.Queue} queue
         */
        queue: {},
        /**
         * @cfg {Number|String} activeSectionId Defines fresh id of currently 
         *                                      editing section.
         *                                      
         */
        activeSectionId: null
    },
    /**
     * @param {Object} config
     */
    constructor(config undefined {}) {
        if (config.block) {
            const block = config.block;
            config.sections = block.getSections();
            config.values = {
                iconCfg: block.getIconCfg(),
                title: block.getTitle(),
                description: block.getDescription()
            };
        } else {
            config.sections = CJ.CourseHelper.getDefaultSections();
            config.values = {};
        }
        this.callParent(args);
        CJ.on('course.section.save', this.onCourseSectionSave, this);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-publish'))
            this.onPublishButtonTap();
        else
            this.callParent(args);
    },
    /**
     * @param {Object} config
     * @return {CJ.view.course.edit.Queue}
     */
    applyQueue(config) {
        if (!config)
            return;
        return Ext.create('CJ.view.course.edit.Queue', Ext.apply({
            editor: this,
            listeners: {
                scope: this,
                busy: this.onQueueBusy,
                free: this.onQueueFree
            }
        }, config));
    },
    /**
     * @param {Ext.Base} newQueue
     * @param {Ext.Base} oldQueue
     * @return {undefined}
     */
    updateQueue(newQueue, oldQueue) {
        if (oldQueue)
            oldQueue.destroy();
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    updateBlock(block) {
        this.callParent(args);
        if (!block)
            return;
        this.element.addCls('d-has-block');
        this.element[block.getPublished() ? 'addCls' : 'removeCls']('d-published');
    },
    /**
     * @param {Ext.Base} queue
     */
    onQueueBusy() {
        this.getMenu().setSaving(true);
        CJ.LoadBar.run({
            renderTo: this.element,
            maskedEl: this.element
        });
    },
    /**
     * @param {Ext.Base} queue
     */
    onQueueFree(queue) {
        this.getMenu().setSaving(false);
        CJ.LoadBar.finish();
    },
    /**
     * @return {Boolean} true in case when editor is ready to be closed.
     */
    canClose() {
        if (this.getMenu().getIconField().getUploading())
            return false;
        if (!this.getQueue().isEmpty())
            return false;
        return true;
    },
    /**
     * @return {Boolean}
     */
    onCloseButtonTap() {
        if (!this.canClose())
            return false;
        const block = this.getBlock();
        if (!block)
            return this.getPopup().hide();
        if (block.getPublished())
            this.onPublishButtonTap();
        else
            block.setEditing(false);
    },
    /**
     * @return {undefined}
     */
    onPublishButtonTap() {
        const block = this.getBlock();
        if (!block || !this.canClose())
            return false;
        block.publish();
    },
    /**
     * creates new instance of unpublished block and saves it in order
     * to allow us to use editing queue during editing a block.
     * @return {CJ.view.course.Block}
     */
    createBlock() {
        let block = this.getBlock();
        if (block)
            return block;
        block = Ext.factory(Ext.apply(this.serialize(), {
            xtype: 'view-course-block',
            editor: this,
            editing: true,
            docVisibility: 'private'
        }, CJ.Block.getInitialTagsAndCategories()));
        this.setBlock(block);
        return block;
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyMenu(config) {
        if (!Ext.isObject(config))
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-course-edit-menu-menu',
            values: this.getValues(),
            sections: this.getSections(),
            renderTo: this.element,
            editor: this
        }, config));
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applySectionList(config) {
        if (!Ext.isObject(config))
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-course-edit-section-list-list',
            sections: this.getSections(),
            renderTo: this.element,
            editor: this
        }, config));
    },
    /**
     * @return {Object}
     */
    serialize() {
        const menu = this.getMenu(), description = menu.getDescriptionField().getValue(), iconCfg = menu.getIconField().getValue(), title = menu.getTitleField().getRealValue();
        return {
            iconCfg,
            title,
            description,
            // @TODO it's temporary
            icon: iconCfg ? iconCfg.original : null
        };
    },
    /**
     * @mediator
     * @param {CJ.view.block.BaseBlock} block
     * @param {Object} section
     */
    onAddBlockToSection(block, section) {
        block.setSaving(true);
        block = this.getSectionList().addBlockToSection(block, section);
        this.getQueue().saveBlock(block, {
            scope: this,
            success: this.onSaveBlockSuccess,
            failure: this.onSaveBlockFailure
        });
    },
    /**
     * @mediator
     * @param {CJ.view.block.BaseBlock} block
     * @param {Object} section
     * @param {Number|String} ref Defines where to insert the block 
     *                            (end, start, docId).
     */
    onInsertBlockToSection(block, section, ref) {
        const list = this.getSectionList();
        let data;
        ref = ref || 'end';
        block.setSaving(true);
        data = list.insertBlockToSection(block, section, ref);
        this.getQueue().saveBlock(data, {
            scope: this,
            success: this.onSaveBlockSuccess,
            failure: this.onSaveBlockFailure
        });
        this.getQueue().insertBlock(data, section, {
            scope: this,
            success: this.onAddBlockSuccess,
            failure: this.onAddBlockFailure
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onSaveBlockSuccess(response, request) {
        const block = request.block;
        this.getSectionList().onBlockSave(block, response.ret.saved[block.docId]);
    },
    /**
     * @param {Object} request
     */
    onSaveBlockFailure(request) {
    }    // @TODO
,
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @param {Object} section
     */
    onEditBlockFromSection(block, section) {
        block.setSaving(true);
        const blockId = block.getDocId();
        for (let i = 0, item; item = section.blocks[i]; i++) {
            if (item.docId == blockId) {
                item.saving = true;
                break;
            }
        }    // this.getSectionList().getBlockDataFromBlock(block).saving = true;
        // this.getSectionList().getBlockDataFromBlock(block).saving = true;
        this.getQueue().editBlock(block.serialize(), {
            scope: this,
            success: this.onEditBlockSuccess,
            failure: this.onEditBlockFailure
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onEditBlockSuccess(response, request) {
        const block = request.block;
        this.getSectionList().onBlockSave(block, response.ret.saved[block.docId]);
    },
    /**
     * @param {Object} request
     */
    onEditBlockFailure(request) {
    }    // @TODO
,
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onAddBlockSuccess(response, request) {
        const block = request.block, section = request.section;
        console.log(`block #${ block.docId } added to #${ section.docId }`);
    },
    /**
     * @param {Object} request
     */
    onAddBlockFailure() {
    }    // @TODO
,
    /**
     * @mediator
     * @param {String} title section's title.
     * @return {undefined}
     */
    onSectionAdd(title) {
        const section = CJ.CourseHelper.getDefaultSectionConfig();
        if (title) {
            section.title = title;
            section.fullTitle = [title];
        }
        this.getMenu().getSectionTree().addSection(section);
        this.getSectionList().addSection(section);
        this.getQueue().saveSection(section, {
            scope: this,
            success: this.onSaveSectionSuccess,
            failure: this.onSaveSectionFailure
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onSaveCourseSuccess(response, request) {
        const block = this.getBlock(), section = request.section, saved = response.ret.saved, data = saved[block.getDocId()];    // update course
        // update course
        block.setDocId(data.docId);
        CJ.StreamHelper.adjustContaining(block);    // user could delete a section.
        // user could delete a section.
        if (section) {
            // course will be always created with one section update
            this.updateSection(section, saved[section.docId]);
        }
    },
    /**
     * @param {Object} request
     * @return {undefined}
     */
    onSaveCourseFailure() {
    }    // @TODO
,
    /**
     * @param {Object} section
     * @param {Object} data
     * @return {undefined}
     */
    updateSection(section, data) {
        const tempId = section.docId, sectionTree = this.getMenu().getSectionTree(), sectionList = this.getSectionList();
        sectionTree.onSectionSave(tempId, data);
        sectionList.onSectionSave(tempId, data);
        console.info(`section saved: #${ tempId }->${ section.docId }`);
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onSaveSectionSuccess(response, request) {
        const section = request.section;
        this.updateSection(section, response.ret.saved[section.docId]);
    },
    /**
     * @return {undefined}
     */
    onSaveSectionFailure() {
    }    // @TODO
,
    /**
     * @return {undefined}
     */
    onCourseUpdate() {
        const block = this.createBlock();
        if (block.isPhantom()) {
            this.getQueue().saveCourse({
                scope: this,
                success: this.onSaveCourseSuccess,
                failure: this.onSaveCourseFailure
            });
        } else {
            this.getQueue().updateCourse({
                scope: this,
                success: this.onUpdateCourseSuccess,
                failure: this.onUpdateCourseFailure
            });
        }
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onUpdateCourseSuccess(response, request) {
        this.getBlock().onSaveSucccess(response, request);
        console.info(`course updated: #${ this.getBlock().getDocId() }`);
    },
    /**
     * @return {undefined}
     */
    onUpdateCourseFailure(request) {
    }    // @TODO
,
    /**
     * @mediator
     * @param {Objet} section
     */
    onSectionDelete(section) {
        const block = this.getBlock();    // don't allow user to remove section when it's initial state.
        // don't allow user to remove section when it's initial state.
        if (!block)
            return;
        const sectionTree = this.getMenu().getSectionTree(), sectionList = this.getSectionList();
        sectionTree.deleteSection(section);
        sectionList.deleteSection(section);
        this.getQueue().deleteSection(section, {
            scope: this,
            success: this.onDeleteSectionSuccess,
            failure: this.onDeleteSectionFailure
        });    // at least one section should exist always.
        // at least one section should exist always.
        if (sectionTree.getSections().length == 0)
            this.onSectionAdd();
    },
    /**
     * @param {Object} sections
     * @return {undefined}
     */
    onDeleteSectionSuccess(response, request) {
        console.log(`section deleted: #${ request.sectionId }`);
    },
    /**
     * @param {Object} sections
     * @return {undefined}
     */
    onDeleteSectionFailure(request) {
    }    // @TODO
,
    /**
     * @mediatoronCategoriesSelect
     * @param {Number} sectionId
     * @param {String} title
     * @return {undefined}
     */
    onSectionRename(sectionId, title) {
        const sectionTree = this.getMenu().getSectionTree(), sectionList = this.getSectionList(), section = sectionTree.getSectionById(sectionId);
        sectionList.renameSection(sectionId, title);
        sectionTree.renameSection(sectionId, title);
        this.getQueue().saveSection(section, {
            scope: this,
            success: this.onRenameSectionSuccess,
            failure: this.onRenameSectionFailure
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onRenameSectionSuccess(response, request) {
        console.log(`renamed:${ request.section.title }`);
    },
    /**
     * @param {Object} request
     * @return {undefined}
     */
    onRenameSectionFailure(request) {
    }    // @TODO
,
    /**
     * @mediator
     * @param {Object} section
     * @param {Number} parent
     * @param {Object|String} refItem
     * @param {Array} sections list of sections in tree structure.
     */
    onSectionOrderChange(section, parent, refItem, sections) {
        this.getSectionList().onSectionOrderChange(sections, section);
        this.getQueue().reorderSection(section, parent, refItem, {
            scope: this,
            success: this.onReorderSectionSuccess,
            failure: this.onReorderSectionFailure
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onReorderSectionSuccess(response, request) {
        console.info(`reordered section: ${ request.parent ? request.parent.docId : 'root' }->${ request.section.docId }`);
    },
    /**
     * @param {Object} request
     * @return {undefined}
     */
    onReorderSectionFailure(request) {
        console.log(request);
    },
    /**
     * @param {Object} section
     * @param {Object} block
     * @param {Object|String} refBlock
     */
    reorderBlock(section, block, ref) {
        this.getQueue().reorderBlock(section, block, ref, {
            scope: this,
            success: this.onReorderBlockSuccess,
            failure: this.onReorderBlockFailure
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onReorderBlockSuccess(response, request) {
        console.log(CJ.tpl('block reordered {0}: to section ({1}) after block ({2})', request.blockId, request.sectionId, request.refId));
    },
    /**
     * @param {Object} request
     * @return {undefined}
     */
    onReorderBlockFailure(request) {
    }    // @TODO
,
    /**
     * @param {String} sectionId
     * @param {Object} data
     * @return {undefined}
     */
    onCourseSectionSave(sectionId, data) {
        if (this.getActiveSectionId() == sectionId)
            this.setActiveSectionId(data.docId);
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     */
    deleteBlockFromCourse(block) {
        const title = 'view-course-edit-section-block-bottom-bar-delete-title', message = 'view-course-edit-section-block-bottom-bar-delete-message';
        CJ.confirm(title, message, function (confirm) {
            if (confirm == 'no')
                return;
            this.deleteBlockFromCourseConfirmed(block, this.getBlock());
        }, this);
    },
    /**
     * @param {CJ.view.block.BaseBlock} course
     * @return {undefined}
     */
    deleteBlockFromCourseConfirmed(block, course) {
        CJ.request({
            rpc: {
                model: 'Course',
                method: 'delete_from_course'
            },
            params: {
                id: course.getDocId(),
                blockId: block.getDocId()
            },
            stash: { block },
            scope: this,
            success: this.onDeleteBlockFromCourseSuccess,
            failure: this.onDeleteBlockFromCourseFailure
        });
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onDeleteBlockFromCourseSuccess(response, request) {
        CJ.feedback();
        this.onBlockDeleted(request.stash.block);
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onDeleteBlockFromCourseFailure(response) {
    }    // @TODO
,
    /**
     * @return {undefined}
     */
    destroy() {
        this.setQueue(null);
        this.callParent(args);
        CJ.un('course.section.save', this.onCourseSectionSave, this);
    }
});