import 'app/view/course/base/Editor';
import 'app/view/course/view/menu/Menu';
import 'app/view/course/view/section/list/List';
import 'app/view/course/view/AssignTeachers';
import 'app/view/course/view/AssignUser';

/**
 * Defines a component that allows user to view an existing course.
 */
Ext.define('CJ.view.course.view.Editor', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.base.Editor',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-view-editor',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-course-viewer',
        /**
         * @cfg {Object} commentsList
         */
        commentsList: {}
    },
    /**
     * @property {Object} statics
     */
    inheritableStatics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config undefined {}) {
            return Ext.factory({
                xtype: 'core-view-popup',
                cls: 'd-course-popup',
                titleBar: false,
                fitMode: true,
                isHistoryMember: true,
                content: {
                    block: config.block,
                    xtype: this.xtype
                }
            });
        }
    },
    constructor() {
        if (CJ.User.isFGA())
            CJ.on('historymember.hide', this.requestCompleteness, this);
        this.callParent(args);
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    updateBlock(block) {
        this.callParent(args);
        this.updatePageTitle(block);
        if (block)
            return this.prefillSections();
    },
    /**
     * simply changes document's title
     * @param {CJ.view.block.BaseBlock} block
     */
    updatePageTitle(block) {
        let title = null;
        if (block && block.getIsManaged())
            title = block.getStudent().name;
        Ext.Viewport.setPageTitle(title);
    },
    /**
     * prefills sections with fake components, so empty sections are always visible in the editor.
     */
    prefillSections() {
        const block = this.getBlock();
        CJ.CourseHelper.eachSection(block.getSections(), section => {
            section.blocksLength++;
            section.blocks.push({
                xtype: 'core-view-component',
                cls: 'd-fake-block',
                docId: CJ.Guid.generatePhantomId()
            });
        });
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        if (e.getTarget('.d-button.d-edit'))
            this.onEditButtonTap();
        if (e.getTarget('.d-enroll-button'))
            this.onEnrollButtonTap();
        else if (e.getTarget('.d-leave-button'))
            this.onLeaveButtonTap();
        else if (e.getTarget('.d-assign-teachers'))
            this.onAssignTeachersTap();
        else
            this.callParent(args);
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyMenu(config) {
        if (!Ext.isObject(config))
            return false;
        const block = this.getBlock();
        return Ext.factory(Ext.apply({
            xtype: 'view-course-view-menu-menu',
            sections: block.getSections(),
            values: {
                icon: block.getIcon(),
                title: block.getTitle(),
                description: block.getDescription(),
                backgroundMocksyNumber: block.getBackgroundMocksyNumber(),
                backgroundHsl: block.getBackgroundHsl()
            },
            enrolled: block.getIsEnrolled(),
            renderTo: this.element,
            editor: this
        }, config));
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applySectionList(config) {
        if (!Ext.isObject(config))
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-course-view-section-list-list',
            sections: this.getBlock().getSections(),
            renderTo: this.element,
            editor: this
        }, config));
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyCommentsList(config) {
        this.getMenu();
        this.getSectionList();
        const block = this.getBlock();
        if (!(config && CJ.User.isFGA() && block.getIsManaged()))
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-comments-list-course',
            renderTo: this.element,
            block
        }, config));
    },
    /**
     * closes courses' view mode and opens a course in edit mode.
     * @return {undefined}
     */
    onEditButtonTap() {
        const block = this.getBlock();
        CJ.History.back();
        setTimeout(() => {
            block.setEditing(true);
        }, 500);    // popup close animation.
    },
    /**
     * @return {undefined}
     */
    onEnrollButtonTap() {
        if (!CJ.User.isLogged())
            return CJ.view.login.Login.popup();
        const block = this.getBlock();
        if (!block.getPublished())
            return;    // don't allow user to enroll to unpublished courses.
        // don't allow user to enroll to unpublished courses.
        block.enroll({
            scope: this,
            success: this.onEnrollSuccess
        });
    },
    /**
     * @return {undefined}
     */
    onLeaveButtonTap() {
        this.getBlock().leave({
            scope: this,
            success: this.onLeaveSuccess
        });
    },
    /**
     * @return {undefined}
     */
    onAssignTeachersTap() {
        CJ.view.course.view.AssignTeachers.popup();
    },
    /**
     * @param {Object} response
     */
    onEnrollSuccess(response) {
        // user closed an editor before we have the response.
        if (this.isDestroyed)
            return;
        this.getMenu().onCourseEnroll();
    },
    /**
     * @param {Object} response
     */
    onLeaveSuccess(response) {
        this.getMenu().onCourseLeave();
    },
    /**
     * This method updates editor's completeness when user deletes a block using menu button, because 
     * 'historymemeber.hide' event is not fired.
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    onBlockDeleted(block) {
        this.callParent(args);
        if (CJ.User.isFGA())
            this.requestCompleteness();
    },
    /**
     * requests new course's completeness.
     * @return {undefined}
     */
    requestCompleteness(popup) {
        if (this.getPopup() == popup)
            return;
        const block = this.getBlock();
        Promise.all([
            CJ.Utils.promise(block, 'requestCompleteness'),
            CJ.Utils.promise(block, 'requestStudentStats')
        ]).then(items => {
            const completeness = items[0], studentStats = items[1];
            this.refreshCompleteness(completeness);
            this.refreshStudentStats(studentStats);
        });
    },
    /**
     * @param {Object} completeness
     * @return {undefined}
     */
    refreshCompleteness(completeness) {
        const node = this.element.dom.querySelector('.d-side-menu .d-completeness-container');
        node.innerHTML = CJ.Utils.completeness(completeness);
    },
    /**
     * @param {Object} stats
     * @return {undefined}
     */
    refreshStudentStats(stats) {
        this.getBlock().setStudentStats(stats);
        this.getMenu().renderCourseInfo();
    },
    destroy() {
        if (CJ.User.isFGA())
            CJ.un('historymember.hide', this.requestCompleteness, this);
        this.callParent(args);
    }
});