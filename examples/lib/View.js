import 'Ext/Component'
import 'Ext/dom/Element'

/**
 * @class CJ.core.ui.View
 */
Ext.define('CJ.core.ui.View', {
    extend: 'Ext.Component',
    /**
	 * @return {Object}
	 */
    getElementConfig(...args) {
        this.superclass.getElementConfig.apply(this, args)
    },
    /**
	 * @param {Number} id
	 * @return {Number}
	 */
    applyId(id) {
        id = ++this.id
        return this.superclass.applyId.apply(this, [id])
    },
    /**
	 * @param {String} param
	 * @return {String}
	 */
    applyId2(param) {
        const me = this
        return me.superclass.applyId2.apply(me, [param])
    },
    /**
	 * @param {Object} config
	 * @param {String} config.firstName
	 * @param {String} config.lastName
	 * @return {undefined}
	 */
    sayHello(config) {
        const firstName = config.firstName
        const lastName = config.lastName
        alert(`${ firstName } ${ lastName }!`)
    }
})