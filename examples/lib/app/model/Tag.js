import 'Ext/data/Model';

/**
 */
Ext.define('CJ.model.Tag', {
    extend: 'Ext.data.Model',
    alternateClassName: 'CJ.Tag',
    statics: {
        /**
         * @param {String} tags
         * @param {Object} config
         * @param {Function} config.success
         * @param {Function} config.failure
         * @param {Object} config.scope
         * @return {Object} request
         */
        load(tags, config) {
            return CJ.request(Ext.apply({
                rpc: {
                    model: 'Tag',
                    method: 'search'
                },
                params: {
                    tags,
                    includeUsers: false,
                    limit: 50
                }
            }, config));
        }
    },
    config: {
        useCache: false,
        fields: [
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'count',
                type: 'int'
            },
            {
                name: 'type',
                type: 'string'
            },
            {
                name: 'icon',
                type: 'string',
                convert(v, rec) {
                    //if the image has no size, force it to 150
                    //this is here mainly because some imported users have
                    //profile image links with no size.
                    //[TODO] save all FS links by the id only, and render as needed.
                    if (v.indexOf('size:') == -1) {
                        let id = /[0-9]+/.exec(v);
                        if (Ext.isArray(id) && id[0] && !Ext.isNumeric(id[0])) {
                            id = id[0];
                            v = `${ CJ.app.FSUrl }/${ id }/fill:ffffff,size:150x150/image.jpg`;
                        }
                    }
                    return v;
                }
            },
            {
                name: 'title',
                type: 'string'
            }
        ]
    }
});