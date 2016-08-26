import 'app/view/course/base/Store';

/**
 * Defines a component that acts as a layer between the paging and 
 * section-list, which allows us to get blocks for course without knowing
 * where these blocks are located (in memory or in the server-side)
 */
Ext.define('CJ.view.course.edit.section.list.Store', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.base.Store',
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    updateBlocks(blocks) {
        const index = [];
        for (let i = 0, block; block = blocks[i]; i++) {
            index.push(block.docId);
            if (block.xtype == 'view-block-default-block')
                block.xtype = 'view-course-edit-section-block-default-block';
            else if (block.xtype == 'view-playlist-block')
                block.xtype = 'view-course-edit-section-block-playlist-block';
        }
        this.setIndex(index);
    },
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    addBlocks(blocks) {
        const index = this.getIndex(), storeBlocks = this.getBlocks();
        for (let i = 0, block; block = blocks[i]; i++) {
            index.push(block.docId);
            storeBlocks.push(block);
            if (block.xtype == 'view-block-default-block')
                block.xtype = 'view-course-edit-section-block-default-block';
            else if (block.xtype == 'view-playlist-block')
                block.xtype = 'view-course-edit-section-block-playlist-block';
        }
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    addBlock(data) {
        const index = this.getIndex(), blocks = this.getBlocks();
        if (data.xtype == 'view-block-default-block')
            data.xtype = 'view-course-edit-section-block-default-block';
        else if (data.xtype == 'view-playlist-block')
            data.xtype = 'view-course-edit-section-block-playlist-block';
        for (let i = blocks.length - 1, block; block = blocks[i]; i--) {
            if (block.sectionId == data.sectionId) {
                index.splice(i, 0, data.docId);
                blocks.splice(i, 0, data);
                return;
            }
        }
    },
    /**
     * @TODO add support for adding start/end
     * @param {Object} data
     * @param {Number|String} ref
     */
    insertBlock(data, ref) {
        const index = this.getIndex(), blocks = this.getBlocks(), blockIndex = index.indexOf(ref);
        if (data.xtype == 'view-block-default-block')
            data.xtype = 'view-course-edit-section-block-default-block';
        else if (data.xtype == 'view-playlist-block')
            data.xtype = 'view-course-edit-section-block-playlist-block';
        index.splice(blockIndex + 1, 0, data.docId);
        blocks.splice(blockIndex + 1, 0, data);
    },
    /**
     * @param {Number} blockId
     * @param {Number} refId
     * @param {String} position
     */
    reorderBlock(blockId, refId, position) {
        const index = this.getIndex();
        const blocks = this.getBlocks();
        const blockIndex = index.indexOf(blockId);
        const block = blocks[blockIndex];
        let refIndex;    // delete block from old position.
        // delete block from old position.
        index.splice(blockIndex, 1);
        blocks.splice(blockIndex, 1);
        refIndex = index.indexOf(refId);
        if (position == 'after')
            refIndex++;    // inser block into new position.
        // inser block into new position.
        index.splice(refIndex, 0, block.docId);
        blocks.splice(refIndex, 0, block);
    },
    /**
     * @param {Object} block
     * @param {Object} data
     * @return {undefined}
     */
    onBlockSave(block, data) {
        const index = this.getIndex(), position = index.indexOf(block.docId);
        index[position] = data.docId;
    },
    /**
     * removes all blocks with required sectionId
     * @param {Number} sectionId
     * @return {undefined}
     */
    deleteSection(sectionId) {
        const blocks = this.getBlocks(), index = this.getIndex();
        for (let i = blocks.length - 1, block; block = blocks[i]; i--) {
            if (block.sectionId == sectionId) {
                blocks.splice(i, 1);
                index.splice(i, 1);
            }
        }
    },
    /**
     * @param {Number} docId
     * @return {Object}
     */
    getBlockById(docId) {
        const index = this.getIndex().indexOf(docId);
        return this.getBlocks()[index];
    }
});