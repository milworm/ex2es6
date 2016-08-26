import 'Ext/Video';

/**
 * Defines a component that is used to show video
 */
Ext.define('Ux.Video', {
    extend: 'Ext.Video',
    xtype: 'ux-video',
    template: [
        {
            reference: 'ghost',
            classList: [`${ Ext.baseCSSPrefix }video-ghost`]
        },
        {
            tag: 'video',
            preload: 'none',
            reference: 'media',
            classList: [`${ Ext.baseCSSPrefix }media`]
        },
        { className: 'd-title' }
    ],
    config: {
        /**
         * @cfg {Object} values
         */
        values: null,
        /**
         * @cfg {Number} timer
         */
        timer: null,
        /**
         * @cfg {Number} currentProgressRequest
         */
        currentProgressRequest: null
    },
    initialize() {
        this.callParent(args);
        this.seekingFunction = Ext.bind(this.onSeeking, this);
        this.media.dom.addEventListener('seeking', this.seekingFunction);
    },
    /**
     * @param {Object} values
     * @return {undefined}
     */
    applyValues(values) {
        this.removeCls([
            'unpublished',
            'rendering'
        ]);
        this.setTimer(false);
        this.setTitle(false);
        const urlConfig = values.cfg, thumb = urlConfig.thumb, url = urlConfig.formats ? urlConfig.formats[this.getSupportedType()] : urlConfig.url;
        if (thumb) {
            this.setPosterUrl(thumb);
        }
        if (urlConfig.converting && urlConfig.progress < 100) {
            this.addCls('rendering');
            this.setProgress(urlConfig.progress);
            this.setTimer(true);
            Ext.TaskQueue.requestWrite(this.updateProgress, this);
        } else if (urlConfig.converting === false) {
            this.addCls('unpublished');
            this.setTitle(CJ.t('ux-video-unpublished-text'));
        }
        if (url) {
            this.setUrl(url);
        }
        return values;
    },
    /**
     * @param {String} text
     */
    setTitle(text) {
        this.element.dom.querySelector('.d-title').innerHTML = text || '';
    },
    /**
     * pauses all other videos that may be playing
     * @return {undefined}
     */
    onPlay() {
        const others = Ext.ComponentQuery.query(this.xtype);
        this.fireEvent('play', this);
        this.media.show();
        Ext.each(others, function (item) {
            if (item.getId() != this.getId() && item.isPlaying())
                item.pause();
        }, this);
    },
    /**
     * finds best supported video type
     * @return {String}
     */
    getSupportedType() {
        const el = this.media.dom;
        let ogg;
        let webm;
        let mp4;
        mp4 = el.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');
        if (mp4 == 'probably') {
            // low bandwidth and small scree detection
            if (Ext.os.is.Phone)
                return 'mp4_low';
            return 'mp4_high';
        }    /*
        ogg = el.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');

        if (ogg == "probably")
            return "ogg";

        webm = el.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');

        if (webm == "probably")
            return "webm";
        */
        /*
        ogg = el.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');

        if (ogg == "probably")
            return "ogg";

        webm = el.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');

        if (webm == "probably")
            return "webm";
        */
        return 'mp4_low';
    },
    /**
     * added because bug: https://redmine.iqria.com/issues/9986
     * pause happends before seeking or seeked events, so the only possible
     * solution is to continue playing , also the blur is because on pause
     * covers the player therefore steals focus , but lets the seeking button
     * focused so when hovering on top will change the position without clicking
     * on it.
     * @param {Event} event
     * @return {undefined}
     */
    onSeeking(event) {
        this.play();
        event.target.blur();
    },
    /**
     * overridden because Android4 & iPad -> isInlineVideo == true
     * @return {undefined}
     */
    onPause() {
        this.fireEvent('pause', this, this.getCurrentTime());
        if (!(Ext.browser.is.Firefox && !Ext.Viewport.isFullScreen))
            return;    // Firefox needs some time to show video in fullscreen mode and during the animation
                       // isFullScreen is false, so when animation is done we need start playing the video.
                       // https://redmine.iqria.com/issues/9949
        // Firefox needs some time to show video in fullscreen mode and during the animation
        // isFullScreen is false, so when animation is done we need start playing the video.
        // https://redmine.iqria.com/issues/9949
        clearTimeout(this.playOnFullscreenTimerId);
        this.playOnFullscreenTimerId = Ext.defer(function () {
            Ext.Viewport.isFullScreen && this.play();
        }, 250, this);
    },
    /**
     * stops the video
     */
    onErased() {
        this.showGhost();
    },
    /**
     * simply shows ghost-cover.
     * @return {undefined}
     */
    showGhost() {
        this.pause();
        this.media.hide();
        this.ghost.show();
    },
    /**
     * @param {Boolean|Number} newTimer
     * @param {Number} oldTimer
     * @return {undefined}
     */
    applyTimer(newTimer, oldTimer) {
        if (oldTimer)
            clearInterval(oldTimer);
        if (!newTimer)
            return;
        const me = this;
        return setInterval(() => {
            me.updateProgress();
        }, 5000);
    },
    /**
     * @param {Number} amount
     * @return {undefined}
     */
    setProgress(amount) {
        if (amount < 5)
            amount = 5;
        if (amount > 98)
            amount = 98;
        this.setTitle(`${ Math.round(amount) }%`);
    },
    /**
     * makes a request to the server in order to get information
     * about converting the file.
     */
    updateProgress() {
        const values = this.getValues(), request = this.getCurrentProgressRequest();
        if (request)
            return;
        this.setCurrentProgressRequest(true);
        CJ.Embed.requestUrlInfos(values.code, this.onRequestUrlInfosSuccess, Ext.emptyFn, this);
    },
    /**
     * @param {Object} response
     * @return {undefined}
     */
    onRequestUrlInfosSuccess(response) {
        if (this.isDestroyed)
            return;
        const progress = response.cfg.progress;
        this.setCurrentProgressRequest(false);
        this.setProgress(progress);
        if (progress < 100)
            return;
        this.setTimer(false);
        this.setValues(response);
        this.fireEvent('converted', this);
    },
    /**
     * also clears timer
     */
    destroy() {
        this.media.dom.removeEventListener('seeking', this.seekingFunction);
        this.setTimer(false);
        this.callParent(args);
    }
});