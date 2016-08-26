/**
 * Class used to incapsulate all ajax-requests logic concerning Country
 */
Ext.define('CJ.model.Country', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.Country',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @param {String} countryCode
     * @param {Object} config
     * return {undefined}
     */
    loadStates(countryCode, config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'Country',
                method: 'get_province_options'
            },
            params: { country_code: countryCode }
        }, config));
    },
    /**
     * @param {Object} config
     * return {undefined}
     */
    loadCountries(config) {
        CJ.request(Ext.apply({
            rpc: {
                model: 'Country',
                method: 'get_options'
            }
        }, config));
    }
});