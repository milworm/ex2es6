import 'Ext/Component';

Ext.define('CJ.core.view.form.Icon', {
    extend: 'Ext.Component',
    alias: 'widget.core-view-form-icon',
    isField: true,
    isIconField: true,
    config: {
        baseCls: 'd-core-view-form-icon',
        name: null,
        /**
         * @cfg {Boolean} allowEmpty False to generate hsl when iconCfg is empty
         */
        allowEmpty: true,
        iconCfg: null,
        /**
         * @cfg {Boolean} isIcon True if component is used as an icon, so it 
         *                       will render the preview after uploading.
         */
        isIcon: true,
        /**
         * @cfg {Boolean} uploading Flag will be true when uploading is in 
         *                          progress.
         */
        uploading: false,
        /**
         * @cfg {String} labelText
         */
        labelText: 'core-view-form-icon-label',
        /**
         * @cfg {Object} uploader
         */
        uploader: null,
        /**
         * @cfg {String} previewType
         */
        previewType: 'preview'
    },
    /**
     * @cfg {Array} template
     */
    template: [
        {
            tag: 'input',
            className: 'invisible-stretch',
            type: 'file',
            reference: 'input'
        },
        {
            tag: 'div',
            className: 'label',
            reference: 'label'
        }
    ],
    initialize() {
        this.callParent(args);
        this.input.on({
            change: this.onFileSelected,
            scope: this
        });
        const configValue = this.config.value;
        if (configValue)
            this.setValue(configValue);
    },
    updateLabelText(labelText) {
        if (labelText)
            this.label.setHtml(CJ.t(labelText));
        else
            this.label.hide();
    },
    /**
     * @param {Boolean} state
     */
    updateUploading(state) {
        this[state ? 'addCls' : 'removeCls']('loading');
    },
    onFileSelected(e) {
        if (!e.target.value)
            return;    //file select cancelled
        //file select cancelled
        this.setUploading(true);
        this.fireEvent('uploadstart', this, e);
        this.setIconCfg(false);
        const uploader = CJ.FileUploader.upload(e.target, {
            scope: this,
            success: this.onUploadFileSuccess,
            failure: this.onUploadFileFailure,
            progress: this.onUploadFileProgress
        });
        this.setUploader(uploader);
    },
    /**
     * @param {String} url
     * @return {undefined}
     */
    setPreviewUrl(url) {
        if (!this.getIsIcon())
            return;
        let image;
        if (url)
            image = `url("${ url }")`;
        else
            image = undefined;
        this.setStyle({ backgroundImage: image });
    },
    updateIconCfg(config) {
        if (config) {
            const preview = config[this.getPreviewType()];
            if (preview) {
                this.addCls('preview');
                this.setPreviewUrl(preview);
            }
        } else {
            this.removeCls('preview');
            this.setPreviewUrl(false);
        }
    },
    setValue(value) {
        if (Ext.isString(value)) {
            this.setIconCfg({
                preview: value,
                original: value
            });
        }
        if (Ext.isObject(value)) {
            this.setIconCfg(value);
        }
    },
    /**
     * @return {Object} config
     * @return {String|Number} config.original
     */
    getValue() {
        const value = this.getIconCfg();
        if (this.getAllowEmpty())
            return value;
        return value || { original: CJ.Utils.randomHsl() };
    },
    onUploadFileSuccess(response) {
        this.fireEvent('fileuploaddone', this, response);
        this.setUploading(false);
        this.setIconCfg({
            preview: CJ.Utils.getImageUrl(response, 'preview'),
            original: CJ.Utils.getImageUrl(response)
        });
        this.fireEvent('uploadsuccess', this, response, this.getIconCfg());
    },
    onUploadFileFailure(response) {
        this.setUploading(false);
        this.fireEvent('uploadfailure', this, response);
    },
    onUploadFileProgress(progress) {
        this.fireEvent('uploadprogress', this, progress);
    },
    /**
     * @param {Object} newUploader
     * @param {Object} oldUploader
     * @return {undefined}
     */
    updateUploader(newUploader, oldUploader) {
        if (oldUploader)
            oldUploader.abort();
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setUploader(null);
        this.callParent(args);
    }
});