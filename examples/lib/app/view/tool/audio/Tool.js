import 'app/view/tool/media/Tool';

/**
 * Defines a component to manage audio file-types.
 */
Ext.define('CJ.view.tool.audio.Tool', {
    extend: 'CJ.view.tool.media.Tool',
    /**
     * @cfg {String} alias
     */
    alias: 'widget.view-tool-audio-tool',
    statics: {
        /**
         * @cfg {String} toolType
         */
        toolType: 'audio',
        /**
         * @property {Ext.XTemplate} previewTpl
         */
        previewTpl: Ext.create('Ext.XTemplate', '<div class=\'d-tool d-fake d-audio\' data-tool-index=\'{toolIndex}\'>', '<div class=\'x-inner\'>', '<div class=\'d-preview ux-audio-player\'>', '<div class=\'x-innerhtml\'>', '<div class=\'d-button d-paused\'></div>', '<div class=\'d-download\'></div>', '<div class=\'d-time\'>00:00</div>', '<div class=\'d-timeline-container\'>', '<div class=\'d-timeline\'>', '<div class=\'d-progress\'></div>', '</div>', '</div>', '</div>', '</div>', '</div>', '</div>', { compiled: true })
    },
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-tool d-audio'
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        this.getContent().onElementTap(e);
    },
    /**
     * @return {Object}
     */
    getPreviewConfig() {
        return {
            ref: 'content',
            xtype: 'ux-audio-player',
            cls: 'ux-audio-player',
            url: this.getValues().cfg.url
        };
    },
    /**
     * stops playing the audio
     */
    stopPlaying() {
        this.getContent().pause();
    }
});