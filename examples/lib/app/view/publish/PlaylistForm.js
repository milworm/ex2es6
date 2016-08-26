import 'Ext/Component';

Ext.define('CJ.view.publish.PlaylistForm', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-publish-playlist-form',
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
         * @cfg {String} cls
         */
        cls: 'd-playlist-form',
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-preview-container\'>', '<input type=\'text\' class=\'d-title-field d-input\' placeholder=\'{titlePlaceholder}\' value="{title}" maxlength=\'60\' />', '</div>', '<textarea class=\'d-description-field d-input\' placeholder=\'{descriptionPlaceholder}\' maxlength=\'140\'>{description}</textarea>', { compiled: true }),
        /**
         * @cfg {String} title
         */
        title: null,
        /**
         * @cfg {String} description
         */
        description: null,
        /**
         * @cfg {Object} icon
         */
        iconCfg: null,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {CJ.core.view.form.ImageField} imageField
         */
        imageField: {}
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        data = Ext.apply({
            titlePlaceholder: CJ.t('view-publish-playlist-form-title-placeholder', true),
            descriptionPlaceholder: CJ.t('view-publish-playlist-form-description-placeholder', true),
            description: Ext.htmlEncode(this.getDescription()),
            title: Ext.htmlEncode(this.getTitle())
        }, data);
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {Object} config
     * @return {CJ.core.view.form.ImageField}
     */
    applyImageField(config) {
        if (!config)
            return false;
        this.getData();
        return Ext.factory(Ext.apply({
            xtype: 'core-view-form-image-field',
            iconCfg: this.getIconCfg(),
            labelText: 'view-publish-playlist-form-image-field-label'
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
        if (newField) {
            const renderTo = this.element.dom.querySelector('.d-preview-container');
            newField.renderTo(renderTo, renderTo.firstChild);
        }
    },
    applyChanges() {
        const titleField = this.element.dom.querySelector('.d-title-field'), title = Ext.String.trim(titleField.value) || CJ.t('view-publish-playlist-form-title-default', true);
        this._title = title;
        this._description = this.element.dom.querySelector('.d-description-field').value;
        this._iconCfg = this.getImageField().getValue();
        return this;
    }
});