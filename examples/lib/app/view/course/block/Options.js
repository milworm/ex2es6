import 'app/view/block/options/Default';

Ext.define('CJ.view.course.block.Options', {
    extend: 'CJ.view.block.options.Default',
    alias: 'widget.view-course-block-options',
    config: {
        /**
         * @cfg {Object|Boolean} editButton
         */
        editButton: true,
        /**
         * @cfg {Object|Boolean} pinButton
         */
        pinButton: false,
        /**
         * @cfg {Object|Boolean} assignButton
         */
        assignButton: true,
        /**
         * @cfg {Object|Boolean} mergeButton
         */
        mergeButton: false,
        /**
         * @cfg {Object|Boolean} addToPlaylistButton
         */
        addToPlaylistButton: false,
        /**
         * @cfg {Object|Boolean} saveToMyFeedButton
         */
        saveToMyFeedButton: false,
        /**
         * @cfg {Object|Boolean} addToCourseButton
         */
        addToCourseButton: false,
        /**
         * @cfg {Object|Boolean} buyMoreLicensesButton
         */
        buyMoreLicensesButton: true,
        /**
         * @cfg {Object|Boolean} addUser
         */
        addUserButton: true
    },
    /**
     * @param {Object|Boolean} config
     * @return {Object}
     */
    applyAddUserButton(config) {
        if (!config)
            return false;
        if (!(CJ.User.isPortalAdmin() && CJ.User.isFGA()))
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-popup-options-add-user',
            cls: 'd-button d-icon-user',
            handler: this.onAddUserButtonTap
        }));
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onAddUserButtonTap(e) {
        CJ.view.course.view.AssignUser.popup({ courseId: this.getBlock().getDocId() });
    },
    /**
     * @param {Object} config
     */
    applyAssignButton(config) {
        if (!(config && CJ.User.isMine(this.getBlock())))
            return false;
        return this.createButton(Ext.apply({
            text: 'view-block-popup-options-assign',
            cls: 'd-button d-icon-reuse',
            handler: this.onAssignButtonTap,
            disabled: !CJ.User.isLogged()
        }, config));
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyPinButton(config) {
        if (!config || !CJ.User.isMineFeed())
            return false;
        if (config == true)
            config = {};
        return this.createButton(Ext.applyIf(config, {
            text: 'view-course-block-options-pin',
            cls: 'd-button d-icon-pin',
            handler: this.onPinButtonTap
        }));
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onPinButtonTap(e) {
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyMergeButton(config) {
        if (!config)
            return false;
        const block = this.getBlock();
        if (block.isReused() || !CJ.User.isMine(block))
            return false;
        return this.createButton(Ext.apply({
            text: 'view-course-block-options-merge',
            cls: 'd-button d-icon-merge-courses',
            handler: this.onMergeButtonTap
        }, config));
    },
    /**
     * @param {Ext.Evented} e
     */
    onMergeButtonTap(e) {
        const course = this.getBlock();
        CJ.view.course.Select.popup({
            title: 'view-course-block-options-merge-courses-popup-title',
            button: 'view-course-block-options-merge-courses-popup-button',
            selectionMode: 'single',
            listeners: {
                selected: Ext.bind(this.onCoursesSelected, this),
                created: Ext.bind(this.onCourseCreated, this),
                destroy: this.onCourseSelectDestroy
            }
        });
    },
    /**
     * @param {Ext.Component} component
     * @return {undefined}
     */
    onCourseSelectDestroy(component) {
        delete component.config.listeners.selected;
        delete component.config.listeners.created;
    },
    /**
     * @param {Ext.Component} component
     * @param {Array} ids
     */
    onCoursesSelected(component, ids) {
        const fromCourse = this.getBlock(), toCourse = component.getList().getStore().findRecord('docId', ids[0]);
        this.mergeCourses(fromCourse, toCourse);
    },
    /**
     * @param {Ext.Component} component
     * @param {CJ.view.course.block.Block} course
     */
    onCourseCreated(component, course) {
        this.mergeCourses(this.getBlock(), course);
    },
    /**
     * @param {Ext.Base} fromCourse
     * @param {Ext.Base} toCourse
     * @return {undefined}
     */
    mergeCourses(fromCourse, toCourse) {
        const title = 'view-course-block-options-merge-confirm-title';
        let text = 'view-course-block-options-merge-confirm-text';
        text = CJ.t(text);
        text = CJ.tpl(text, fromCourse.getSectionsLength(), fromCourse.getBlocksLength());
        CJ.confirm(title, text, result => {
            if (result != 'yes')
                return;
            alert('merged');
        });
    },
    /**
     * @param {Object} config
     */
    applyEditButton(config) {
        this.getPinButton();
        this.getMergeButton();
        if (!(config && !Ext.os.is.Phone))
            return false;
        const block = this.getBlock();
        if (block.isReused() || !CJ.User.isMine(this.getBlock()))
            return false;
        return this.createButton(Ext.apply({
            text: 'block-popup-options-edit',
            cls: 'd-button d-icon-edit',
            handler: this.onEditButtonTapped
        }, config));
    }
});