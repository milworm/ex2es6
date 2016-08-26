import 'Ext/data/Store';

/**
 */
Ext.define('CJ.store.Tags', {
    extend: 'Ext.data.Store',
    config: {
        storeId: 'Tags',
        model: 'CJ.model.Tag',
        proxy: {
            type: 'ajax',
            url: Core.opts.rcall_url,
            reader: {
                type: 'json',
                rootProperty: 'ret'
            },
            listeners: {
                exception(store, response, op) {
                    //handle 401 - Unauthorized
                    //this handles the cases where the user get's disconnected
                    //while being in the software and makes a request
                    if (CJ.User.isLogged() && response.status === 401) {
                        CJ.User.onLogoutSuccess();
                    }
                }
            }
        }
    }
});