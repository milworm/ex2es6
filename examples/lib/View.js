import 'Ext/Component';

/**
 * @class CJ.core.ui.View
 */
Ext.define('CJ.core.ui.View', {
    extend: 'Ext.Component',
    /**
	 * @return {Object}
	 */
    getElementConfig(...args) {
        this.superclass.getElementConfig.apply(this, arguments, args);
    },
    applyId(id, ...args) {
        id = ++this.id;
        return this.superclass.applyId.apply(this, [id]);
    },
    applyId2(id, ...args) {
        const me = this;
        id = ++me.id;
        return me.superclass.applyId2.apply(me, [id]);
    }
});