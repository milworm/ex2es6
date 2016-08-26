import 'Ext/Component';

/**
 * Defines a class that contains all basic logic/methods for both view/edit
 * editors.
 */
Ext.define('CJ.view.course.base.Editor', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-base-editor',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-course-editor',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-course-editor-inner',
        /**
         * @cfg {Object} values
         * @cfg {String} values.icon
         * @cfg {String} values.title
         * @cfg {String} values.description
         * @cfg {Array} values.sections
         */
        values: null,
        /**
         * @cfg {CJ.view.course.Block} block
         */
        block: null,
        /**
         * @cfg {Ext.Component} menu
         */
        menu: {},
        /**
         * @cfg {Ext.Component} sectionList
         */
        sectionList: {},
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Array} sections
         */
        sections: null
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
        CJ.on('contentblock.deleted', this.onBlockDeleted, this);
    },
    /**
     * adds/removes FGA required classes.
     * @param {CJ.view.course.block.Block} block
     * @return {undefined}
     */
    updateBlock(block) {
        if (!block)
            return;
        const user = CJ.User, isStudent = CJ.User.isStudentFor(block), isTeacher = CJ.User.isTeacherFor(block);
        this.element[isStudent ? 'addCls' : 'removeCls']('d-student');
        this.element[isTeacher ? 'addCls' : 'removeCls']('d-teacher');
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    onBlockDeleted(block) {
        var block = this.getBlockById(block.getDocId());
        if (!block)
            return;
        this.getSectionList().onBlockDeleted(block);
    },
    /**
     * @param {Number} id
     * @return {CJ.view.block.BaseBlock}
     */
    getBlockById(id) {
        const selector = CJ.tpl('[docid=\'{0}\']', id), element = this.element.down(selector);
        return element ? Ext.getCmp(element.id) : null;
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-close'))
            this.onCloseButtonTap();
        else if (e.getTarget('.d-open-menu-button'))
            this.onOpenMenuButtonTap();
        else if (e.getTarget('.d-mask'))
            this.onMaskTap();
    },
    /**
     * @return {undefined}
     */
    onCloseButtonTap() {
        this.getPopup().hide();
    },
    /**
     * @param {Ext.Component} newMenu
     * @param {Ext.Component} oldMenu
     */
    updateMenu(newMenu, oldMenu) {
        if (oldMenu)
            oldMenu.destroy();
    },
    /**
     * @param {Ext.Component} newSectionList
     * @param {Ext.Component} oldSectionList
     */
    updateSectionList(newSectionList, oldSectionList) {
        if (oldSectionList)
            oldSectionList.destroy();
    },
    /**
     * @param {Number} sectionId
     * @return {undefined}
     */
    onSectionNameTap(sectionId) {
        this.getSectionList().scrollToSection(sectionId);
    },
    /**
     * @return {Number}
     */
    getCourseId() {
        return this.getBlock().getDocId();
    },
    /**
     * @return {Object}
     */
    getSectionById(sectionId) {
        return this.getMenu().getSectionTree().getSectionById(sectionId);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setPopup(null);
        this.setBlock(null);
        this.setMenu(null);
        this.setSectionList(null);
        this.callParent(args);
        CJ.un('contentblock.deleted', this.onBlockDeleted, this);
    }
});