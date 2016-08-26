import 'Ext/Component';

/**
 * Audio player
 */
Ext.define('Ux.AudioPlayer', {
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.ux-audio-player',
    /**
     * @cfg {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'ux-audio-player',
        /**
         * @cfg {String} url
         */
        url: null,
        /**
         * @cfg {String} duration
         */
        duration: null,
        /**
         * @cfg {MediaElementPlayer} player
         */
        player: true,
        /**
         * @cfg {Object} data
         */
        data: {}
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        if (e.getTarget('.d-button', 10))
            this.onPlayButtonTap();
        else if (e.getTarget('.d-download', 10))
            this.onDownloadButtonTap();
    },
    /**
     * @param {Object} data
     * @return {undefined}
     */
    updateData(data) {
        this.element.setHtml([
            '<div class=\'d-button d-paused\'></div>',
            '<div class=\'d-download\'></div>',
            '<div class=\'d-time\'>00:00</div>',
            '<div class=\'d-timeline-container\'>',
            '<div class=\'d-timeline\'>',
            '<div class=\'d-progress\'></div>',
            '</div>',
            '</div>'
        ].join(''));
    },
    /**
     * @param {Object} config
     * @return {Object}
     */
    applyPlayer(config) {
        if (!config)
            return false;
        this.getUrl();
        this.media.onDom('loadedmetadata', this.onLoadedMetaData, this);
        this.media.onDom('timeupdate', this.onTimeUpdate, this);
        return this.media.dom;
    },
    /**
     * @return {undefined}
     */
    onLoadedMetaData() {
        this.setDuration(this.getPlayer().duration);
    },
    /**
     * @return {undefined}
     */
    onTimeUpdate() {
        const timeline = this.getTimeline(), progress = this.getProgress(), player = this.getPlayer(), timePercent = player.currentTime / player.duration * 100;
        progress.setWidth(`${ timePercent }%`);
        if (timePercent == 100)
            this.pause();
    },
    /**
     * @param {Number} duration seconds
     * @return {String}
     */
    applyDuration(duration) {
        let minutes = Math.floor(duration / 60), seconds = Math.round(duration - 60 * minutes);
        if (minutes < 10)
            minutes = `0${ minutes }`;
        if (seconds < 10)
            seconds = `0${ seconds }`;
        return CJ.tpl('{0}:{1}', minutes, seconds);
    },
    /**
     * @param {String} duration
     */
    updateDuration(duration) {
        this.element.dom.querySelector('.d-time').innerHTML = duration;
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [{
                    reference: 'media',
                    preload: 'metadata',
                    tag: 'audio'
                }]
        };
    },
    /**
     * @param {String} newUrl
     * @param {String} oldUrl
     */
    updateUrl(newUrl, oldUrl) {
        // undefined ais used to remove an attribute
        this.media.set({ src: newUrl ? newUrl : undefined });
    },
    /**
     * @return {undefined}
     */
    onPlayButtonTap() {
        if (this.isPaused())
            this.play();
        else
            this.pause();
    },
    /**
     * @return {undefined}
     */
    play() {
        this.getPlayButton().removeCls('d-paused');
        this.getPlayer().play();
    },
    /**
     * @return {undefined}
     */
    pause() {
        this.getPlayButton().addCls('d-paused');
        this.getPlayer().pause();
    },
    /**
     * @return {undefined}
     */
    isPaused() {
        return this.getPlayer().paused;
    },
    /**
     * @return {undefined}
     */
    onDownloadButtonTap() {
        if (Ext.os.is.iOS)
            return;
        CJ.Utils.download(this.getUrl());
    },
    /**
     * @return {Ext.Element}
     */
    getPlayButton() {
        if (this.playButton)
            return this.playButton;
        return this.playButton = this.element.down('.d-button');
    },
    /**
     * @return {Ext.Element}
     */
    getProgress() {
        if (this.progress)
            return this.progress;
        return this.progress = this.element.down('.d-progress');
    },
    /**
     * @return {Ext.Element}
     */
    getTimeline() {
        if (this.timeline)
            return this.timeline;
        return this.timeline = this.element.down('.d-timeline');
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.pause();
        if (this.playButton)
            this.playButton.destroy();
        if (this.progress)
            this.progress.destroy();
        if (this.timeline)
            this.timeline.destroy();
        this.callParent(args);
    }
});