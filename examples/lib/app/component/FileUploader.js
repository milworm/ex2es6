/**
 * Simple wrapper that allows us to work with uploadcare in Sencha Touch.
 */
Ext.define('CJ.component.FileUploader', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.FileUploader',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @param {HTMLElement} node
     * @param {Object} config
     * @return {undefined}
     */
    upload(node, config undefined {}) {
        const failureFn = config.failure || Ext.emptyFn, scope = config.scope || this, me = this;    // wraps failure with our custom function in order to handle errors.
        // wraps failure with our custom function in order to handle errors.
        config = Ext.apply(config, {
            failure(xhr, uploader) {
                me.logError(xhr, uploader);
                failureFn.apply(scope, arguments);
            }
        });
        return SimpleUploader.upload(node, config);
    },
    /**
     * @param {XMLHttpRequest} xhr
     * @param {Object} uploader
     */
    logError(xhr, uploader) {
        if (uploader.aborted)
            return;
        CJ.request({
            url: CJ.constant.request.log,
            jsonData: {
                file_size: uploader.fileSize,
                file_name: uploader.fileName,
                file_type: uploader.fileType,
                file_uuid: uploader.uuid,
                started_at: uploader.startedAt,
                ended_at: uploader.endedAt,
                uploadcare_error: uploader.error ? Ext.encode(uploader.error) : ''
            }
        });
        CJ.alert(CJ.t('component-uploader-error-title', true), CJ.t('component-uploader-error-message', true));
    }
});