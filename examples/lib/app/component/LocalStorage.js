/**
 * Defines a component that allows us to work with localStorage 
 * (where it's supported)
 */
Ext.define('CJ.component.LocalStorage', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.LocalStorage',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @param {String} key
     * @return {String}
     */
    getItem(key) {
        if (!this.isSupported())
            return null;
        return localStorage.getItem(key);
    },
    /**
     * @param {String} key
     * @param {String} value
     */
    setItem(key, value) {
        if (!this.isSupported())
            return;
        return localStorage.setItem(key, value);
    },
    /**
     * @param {String} key
     */
    removeItem(key) {
        if (!this.isSupported())
            return;
        return localStorage.removeItem(key);
    },
    /**
     * Verify for localStorage support
     * We use this technique because private mode
     * on iOS shoots an error when setting an Item.
     * http://stackoverflow.com/a/11214467
     * @return {Boolean}
     */
    isSupported: (() => {
        const mod = 'modernizr';
        let supported = false;
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            supported = true;
        } catch (e) {
        }
        return () => supported;
    })()
});