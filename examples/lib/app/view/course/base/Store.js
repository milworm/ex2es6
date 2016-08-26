/**
 * Defines a component that acts as a layer between the paging and 
 * section-list, which allows us to get blocks for course without knowing
 * where these blocks are located (in memory or in the server-side)
 */
Ext.define('CJ.view.course.base.Store', {
    /**
	 * @property {Object} config
	 */
    config: {
        /**
		 * @cfg {Array} blocks
		 */
        blocks: [],
        /**
		 * @cfg {Object} index
		 */
        index: []
    },
    /**
	 * @param {Object} config
	 */
    constructor(config) {
        this.initConfig(config || {});
        this.callParent(args);
    },
    /**
	 * @param {Array} blocks
	 * @return {undefined}
	 */
    updateBlocks(blocks) {
        const index = [];
        for (let i = 0, block; block = blocks[i]; i++)
            index.push(block.docId);
        this.setIndex(index);
    },
    /**
	 * @param {Object} config
	 * @param {Number} config.refId
	 * @param {Number} config.count
	 * @param {Number} config.success
	 * @param {Number} config.scope
	 */
    prev(config) {
        const refId = config.refId;
        const count = config.count;
        const success = config.success;
        const scope = config.scope;
        let index = this.getIndex().indexOf(refId);
        let startIndex;
        if (index == -1)
            index = 0;
        startIndex = index - count;
        if (startIndex < 0)
            startIndex = 0;
        success.call(scope, this.getBlocks().slice(startIndex, index));
    },
    /**
	 * @param {Object} config
	 * @param {Number} config.refId
	 * @param {Number} config.count
	 * @param {Number} config.success
	 * @param {Number} config.scope
	 */
    next(config) {
        const refId = config.refId;
        const count = config.count;
        const success = config.success;
        const scope = config.scope;
        let index = this.getIndex().indexOf(refId);
        if (index == -1)
            index = 0;
        else
            index++;    // because we need only blocks after refId-item
        // because we need only blocks after refId-item
        success.call(scope, this.getBlocks().slice(index, index + count));
    },
    /**
	 * method fetches:
	 * pageCount-blocks before required section;
	 * (count-pageCount)-blocks for required section;
	 * 
	 * @param {Number} sectionId
	 * @param {Object} config
	 * @param {Object} config.scope
	 * @param {Number} config.pageCount Number of blocks per page.
	 * @param {Function} config.success
	 * @return {undefined}
	 */
    middle(sectionId, config) {
        const count = config.count;
        const scope = config.scope;
        const success = config.success;
        const pageCount = config.pageCount;
        const blocks = this.getBlocks();
        let result = [];
        for (let i = 0, block; block = blocks[i]; i++) {
            if (block.sectionId != sectionId)
                continue;
            let startIndex = i - pageCount;
            if (startIndex < 0)
                startIndex = 0;
            result = blocks.slice(startIndex, startIndex + count);
            return success.call(scope, result, sectionId);
        }
    },
    /**
	 * @param {CJ.view.block.BaseBlock} block
	 * @return {undefined}
	 */
    onBlockDeleted(block) {
        const index = this.getIndex(), blocks = this.getBlocks(), position = index.indexOf(block.getDocId());
        index.splice(position, 1);
        blocks.splice(position, 1);
    }
});