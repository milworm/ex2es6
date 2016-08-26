import 'Ext/Component';
import 'app/view/course/edit/section/list/Rename';

Ext.define('CJ.view.course.edit.section.list.Menu', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-list-menu',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-section-menu',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-section-menu-inner',
        /**
         * @cfg {CJ.view.course.edit.Editor} editor
         */
        editor: null,
        /**
         * @cfg {Ext.Component} section
         */
        section: null,
        /**
         * @cfg {CJ.view.course.edit.SectionList} sectionList
         */
        sectionList: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-anchor\'></div>', '<div class=\'d-item d-rename-icon\' data-action=\'rename\'>{rename}</div>', // "<div class='d-item d-assign-icon' data-action='assign'>{assign}</div>",
        '<div class=\'d-item d-delete-icon\' data-action=\'delete\'>{delete}</div>', { compiled: true })
    },
    constructor(config) {
        const section = config.section;
        delete config.section;
        this.setSection(section);
        this.onSectionListScroll = Ext.bind(this.onSectionListScroll, this);
        this.callParent(args);
        Ext.getBody().on('touchstart', this.onPageTap, this);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {CJ.view.course.edit.SectionList} sectionList
     * @return {undefined}
     */
    updateSectionList(newSectionList, oldSectionList) {
        if (!Ext.os.is.Desktop)
            return;
        let node, event = 'mousewheel';
        if (Ext.browser.is.Firefox)
            event = 'DOMMouseScroll';
        if (oldSectionList)
            oldSectionList.element.dom.removeEventListener(event, this.onSectionListScroll);
        if (newSectionList)
            newSectionList.element.dom.addEventListener(event, this.onSectionListScroll);
    },
    /**
     * @return {undefined}
     */
    onSectionListScroll() {
        this.destroy();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onPageTap(e) {
        if (e.getTarget('.d-section-menu', 10))
            return;
        this.destroy();
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        const target = e.getTarget('[data-action]', 5);
        if (!target)
            return;
        const action = CJ.getNodeData(target, 'action'), method = CJ.tpl('on{0}ButtonTap', CJ.capitalize(action));
        if (this[method])
            this[method]();
        this.destroy();
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        return Ext.apply(data, {
            rename: CJ.t('view-course-edit-section-list-menu-rename'),
            assign: CJ.t('view-course-edit-section-list-menu-assign'),
            'delete': CJ.t('view-course-edit-section-list-menu-delete')
        });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @return {undefined}
     */
    onRenameButtonTap() {
        this.getSectionList().showRenamePopup(this.getSection());
    },
    /**
     * @return {undefined}
     */
    onAssignButtonTap() {
        alert('assign');
    },
    /**
     * @return {undefined}
     */
    onDeleteButtonTap() {
        this.getSectionList().onSectionDelete(this.getSection());
    },
    destroy() {
        this.setSection(null);
        this.setSectionList(null);
        this.callParent(args);
    }
});