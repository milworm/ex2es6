/**
 * Defines a singleton class that contains some methods that are used in 
 * different classes inside of course-module.
 */
Ext.define('CJ.view.course.Helper', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.CourseHelper',
    /**
     * @property {String} singleton
     */
    singleton: true,
    /**
     * @param {Array} sections
     * @param {Function} callback
     * @param {Object} scope
     */
    eachSection(sections, callback, scope, parentSection) {
        for (let i = 0, section; section = sections[i]; i++) {
            if (callback.call(scope, section, parentSection, sections) === false)
                return false;
            if (section.sections.length) {
                if (this.eachSection(section.sections, callback, scope, section) === false)
                    return false;
            }
        }
    },
    /**
     * @return {Array}
     */
    getDefaultSections() {
        return [this.getDefaultSectionConfig()];
    },
    /**
     * @return {Object}
     */
    getDefaultSectionConfig() {
        const config = {
            docId: CJ.Guid.generatePhantomId(),
            title: CJ.t('view-course-edit-section-tree-untitled-section', true),
            nodeCls: 'Section',
            sections: [],
            blocks: [],
            blocksLength: 0,
            sectionsLength: 0
        };
        config.fullTitle = [config.title];
        return config;
    },
    /**
     * @return {CJ.view.course.edit.Editor}
     */
    getOpenedEditor() {
        const editors = Ext.ComponentQuery.query('view-course-base-editor');
        if (editors.length > 0)
            return editors[0];
        return null;
    },
    /**
     * @param {Function} callback
     * @param {Object} scope
     */
    closeOpenedEditor(callback, scope) {
        const editor = this.getOpenedEditor();
        let config;
        if (!editor)
            return Ext.callback(callback, scope);
        config = editor.getPopup().getCloseConfirm();
        if (!config)
            return Ext.callback(callback, scope);
        CJ.confirm(config.title, config.message, result => {
            Ext.callback(config.fn, config.scope, [result]);
            if (result == 'yes')
                Ext.callback(callback, scope);
        });
    },
    /**
     * each time when we open a block to edit block itself or its options, we need to call this method to save
     * sectionId of current block in CourseEditor, so we know which section needs to be updated.
     * @param {CJ.core.view.BaseBlock} block
     * @return {undefined}
     */
    onActivated(block) {
        if (block.isPhantom())
            return;
        this.getOpenedEditor().setActiveSectionId(block.sectionId);
    },
    /**
     * @param {String} docId
     * @return {CJ.core.view.BaseBlock}
     */
    byDocId(docId) {
        const selector = CJ.tpl('[docid=\'{0}\']', docId), node = this.getOpenedEditor().element.dom.querySelector(selector);
        if (node)
            return Ext.getCmp(node.id);
    },
    getOpenedCourseId() {
        return this.getOpenedEditor().getBlock().getDocId();
    }
});