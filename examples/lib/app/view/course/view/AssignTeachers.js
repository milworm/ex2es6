import 'Ext/Container';

Ext.define('CJ.view.course.view.AssignTeachers', {
    extend: 'Ext.Container',
    alias: 'widget.view-course-view-assign-teachers',
    statics: {
        popup(config) {
            return new CJ.core.view.Popup({
                title: CJ.t('view-course-view-assign-teachers-title'),
                actionButton: { text: CJ.t('view-course-view-assign-teachers-button') },
                content: { xtype: this.xtype }
            });
        }
    },
    config: {
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {String} cls
         */
        cls: ['d-assign-teachers']
    },
    applyItems(items) {
        items = [
            {
                xtype: 'core-view-search-field',
                ref: 'search',
                listeners: {
                    scope: this,
                    element: 'element',
                    delegate: 'input',
                    keypress: this.onFieldKeyPress
                }
            },
            {
                ref: 'list',
                xtype: 'dataview',
                cls: 'd-list d-scroll',
                scrollable: CJ.Utils.getScrollable(),
                disableSelection: true,
                masked: true,
                mode: 'SINGLE',
                store: {
                    autoLoad: true,
                    fields: [
                        'id',
                        'name',
                        'title',
                        'icon',
                        'mainTeacher'
                    ],
                    proxy: {
                        type: 'ajax',
                        url: CJ.constant.request.rpc,
                        enablePagingParams: false,
                        extraParams: {
                            model: 'Course',
                            method: 'list_teachers',
                            id: this.getCourseId()
                        },
                        reader: {
                            type: 'json',
                            rootProperty: 'ret'
                        }
                    }
                },
                itemTpl: [
                    '<div class="d-item d-hbox d-vcenter {[ values.mainTeacher ? \'d-main\' : \'\']}">',
                    '<div class="d-user-icon" style="{[ CJ.Utils.makeIcon(values.icon) ]}"></div>',
                    '<div class="d-content d-vbox d-vcenter">',
                    '<div class="d-title">{title}</div>',
                    '<span class="d-tag">{name}</span>',
                    '</div>',
                    '<div class="d-remove-icon"></div>',
                    '</div>'
                ],
                listeners: {
                    scope: this,
                    itemtap: this.onListItemTap
                }
            }
        ];
        return this.callParent(args);
    },
    /**
     * @return {Number} an id of a block from visible course-viewer.
     */
    getCourseId() {
        return CJ.CourseHelper.getOpenedCourseId();
    },
    /**
     * @param {Ext.Component} list
     * @param {Number} index
     * @param {Ext.Element} el
     * @param {Ext.data.Model} record
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onListItemTap(list, index, el, record, e) {
        if (e.getTarget('.d-remove-icon'))
            return this.removeTeacher(record);
        this.setMainTeacher(record, list.getStore());
    },
    /**
     * @param {Ext.data.Model} record
     * @param {Ext.data.Store} store
     * @return {undefined}
     */
    setMainTeacher(record, store) {
        const mainTeacher = store.findRecord('mainTeacher', true);
        if (mainTeacher)
            mainTeacher.set('mainTeacher', false);
        record.set('mainTeacher', true);
        CJ.request({
            rpc: {
                model: 'Course',
                method: 'set_main_teacher',
                id: this.getCourseId()
            },
            params: { userTag: record.get('name') }
        });
    },
    /**
     * @param {Ext.data.Model} record
     */
    removeTeacher(record) {
        this.getList().mask();
        CJ.request({
            rpc: {
                model: 'Course',
                method: 'remove_teacher',
                id: this.getCourseId()
            },
            params: { userTag: record.get('name') },
            scope: this,
            success: this.onRemoveTeacherSuccess,
            callback: this.onRemoveTeacherCallback
        });
    },
    onRemoveTeacherSuccess(response, request) {
        this.refill(response.ret);
    },
    onRemoveTeacherCallback() {
        this.getList().unmask();
    },
    /**
     * @param {Ext.Evented} e
     */
    onFieldKeyPress(e) {
        if (e.browserEvent.keyCode != 13)
            return;
        let value = e.target.value;
        if (!value)
            return;
        if (CJ.Utils.getTagType(value) != 'user')
            value = `@${ value }`;
        this.assign(value);
        this.resetField();
    },
    getList() {
        return this.down('[ref=list]');
    },
    getSearch() {
        return this.down('[ref=search]');
    },
    resetField() {
        this.getSearch().setValue('');
    },
    assign(user) {
        CJ.request({
            rpc: {
                model: 'Course',
                method: 'add_teacher',
                id: this.getCourseId()
            },
            params: { userTag: user },
            scope: this,
            success: this.onAssignTeacherSuccess,
            failure: this.onAssignTeacherFailure,
            callback: this.onAssignTeacherCallback
        });
    },
    onAssignTeacherSuccess(response) {
        this.refill(response.ret);
    },
    onAssignTeacherFailure(response) {
        switch (response.errCode) {
        case 'NOTFOUND':
            return CJ.alert(CJ.t('msg-feedback-failure'), CJ.t('view-course-view-assign-teacher-not-found'));
        }
    },
    onAssignTeacherCallback() {
        this.getList().unmask();
    },
    refill(items) {
        const store = this.getList().getStore();
        store.removeAll();
        store.add(items);
    }
});