import 'Ext/Container';

Ext.define('CJ.view.answers.base.Settings', {
    extend: 'Ext.Container',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    config: {
        /**
		 * @cfg {String} cls
		 */
        cls: 'd-answer-settings d-scroll',
        /**
		 * @cfg {CJ.core.view.Popup} popup
		 */
        popup: null
    },
    /**
	 * @param {Object} config
	 */
    constructor(config) {
        this.callParent(args);
        config = config || {};
        if (config)
            this.setValues(config.values);
    }
});