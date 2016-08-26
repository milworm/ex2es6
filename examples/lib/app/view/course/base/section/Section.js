import 'Ext/Component';

Ext.define('CJ.view.course.base.section.Section', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-base-section-section',
    /**
     * @property {Boolean} isSection
     */
    isSection: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-section',
        /**
         * @cfg {Boolean} integrityEnabled
         */
        integrityEnabled: !Ext.os.is.Phone,
        // phones has one column-layout, so we don't need to use integrity
        /**
         * @cfg {Number} blocksLength
         */
        blocksLength: 0,
        /**
         * @cfg {String} title
         */
        title: null,
        /**
         * @cfg {Number} docId
         */
        docId: null,
        /**
         * @cfg {Array} blocks
         */
        blocks: [],
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Object} section
         */
        section: null,
        /**
         * @cfg {Ext.Template} sectionTpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-header\'>', '<div class=\'d-title d-section-title\'>{title}</div>', '</div>', '<div class=\'d-blocks\'></div>', { compiled: true })
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.setSection(config.section);
        delete config.section;
        this.callParent(args);
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        return Ext.apply(data, {
            docId: this.getDocId(),
            title: this.generateTitle()
        });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {Number} docId
     * @return {undefined}
     */
    updateDocId(docId) {
        this.element.set({ 'data-id': docId });
    },
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    updateBlocks(newBlocks, oldBlocks) {
        this.getData();
        if (newBlocks)
            this.appendBlocks(newBlocks);
    },
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    appendBlocks(blocks) {
        blocks = Ext.isArray(blocks) ? blocks : [blocks];
        const items = this.getItems(), renderTree = document.createDocumentFragment();
        for (let i = 0, block; block = blocks[i]; i++) {
            block = this.createBlock(block);
            block.renderTo(renderTree);
            block.setRendered(true);
            items.push(block);
        }
        this.getBlocksNode().appendChild(renderTree);
    },
    /**
     * @param {Array} blocks
     * @return {undefined}
     */
    prependBlocks(blocks) {
        blocks = Ext.isArray(blocks) ? blocks : [blocks];
        let items = [];
        const renderTree = document.createDocumentFragment();
        const blocksNode = this.getBlocksNode();
        for (let i = 0, block; block = blocks[i]; i++) {
            block = this.createBlock(block);
            block.renderTo(renderTree);
            items.push(block);
        }
        blocksNode.insertBefore(renderTree, blocksNode.firstChild);
        items = items.concat(this.getItems());
        this.setItems(items);
    },
    /**
     * @param {Number} columns
     * @return {undefined}
     */
    calculateIntegrityBlocksCount(columns) {
        const visibleCount = this.getItems().length, blocksCount = this.getBlocksLength();
        return (blocksCount - visibleCount) % columns;
    },
    /**
     * @return {Number} true in case when current section is fullfilled with blocks.
     */
    isFilled() {
        return this.getItems().length == this.getBlocksLength();
    },
    /**
     * @return {HTMLElement}
     */
    getBlocksNode() {
        if (this.blocksNode)
            return this.blocksNode;
        return this.blocksNode = this.element.dom.querySelector('.d-blocks');
    },
    /**
     * @return {Number}
     */
    getFirstBlockId() {
        const item = this.getItems()[0];
        if (item.getDocId)
            return item.getDocId();
        return item.config.docId;
    },
    /**
     * @return {Number}
     */
    getLastBlockId() {
        const items = this.getItems(), item = items[items.length - 1];
        if (item.getDocId)
            return item.getDocId();
        return item.config.docId;
    },
    /**
     * Adds additional phantom elements in order to maintain section's integrity
     * according to columnsCount-param.
     * @param {Number} columns
     */
    maintainIntegrity(columns) {
        if (!this.getIntegrityEnabled())
            return;
        this.renderIntegrityBlocks(this.calculateIntegrityBlocksCount(columns));
    },
    /**
     * @param {Number} count
     */
    renderIntegrityBlocks(count) {
        if (!this.getIntegrityEnabled())
            return;
        if (count == 0)
            return;
        this.removeIntegrityBlocks();
        const html = [], renderTree = document.createDocumentFragment(), blocksNode = this.getBlocksNode();
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'd-section-integrity-block d-section-block';
            renderTree.appendChild(div);
        }
        blocksNode.insertBefore(renderTree, blocksNode.firstChild);
    },
    /**
     * @return {undefined}
     */
    removeIntegrityBlocks() {
        if (!this.getIntegrityEnabled())
            return;
        const integrityBlocks = this.getIntegrityBlocks();
        while (integrityBlocks.length) {
            Ext.removeNode(integrityBlocks.pop());
        }
    },
    /**
     * @return {Array}
     */
    getIntegrityBlocks() {
        return Ext.toArray(this.element.dom.querySelectorAll('.d-section-integrity-block'));
    },
    /**
     * maintains list integrity after first-items in list are removed.
     * @param {Number} oldCount
     * @param {Number} columns
     * @return {undefined}
     */
    onFirstItemsRemoved(oldCount, columns) {
        if (!this.getIntegrityEnabled())
            return;
        this.removeIntegrityBlocks();
        const newCount = this.getItems().length;
        let oldLastRowBlocksCount = oldCount % columns;
        let newLastRowBlocksCount = newCount % columns;
        let integrityBlocksCount;
        let diff;
        if (oldLastRowBlocksCount == 0)
            oldLastRowBlocksCount = columns;
        if (newLastRowBlocksCount == 0)
            newLastRowBlocksCount = columns;
        diff = oldLastRowBlocksCount - newLastRowBlocksCount;
        if (diff == 0)
            return;    // need to add integrity-blocks
        // need to add integrity-blocks
        if (newLastRowBlocksCount < oldLastRowBlocksCount)
            integrityBlocksCount = diff;
        else
            integrityBlocksCount = columns - newLastRowBlocksCount + oldLastRowBlocksCount;
        this.renderIntegrityBlocks(integrityBlocksCount);
    },
    /**
     * @param {Number} id
     */
    getBlockById(id) {
        const data = this.getSection(), blocks = data.blocks;
        for (let i = 0, block; block = blocks[i]; i++) {
            if (block.docId == id)
                return block;
        }
        return null;
    },
    /**
     * @param {Object} config
     * @return {CJ.view.block.BaseBlock}
     */
    createBlock(config) {
        config = Ext.factory(config);
        config.isCourseSectionBlock = true;
        return config;
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     */
    onBlockDeleted(block) {
        this.removeBlock(block);
        this.removeBlockDataById(block.getDocId());
    },
    /**
     * @param {Ext.Component} block
     */
    removeBlock(block) {
        const items = this.getItems(), docId = block.getDocId();
        for (let i = 0, item; item = items[i]; i++) {
            const tempId = item.isInstance ? item.getDocId() : item.docId;
            if (tempId == docId) {
                this.setBlocksLength(this.getBlocksLength() - 1);
                this.getSection().blocksLength--;
                items.splice(i, 1);
                return;
            }
        }
    },
    /**
     * removes block's data from blocks-array of a section.
     * @param {Number} id
     * @return {undefined}
     */
    removeBlockDataById(id) {
        const section = this.getSection(), blocks = section.blocks;
        for (let i = 0, block; block = blocks[i]; i++) {
            if (block.docId == id) {
                blocks.splice(i, 1);
                section.blocksLength--;
                break;
            }
        }
    },
    /**
     * @return {String}
     */
    generateTitle() {
        return this.getSection().fullTitle.join(' > ');
    },
    /**
     * @param {String} docId
     * @return {CJ.view.block.BaseBlock}
     */
    getBlockComponentById(docId) {
        const items = this.getItems();
        for (let i = 0, item; item = items[i]; i++)
            if (item.getDocId() == docId)
                return item;
    },
    /**
     * removes block's data from blocks-array of a section.
     * @param {Object} data
     * @return {undefined}
     */
    removeBlockData(data) {
        const section = this.getSection(), blocks = section.blocks;
        for (let i = 0, block; block = blocks[i]; i++) {
            if (block == data) {
                blocks.splice(i, 1);
                section.blocksLength--;
                break;
            }
        }
    },
    /**
     * adds block's data to required position depending on ref and position 
     & params
     * @param {Object} data
     * @return {undefined}
     */
    insertBlockData(data, refId, position) {
        const section = this.getSection(), blocks = section.blocks;
        for (let i = 0, block; block = blocks[i]; i++) {
            if (block.docId == refId) {
                if (position == 'after')
                    i++;
                blocks.splice(i, 0, data);
                section.blocksLength++;
                break;
            }
        }
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.removeIntegrityBlocks();
        delete this.blocksNode;
        Ext.destroy(this.getItems());
        this.callParent(args);
    }
});