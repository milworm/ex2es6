import 'app/view/course/view/menu/Menu';
import 'app/view/phone/course/view/section/tree/Tree';
import 'app/view/phone/course/view/menu/DescriptionField';

Ext.define('CJ.view.phone.course.view.menu.Menu', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.view.menu.Menu',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-phone-course-view-menu-menu',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Ext.Component} sectionTree
         */
        sectionTree: null,
        /**
         * @cfg {Object} descriptionField
         */
        descriptionField: { xtype: 'view-phone-course-view-menu-description-field' }
    }
});