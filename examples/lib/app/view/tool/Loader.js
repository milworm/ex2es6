import 'Ext/Container';

/**
 * Defines a component that handles all stuff connect with loading a tool: 
 * shows dummy tool with loading indicator.
 * recognizes type of a tool that should be inserted.
 * replaces loader with real tool.
 */
Ext.define('CJ.view.tool.Loader', {
    extend: 'Ext.Container',
    alias: 'widget.view-tool-loader',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    /**
     * @property {Boolean} isToolLoader
     */
    isToolLoader: true,
    statics: {
        /**
         * @param {Object} config
         * @return {undefined}
         */
        load(config) {
            return Ext.factory(Ext.apply({
                xtype: 'view-tool-loader',
                loadingType: 'invisible'
            }, config || {}));
        }
    },
    config: {
        /**
         * @cfg {String} loadingType [inline, invisible]
         */
        loadingType: 'inline',
        /**
         * @cfg {Object} values
         */
        values: {},
        /**
         * @cfg {Object} uploader
         */
        uploader: null,
        /**
         * @cfg {CJ.vire.tool.Base} tool Reference to a real tool.
         */
        tool: null,
        /**
         * @cfg {Object} data
         */
        data: null,
        /**
         * @cfg {Boolean} editing
         */
        editing: true,
        /**
         * @cfg {Number} progress
         */
        progress: 0,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'x-container x-unsized d-tool\'>', '<div class=\'d-draggable d-draghandle\'>', '<div class=\'grab\'></div>', '<div class=\'grab\'></div>', '<div class=\'grab\'></div>', '</div>', '<div class=\'x-inner\'>', '<div class=\'d-preview\'>', '<img src=\'{[Core.opts.resources_root]}/resources/images/loader.gif\' />', '</div>', '</div>', '<div class=\'x-container x-unsized d-menu\'>', '<div class=\'x-inner\'>', '<div class=\'x-innerhtml\' id=\'ext-element-305\'>', '<span data-command=\'edit\' class=\'d-item d-edit\'>{edit}</span>', '<span data-command=\'delete\' class=\'d-item d-delete\'>{remove}</span>', '</div>', '</div>', '</div>', '</div>', { compiled: true })
    },
    /**
     * @return {undefined}
     */
    updateUploader(newUploader, oldUploader) {
        if (oldUploader)
            oldUploader.abort();
    },
    /**
     * replaces currently dummy tool with real one
     * @param {CJ.view.tool.Base} tool
     */
    replace(tool) {
        if (this.getLoadingType() == 'inline')
            this.getList().replace(this, tool);
    },
    /**
     * @param {Object} values
     */
    updateValues(values) {
        const loadingType = this.getLoadingType();
        const isInline = loadingType == 'inline';
        const event = values.event;
        const url = values.url;
        let uploader;
        if (event) {
            if (isInline)
                this.onFileBeforeUpload();
            uploader = CJ.FileUploader.upload(event.target, {
                scope: this,
                success: this.onUploadFileSuccess,
                failure: this.onUploadFileFailure,
                progress: isInline ? this.onUploadFileProgress : Ext.emptyFn
            });
            this.setUploader(uploader);
            return;
        }
        if (isInline)
            this.setData({});    // get information from url
        // get information from url
        if (url)
            this.requestUrlInfo(url);
    },
    /**
     * method will be called before file starts loading, 
     * renders component in case when it's inline.
     * @return {undefined}
     */
    onFileBeforeUpload() {
        if (this.getLoadingType() != 'inline')
            return;
        this.setData({});
        this.onUploadFileProgress(0);
    },
    /**
     * @param {Object} response
     */
    onUploadFileSuccess(response) {
        this.requestUrlInfo(CJ.tpl('/u/{0}/{1}', response.uuid, response.name));
    },
    /**
     * @param {Object} response
     */
    onUploadFileProgress(progress) {
        this.setProgress(progress);
        if (this.hasPendingRaf)
            return;
        this.hasPendingRaf = true;
        Ext.TaskQueue.requestWrite(function () {
            delete this.hasPendingRaf;
            if (this.isDestroyed)
                return;
            const value = this.getProgress(), node = this.element.dom;
            node.querySelector('.d-preview').innerHTML = `${ value } % `;
        }, this);
    },
    /**
     * @param {String} url
     */
    requestUrlInfo(url) {
        CJ.Embed.requestUrlInfos(url, this.onLoadSuccess, this.onLoadFailure, this);
    },
    /**
     * method will be called when uploadcare cannot load file
     * @param {XMLHttpRequest} xhr
     * @param {Object} fileUploader
     * @return {undefined}
     */
    onUploadFileFailure() {
        this.fireEvent('failed', this);
        if (this.getLoadingType() != 'inline')
            this.destroy();
        const list = this.getList();    // ST resets parent before destroying the component
        // ST resets parent before destroying the component
        if (list)
            list.removeListItem(this);
    },
    /**
     * @return {CJ.view.list.Editor}
     */
    getList() {
        return this.up('[isList]');
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onLoadSuccess(response) {
        if (this.fireEvent('upload', this, response) === false)
            return;
        if (this.getLoadingType() == 'invisible')
            return;
        const type = response.type;
        this.replace({
            editing: this.getEditing(),
            values: response,
            xtype: CJ.tpl('view-tool-{0}-tool', type == 'custom_card' ? 'custom' : type)
        });
    },
    onLoadFailure() {
    },
    /**
     * @param {Boolean} state
     */
    updateEditing(state) {
        if (this.initialized)
            this.setData(this.getData());
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        Ext.apply(data, {
            edit: CJ.t('view-answers-base-menu-edit'),
            remove: CJ.t('view-answers-base-menu-delete')
        });
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setUploader(null);
        this.callParent(args);
    }
});