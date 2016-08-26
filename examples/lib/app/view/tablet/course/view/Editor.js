import 'app/view/course/view/Editor';
import 'app/view/tablet/course/edit/section/tree/Tree';
import 'app/view/tablet/course/view/section/tree/Tree';

Ext.define('CJ.view.tablet.course.view.Editor', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.view.Editor',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-tablet-course-view-editor',
    /**
     * @property {Object} mixins
     */
    mixins: { tabletEditor: 'CJ.view.tablet.course.base.Editor' },
    /**
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
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    updateBlock(block) {
        this.callParent(args);
        if (block)
            this.element.dom.querySelector('.d-course-title').innerHTML = block.getTitle();
    }
});