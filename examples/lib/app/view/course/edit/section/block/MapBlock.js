import 'app/view/map/Block';

/**
 * Defines map block for section's list in course-editor.
 */
Ext.define('CJ.view.course.edit.section.block.MapBlock', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.map.Block',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-block-map-block',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-cover-block d-map-block d-section-block',
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
    toEditState() {
        if (this.getEditor())
            return;
        CJ.CourseHelper.onActivated(this);
        this.setStateContainer(CJ.view.map.edit.Container.popup({ block: this }));
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
     * @return {undefined}
     */
    doPublish(values, component) {
        const docVisibility = values.docVisibility;
        delete values.docVisibility;
        this.setConfig(values);
        this.applyChanges();
        this.setState(null);
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
                xtype: 'view-map-options',
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