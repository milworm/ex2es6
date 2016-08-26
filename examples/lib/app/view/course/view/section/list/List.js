import 'app/view/course/base/section/List';
import 'app/view/course/view/section/list/Section';

/**
 * Represents section-list in course-viewer.
 */
Ext.define('CJ.view.course.view.section.list.List', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.base.section.List',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-view-section-list-list',
    /**
     * @param {Number} id
     * @return {Ext.Component}
     */
    createSection(id) {
        const section = this.getSectionById(id);
        let config;
        config = Ext.apply({}, section);
        config.blocks = [];
        config.sections = [];
        config.section = section;
        config.xtype = 'view-course-view-section-list-section';
        return Ext.factory(config);
    }
});