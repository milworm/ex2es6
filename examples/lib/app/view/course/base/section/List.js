import 'Ext/Component';
import 'app/view/course/base/Store';
import 'app/view/course/base/section/Paging';
import 'app/view/course/base/section/Section';

/**
 * Defines a class, that contains common logic for all section lists for both
 * course-editor and course-viewer for all platforms (mobile, tablet, desktop).  
 */
Ext.define('CJ.view.course.base.section.List', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-base-section-list',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-section-list d-multicolumn d-scroll',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-section-list d-multicolumn d-scroll-inner',
        /**
         * @cfg {CJ.view.course.view.section.list.Paging} paging
         */
        paging: {},
        /**
         * @cfg {Ext.Base} store Defines an object that allows us
         *                       to fetch blocks without knowing where
         *                       do we have these blocks: on client or 
         *                       server side.
         */
        store: {},
        /**
         * @cfg {CJ.view.course.edit.Editor} editor
         */
        editor: null,
        /**
         * @cfg {Array} sections
         */
        sections: null
    },
    constructor(config) {
        this.callParent(args);
        CJ.on('block.addtocourse', this.onBlockAddToCourse, this);
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: ['x-unsized'],
            children: [{
                    className: 'd-section-list-inner',
                    reference: 'innerElement'
                }]
        };
    },
    /**
     * @param {Object} config
     * @return {CJ.view.course.base.Store}
     */
    applyStore(config) {
        return Ext.create('CJ.view.course.base.Store', Ext.apply(config, { blocks: this.getSectionBlocks() }));
    },
    /**
     * @param {Ext.Base} newInstance
     * @param {Ext.Base} oldInstance
     */
    updateStore(newInstance, oldInstance) {
        if (oldInstance)
            oldInstance.destroy();
    },
    /**
     * @param {Object} config
     * @return {Ext.Base}
     */
    applyPaging(config) {
        if (!config)
            return false;
        return Ext.create('CJ.view.course.base.section.Paging', Ext.apply(config, { component: this }));
    },
    /**
     * @param {Ext.Base} newPaging
     * @param {Ext.Base} oldPaging
     */
    updatePaging(newPaging, oldPaging) {
        if (oldPaging)
            oldPaging.destroy();
    },
    /**
     * @param {Array} sections
     * @return {Array}
     */
    applySections(sections) {
        if (!sections)
            sections = this.getDefaultSections();
        const result = [];
        CJ.CourseHelper.eachSection(sections, (section, parentSection) => {
            if (parentSection) {
                parentSection.fullTitle = parentSection.fullTitle || [parentSection.title];
                section.fullTitle = [].concat(parentSection.fullTitle).concat(section.title);
            } else {
                section.fullTitle = [section.title];
            }
            result.push(section);
        }, this);
        return result;
    },
    /**
     * @param {Number} sectionId
     * @return {HTMLElement}
     */
    getSectionNodeById(sectionId) {
        return this.element.dom.querySelector(CJ.tpl('.d-section[data-id=\'{0}\']', sectionId));
    },
    /**
     * @param {Number} id
     * @return {Object}
     */
    getSectionById(id) {
        const sections = this.getSections();
        for (let i = 0, section; section = sections[i]; i++) {
            if (section.docId == id)
                return section;
        }
        return null;
    },
    /**
     * @return {undefined}
     */
    refresh(config undefined {}) {
        const me = this, element = me.element, scope = config.scope, onHide = config.onHide;
        element.addCls('d-hide-animated');
        Ext.defer(() => {
            if (me.isDestroyed)
                return;
            if (onHide)
                onHide.call(scope);
            element.replaceCls('d-hide-animated', 'd-show-animated');
            Ext.defer(() => {
                if (me.isDestroyed)
                    return;
                element.removeCls('d-show-animated');
            }, 255);
        }, 255);
    },
    /**
     * @param {Number} sectionId
     */
    scrollToSection(sectionId) {
        this.refresh({
            scope: this,
            onHide() {
                this.fireEvent('showsection', sectionId);
            }
        });
    },
    /**
     * @return {undefined}
     */
    displayStatics: Ext.emptyFn,
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
        config.xtype = 'view-course-base-section-section';
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
                blocks.push(block);    // @TODO server should set sectionId to each block inside of
                                       // course-section, so we need to remove this when server is 
                                       // ready.
                // @TODO server should set sectionId to each block inside of
                // course-section, so we need to remove this when server is 
                // ready.
                block.sectionId = section.docId;
            }
        }
        return blocks;
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    onBlockDeleted(block) {
        const sectionId = block.sectionId || block.initialConfig.sectionId, section = this.getSectionComponentById(sectionId), store = this.getStore();
        section.onBlockDeleted(block);
        store.onBlockDeleted(block);
        block.destroy();
    },
    /**
     * @param {Number} id
     * @return {Ext.Component}
     */
    getSectionComponentById(id) {
        const selector = CJ.tpl('.d-section[data-id=\'{0}\']', id), node = this.element.dom.querySelector(selector);
        return node && Ext.getCmp(node.id);
    },
    /**
     * moves block to another section.
     * @param {Number} docId Block's docId.
     * @param {Number} toSectionId
     * @return {undefined}
     */
    moveBlock(docId, toSectionId) {
        const store = this.getStore();
        const position = 'before';
        const blockData = store.getBlockById(docId);
        let fromSection = this.getSectionComponentById(blockData.sectionId);
        let toSection = this.getSectionComponentById(toSectionId);
        let toSectionLastBlockId;
        let block;
        if (!fromSection) {
            fromSection = this.createSection(blockData.sectionId);
            fromSection.isPhantom = true;
        }
        if (!toSection) {
            toSection = this.createSection(toSectionId);
            toSection.isPhantom = true;
        }
        const toSectionBlocks = toSection.getSection().blocks;
        toSectionLastBlockId = toSectionBlocks[toSectionBlocks.length - 1].docId;
        block = fromSection.getBlockComponentById(docId);
        store.reorderBlock(docId, toSectionLastBlockId, position);
        fromSection.removeBlockData(blockData);
        toSection.insertBlockData(blockData, toSectionLastBlockId, position);
        fromSection.removeBlock(block);
        toSection.insertBlock(block, toSectionLastBlockId, position);
        block.sectionId = blockData.sectionId = toSection.getSection().docId;
        const toSectionLastBlock = toSection.getBlockComponentById(toSectionLastBlockId);
        if (toSectionLastBlock)
            block.element.insertBefore(toSectionLastBlock.element);
        else
            block.destroy();
        if (toSection.isPhantom)
            toSection.destroy();
        if (fromSection.isPhantom)
            fromSection.destroy();
    },
    /**
     * @param {Object} config
     * @param {Number} config.docId
     * @param {Number} config.sectionId
     * @param {Number} config.courseId
     * @return {undefined}
     */
    onBlockAddToCourse(config) {
        // we handle situations when block is moved in the same course.
        if (this.getEditor().getCourseId() != config.courseId)
            return;
        this.moveBlock(config.docId, config.sectionId);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        CJ.un('block.addtocourse', this.onBlockAddToCourse, this);
        this.setPaging(null);
        this.setStore(null);
        this.callParent(args);
    }
});