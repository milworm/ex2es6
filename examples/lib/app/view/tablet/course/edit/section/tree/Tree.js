import 'app/view/course/edit/section/tree/Tree';

Ext.define('CJ.view.tablet.course.edit.section.tree.Tree', {
    extend: 'CJ.view.course.edit.section.tree.Tree',
    alias: 'widget.view-tablet-course-edit-section-tree-tree',
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