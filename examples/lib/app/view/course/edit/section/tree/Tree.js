import 'Ext/Component';
import 'app/view/course/edit/section/tree/DDPlugin';
import 'app/view/course/edit/section/tree/NewField';
import 'app/view/course/edit/section/tree/TitleField';

/**
 * Defines a tree-component that allows user to create new section/chapter in 
 * course and change their order and/or make subsections via drag-and-drop.
 */
Ext.define('CJ.view.course.edit.section.tree.Tree', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-tree-tree',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-section-tree',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-section-tree-inner',
        /**
         * @cfg {Array} sections List of sections:
         *                       [{
         *                          id: 1, 
         *                          title: "Section1", 
         *                          blocks: [block, block],
         *                          sections: []
         *                       }]
         */
        sections: [],
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-sections\'>', '<tpl if=\'values.root\'>', '<div class=\'d-ghost d-item\'></div>', '</tpl>', '<tpl for=\'sections\'>', '<div class=\'d-item\' data-id=\'{docId}\'>', '<div class=\'d-overlay\'></div>', '<div class=\'d-title d-section-title\'>', '<div class=\'d-icon d-draghandle\'></div>', '<span class=\'d-text\'>{title}</span>', '<span class=\'d-trigger d-rename\'></span>', '</div>', '{[ parent.scope.getTpl().apply({ root: false, sections: values.sections, scope: parent.scope }) ]}', '</div>', '</tpl>', '<div class=\'d-item dd-helper-item {[values.root ? "d-dd-root-helper-item" : ""]}\' data-id=\'dd-helper\'>', '<div class=\'d-title d-section-title dd-helper-section-title\'></div>', '</div>', '</div>', '<tpl if=\'values.root\'>', '<div class=\'d-bottom-container\'></div>', '</tpl>', { compiled: true }),
        /**
         * @cfg {Ext.Template} sectionTpl
         */
        sectionTpl: Ext.create('Ext.Template', '<div class=\'d-item d-new\' data-id=\'{docId}\'>', '<div class=\'d-overlay\'></div>', '<div class=\'d-title d-section-title\'>', '<div class=\'d-icon d-draghandle\'></div>', '<span class=\'d-text\'>{title}</span>', '<span class=\'d-trigger d-rename\'></span>', '</div>', '<div class=\'d-sections\'>', '<div class=\'d-item dd-helper-item\' data-id=\'dd-helper\'>', '<div class=\'d-title d-section-title dd-helper-section-title\'></div>', '</div>', '</div>', '</div>', { compiled: true }),
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.Component} newSectionField
         */
        newSectionField: {},
        /**
         * @cfg {CJ.view.course.edit.Editor} editor
         */
        editor: null,
        /**
         * @cfg {Array} plugins
         */
        plugins: [{ xclass: 'CJ.view.course.edit.section.tree.DDPlugin' }]
    },
    constructor() {
        this.callParent(args);
        this.element.on('singletap', this.onSectionNameTap, this, { delegate: '.d-section-title .d-text' });
        this.element.on('tap', this.onRenameTriggerTap, this, { delegate: '.d-section-title .d-trigger.d-rename' });
        if (Ext.os.is.Desktop) {
            this.element.on('doubletap', this.onSectionNameDoubleTap, this, { delegate: '.d-section-title .d-text' });
        }
    },
    applyPlugins() {
        this.getData();
        return this.callParent(args);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onSectionNameTap(e) {
        const sectionId = CJ.getNodeData(e.getTarget('.d-item'), 'id');
        this.getEditor().onSectionNameTap(sectionId);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onSectionNameDoubleTap(e) {
        this.initTitleEditing(e.getTarget('.d-item'));
    },
    /**
     * @param {Ext.Evented} e
     */
    onRenameTriggerTap(e) {
        this.initTitleEditing(e.getTarget('.d-item'));
    },
    /**
     * Initializes editing of section title.
     * @param {DomEl} itemDomEl
     */
    initTitleEditing(itemDomEl) {
        const sectionId = CJ.getNodeData(itemDomEl, 'id'), element = itemDomEl.querySelector('.d-title');
        Ext.factory({
            xtype: 'view-course-edit-section-tree-title-field',
            section: this.getSectionById(sectionId),
            element: Ext.get(element),
            listeners: {
                scope: this,
                change: this.onSectionTitleEdit
            }
        });
    },
    /**
     * @param {Ext.Component} field
     * @param {Number} sectionId
     * @param {Number} title
     * @return {undefined}
     */
    onSectionTitleEdit(field, sectionId, title) {
        this.getEditor().onSectionRename(sectionId, title);
    },
    /**
     * @return {Object}
     */
    applyNewSectionField(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-course-edit-section-tree-new-field',
            renderTo: this.element.dom.querySelector('.d-bottom-container'),
            listeners: {
                scope: this,
                change: this.onSectionFieldChange
            }
        }, config));
    },
    /**
     * @param {CJ.view.course.edit.NewSectionField} newField
     * @param {CJ.view.course.edit.NewSectionField} oldField
     * @return {undefined}
     */
    updateNewSectionField(newField, oldField) {
        if (oldField)
            oldField.destroy();
    },
    /**
     * @param {CJ.view.course.edit.NewSectionField} field
     * @param {String} value
     */
    onSectionFieldChange(field, value) {
        this.getEditor().onSectionAdd(value);
    },
    /**
     * @param {Obect} section
     */
    addSection(section) {
        this.getSections().push(section);
        const listNode = this.element.dom.querySelector('.d-sections');
        const html = this.getSectionTpl().apply(section);
        let template;
        let node;
        if (CJ.Utils.supportsTemplate()) {
            template = document.createElement('template');
            template.innerHTML = html;
            node = template.content.firstChild;
            listNode.insertBefore(template.content, listNode.lastChild);
        } else {
            template = document.createElement('div');
            template.innerHTML = html;
            node = template.firstChild;
            listNode.insertBefore(node, listNode.lastChild);
        }
        Ext.defer(() => {
            node.classList.remove('d-new');
        }, 500, this);
        this.fireEvent('nodecreated', node.querySelector('.d-title'));
    },
    /**
     * @param {Number} sectionId
     * @return {HTMLElement}
     */
    getSectionElById(sectionId) {
        return this.element.down(CJ.tpl('.d-item[data-id=\'{0}\']', sectionId));
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    deleteSection(data) {
        const sectionId = data.docId, sections = this.getSections();
        this.getSectionElById(sectionId).destroy();
        CJ.CourseHelper.eachSection(sections, (section, parentSection, sections) => {
            if (section.docId != sectionId)
                return;
            Ext.Array.remove(sections, section);
            return false;
        });
    },
    /**
     * @param {Number} sectionId
     * @param {String} title
     */
    renameSection(sectionId, title) {
        const section = this.getSectionById(sectionId), sectionEl = this.getSectionElById(sectionId);
        section.title = title;
        sectionEl.dom.querySelector('.d-text').innerHTML = title;
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        Ext.apply(data, {
            scope: this,
            root: true,
            sections: this.getSections()
        });
        return data;
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        let html = '';
        if (data)
            html = this.getTpl().apply(data);
        this.element.setHtml(html);
    },
    /**
     * makes rpc call to save changed section's position in section-tree.
     * @param {Object} section
     * @param {Object} parentSection
     * @param {Object|String} refItem Previous section or "end", "before"
     * @return {undefined}
     */
    saveSectionPosition(section, parentSection, refItem) {
        this.getEditor().onSectionOrderChange(section, parentSection, refItem, this.getSections());
    },
    /**
     * @param {String} tempId
     * @param {Object} data
     * @return {undefined}
     */
    onSectionSave(tempId, data) {
        this.getSectionById(tempId).docId = data.docId;
        this.getSectionElById(tempId).set({ 'data-id': data.docId });
    },
    /**
     * @param {Number} id
     */
    getSectionById(id) {
        let item;
        CJ.CourseHelper.eachSection(this.getSections(), section => {
            if (section.docId == id) {
                item = section;
                return false;
            }
        });
        return item;
    },
    /**
     * @param {Number} sectionId
     * @return {Object}
     */
    getParentSectionById(sectionId) {
        const selector = CJ.tpl('[data-id=\'{0}\']', sectionId), parentEl = this.element.down(selector).up('[data-id]');
        if (!parentEl)
            return null;
        return this.getSectionById(CJ.getNodeData(parentEl.dom, 'id'));
    },
    /**
     * @param {Object} section
     * @param {Number} parentSectionId
     * @return {undefined}
     */
    removeSectionFromParent(section, parentSectionId) {
        let sections;
        if (parentSectionId)
            sections = this.getSectionById(parentSectionId).sections;
        else
            sections = this.getSections();
        Ext.Array.remove(sections, section);
    },
    /**
     * destroys all create ext-elements inside of current component.
     * @return {undefined}
     */
    destroyElements(nodes) {
        var nodes = this.element.dom.querySelectorAll('[id]');
        Ext.each(nodes, node => {
            Ext.removeNode(node);
        });
    },
    /**
     * @param {Ext.Element} sectionEl
     * @return {Number} Section's level.
     */
    getSectionLevel(sectionEl) {
        let count = 1;
        while (sectionEl = sectionEl.up('.d-item'))
            count++;
        return count;
    },
    /**
     * @param {Ext.Element} sectionEl
     * @return {Number} Number how much levels does this section contain.
     */
    getSectionLevels(sectionEl) {
        let levels = 0;
        sectionEl.select('.d-item').each(el => {
            let count = 0;
            while (sectionEl != el) {
                el = el.up('.d-item');
                count++;
            }
            if (count > levels)
                levels = count;
        });
        return levels;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.destroyElements();
        this.callParent(args);
    }
});