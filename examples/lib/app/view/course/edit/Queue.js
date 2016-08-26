/**
 * Class that helps us to gradually save a course in editing popup. It has
 * been developed because course could be very big, so we can't save the whole
 * package of data at once.
 * So, there is a limited set of operations that user can perform inside of a 
 * course editor:
 *  addBlock, deleteBlock, editBlock, reoderBlock, deleteSection, renameSection, reorderSection.
 */
Ext.define('CJ.view.course.edit.Queue', {
    /**
     * @property {Object} mixins
     */
    mixins: { observable: 'Ext.mixin.Observable' },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Array} operations
         */
        operations: [],
        /**
         * @cfg {Ext.Component} editor
         */
        editor: null,
        /**
         * @cfg {Boolean} busy
         */
        busy: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initConfig(config || {});
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateBusy(state) {
        this.fireEvent(state ? 'busy' : 'free', this);
    },
    /**
     * @return {Number}
     */
    generateId() {
        if (!this.lastId)
            this.lastId = 1;
        return this.lastId++;
    },
    /**
     * @return {Boolean}
     */
    isEmpty() {
        return this.getOperations().length == 0;
    },
    /**
     * @param {Function} request
     */
    add(request) {
        const editor = this.getEditor();
        if (!editor.getBlock())
            this.saveCourse({
                scope: editor,
                success: editor.onSaveCourseSuccess,
                failure: editor.onSaveCourseFailure
            });
        const operation = {
            id: this.generateId(),
            request
        };
        this.getOperations().push(operation);
        if (!this.getBusy())
            this.execute();
    },
    /**
     * executes first operation from queue
     * @return {undefined}
     */
    execute() {
        const operations = this.getOperations();
        if (operations.length == 0)
            return this.setBusy(false);
        this.setBusy(true);
        const operation = operations[0];
        let request = operation.request;
        if (Ext.isFunction(request))
            request = request.call(this);
        Ext.apply(request, {
            operationId: operation.id,
            stash: {
                scope: request.scope,
                success: request.success,
                failure: request.failure
            },
            scope: this,
            success: this.onOperationSuccess,
            failure: this.onOperationFailure
        });
        CJ.request(request);
    },
    /**
     * @param {Number} id
     * @return {Object}
     */
    getOperationById(id) {
        const operations = this.getOperations();
        for (let i = 0, operation; operation = operations[i]; i++) {
            if (operation.id == id)
                return operation;
        }
        return null;
    },
    /**
     * @param {Object} response
     * @param {Object} request
     */
    onOperationSuccess(response, request) {
        request = request.initialConfig;
        const operationId = request.operationId, operation = this.getOperationById(operationId), config = request.stash, success = config.success, scope = config.scope;
        Ext.Array.remove(this.getOperations(), operation);
        success.call(scope, response, request);
        this.execute();
    },
    /**
     * @return {undefined}
     */
    onOperationFailure() {
        this.setBusy(false);
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    saveCourse(config) {
        const editor = this.getEditor();
        let block = editor.getBlock();
        if (!block)
            block = editor.createBlock();
        if (!block.isPhantom())
            return;
        this.add(() => {
            const data = block.serialize();
            const sections = editor.getSections();
            let section;    // add first section.
            // add first section.
            section = Ext.applyIf({
                blocks: [],
                sections: [],
                blocksLength: 0,
                sectionsLength: 0
            }, sections[0]);
            data.sections = [section];
            return Ext.apply({
                rpc: {
                    model: 'Document',
                    method: 'save_documents'
                },
                params: { data: [data] },
                section: sections[0]
            }, config);
        });
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    updateCourse(config) {
        this.add(function () {
            const block = this.getEditor().getBlock();
            return Ext.apply({
                rpc: {
                    model: 'Document',
                    method: 'save_documents'
                },
                params: { data: [block.serialize()] }
            }, config);
        });
    },
    /**
     * @param {Object} section
     * @param {Object} config
     * @return {undefined}
     */
    saveSection(section, config) {
        this.add(function () {
            const data = Ext.apply({}, section);
            delete data.blocks;
            delete data.sections;
            delete data.blocksLength;
            delete data.sectionsLength;    // phantom section should be saved and placed in one request.
                                           // @TODO refactor after merging with 1.8-dev to CJ.BaseBlock.isPhantom
            // phantom section should be saved and placed in one request.
            // @TODO refactor after merging with 1.8-dev to CJ.BaseBlock.isPhantom
            if (/^temp_/.exec(data.docId))
                data.placeAfter = { containerId: this.getEditor().getCourseId() };
            return Ext.apply({
                rpc: {
                    model: 'Document',
                    method: 'save_documents'
                },
                params: { data: [data] },
                section
            }, config);
        });
    },
    /**
     * @param {Object} section
     * @param {Object} config
     * @return {undefined}
     */
    deleteSection(section, config) {
        this.add(function () {
            return Ext.apply({
                rpc: {
                    model: 'Document',
                    method: 'soft_delete',
                    id: section.docId
                },
                scope: this,
                success: this.onOperationSuccess,
                sectionId: section.docId
            }, config);
        });
    },
    /**
     * @param {Object} section
     * @param {Object} parent
     * @param {Object|String} refItem
     * @param {Object} config
     * @return {undefined}
     */
    reorderSection(section, parent, refItem, config) {
        this.add(function () {
            let model;
            let id;
            const ref = Ext.isObject(refItem) ? refItem.docId : refItem;
            if (parent) {
                model = 'Section';
                id = parent.docId;
            } else {
                model = 'Course';
                id = this.getEditor().getCourseId();
            }
            return Ext.apply({
                rpc: {
                    model,
                    method: 'place_after',
                    id
                },
                params: {
                    item: section.docId,
                    ref
                },
                section,
                parent,
                ref
            }, config);
        });
    },
    /**
     * @param {Object} section
     * @param {Object} block
     * @param {Object|String} ref
     */
    reorderBlock(section, block, ref, config) {
        this.add(() => {
            const sectionId = section.docId, blockId = block.docId;
            ref = Ext.isString(ref) ? ref : ref.docId;
            return Ext.apply({
                rpc: {
                    model: 'Section',
                    method: 'place_after',
                    id: sectionId
                },
                params: {
                    item: blockId,
                    ref
                },
                refId: ref,
                sectionId,
                blockId
            }, config);
        });
    },
    /**
     * @param {Object} data
     * @param {Object} config
     */
    saveBlock(data, config) {
        this.add(() => {
            const clone = Ext.apply({}, data), sectionId = clone.sectionId;
            delete clone.saving;
            delete clone.sectionId;
            if (!Ext.isNumber(clone.docId))
                clone.placeAfter = { containerId: sectionId };
            if (clone.xtype == 'view-course-edit-section-block-default-block')
                clone.xtype = 'view-block-default-block';
            else if (clone.xtype == 'view-course-edit-section-block-playlist-block')
                clone.xtype = 'view-playlist-block';
            return Ext.apply({
                rpc: {
                    model: 'Document',
                    method: 'save_documents'
                },
                params: { data: [clone] },
                block: data
            }, config);
        });
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @param {Object} config
     */
    editBlock(block, config) {
        this.saveBlock(block, config);
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @param {Object} section
     * @param {String|Number} ref
     * @param {Object} config
     */
    insertBlock(block, section, ref, config) {
        this.add(() => Ext.apply({
            rpc: {
                model: 'Section',
                method: 'place_after',
                id: section.docId
            },
            params: {
                item: block.docId,
                ref
            },
            section,
            block
        }, config));
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setOperations(null);
        this.setEditor(null);
        this.callParent(args);
    }
});