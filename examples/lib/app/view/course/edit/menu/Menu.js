import 'Ext/Component';
import 'app/view/course/edit/menu/DescriptionField';
import 'app/view/course/edit/section/tree/Tree';

Ext.define('CJ.view.course.edit.menu.Menu', {
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-menu-menu',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-side-menu',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-side-menu-inner',
        /**
         * @cfg {CJ.core.view.form.Icon} iconField
         */
        iconField: {},
        /**
         * @cfg {CJ.view.course.edit.SectionTree} sectionTree
         */
        sectionTree: {},
        /**
         * @cfg {CJ.view.course.edit.DescriptionField} descriptionField
         */
        descriptionField: {},
        /**
         * @cfg {CJ.core.view.form.InlineField} titleField
         */
        titleField: {},
        /**
         * @cfg {Object} values
         * @cfg {String} values.icon
         * @cfg {String} values.title
         * @cfg {String} values.description
         */
        values: {},
        /**
         * @cfg {Array} sections
         */
        sections: null,
        /**
         * @cfg {CJ.view.course.edit.Editor} editor
         */
        editor: null,
        /**
         * @cfg {Boolean} saving
         */
        saving: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-side-menu-inner\'>', '<div class=\'d-header-item\'>', '<div class=\'d-icon-placeholder\'></div>', '<div class=\'d-title\' data-ref=\'course-title\'></div>', '</div>', '<div class=\'d-description-item\'></div>', '<div class=\'d-sections-item d-scroll\'></div>', '<div class=\'d-footer-item\'>', '<div class=\'d-saving-text\'>{saving}</div>', '<div class=\'d-saved-text\'>{saved}</div>', '<div class=\'d-button d-publish\'>{publish}</div>', '<div class=\'d-button d-close\'>{close}</div>', '</div>', '</div>', { compiled: true })
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyDescriptionField(config) {
        this.getData();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-course-edit-menu-description-field',
            renderTo: this.element.dom.querySelector('.d-description-item'),
            value: this.getValues().description,
            editing: false,
            modern: false,
            // in order to allow text-select.
            listeners: {
                scope: this,
                change: this.onDescriptionFieldChange
            }
        }, config));
    },
    /**
     * @param {Ext.Component} newField
     * @param {Ext.Component} oldField
     * @return {undefined}
     */
    updateDescriptionField(newField, oldField) {
        if (oldField)
            oldField.destroy();
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyTitleField(config) {
        this.getData();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-form-inline-field',
            renderTo: this.element.dom.querySelector('[data-ref=\'course-title\']'),
            value: this.getValues().title,
            defaultValue: CJ.t('view-course-edit-menu-menu-default-title', true),
            maxLength: 150,
            listeners: {
                scope: this,
                change: this.onTitleChange,
                keydown: this.onTitleFieldKeyDown
            }
        }, config));
    },
    /**
     * @param {Ext.Component} field
     * @param {String} value
     * @return {undefined}
     */
    onTitleChange(field, value) {
        this.getEditor().onCourseUpdate();
    },
    /**
     * @param {Ext.Component} field
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onTitleFieldKeyDown(field, e) {
        if (e.browserEvent.keyCode != 9)
            return;
        e.stopEvent();
        this.getDescriptionField().select();
    },
    /**
     * @param {CJ.core.view.form.InlineField} newField
     * @param {CJ.core.view.form.InlineField} oldField
     */
    updateTitleField(newField, oldField) {
        if (oldField)
            oldField.destroy();
    },
    /**
     * @param {Ext.Component} field 
     */
    onDescriptionFieldChange(field) {
        this.getEditor().onCourseUpdate();
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        return Ext.apply({
            close: CJ.t('view-course-edit-menu-menu-close-button'),
            publish: CJ.t('view-course-edit-menu-menu-publish-button'),
            title: CJ.t('view-course-edit-menu-menu-default-title'),
            saving: CJ.t('view-course-edit-menu-menu-saving-text'),
            saved: CJ.t('view-course-edit-menu-menu-saved-text')
        }, data);
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyIconField(config) {
        if (!config)
            return;
        this.getData();
        return Ext.factory(Ext.apply({
            xtype: 'core-view-form-icon',
            cls: 'd-icon',
            labelText: false,
            iconCfg: this.getValues().iconCfg,
            renderTo: this.element.dom.querySelector('.d-icon-placeholder'),
            listeners: {
                scope: this,
                uploadsuccess: this.onIconUploadSuccess
            }
        }, config));
    },
    /**
     * @param {CJ.core.view.form.Icon} newIcon
     * @param {CJ.core.view.form.Icon} oldIcon
     */
    updateIconField(newIcon, oldIcon) {
        if (oldIcon)
            oldIcon.destroy();
    },
    /**
     * @param {Ext.Component} field
     */
    onIconUploadSuccess(field) {
        this.getEditor().onCourseUpdate();
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
            xtype: 'view-course-edit-section-tree-tree',
            renderTo: this.element.dom.querySelector('.d-sections-item'),
            sections: this.getSections(),
            editor: this.getEditor()
        });
        return Ext.factory(config);
    },
    /**
     * @param {CJ.view.course.edit.SectionTree} sectionTree
     */
    updateSectionTree(newSectionTree, oldSectionTree) {
        if (oldSectionTree)
            oldSectionTree.destroy();
    },
    /**
     * @param {Boolean} state
     */
    updateSaving(state) {
        const root = this.element.dom, footer = this.element.dom.querySelector('.d-footer-item');
        if (state) {
            footer.classList.remove('d-saved');
            footer.classList.add('d-saving');
        } else {
            footer.classList.remove('d-saving');
            footer.classList.add('d-saved');
        }
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setEditor(null);
        this.setSectionTree(null);
        this.setDescriptionField(null);
        this.setIconField(null);
        this.setTitleField(null);
    }
});