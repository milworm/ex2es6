import 'app/view/course/edit/Editor';
import 'app/view/tablet/course/edit/menu/Menu';

Ext.define('CJ.view.tablet.course.edit.Editor', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.edit.Editor',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-tablet-course-edit-editor',
    /**
     * @property {Object} mixins
     */
    mixins: { tabletEditor: 'CJ.view.tablet.course.base.Editor' },
    /**
     * @TODO it's duplicated in ../view/Editor
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            classList: ['x-unsized'],
            html: [
                '<div class=\'d-mask\'></div>',
                '<div class=\'d-header\'>',
                '<div class=\'d-open-menu-button\'></div>',
                '<div class=\'d-course-title\'></div>',
                '<div class=\'d-close\'>',
                CJ.t('view-tablet-course-edit-editor-close-button'),
                '</div>',
                '</div>'
            ].join('')
        };
    },
    /**
     * @return {undefined}
     */
    onCourseUpdate() {
        this.callParent(args);
        const title = this.getMenu().getTitleField().getRealValue();
        this.element.dom.querySelector('.d-course-title').innerHTML = title;
    }
});