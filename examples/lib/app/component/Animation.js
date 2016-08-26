/**
 * Helper class to make css3 animations
 */
Ext.define('CJ.component.Animation', {
    singleton: true,
    alternateClassName: 'CJ.Animation',
    /**
     * @param {Object} config
     * @param {Ext.Element} config.el
     * @param {String} config.cls
     * @param {Number} config.maxDelay Maximum animation of time in seconds,
     *                                 used to call after-callback, if animationend
     *                                 wasn't fired.
     * @param {Function} [config.before]
     * @param {Function} [config.after]
     * @param {Object} [config.scope]
     */
    animate(config) {
        const maxDelay = config.maxDelay;
        let el = config.el;
        let timerId;
        Ext.callback(config.before, config.scope);
        el = CJ.fly(el);
        el.on('animationend', this.onAnimationEnd, this, {
            args: [
                timerId,
                config,
                el
            ]
        });
        if (maxDelay)
            timerId = Ext.defer(function () {
                this.onAnimationEnd(timerId, config, el);
            }, maxDelay, this);
        el.addCls(config.cls);
    },
    /**
     * @param {Number} timerId
     * @param {Object} config
     * @param {Ext.Element} el
     * @return {undefined}
     */
    onAnimationEnd(timerId, config, el) {
        clearTimeout(timerId);
        el.un('animationend', this.onAnimationEnd, this);
        Ext.callback(config.after, config.scope);
        CJ.unFly(el);
    }
});