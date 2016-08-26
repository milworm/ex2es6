import 'app/view/course/view/section/list/List';

/**
 * Defines a section list for tablet version of course-editor.
 */
Ext.define('CJ.view.phone.course.view.section.list.List', {
    /**
	 * @property {String} extend
	 */
    extend: 'CJ.view.course.view.section.list.List',
    /**
	 * @property {String} alias
	 */
    alias: 'widget.view-phone-course-view-section-list-list',
    /**
	 * @property {Object} config
	 */
    config: {
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-section-list d-multicolumn'
    },
    /**
	 * @return {Ext.Element}
	 */
    getScrollEl() {
        return this.getEditor().innerElement;
    },
    /**
     * @return {undefined}
     */
    displayStatics(state) {
        this.getEditor().getMenu()[state ? 'show' : 'hide']();
    }
});