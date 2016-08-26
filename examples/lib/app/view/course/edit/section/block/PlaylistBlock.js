import 'app/view/playlist/Block';

/**
 * Defines default block for section's list in course-editor.
 */
Ext.define('CJ.view.course.edit.section.block.PlaylistBlock', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.playlist.Block',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-block-playlist-block',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-cover-block d-playlist-block d-section-block',
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
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [{
                    className: 'd-block-content',
                    // for dnd.
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
     * @param {CJ.view.publish.Carousel} component
     */
    doPublish(values, component) {
        const iconCfg = values.iconCfg, docVisibility = values.docVisibility;
        delete values.docVisibility;
        if (iconCfg)
            this.setIcon(iconCfg.preview);
        this.setConfig(values);
        this.initGroups();
        this.setData({});
        if (this.getReuseCount()) {
            CJ.Ajax.initBatch();
            CJ.fire('course.block.publish', this);
            this.saveDocVisibility(docVisibility);
            CJ.Ajax.runBatch();
        } else {
            this.setDocVisibility(docVisibility);
            CJ.fire('course.block.publish', this);
        }
        this.setState(null);
    },
    /**
     * @param {String} state
     */
    setState(state) {
        if (state == 'review')
            CJ.CourseHelper.onActivated(this);
        return this.callParent(args);
    },
    toEditState() {
        if (this.getEditor())
            return;
        const isPhantom = this.isPhantom();
        const isLoaded = this.getIsLoaded();
        let index;
        let xtype;
        let popup;
        if (!(isPhantom || isLoaded))
            return this.requestPlaylist(this.toEditState);
        this.fireEvent('toeditstate', this);
        index = this.getPendingIndex();
        if (this.isPhantom())
            xtype = 'view-course-edit-section-block-edit-popup';
        else
            // do not allow coverting non-phantom playlist to many blocks.
            xtype = 'view-block-edit-defaults-popup';
        popup = Ext.factory({
            xtype,
            block: this,
            activeItemIndex: Ext.isNumber(index) ? index : false
        });
        this.setEditor(popup.getContent());
        this.setStateContainer(popup);
        this.setPendingIndex(null);
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
                xtype: 'view-playlist-options',
                deleteFromCourseButton: true,
                block: this
            }
        });
    },
    /**
     * for us it's section-block, but for server it's default-block.
     * @return {Object}
     */
    serialize() {
        const data = this.callParent(args);
        Ext.apply(data, { xtype: this.superclass.xtype });
        return data;
    }
});