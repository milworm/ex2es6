/**
 * Very simple implementation of pattern Observer.
 */
Ext.define('CJ.component.Observer', {
    alternateClassName: 'CJ.Observer',
    handlers: {},
    /**
     * @param {String} name
     * @param {Function} callback
     * @param {Object} scope
     */
    on(name, callback, scope) {
        (this.handlers[name] = this.handlers[name] || []).push({
            name,
            callback,
            scope
        });
    },
    /**
     * @param {String} name
     * @param {Function} callback
     * @param {Object} scope
     */
    un(name, callback, scope) {
        if (!this.handlers[name])
            return;
        const handlers = this.handlers[name];
        let i = handlers.length;
        while (i--) {
            const handler = handlers[i];
            if (handler.callback == callback && handler.scope == scope)
                handlers.splice(i, 1);
        }
    },
    /**
     * @param {String} event
     * @return {Boolean}
     */
    fire(name) {
        const handlers = this.handlers[name];
        if (!handlers)
            return;
        const args = [].slice.call(arguments, 1);
        for (let i = 0, item; item = handlers[i]; i++) {
            item.callback.apply(item.scope, args);
        }
    }
}, cls => {
    const instance = new cls();
    CJ.on = Ext.bind(instance.on, instance);
    CJ.un = Ext.bind(instance.un, instance);
    CJ.fire = Ext.bind(instance.fire, instance);
});