import 'app/view/course/view/section/tree/Tree';

Ext.define('CJ.view.phone.course.view.section.tree.Tree', {
    extend: 'CJ.view.course.view.section.tree.Tree',
    alias: 'widget.view-phone-course-view-section-tree-tree',
    config: {
        /**
         * @cfg {Ext.XTemplate} leafTpl
         */
        sectionsTpl: Ext.create('Ext.XTemplate', '<div class=\'d-sections\'>', '<tpl for=\'sections\'>', '<div class=\'d-item\' data-id=\'{docId}\'>', '<div class=\'d-title d-section-title\'>', '<div class=\'d-icon\'></div>', '<span class=\'d-text\'>{title}</span>', '</div>', '{[ parent.scope.getSectionsTpl().apply({ sections: values.sections, scope: parent.scope }) ]}', '</div>', '</tpl>', '</div>', { compiled: true }),
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-content d-scroll\'>', '{[ values.scope.getSectionsTpl().apply({ sections: values.sections, scope: values.scope }) ]}', '</div>', '<div class=\'d-footer\'>', '<div class=\'d-text\'>{back}</div>', '<div class=\'d-triangle-up\'></div>', '</div>', { compiled: true })
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onFooterTap, this, { delegate: '.d-footer' });
    },
    /**
     * @return {Object} data
     */
    applyData(data) {
        data = this.callParent(args);
        return Ext.apply(data, { back: CJ.t('view-phone-course-view-section-tree-tree-back') });
    },
    /**
     * @return {undefined}
     */
    onSectionNameTap() {
        this.callParent(args);
        this.close();
    },
    /**
     * @return {undefined}
     */
    onFooterTap(e) {
        e.stopEvent();
        this.close();
    },
    /**
     * @return {undefined}
     */
    close() {
        this.element.addCls('d-hiding');
        Ext.defer(function () {
            this.destroy();
        }, 750, this);
    }
});