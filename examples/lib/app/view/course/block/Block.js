import 'app/view/block/ContentBlock';
import 'app/view/course/Helper';
import 'app/view/course/edit/Editor';
import 'app/view/course/view/Editor';
import 'app/view/course/block/Options';
import 'app/view/course/Scoreboard';

/**
 * Defines a course-block.
 */
Ext.define('CJ.view.course.block.Block', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.block.ContentBlock',
    /**
     * @property {String} alias
     */
    alias: [
        'widget.view-course-block',
        'widget.view-course-block-block'
    ],
    /**
     * @property {Boolean} isCourseBlock
     */
    isCourse: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-cover-block d-course-block',
        /**
         * @cfg {Array} sections
         */
        sections: [],
        /**
         * @cfg {Number} sectionsLength
         */
        sectionsLength: 0,
        /**
         * @cfg {Number} blocksLength
         */
        blocksLength: 0,
        /**
         * @cfg {String} icon
         */
        icon: null,
        /**
         * @cfg {Object} iconCfg
         */
        iconCfg: null,
        /**
         * @cfg {Number} backgroundHsl
         */
        backgroundHsl: true,
        /**
         * @cfg {Number} backgroundMocksyNumber
         */
        backgroundMocksyNumber: true,
        /**
         * @cfg {String} title
         */
        title: null,
        /**
         * @cfg {String} description
         */
        description: null,
        /**
         * @cfg {Boolean} published Defines was the block publised or not.
         */
        published: false,
        /**
         * @cfg {Boolean} isEnrolled
         */
        isEnrolled: false,
        /**
         * @cfg {Number} completed
         */
        completed: 0,
        /**
         * @cfg {Number} total
         */
        total: 0,
        /**
         * @cfg {Boolean} isTeacher
         */
        isTeacher: null,
        /**
         * @cfg {Boolean} isManaged
         */
        isManaged: null,
        /**
         * @cfg {String} startDate
         */
        startDate: null,
        /**
         * @cfg {String} endDate
         */
        endDate: null,
        /**
         * @cfg {String} lastFollowUp
         */
        lastFollowUp: null,
        /**
         * @cfg {Number} totalHours
         */
        totalHours: null,
        /**
         * @cfg {Object} student
         */
        student: null,
        /**
         * @cfg {Object} studentStats
         */
        studentStats: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class="d-cover {[ CJ.Utils.getBackgroundCls(values) ]}" data-course>', '<div class="d-block-type-icon"></div>', '<div class="d-title">', '<span>{title}</span>', '</div>', '<tpl if="description">', '<div class="d-info-button">', '<span>{[ CJ.t("more-info") ]}</span>', '</div>', '</tpl>', '<tpl if="showCompleteness">', '<div class="d-completeness-container">', '{[ CJ.Utils.completeness(values.completeness) ]}', '</div>', '</tpl>', '</div>'),
        /**
         * @cfg {Ext.XTemplate} headerTpl
         */
        headerTpl: Ext.create('Ext.XTemplate', '<tpl if="values.licensed">', '<tpl if="values.samePortal">', '<a class="d-user-icon d-creator-icon" style="background-image: url({creatorInfo.icon})" href="#!u/{creatorInfo.user}" onclick="return false;"></a>', '<tpl if="isReused">', '<a class="d-user-icon" style="background-image: url({userInfo.icon})" href="#!u/{userInfo.user}" onclick="return false;"></a>', '</tpl>', '<div class="d-content">', '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">', '{userInfo.name}', '</a>', '<tpl if=\'values.published\'>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '<tpl else>', '<div class=\'d-unpublished\'>{[ CJ.t(\'view-course-block-block-unpublished\') ]}</div>', '</tpl>', '</div>', '<tpl elseif="portal">', '<a class="d-user-icon d-creator-icon d-portal-icon" style="background-image: url({portal.icon})" href="#!pu/{portal.prefix}@/f" onclick="return false;"></a>', '<tpl if="isReused">', '<a class="d-user-icon" style="background-image: url({userInfo.icon})" href="#!u/{userInfo.user}" onclick="return false;"></a>', '<div class="d-content">', '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">', '{userInfo.name}', '</a>', '<tpl if=\'values.published\'>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '<tpl else>', '<div class=\'d-unpublished\'>{[ CJ.t(\'view-course-block-block-unpublished\') ]}</div>', '</tpl>', '</div>', '<tpl else>', '<div class="d-content">', '<a class="d-title d-user-name d-portal-name" href="#!pu/{portal.prefix}@/f" onclick="return false;">', '{portal.name}', '</a>', '<tpl if=\'values.published\'>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '<tpl else>', '<div class=\'d-unpublished\'>{[ CJ.t(\'view-course-block-block-unpublished\') ]}</div>', '</tpl>', '</div>', '</tpl>', '<tpl else>', '<a class="d-user-icon d-creator-icon" style="background-image: url({creatorInfo.icon})" href="#!u/{creatorInfo.user}" onclick="return false;"></a>', '<tpl if="isReused">', '<a class="d-user-icon" style="background-image: url({userInfo.icon})" href="#!u/{userInfo.user}" onclick="return false;"></a>', '</tpl>', '<div class="d-content">', '<a class="d-title d-user-name d-creator-icon" href="#!u/{userInfo.user}" onclick="return false;">', '{userInfo.name}', '</a>', '<tpl if=\'values.published\'>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '<tpl else>', '<div class=\'d-unpublished\'>{[ CJ.t(\'view-course-block-block-unpublished\') ]}</div>', '</tpl>', '</div>', '</tpl>', '<tpl else>', '<a class="d-user-icon d-creator-icon" style="background-image: url({creatorInfo.icon})" href="#!u/{creatorInfo.user}" onclick="return false;"></a>', '<tpl if="isReused">', '<a class="d-user-icon" style="background-image: url({userInfo.icon})" href="#!u/{userInfo.user}" onclick="return false;"></a>', '</tpl>', '<div class="d-content">', '<a class="d-title d-user-name" href="#!u/{userInfo.user}" onclick="return false;">', '{userInfo.name}', '</a>', '<tpl if=\'values.published\'>', '<div class="d-time">', '<span>{[ CJ.t("block-posted-text") ]}</span> ', '{[ CJ.Block.formatDate(values.createdDate) ]} ', '</div>', '<tpl else>', '<div class=\'d-unpublished\'>{[ CJ.t(\'view-course-block-block-unpublished\') ]}</div>', '</tpl>', '</div>', '</tpl>', '<tpl if="values.scope.getShowContentUpdatedIcon(values)">', '<div class="content-updated-icon"></div>', '</tpl>', '<tpl if="CJ.User.isMine(values.scope)">', '<div class="d-permissions-button d-{docVisibility}"></div>', '</tpl>', '<div class="d-assign-button"></div>', '<div class="d-menubutton {menuButtonCls}"></div>', {
            compiled: true,
            /**
                 * @param {Object} values
                 * @return {String}
                 */
            getOwnerHref(values) {
                return `#!u${ CJ.Utils.urlify('/' + values.scope.getOwnerUser()) }`;
            }
        }),
        /**
         * @cfg {String} deleteConfirmationText
         */
        deleteConfirmationText: 'view-course-block-popup-options-confirmtext'
    },
    constructor() {
        this.callParent(args);
        this.tapListeners = Ext.clone(this.tapListeners);
        this.tapListeners['.d-cover'] = 'onCoverTap';
    },
    /**
     * @inheritdoc
     */
    getElementConfig() {
        return {
            reference: 'element',
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
        };
    },
    /**
     * @param {Boolean} arrayFormat Should be true if you want to get sections
     *                              in an array-format.
     */
    getSections(arrayFormat) {
        if (!arrayFormat)
            return this._sections;
        const result = [];
        CJ.CourseHelper.eachSection(this._sections, section => {
            result.push(section);
        });
        return result;
    },
    /**
     * @return {Object}
     */
    applyChanges() {
        if (!this.getEditing())
            return;
        const data = this.getEditor().serialize();
        this.setTitle(data.title);
        this.setDescription(data.description);
        this.setIcon(data.icon);
        this.setIconCfg(data.iconCfg);
    },
    /**
     * @param {Object} callbacks
     * @param {Function} callbacks.scope
     * @param {Function} callbacks.success
     * @param {Function} callbacks.failure
     * @return {undefined}
     */
    save(callbacks) {
        this.setSaving(true);
        const data = this.serialize();
        CJ.StreamHelper.adjustContaining(this);
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'save_documents'
            },
            params: { data: [data] },
            scope: this,
            callbacks: callbacks || {},
            success: this.onSaveSuccess,
            callback: this.onSaveCallback
        });
    },
    /**
     * @param {Object} response
     * @param {Object} request
     * @return {undefined}
     */
    onSaveSuccess(response, request) {
        this.callParent(args);
        const callbacks = request.initialConfig.callbacks;
        Ext.callback(callbacks.success, callbacks.scope, arguments);
    },
    /**
     * @param {String} mode Should be "local" to return all set of data 
     *                      including comments/userInfo etc.., server by default
     * @return {Object}
     */
    serialize(mode undefined 'server') {
        const data = {
            xtype: this.xtype,
            docId: this.getDocId(),
            docVisibility: this.getDocVisibility(),
            tags: this.getTags(),
            categories: this.getCategories(),
            appVer: CJ.constant.appVer,
            nodeCls: 'Course',
            groups: this.getGroups(),
            backgroundHsl: this.getBackgroundHsl(),
            backgroundMocksyNumber: this.getBackgroundMocksyNumber(),
            totalHours: this.getTotalHours(),
            published: this.getPublished(),
            licensingOptions: this.getLicensingOptions(),
            licenseInfo: this.getLicenseInfo()
        };
        if (this.getEditing()) {
            Ext.apply(data, this.getEditor().serialize());
        } else {
            Ext.apply(data, {
                icon: this.getIcon(),
                title: this.getTitle(),
                iconCfg: this.getIconCfg(),
                description: this.getDescription()
            });
        }
        if (mode == 'server')
            return data;
        Ext.apply(data, {
            userInfo: this.getUserInfo(),
            createdDate: this.getCreatedDate(),
            icon: this.getIcon(),
            comments: this.getComments(),
            reuseInfo: this.getReuseInfo(),
            reusedCount: this.getReuseCount()
        });
        return data;
    },
    /**
     * @return {undefined}
     */
    onBlockCreated() {
        this.callParent(args);
        if (!this.getPublished())
            return;
        if (this.hasPageTags())
            return CJ.feedback(CJ.t('activity-created'));
        const tags = CJ.Utils.tagsToPath(this.getTags());
        CJ.feedback({
            message: CJ.t('activity-created-with-check-out'),
            duration: 5000,
            tap(e) {
                if (e.getTarget('.d-button'))
                    CJ.app.redirectTo(tags);
            }
        });
    },
    getHeaderTplData() {
        const values = this.callParent(args);
        return Ext.apply(values, { published: this.getPublished() });
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        if (!data)
            return false;
        const published = this.getPublished();
        return Ext.apply(data, {
            icon: this.getIcon(),
            title: this.getTitle(),
            description: this.getDescription(),
            backgroundMocksyNumber: this.getBackgroundMocksyNumber(),
            backgroundHsl: published ? this.getBackgroundHsl() : 0,
            published,
            completeness: this.getCompleteness(),
            showCompleteness: this.getShowCompleteness()
        });
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        let html = '';
        if (data)
            html = this.getTpl().apply(data);
        this.innerElement.setHtml(html);
        let icon = data.icon;
        if (Ext.isObject(icon))
            icon = icon.preview || icon.original;
        this.renderCoverImage(icon, data, { disabled: !data.published });
    },
    applyBackgroundHsl(config) {
        if (config === true)
            config = CJ.Utils.randomHsl();
        return config;
    },
    applyBackgroundMocksyNumber(config) {
        if (config === true)
            config = CJ.Utils.getRandomNumber(1, 10);
        return config;
    },
    /**
     * @return {undefined}
     */
    toEditState() {
        if (this.getEditor())
            return;
        CJ.CourseHelper.closeOpenedEditor(function () {
            this.openEditor();
        }, this);
    },
    /**
     * Loads and shows course editor.
     * @return {undefined}
     */
    openEditor() {
        CJ.LoadBar.run();
        CJ.Block.load(this.getDocId(), {
            scope: this,
            success(response) {
                this.setSections(response.ret.sections);
                this.setEditor(CJ.view.course.edit.Editor.popup({ block: this }).getContent());
            },
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    /**
     * @return {undefined}
     */
    toViewState() {
        const editor = this.getEditor();
        if (editor)
            editor.getPopup().hide();
        this.setEditor(null);
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
                xtype: 'view-course-block-options',
                block: this
            }
        });
    },
    /**
     * enrolls current user to a course.
     * @return {undefined}
     */
    enroll(config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'Course',
                method: 'enroll',
                id: this.getDocId()
            }
        }, config));
        this.setIsEnrolled(true);
        CJ.fire('course.enroll', this);
    },
    /**
     * unenrolls current user from a course.
     * @return {undefined}
     */
    leave(config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'Course',
                method: 'unenroll',
                id: this.getDocId()
            }
        }, config));
        this.setIsEnrolled(false);
        CJ.fire('course.leave', this);
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    requestStudentStats(config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'Course',
                method: 'student_stats',
                id: this.getDocId()
            }
        }, config));
    },
    /**
     * @param {Objec} response
     * @param {Objec} request
     */
    onSaveSucccess(response, request) {
        if (this.isPhantom())
            this.onBlockCreated();
        else
            this.onBlockUpdated();
        const docId = this.getDocId(), data = response.ret.saved[docId];
        this.each(block => {
            Ext.apply(data, {
                bottomBar: block.getBottomBar(),
                comments: block.getComments()
            });
            block.reinit(data);
            delete data.bottomBar;
        });
        this.fireEvent('saved', this);
    },
    /**
     * @param {Ext.Component} newBottomBar
     * @param {Ext.Component} oldBottomBar
     */
    applyBottomBar(newBottomBar, oldBottomBar) {
        // in case when we update a block, initialial applier will be called
        // so these two params are equal.
        if (oldBottomBar == newBottomBar)
            return newBottomBar;
        return this.callParent(args);
    },
    /**
     * @inheritdoc
     */
    getLocalUrl() {
        return CJ.tpl('!cs/{0}', this.getDocId());
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updatePublished() {
        if (!this.initialized)
            return;
        this.refreshHeader();
    },
    /**
     * @return {undefined}
     */
    onBlockDeleted() {
        this.callParent(args);
        CJ.fire('course.deleted', this);
    },
    /**
     * @param {Object} options
     * @return {undefined}
     */
    publish(options) {
        let docVisibility = this.getDocVisibility();    // first time publish.
        // first time publish.
        if (!this.getPublished())
            docVisibility = CJ.User.getDefaultDocVisibility();
        options = Ext.apply({
            type: 'course',
            block: this,
            tags: this.getTags(),
            staticTags: [CJ.User.get('user')],
            categories: this.getCategories(),
            docVisibility,
            licensingOptions: this.getLicensingOptions(),
            totalHours: this.getTotalHours(),
            listeners: {
                scope: this,
                complete: this.doPublish
            }
        }, options);
        CJ.PublishCarousel.popup(options);
    },
    /**
     * @param {Object} values
     * @param {CJ.view.publish.Carousel} component
     * @return {undefined}
     */
    doPublish(values, component) {
        const docVisibility = values.docVisibility;
        delete values.docVisibility;
        this.initGroups();
        this.applyChanges();
        this.setConfig(values);
        this.setPublished(true);
        this.setEditing(false);
        this.saveWithVisibility(docVisibility);
        CJ.fire('course.publish', this);
    },
    /**
     * shows a popup to change permissions only when course is published.
     * @return {undefined}
     */
    showPermissions() {
        if (!this.getPublished())
            return;
        return this.callParent(args);
    }
});