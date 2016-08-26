import 'Ext/Component';
import 'app/view/course/add/CourseSelect';
import 'app/view/course/add/SectionSelect';

/**
 * Class defines a component to give users a way to add blocks to a course. Allows users to search and select/create a 
 * course and select a section where the block will be inserted at the first place.
 */
Ext.define('CJ.view.course.add.View', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.AddToCourse',
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-add-view',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config undefined {}) {
            return Ext.factory({
                xtype: 'core-view-popup',
                title: 'view-course-add-view-popup-title',
                cls: 'd-add-to-course-popup',
                content: {
                    block: config.block,
                    xtype: this.xtype,
                    listeners: config.listeners
                }
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-course-add-view',
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Ext.Component} searchField
         */
        searchField: {},
        /**
         * @cfg {Ext.Component} content
         */
        content: {},
        /**
         * @cfg {Ext.Component} createButton
         */
        createButton: {},
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        /**
         * @cfg {Object} selectedCourse
         */
        selectedCourse: null,
        /**
         * @cfg {Ext.XTemplate} selectedCourseTpl
         */
        selectedCourseTpl: Ext.create('Ext.XTemplate', '<div class="d-back-icon"></div>', '<div class="d-content">', '<div class="d-user-icon" style="{[ CJ.Utils.makeIcon(values.icon || values.backgroundHsl) ]}"></div>', '<div class="d-title">{title}</div>', '</div>', { compiled: true })
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    getElementConfig() {
        return {
            reference: 'element',
            children: [
                { classList: ['d-header-element'] },
                {
                    reference: 'selectedCourseEl',
                    classList: ['d-selected-course']
                },
                {
                    reference: 'contentElement',
                    classList: [
                        'd-content-element',
                        'd-scroll'
                    ]
                },
                { classList: ['d-footer-element'] }
            ]
        };
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-create-button', 2))
            this.onCreateButtonTap(e);
        else if (e.getTarget('.d-course-item', 5))
            this.onCourseItemTap(e);
        else if (e.getTarget('.d-selected-course', 5))
            this.showCourses();
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applySearchField(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-search-field',
            ref: 'search',
            listeners: {
                scope: this,
                input: this.onSearchFieldInput
            },
            renderTo: this.element.dom.querySelector('.d-header-element')
        }, config));
    },
    /**
     * @param {Ext.Component} newField
     * @param {Ext.Component} oldField
     * @return {undefined}
     */
    updateSearchField(newField, oldField) {
        if (oldField)
            oldField.destroy();
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyContent(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-course-add-course-select',
            renderTo: this.contentElement
        }, config));
    },
    /**
     * @param {Ext.Component} newContent
     * @param {Ext.Component} oldContent
     * @return {undefined}
     */
    updateContent(newContent, oldContent) {
        if (oldContent)
            oldContent.destroy();
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyCreateButton(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'core-view-component',
            cls: 'd-create-button',
            html: CJ.t('view-course-select-create-course'),
            renderTo: this.element.dom.querySelector('.d-footer-element')
        }, config));
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     * @return {undefined}
     */
    updateCreateButton(newComponent, oldComponent) {
        if (oldComponent)
            oldComponent.destroy();
    },
    /**
     * @param {CJ.core.view.SearchField} field
     * @param {String} value
     */
    onSearchFieldInput(field, value) {
        const content = this.getContent();
        if (!content.isCourseSelect)
            return this.showCourses();
        content.abort();
        content.load({ filter: value });
    },
    /**
     * @return {undefined}
     */
    onCreateButtonTap() {
        const course = Ext.factory(Ext.apply({
            xtype: 'view-course-block',
            sections: CJ.CourseHelper.getDefaultSectionConfig(),
            title: CJ.t('view-course-edit-menu-menu-default-title', true),
            docVisibility: 'private'
        }, CJ.Block.getInitialTagsAndCategories()));
        this.mask();
        course.save({
            scope: this,
            callback: this.unmask,
            success() {
                this.fireEvent('created', this, course);
                this.getPopup().hide();
            }
        });
    },
    showCourses() {
        this.replaceCls('d-show-sections', 'd-show-courses');
        Ext.defer(this.onCoursesShown, 500, this);
    },
    onCoursesShown() {
        this.removeCls('d-show-courses');
        this.selectedCourseEl.setHtml('');
        this.setContent({ loadParams: { filter: this.getSearchField().getValue() } });
    },
    /**
     * @param {Ext.dataview.DataView} list
     * @param {Number} index
     * @param {Ext.dom.Element} element
     * @param {Ext.data.Model} record
     */
    onCourseItemTap(e) {
        const target = e.getTarget('.d-course-item'), index = CJ.getNodeData(target, 'index'), course = this.getContent().getData()[index - 1];
        this.selectCourse(course, index, target);
    },
    /**
     * @param {Object} course
     * @param {Number} index
     * @param {HTMLElement} target
     * @return {undefined}
     */
    selectCourse(course, index, node) {
        this.setSelectedCourse(course);
        this.selectedCourseEl.setHtml(this.getSelectedCourseTpl().apply(course));
        this.selectedCourseEl.translate(0, this.getListItemTopOffset(node));
        this.addCls('d-hide-courses');
        Ext.defer(this.onSelectCourseAnimationEnd, 500, this);
        node.classList.add('invisible');
    },
    /**
     * loads and renders list of sections.
     * @return {undefined}
     */
    onSelectCourseAnimationEnd() {
        this.setContent({
            xtype: 'view-course-add-section-select',
            sections: this.getSelectedCourse().sections,
            listeners: {
                scope: this,
                select: this.onSectionSelect
            }
        });
        this.replaceCls('d-hide-courses', 'd-show-sections');
    },
    /**
     * @param {HTMLElement} itemNode
     * @return {Number}
     */
    getListItemTopOffset(itemNode) {
        return CJ.Utils.flyPageBox(itemNode).top - this.contentElement.getY();
    },
    /**
     * @param {Object} section
     * @return {undefined}
     */
    onSectionSelect(section) {
        this.addBlockToSection(section);
    },
    /**
     * makes a request to add block to a section
     * @param {String} sectionId
     */
    addBlockToSection(sectionId) {
        CJ.request({
            rpc: {
                model: 'Course',
                method: 'add_to_course'
            },
            params: {
                docId: this.getBlock().getDocId(),
                courseId: this.getSelectedCourse().docId,
                sectionId
            },
            scope: this,
            success: this.onAddBlockToSectionSuccess,
            failure: this.onAddBlockToSectionFailure
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onAddBlockToSectionSuccess(response, request) {
        CJ.feedback();
        this.getPopup().hide();
        const params = request.initialConfig.params;
        CJ.fire('block.addtocourse', {
            docId: params.docId,
            courseId: params.courseId,
            sectionId: params.sectionId
        });
    },
    /**
     * @return {undefined}
     */
    onAddBlockToSectionFailure() {
    }    // @TODO
,
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setSearchField(null);
        this.setContent(null);
        this.setCreateButton(null);
    }
});