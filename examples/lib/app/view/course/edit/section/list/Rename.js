import 'Ext/Component';

/**
 * Defines a component that is used to rename a section.
 */
Ext.define('CJ.view.course.edit.section.list.Rename', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-list-rename',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {Object} config
         * @return {CJ.core.view.Popup}
         */
        popup(config) {
            return Ext.factory(Ext.apply({
                xtype: 'core-view-popup',
                title: CJ.t('view-course-edit-section-list-rename-title'),
                content: {
                    xtype: this.xtype,
                    section: config.section
                },
                actionButton: { text: CJ.t('view-course-edit-section-list-rename-submit') }
            }, config));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Ext.Component} section
         */
        section: null,
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-section-rename',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-section-rename-inner',
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {Number} maxLength
         */
        maxLength: 150,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-hint\'>{hint}</div>', '<input type=\'text\' value="{title}" class=\'d-input\' maxlength=\'{maxlength}\' placeholder=\'{placeholder}\' />', { compiled: true })
    },
    /**
     * @return {String}
     */
    getInputValue() {
        return this.element.dom.querySelector('.d-input').value;
    },
    /**
     * @param {Object} data
     * @return {Object}
     */
    applyData(data) {
        let title = this.getSection().getTitle();
        const placeholder = CJ.t('view-course-edit-section-list-rename-placeholder', true);
        if (title == placeholder)
            title = '';
        return Ext.apply(data, {
            title: Ext.htmlEncode(title),
            hint: CJ.t('view-course-edit-section-list-rename-hint'),
            placeholder,
            maxlength: this.getMaxLength()
        });
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {CJ.core.view.Popup} popup
     * @return {undefined}
     */
    updatePopup(popup) {
        if (!popup)
            return;
        popup.onBefore('actionbuttontap', this.onPopupActionButtonTap, this);
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    onPopupActionButtonTap() {
        return !Ext.isEmpty(Ext.String.trim(this.getInputValue()));
    }
});