import 'Ext/Component';
import 'Ext/dom/Element';

/**
 * @class CJ.core.ui.View
 */
Ext.define('CJ.core.ui.View', {
    extend: 'Ext.Component',
    /**
	 * @return {Object}
	 */
    getElementConfig(...args) {
        this.callParent(args);
    },
    /**
	 * @param {Number} id
	 * @return {Number}
	 */
    applyId(id, ...args) {
        id = ++this.id;
        return this.callParent(args);
    },
    /**
	 * @param {String} param
	 * @return {String}
	 */
    applyId2(param = 33, param2 = 334) {
        const me = this;
        return me.callParent([param]);
    },
    /**
	 * @param {Object} config
	 * @param {String} config.firstName
	 * @param {String} config.lastName
	 * @return {undefined}
	 */
    sayHello(config) {
        const firstName = config.firstName;
        const lastName = config.lastName;
        alert(`${ firstName } ${ lastName }!`);
    }
});