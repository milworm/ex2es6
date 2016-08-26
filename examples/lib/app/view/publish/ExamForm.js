import 'Ext/Component';

/**
 * Defines a component that allows users to configure exam-settings for activity such as:
 * passing grade, badge, skill title and description etc...
 */
Ext.define('CJ.view.publish.ExamForm', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-exam-form',
    /**
     * @property {Object} eventedConfig
     */
    eventedConfig: null,
    /**
     * @property {Object} config
     */
    config: {
        floatingCls: null,
        hiddenCls: null,
        styleHtmlCls: null,
        tplWriteMode: null,
        disabledCls: null,
        carousel: null,
        /**
         * @cfg {Number} passingGrade
         */
        passingGrade: null,
        /**
         * @cfg {Object} badge
         */
        badge: null,
        /**
         * @cfg {Ext.Component} imageField
         */
        imageField: {},
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} cls
         */
        cls: 'd-exam-form',
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<span class=\'d-title\'>{formTitle}</span>', '<div class=\'d-passing-grade-field d-hbox\'>', '<label class=\'d-label\' for=\'grade\'>{passingGradeLabel}</label>', '<input class=\'d-input d-grade-input\' id=\'grade\' value=\'{passingGrade}\' />', '</div>', '<div class=\'d-badge-form\'>', '<span class=\'d-title\'>{badgeFormTitle}</span>', '<div class=\'d-image-placeholder d-form-item d-vbox d-vcenter\'></div>', '<input class=\'d-name d-form-item\' placeholder="{titlePlaceholder}" value=\'{name}\' maxlength=\'50\'/>', '<textarea class=\'d-description d-form-item\' placeholder="{descriptionPlaceholder}" maxlength=\'500\'>', '{description}', '</textarea>', '</div>', { compiled: true })
    },
    /**
     * @return {undefined}
     */
    initElement() {
        this.callParent(args);
        this.element.on('input', this.onGradeInputChange, this, { delegate: '.d-grade-input' });    // because IE emits input-event when an input has a placeholder attribute.
        // because IE emits input-event when an input has a placeholder attribute.
        if (Ext.browser.is.IE)
            Ext.TaskQueue.requestWrite(this.initInputEventListener, this);
        else
            this.initInputEventListener();
    },
    /**
     * @return {undefined}
     */
    initInputEventListener() {
        this.element.on('input', this.validate, this, { delegate: 'input' });
    },
    /**
     * @param {Object} badge
     * @return {Object}
     */
    applyBadge(badge) {
        return badge || {};
    },
    /**
     * @param {Ext.Evented} e
     * @param {HTMLElement} target
     * @return {undefined}
     */
    onGradeInputChange(e, target) {
        let value = target.value.replace(/[^0-9]/g, '');
        if (value == '')
            return target.value = '';
        if (value > 100)
            value = 100;
        target.value = value;
        this.getCarousel().setFocusOn(this);
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        data = Ext.apply({
            formTitle: CJ.t('view-publish-exam-form-title'),
            badgeFormTitle: CJ.t('view-publish-exam-form-badge-form-title'),
            passingGradeLabel: CJ.t('view-publish-exam-form-passing-grade-label'),
            descriptionPlaceholder: CJ.t('view-publish-exam-form-badge-description-placeholder', true),
            titlePlaceholder: CJ.t('view-publish-exam-form-badge-title-placeholder', true),
            passingGrade: this.getPassingGrade() * 100
        }, this.getBadge());
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyImageField(config) {
        this.getData();
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            usePreviewElement: true,
            showFileName: true,
            previewType: 'preview',
            xtype: 'core-view-form-image-field',
            iconCfg: this.getBadge().iconCfg,
            labelText: 'view-publish-exam-form-image-field-label',
            renderTo: this.element.dom.querySelector('.d-image-placeholder'),
            listeners: {
                uploadsuccess: this.validate,
                fileremoved: this.validate,
                scope: this
            }
        }, config));
    },
    /**
     * @param {Ext.Component} newField
     * @param {Ext.Component} oldField
     * @return {undefined}
     */
    updateImageField(newField, oldField) {
        if (oldField)
            oldField.destroy();
    },
    /**
     * @return {Ext.Component}
     */
    applyChanges() {
        const passingGrade = this.getValueFor('#grade');
        if (Ext.isNumeric(passingGrade))
            this._passingGrade = (passingGrade - 0) / 100;
        else
            this._passingGrade = null;
        this._badge = {
            name: this.getValueFor('.d-name'),
            description: this.getValueFor('.d-description'),
            iconCfg: this.getImageField().getValue()
        };
        return this;
    },
    validate() {
        let failed = false;
        const imageField = this.getImageField();
        const imageHolder = this.element.dom.querySelector('.d-image-placeholder');
        const nameField = this.element.dom.querySelector('.d-name');
        const carousel = this.getCarousel();
        if (!imageField.getValue()) {
            failed = true;
            imageHolder.classList.add('d-error');
        }
        if (!nameField.value) {
            failed = true;
            nameField.classList.add('d-error');
        }
        if (!imageField.getValue() && !nameField.value) {
            failed = false;
            nameField.classList.remove('d-error');
            imageHolder.classList.remove('d-error');
        }
        carousel.allowSubmit(!failed);
        carousel.setFocusOn(this);
    },
    /**
     * returns value of HTMLElement found with selector.
     * @param {String} selector
     * @return {String}
     */
    getValueFor(selector) {
        return this.element.dom.querySelector(selector).value;
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setImageField(null);
    }
});