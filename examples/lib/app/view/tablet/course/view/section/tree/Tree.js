import 'app/view/course/view/section/tree/Tree';

Ext.define('CJ.view.tablet.course.view.section.tree.Tree', {
    extend: 'CJ.view.course.view.section.tree.Tree',
    alias: 'widget.view-tablet-course-view-section-tree-tree',
    /**
     * @return {undefined}
     */
    onSectionNameTap(e) {
        const editor = this.getEditor(), sectionId = CJ.getNodeData(e.getTarget('.d-item'), 'id');
        editor.hideMask(() => {
            editor.onSectionNameTap(sectionId);
        });
    }
});