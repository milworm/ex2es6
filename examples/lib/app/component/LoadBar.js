/**
 * The class provide load bar component.
 * @class CJ.component.LoadBar
 */
Ext.define('CJ.component.LoadBar', {
    /**
     * @cfg {String} alternateClassName
     */
    alternateClassName: 'CJ.LoadBar',
    /**
     * @cfg {Boolean} singleton
     */
    singleton: true,
    /**
     * @property {HTMLElement} element
     */
    element: null,
    /**
     * @property {Boolean} rendered
     */
    rendered: false,
    /**
     * @property {Boolean} running A flag that will be true in case when component shows loading progress.
     */
    running: false,
    /**
     * @property {Boolean} finishing A flag that will be true in case when component is in finishing-state.
     */
    finishing: false,
    /**
     * @property {Number} startFrameId
     */
    startFrameId: null,
    /**
     * @property {Number} finishTimerId
     */
    finishTimerId: null,
    /**
     * @property {String} tpl
     */
    tpl: '<div class=\'d-progress\'></div>',
    /**
     * Renders a load bar.
     * @param {Ext.dom.Element} renderTo
     */
    render(renderTo) {
        this.rendered = true;
        this.element = Ext.DomHelper.append(renderTo, {
            cls: 'd-load-bar',
            html: this.tpl
        });
    },
    /**
     * @return {Object}
     */
    getDefaultRunConfig() {
        return {
            renderTo: Ext.Viewport.element,
            maskedEl: Ext.Viewport.element
        };
    },
    /**
     * Runs animation of a load bar.
     * @param {Object} config
     * @param {Ext.dom.Element} config.renderTo
     * @param {Ext.dom.Element} [config.maskedEl]
     * @param {Number} [config.duration]
     * @param {Number} [config.width]
     */
    run(config) {
        if (this.rendered)
            this.cleanup();
        config = config || this.getDefaultRunConfig();
        this.render(config.renderTo);
        this.maskedEl = config.maskedEl;
        if (this.maskedEl)
            this.maskedEl.addCls('d-load-bar-mask');    // when we execute javascript it could take more than 16ms (1 frame)
                                                        // and at that case browser will not call requestAnimationFrame callback
                                                        // so we need to give some time for a browser.
        // when we execute javascript it could take more than 16ms (1 frame)
        // and at that case browser will not call requestAnimationFrame callback
        // so we need to give some time for a browser.
        this.startFrameId = fastdom.defer(4, function () {
            this.running = true;
            this.element.classList.add('d-running');
        }, this);
    },
    /**
     * @return {undefined}
     */
    finish() {
        if (this.finishing || !this.rendered)
            return;
        if (!this.running)
            return this.cleanup();
        this.finishing = true;
        this.element.classList.add('d-finishing');
        this.finishTimerId = Ext.defer(function () {
            this.element.classList.remove('d-finishing');
            this.cleanup();
        }, 500, this);
    },
    /**
     * Destroys a load bar.
     */
    cleanup() {
        Ext.removeNode(this.element);
        fastdom.clear(this.startFrameId);
        clearTimeout(this.finishTimerId);
        this.rendered = false;
        this.running = false;
        this.finishing = false;
        if (this.maskedEl)
            this.maskedEl.removeCls('d-load-bar-mask');
        delete this.element;
        delete this.maskedEl;
    },
    isRunning() {
        return this.running;
    }
});