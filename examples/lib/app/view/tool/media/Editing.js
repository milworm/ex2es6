import 'Ext/Container';

/**
 * Defines a component to create/edit any kind of media tool, for example: 
 * image, audio, video etc ...
 */
Ext.define('CJ.view.tool.media.Editing', {
    extend: 'Ext.Container',
    xtype: 'view-tool-media-editing',
    statics: {
        /**
         * @param {Object} config
         * @param {Object} config.popup
         * @param {Object} config.content
         * @return {undefined}
         */
        popup(config undefined {}) {
            Ext.factory(Ext.apply({
                xtype: 'core-view-popup',
                cls: 'd-popup-transparent d-answer-media-popup',
                content: Ext.apply({ xtype: this.xtype }, config.content),
                actionButton: { text: 'view-answer-type-media-popup-submit-button-text' }
            }, config.popup));
        }
    },
    config: {
        cls: 'd-answer-media',
        popup: null,
        preview: null,
        urlField: true,
        fileField: true
    },
    /**
     * @param {CJ.core.view.Popup} popup
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
        if (!this.getPreview())
            return false;
    },
    applyPreview(config) {
        if (!config)
            return false;
        return Ext.factory(config);
    },
    updatePreview(newPreview, oldPreview) {
        if (oldPreview)
            oldPreview.destroy();
        if (newPreview) {
            CJ.Animation.animate({
                el: newPreview.element,
                cls: 'showing',
                maxDelay: 1000,
                after() {
                    newPreview.removeCls('showing');
                }
            });
            this.insert(0, newPreview);
        }
    },
    applyUrlField(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'urlfield',
            cls: 'd-media-field d-url-field',
            name: 'url',
            clearIcon: false,
            placeHolder: 'view-answer-type-media-url-field-placeholder',
            listeners: {
                input: {
                    element: 'element',
                    delegate: 'input',
                    fn: this.onUrlFieldInput,
                    scope: this
                }
            }
        });
        return Ext.factory(config);
    },
    updateUrlField: CJ.Utils.updateComponent,
    applyFileField(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'component',
            cls: 'd-media-field d-upload-field',
            tpl: Ext.create('Ext.Template', '<input type=\'file\' class=\'invisible-stretch\' />{text}'),
            data: { text: CJ.app.t('view-answer-type-media-file-field-placeholder') },
            listeners: {
                change: {
                    element: 'element',
                    delegate: '[type=file]',
                    fn: this.onFileChange,
                    scope: this
                }
            }
        });
        return Ext.factory(config);
    },
    updateFileField: CJ.Utils.updateComponent,
    onUrlFieldInput(e, input) {
        const fileField = this.getFileField(), value = input.value;
        if (fileField)
            fileField.setData({ text: fileField.initialConfig.data.text });
        clearTimeout(this.onInputTimeout);
        if (!value)
            return this.setPreview(false);
        this.onInputTimeout = Ext.defer(function () {
            this.load({ url: input.value });
        }, 500, this);
    },
    onFileChange(e) {
        this.getUrlField().reset();
        this.getFileField().setData({ text: e.target.files[0].name });
        this.load({ event: e });
    },
    load(values) {
        const preview = this.getPreview();
        if (preview)
            preview.addCls('hiding');
        this.getPopup().setLoading(true);
        CJ.view.tool.Loader.load({
            values,
            listeners: {
                upload: this.onFileUploaded,
                failed: this.onFileUploadFailed,
                scope: this
            }
        });
    },
    onFileUploaded(loader, response) {
        this.getPopup().setLoading(false);
        const type = response.type == 'custom_card' ? 'custom' : response.type;
        this.setPreview({
            xtype: Ext.String.format('view-tool-{0}-tool', type),
            values: response
        });
    },
    onFileUploadFailed() {
        this.getPopup().setLoading(false);
    }
});