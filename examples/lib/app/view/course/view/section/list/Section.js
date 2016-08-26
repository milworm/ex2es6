import 'app/view/course/base/section/Section';

Ext.define('CJ.view.course.view.section.list.Section', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.base.section.Section',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-view-section-list-section',
    /**
     * @param {Object} config
     * @return {CJ.view.block.BaseBlock}
     */
    createBlock(config) {
        config.showCompleteness = true;
        config = Ext.factory(config);
        config.isCourseSectionBlock = true;
        return config;
    }
});