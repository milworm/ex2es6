import 'Ext/Component';

/**
 * Defines a tree-component that allows user to view sections in a tree form.
 */
Ext.define('CJ.view.course.view.section.tree.Tree', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-view-section-tree-tree',
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
         *                          items: [block, block]
         *                       }]
         */
        sections: [],
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<tpl if=\'values.root\'>', '<div class=\'d-title\'>{title}</div>', '</tpl>', '<div class=\'d-sections\'>', '<tpl for=\'sections\'>', '<div class=\'d-item\' data-id=\'{docId}\'>', '<div class=\'d-title d-section-title\'>', '<tpl if=\'parent.root == false\'>', '<div class=\'d-icon\'></div>', '</tpl>', '<span class=\'d-text\'>{title}</span>', '</div>', '{[ parent.scope.getTpl().apply({ root: false, sections: values.sections, scope: parent.scope }) ]}', '</div>', '</tpl>', '</div>', { compiled: true }),
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {CJ.view.course.edit.Editor} editor
         */
        editor: null
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onSectionNameTap, this, { delegate: '.d-section-title' });
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onSectionNameTap(e) {
        this.getEditor().onSectionNameTap(CJ.getNodeData(e.getTarget('.d-item'), 'id'));
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
     * @return {Object}
     */
    applyData(data) {
        Ext.apply(data, {
            scope: this,
            root: true,
            sections: this.getSections(),
            title: CJ.t('view-course-view-section-tree-tree-title')
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
     * @return {undefined}
     */
    destroy() {
        this.destroyElements();
        this.callParent(args);
    },
    /**
     * destroys all create ext-elements inside of current component.
     * @return {undefined}
     */
    destroyElements() {
        const nodes = this.element.dom.querySelectorAll('[id]');
        Ext.each(nodes, node => {
            Ext.removeNode(node);
        });
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
    }
});