import 'Ext/Component';
import 'app/view/course/view/section/tree/Tree';
import 'app/view/course/view/menu/DescriptionField';

Ext.define('CJ.view.course.view.menu.Menu', {
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-view-menu-menu',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Boolean} enrolled
         */
        enrolled: false,
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-side-menu',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-side-menu-inner',
        /**
         * @cfg {Ext.XTemplate} enrollTpl
         */
        enrolledTpl: Ext.create('Ext.XTemplate', '<tpl if=\'! published\'>', '<div class=\'d-enroll-button d-unpublished\'>', '<div class=\'d-text\'>{unpublished}</div>', '</div>', '<tpl elseif=\'enrolled\'>', '<div class=\'d-leave-button\'>', '<div class=\'d-text\'>{leave}</div>', '</div>', '<tpl else>', '<div class=\'d-enroll-button\'>', '<div class=\'d-text\'>{enroll}</div>', '</div>', '</tpl>', { compiled: true }),
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        courseInfoTpl: Ext.create('Ext.XTemplate', '<div>', '<tpl if=\'values.endDate\'>', '<b>{[ CJ.t(\'view-course-view-menu-menu-end-date\') ]}</b> ', '{[ Ext.Date.format(Ext.Date.parse(values.endDate, \'Y-m-d h:i:s\'), \'Y-m-d\') ]}', '</tpl>', '</div>', '<div>', '<b>{[ CJ.t(\'view-course-view-menu-menu-estimate\') ]}</b> ', '{mf}h / {[ CJ.t(\'week\') ]}', '</div>', '<div>', '<b>{[ CJ.t(\'view-course-view-menu-menu-objective\') ]}</b> ', '{[ this.getNextMonday() ]}', '</div>', '<div class=\'d-progress-container\'>', '<div class=\'d-progress\'>', '<span class=\'d-per-week\'>{count}</span>', '<span class=\'d-target\'>/{total}</span>', '<div class=\'d-bar\'>', '<div class=\'d-bar-inner\' style=\'width:{percentage}%\'></div>', '</div>', '</div>', '</div>', {
            getNextMonday() {
                // @TODO it's a hack to translate months.
                return Ext.Date.format(CJ.Calculations.getNextMonday(), 'j {F}').replace(/\{([^\}]+)\}/, (a, b) => CJ.t(b)).toLowerCase();
            }
        }),
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-side-menu-inner\'>', '<div class=\'d-header-item {[ CJ.Utils.getBackgroundCls(values) ]}\' style=\'{[ CJ.Utils.getBackground(values) ]}\'>', '<div class=\'d-icon\'></div>', '<div class=\'d-title\'>{title}</div>', '<div class=\'d-completeness-container\'>{completeness}</div>', '</div>', '<tpl if=\'isFGA && isManaged\'>', '<div class=\'d-course-info\'></div>', '</tpl>', '<div class=\'d-enroll-item {[ values.isTeacher ? "d-hidden" : ""]}\'></div>', '<div class=\'d-description-item d-hidden\'></div>', '<div class=\'d-sections-item d-scroll\'></div>', '<div class=\'d-footer-item\'>', '<tpl if=\'isFGA && isPortalAdmin\'>', '<div class=\'d-button d-assign-teachers\'>{assignTeachers}</div>', '</tpl>', '<tpl if=\'canEdit\'>', '<div class=\'d-button d-edit\'>{editText}</div>', '</tpl>', '<div class=\'d-button d-close\'>{closeText}</div>', '</div>', '</div>'),
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {CJ.view.course.edit.SectionTree} sectionTree
         */
        sectionTree: {},
        /**
         * @cfg {CJ.view.course.edit.DescriptionField} descriptionField
         */
        descriptionField: {},
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
        editor: null
    },
    /**
     * @param {Boolean} enrolled
     */
    updateEnrolled(enrolled) {
        this.getData();
        const block = this.getEditor().getBlock();
        let html;
        html = this.getEnrolledTpl().apply({
            enrolled,
            completed: block.getCompleted(),
            published: block.getPublished(),
            unpublished: CJ.t('view-course-view-menu-menu-upublished'),
            enroll: CJ.t('view-course-view-menu-menu-enroll'),
            leave: CJ.t('view-course-view-menu-menu-leave'),
            completedTitle: CJ.t('view-course-menu-menu-completed')
        });
        this.element.dom.querySelector('.d-enroll-item').innerHTML = html;
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyDescriptionField(config) {
        const values = this.getValues();
        if (!values.description)
            return false;
        const renderTo = this.element.dom.querySelector('.d-description-item');
        renderTo.classList.remove('d-hidden');
        return Ext.factory(Ext.apply({
            xtype: 'view-course-view-menu-description-field',
            renderTo,
            value: values.description
        }, config));
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        const block = this.getEditor().getBlock();
        let canEdit = !block.isReused() && CJ.User.isMine(block);
        const isTeacher = CJ.User.isTeacherFor(block);
        let progress;
        if (isTeacher)
            canEdit = true;
        return Ext.apply({
            closeText: CJ.t('view-course-view-menu-menu-close'),
            editText: CJ.t('view-course-view-menu-menu-edit'),
            assignTeachers: CJ.t('view-course-view-menu-assign-teachers'),
            canEdit,
            isFGA: CJ.User.isFGA(),
            isPortalAdmin: CJ.User.isPortalAdmin(),
            isTeacher,
            isManaged: block.getIsManaged(),
            completeness: CJ.Utils.completeness(block.getCompleteness()),
            lastFollowUp: block.getLastFollowUp(),
            endDate: block.getEndDate(),
            studentStats: block.getStudentStats(),
            scope: this
        }, data, this.getValues());
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
        this.renderCourseInfo();
    },
    /**
     * @param {Object} config
     * @return {CJ.view.course.edit.SectionTree}
     */
    applySectionTree(config) {
        if (!config)
            return false;
        Ext.apply(config, {
            xtype: 'view-course-view-section-tree-tree',
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
     * @return {undefined}
     */
    onCourseEnroll() {
        this.setEnrolled(true);
    },
    /**
     * @return {undefined}
     */
    onCourseLeave() {
        this.setEnrolled(false);
    },
    /**
     * renders course-info block, that is based on student's stats.
     */
    renderCourseInfo() {
        const element = this.element.dom.querySelector('.d-course-info');
        if (!element)
            return;
        const block = this.getEditor().getBlock(), values = {
                studentStats: block.getStudentStats(),
                startDate: block.getStartDate(),
                endDate: block.getEndDate()
            };
        const me = CJ.Calculations.me(values);
        const mf = CJ.Calculations.mf(values);
        const count = me.count || 0;
        const total = me.total || 0;
        let percentage = Math.round(count / total * 100) || 0;
        if (percentage > 100)
            percentage = 100;
        Ext.apply(values, {
            percentage,
            total,
            count,
            mf
        });
        element.innerHTML = this.getCourseInfoTpl().apply(values);
    }
});