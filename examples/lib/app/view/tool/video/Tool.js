import 'app/view/tool/media/Tool';

/**
 * Defines a component to manage video file-types.
 */
Ext.define('CJ.view.tool.video.Tool', {
    extend: 'CJ.view.tool.media.Tool',
    /**
     * @cfg {String} alias
     */
    alias: 'widget.view-tool-video-tool',
    statics: {
        /**
         * @cfg {String} toolType
         */
        toolType: 'video',
        /**
         * @property {Ext.Template} previewTpl
         */
        previewTpl: Ext.create('Ext.Template', '<div class=\'d-tool d-video d-fake\' data-tool-index=\'{toolIndex}\'></div>', { compiled: true })
    },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-video'
    },
    /**
     * @return {Object}
     */
    getPreviewConfig() {
        return {
            ref: 'content',
            cls: 'x-video d-preview',
            xtype: 'ux-video',
            enableControls: true,
            values: this.getValues(),
            listeners: {
                scope: this,
                converted: this.onVideoConverted
            }
        };
    },
    toViewState() {
        this.callParent(args);
        this.element.on('contextmenu', this.onContextMenu, this);
    },
    onContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    },
    /**
     * updates initialConfig in order to always keep fresh data, so #serialize returns latest values.
     * @param {Ux.Video} video
     * @return {undefined}
     */
    onVideoConverted(video) {
        Ext.apply(this.initialConfig.values, video.getValues());
    },
    /**
     * stops playing the video.
     * @return {undefined}
     */
    stopPlaying() {
        this.getPreview().showGhost();
    }
});