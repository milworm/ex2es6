import 'app/core/view/Component';

/**
 * UI for teachers, that allows to create managed courses for specific users.
 */
Ext.define('CJ.view.course.view.AssignUser', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-view-assign-user',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         */
        popup(config) {
            Ext.factory({
                xtype: 'core-view-popup',
                title: CJ.t('view-course-view-assign-user-title'),
                actionButton: { text: CJ.t('view-course-view-assign-user-button') },
                content: Ext.apply({ xtype: this.xtype }, config)
            });
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} cls
         */
        cls: 'd-course-assign-user',
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Boolean} type
         */
        type: 'light',
        /**
         * @cfg {String} courseId
         */
        courseId: null,
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Object} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<input class=\'d-input\' type=\'text\' placeholder=\'{[ CJ.t(\'view-course-view-assign-user-input\', true) ]}\' />')
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        if (!popup)
            return;
        popup.on('actionbuttontap', this.addUser, this);
    },
    /**
     * calls Course#manage_for to add a user to a course.
     */
    addUser() {
        this.getPopup().setLoading(true);
        CJ.request({
            rpc: {
                model: 'Course',
                method: 'manage_for',
                id: this.getCourseId()
            },
            params: { userTag: this.getEnteredValue() },
            scope: this,
            success: this.onAddUserSuccess,
            failure: this.onAddUserFailure
        });
        return false;
    },
    /**
     * @return {String}
     */
    getEnteredValue() {
        const value = this.element.dom.querySelector('.d-input').value;
        return CJ.Utils.getTagType(value) == 'user' ? value : `@${ value }`;
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onAddUserSuccess(response) {
        this.getPopup().hide();
        CJ.app.redirectTo(`!cs/${ response.ret }`);
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onAddUserFailure(response) {
        this.getPopup().setLoading(false);
        switch (response.errCode) {
        case 'NOTFOUND':
            return CJ.alert(CJ.t('msg-feedback-failure'), CJ.t('view-course-view-assign-user-not-found'));
        }
    }
});