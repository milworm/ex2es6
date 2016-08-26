import 'app/view/course/edit/menu/Menu';
import 'app/view/tablet/course/edit/section/tree/Tree';

Ext.define('CJ.view.tablet.course.edit.menu.Menu', {
    extend: 'CJ.view.course.edit.menu.Menu',
    alias: 'widget.view-tablet-course-edit-menu-menu',
    config: {
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-side-menu-inner\'>', '<div class=\'d-header-item\'>', '<div class=\'d-image-placeholder\'></div>', '<div class=\'d-title\' data-ref=\'course-title\'></div>', '</div>', '<div class=\'d-description-item\'></div>', '<div class=\'d-sections-item d-scroll\'></div>', '<div class=\'d-footer-item\'>', '<div class=\'d-saving-text\'>{saving}</div>', '<div class=\'d-saved-text\'>{saved}</div>', '<div class=\'d-button d-publish\'>{publish}</div>', '<div class=\'d-button d-close\'>{close}</div>', '</div>', '</div>', { compiled: true })
    },
    /**
     * @param {Object} config
     * @return {CJ.view.course.edit.SectionTree}
     */
    applySectionTree(config) {
        if (!config)
            return false;
        this.getData();
        Ext.apply(config, {
            xtype: 'view-tablet-course-edit-section-tree-tree',
            renderTo: this.element.dom.querySelector('.d-sections-item'),
            sections: this.getSections(),
            editor: this.getEditor()
        });
        return Ext.factory(config);
    },
    /**
     * @TODO need to clarify specs how icon-field should work on tablets.
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyIconField(config) {
        this.getData();
        if (!config)
            return;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-form-image-field',
            iconCfg: this.getValues().iconCfg,
            renderTo: this.element.dom.querySelector('.d-image-placeholder'),
            listeners: {
                scope: this,
                uploadsuccess: this.onIconUploadSuccess
            }
        }, config));
    }
});