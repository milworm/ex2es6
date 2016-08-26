import 'Ext/Component';

Ext.define('CJ.view.course.add.CourseSelect', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-add-course-select',
    /**
     * @property {Boolean} isCourseSelect
     */
    isCourseSelect: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-course-add-course-select',
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<tpl for=".">', '<div class="d-course-item" data-index="{[ xindex ]}">', '<div class="d-user-icon" style="{[ CJ.Utils.makeIcon(values.icon || values.backgroundHsl) ]}"></div>', '<div class="d-title">', '{title}', '</div>', '</div>', '</tpl>'),
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Number} requestId
         */
        requestId: null
    },
    constructor(config undefined {}) {
        this.callParent(args);
        this.load(config.loadParams);
    },
    /**
     * @param {Object} newData
     */
    updateData(newData) {
        this.element.setHtml(this.getTpl().apply(newData));
    },
    /**
     * loads courses or sections.
     * @param {Object} config
     * @return {undefined}
     */
    load(config undefined {}) {
        const params = {};
        let request;
        if (config.filter)
            params.filter = config.filter;
        request = CJ.request({
            rpc: {
                model: 'Course',
                method: 'list_courses'
            },
            params,
            scope: this,
            success: this.onLoadSuccess,
            failure: this.onLoadFailure
        });
        this.setRequestId(request.id);
        this.mask();
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onLoadSuccess(response) {
        const isFga = CJ.User.isFGA();
        let items;
        items = response.ret.map(item => {
            if (isFga && item.student)
                item.title = CJ.tpl('{0} - {1}', item.student.name, item.title);
            return item;
        });
        this.setData(items);
        this.unmask();
    },
    /**
     * @param {Number} status
     * @param {Number} request
     * @return {undefined}
     */
    onLoadFailure(status, request) {
        if (request.aborted)
            return;
        this.unmask();
    },
    /**
     * @param {Object} param
     * @return {undefined}
     */
    abort() {
        CJ.Ajax.abort(this.getRequestId());
    }
});