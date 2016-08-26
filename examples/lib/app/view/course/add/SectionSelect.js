import 'Ext/Component';

Ext.define('CJ.view.course.add.SectionSelect', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-add-section-select',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-course-add-section-select',
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<tpl for="sections">', '<div class="d-section-item" data-section-id="{docId}">', '<div class="d-title">{title}</div>', '<tpl if="values.sections.length">', '{[ parent.scope.getTpl().apply({ scope: parent.scope, sections: values.sections }) ]}', '</tpl>', '</div>', '</tpl>'),
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Array} sections
         */
        sections: []
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Array} sections
     */
    updateSections(sections) {
        this.element.setHtml(this.getTpl().apply({
            scope: this,
            sections
        }));
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        const sectionId = this.getSectionIdFromEvent(e);
        if (!sectionId)
            return;
        this.fireEvent('select', sectionId);
    },
    /**
     * @param {Ext.Evented} e
     * @return {String}
     */
    getSectionIdFromEvent(e) {
        const node = e.getTarget('.d-section-item');
        if (!node)
            return;
        return CJ.getNodeData(node, 'sectionId');
    }
});