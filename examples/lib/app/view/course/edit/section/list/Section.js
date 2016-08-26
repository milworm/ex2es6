import 'app/view/course/base/section/Section';

Ext.define('CJ.view.course.edit.section.list.Section', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.base.section.Section',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-list-section',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Ext.Template} sectionTpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-header\'>', '<div class=\'d-title d-section-title\'>{title}</div>', '<div class=\'d-menu-icon\'></div>', '<div class=\'d-menu-container\'></div>', '</div>', '<div class=\'d-blocks\'></div>', { compiled: true })
    },
    /**
     * @param {Object} block
     * @return {undefined}
     */
    appendBlock(block) {
        const node = this.getBlocksNode();
        block = this.createBlock(block);
        block.renderTo(node, node.lastChild);
        block.setRendered(true);
        this.insertItem(block);
        this.setBlocksLength(this.getBlocksLength() + 1);
    },
    /**
     * inserts block at the end.
     * @param {CJ.view.block.BaseBlock} block
     * @param {String} position
     * @return {CJ.view.block.BaseBlock}
     */
    insertItem(block, position) {
        const items = this.getItems();
        switch (position) {
        case 'start': {
                items.splice(0, 0, block);
                break;
            }    // inserts at the end
        // inserts at the end
        default: {
                items.splice(items.length - 1, 0, block);
                break;
            }
        }
        return block;
    },
    insertBlock(block, refId, refPosition) {
        const items = this.getItems(), docId = block.getDocId();
        for (let i = 0, item; item = items[i]; i++) {
            const tempId = item.isInstance ? item.getDocId() : item.docId;
            if (tempId == refId) {
                i = refPosition == 'before' ? i : i + 1;
                items.splice(i, 0, block);
                this.setBlocksLength(this.getBlocksLength() + 1);
                return;
            }
        }
    },
    /**
     * @param {Number} docId
     * @return {undefined}
     */
    updateDocId(docId) {
        this.element.set({ 'data-id': docId });
    },
    /**
     * @param {String} title
     */
    updateTitle(title) {
        if (!this.initialized)
            return;
        const section = this.getSection();
        section.fullTitle.pop();
        section.fullTitle.push(title);
        section.title = title;
        this.refreshTitleEl();
    },
    /**
     * @return {undefined}
     */
    refreshTitleEl() {
        this.element.dom.querySelector('.d-section-title').innerHTML = this.generateTitle();
    },
    /**
     * @param {Object} config
     * @return {CJ.view.block.BaseBlock}
     */
    createBlock(config) {
        if (config.xtype == 'view-block-default-block')
            config.xtype = 'view-course-edit-section-block-default-block';
        else if (config.xtype == 'view-playlist-block')
            config.xtype = 'view-course-edit-section-block-playlist-block';
        else if (config.xtype == 'view-map-block')
            config.xtype = 'view-course-edit-section-block-map-block';
        config = Ext.factory(config);
        config.isCourseSectionBlock = true;
        return config;
    }
});