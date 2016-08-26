import 'app/core/view/form/Icon';

Ext.define('CJ.core.view.form.ImageField', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.core.view.form.Icon',
    /**
     * @property {String} alias
     */
    alias: 'widget.core-view-form-image-field',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} baseCls
         */
        baseCls: '',
        /**
         * @cfg {String} cls
         */
        cls: 'd-image',
        /**
         * @cfg {Boolean} labelText
         */
        labelText: 'core-view-form-image-field-label',
        /**
         * @cfg {String} previewType
         */
        previewType: 'original',
        /**
         * @cfg {Boolean} usePreviewElement
         */
        usePreviewElement: null,
        /**
         * @cfg {Boolean} showFileName
         */
        showFileName: null
    },
    template: [
        {
            className: 'd-preview-element',
            reference: 'previewElement'
        },
        {
            className: 'd-remove-button',
            reference: 'removeButton'
        },
        {
            className: 'invisible-stretch',
            reference: 'input',
            tag: 'input',
            type: 'file'
        },
        {
            className: 'd-label',
            reference: 'label'
        },
        {
            className: 'd-file-name-element',
            reference: 'fileNameElement'
        }
    ],
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onRemoveButtonTap, this, { delegate: '.d-remove-button' });
    },
    /**
     * @return {undefined}
     */
    onRemoveButtonTap() {
        this.setIconCfg(false);
        this.setPreviewUrl(false);
        this.fireEvent('fileremoved', this);
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    updateIconCfg(config) {
        if (!config)
            return this.setPreviewUrl(false);
        this.setPreviewUrl(config[this.getPreviewType()]);
    },
    /**
     * @param {String} url
     */
    setPreviewUrl(url) {
        if (url) {
            const image = new Image();
            image.onload = this.onImagePreloadSuccess.bind(this);
            image.onerror = this.onImagePreloadFailure.bind(this);
            image.src = url;
            this.setUploading(true);
        } else {
            this.removeCls('preview');
            this.getPreviewElement().setStyle({ backgroundImage: undefined });
        }
    },
    /**
     * @param {Event} e
     */
    onImagePreloadSuccess(e) {
        this.addCls('preview');
        this.setUploading(false);
        this.getPreviewElement().setStyle({ backgroundImage: CJ.Utils.getBackgroundUrl(e.target.src) });
    },
    /**
     * @param {Event} e
     */
    onImagePreloadFailure(e) {
        this.setUploading(false);
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onUploadFileSuccess(response) {
        this.callParent(args);
        if (this.getShowFileName())
            this.fileNameElement.setText(response.original_filename);
    },
    /**
     * @return {HTMLElement}
     */
    getPreviewElement() {
        if (this.getUsePreviewElement())
            return this.previewElement;
        return this.element;
    }
});