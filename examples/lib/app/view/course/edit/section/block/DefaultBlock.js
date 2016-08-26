import 'app/view/block/DefaultBlock';

/**
 * Defines default block for section's list in course-editor.
 */
Ext.define('CJ.view.course.edit.section.block.DefaultBlock', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.DefaultBlock',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-block-default-block',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-default d-section-block',
        /**
         * @cfg {Ext.Component} bottomBar
         */
        bottomBar: { xtype: 'view-course-edit-section-block-bottom-bar' }
    },
    constructor(config) {
        this.sectionId = config.sectionId;
        this.callParent(args);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onUserTap: Ext.emptyFn,
    /**
     * creates an edtior popup and moves block's content into editor
     */
    toEditState() {
        if (this.getEditor())
            return;
        const list = this.getList().serialize();
        const activityTitle = this.getActivityTitle();
        const question = this.getQuestion();
        let popup;
        this.setActivityTitle(null);
        this.setList(null);
        this.setQuestion(null);
        popup = Ext.factory({
            xtype: 'view-course-edit-section-block-edit-popup',
            title: CJ.app.t('nav-popup-block-title'),
            block: this,
            content: {
                editing: true,
                block: this,
                activityTitle,
                list,
                question,
                xtype: 'view-block-edit-defaults-editor'
            }
        });
        this.setEditor(popup.getContent());
        CJ.CourseHelper.onActivated(this);
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [{
                    className: 'd-block-content',
                    children: [
                        { className: 'd-header' },
                        {
                            reference: 'innerElement',
                            classList: [
                                'x-inner',
                                'd-body'
                            ]
                        },
                        { className: 'd-footer' }
                    ]
                }]
        };
    },
    /**
     * @return {undefined}
     */
    publish() {
        CJ.CourseHelper.onActivated(this);
        this.callParent(args);
    },
    /**
     * @param {Object} values
     * @param {CJ.core.view.Popup} component
     */
    doPublish(values, component) {
        const docVisibility = values.docVisibility, editor = this.getEditor();
        delete values.docVisibility;
        this.setConfig(values);
        this.applyChanges();
        this.setEditing(false);
        if (editor)
            editor.getPopup().hide();
        if (this.getReuseCount()) {
            CJ.Ajax.initBatch();
            CJ.fire('course.block.publish', this);
            this.saveDocVisibility(docVisibility);
            CJ.Ajax.runBatch();
        } else {
            this.setDocVisibility(docVisibility);
            CJ.fire('course.block.publish', this);
        }
    },
    /**
     * @inheritdoc
     */
    showOptions() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-popup-options-title',
            cls: 'd-menu-popup',
            layout: 'light',
            content: {
                xtype: 'view-block-options-default',
                deleteFromCourseButton: true,
                block: this
            }
        });
    },
    /**
     * for us it's section-block, but for the server it's default-block.
     * @return {Object}
     */
    serialize() {
        const data = this.callParent(args);
        Ext.apply(data, { xtype: this.superclass.xtype });
        return data;
    }
});