/**
 * Defines a component that represents the Group.
 */
Ext.define('CJ.model.Group', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.Group',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @param {Number} id Group id
     * @param {Object} config 
     * @return {undefined}
     */
    join(id, config undefined {}) {
        CJ.Ajax.request(Ext.apply({
            rpc: {
                model: 'Group',
                method: 'join_group',
                id
            }
        }, config));
    },
    /**
     * @param {Number} id Group id
     * @param {Object} config 
     * @return {undefined}
     */
    leave(id, config undefined {}) {
        CJ.Ajax.request(Ext.apply({
            rpc: {
                model: 'Group',
                method: 'leave_group',
                id
            }
        }, config));
    },
    /**
     * @param {Number} id
     * @param {Object} config
     */
    destroy(id, config undefined {}) {
        CJ.Ajax.request(Ext.apply({
            rpc: {
                model: 'Group',
                method: 'soft_delete',
                id
            }
        }, config));
    },
    /**
     * @param {Object} config
     * @return {Object} request
     */
    listOwned(config) {
        const params = config.params;
        delete config.params;
        return CJ.Ajax.request(Ext.apply({
            rpc: {
                model: 'Group',
                method: 'list_user_owned_groups'
            },
            params: Ext.apply({
                offset: 0,
                limit: 100
            }, params)
        }, config));
    },
    /**
     * @param {Number} id
     * @param {Object} config
     * @return {Object} request
     */
    members(id, config) {
        return CJ.Ajax.request(Ext.apply({
            rpc: {
                model: 'Group',
                method: 'list_members',
                id
            },
            params: {
                offset: 0,
                limit: 20
            }
        }, config));
    },
    /**
     * @param {Number} id Group id.
     * @param {Number} licenseId License id.
     * @param {Object} config
     * @return {Object} request
     */
    membersForLicensing(id, licenseId, config) {
        config.params = Ext.apply({
            offset: 0,
            limit: 20,
            licenseId
        }, config.params);
        return CJ.Ajax.request(Ext.apply({
            rpc: {
                model: 'Group',
                method: 'list_members_for_licensing',
                id
            }
        }, config));
    }
});