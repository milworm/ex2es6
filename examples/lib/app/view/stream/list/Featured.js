import 'app/view/stream/list/Base';

/**
 * Defines a component that we use to display items in featured-tab for Portal.
 */
Ext.define('CJ.view.stream.list.Featured', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.stream.list.Base',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-stream-list-featured',
    /**
     * @property {Object} statics
     */
    statics: {
        /**
         * @param {String} tags
         * @param {Object} config
         * @return {undefined}
         */
        load(tags, config) {
            return CJ.Ajax.request(Ext.apply({
                rpc: {
                    model: 'Portal',
                    method: 'info'
                },
                params: { tags }
            }, config));
        }
    },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-list d-list-featured',
        /**
         * @cfg {String} portalTag
         */
        portalTag: null,
        /**
         * @cfg {Array} categories
         */
        categories: null,
        /**
         * @cfg {Object} scrollLoader
         */
        scrollLoader: null,
        /**
         * @cfg {Ext.XTemplate} categoriesTpl
         */
        categoriesTpl: Ext.create('Ext.XTemplate', '<div class=\'d-section-header\'>', '{[ CJ.t(\'view-stream-list-featured-category-section-title\') ]}', '</div>', '<div class=\'d-section-items\'>', '<tpl for=\'categories\'>', '<a class="d-category-block" href="{[ this.createUrl(values) ]}" onclick="return false;">', '<div class="d-body" style="background-image: url(\'{icon}\')">', '</div>', '<div class="d-footer">', '<span>{name}</span>', '</div>', '</a>', '</tpl>', '</div>', {
            /**
                 * @param {Object} values
                 * @return {String}
                 */
            createUrl(values) {
                if (values.url)
                    return values.url;
                return CJ.tpl('#!e/${0}/c/{1}', values.hashId, values.portalTag);
            }
        })
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            className: 'd-list d-block-list d-multicolumn d-scroll',
            children: [{
                    className: 'x-inner d-block-list-inner',
                    children: [
                        {
                            reference: 'categoriesElement',
                            className: 'd-section d-category-section'
                        },
                        {
                            className: 'd-section d-category-section',
                            children: [
                                {
                                    className: 'd-section-header',
                                    html: CJ.t('view-stream-list-featured-featured-section-title')
                                },
                                {
                                    className: 'd-section-items',
                                    children: [{ reference: 'innerElement' }]
                                }
                            ]
                        }
                    ]
                }]
        };
    },
    /**
     * @inheritdoc
     */
    applyItems(items) {
        Ext.each(items, item => {
            item.pinned = true;
        });
        this.getCategories();
        this.renderItems(items);
    },
    /**
     * @param {Array} categories
     * @return {undefined}
     */
    updateCategories(categories) {
        if (!categories.length)
            return;
        let followersCount;
        let documentsCount;
        const items = [];
        let html;
        const portalTag = this.getPortalTag();
        for (let i = 0, item; item = categories[i]; i++) {
            documentsCount = CJ.Utils.getShortCount(item.documents);
            followersCount = CJ.Utils.getShortCount(item.followers);
            items.push(Ext.apply(item, {
                followersLabel: CJ.t(CJ.Utils.pluralizeQuantity('view-category-subscriber', followersCount)),
                documentsLabel: CJ.t(CJ.Utils.pluralizeQuantity('view-category-activity', documentsCount)),
                documentsCount,
                followersCount,
                portalTag
            }));
        }
        html = this.getCategoriesTpl().apply({ categories: items });
        let template, templateContent;
        if (CJ.Utils.supportsTemplate()) {
            template = document.createElement('template');
            template.innerHTML = html;
            templateContent = template.content;
        } else {
            template = document.createElement('div');
            template.innerHTML = html;
            templateContent = document.createDocumentFragment();
            const nodes = template.childNodes;
            while (nodes.length)
                templateContent.appendChild(nodes[0]);
        }
        this.categoriesElement.appendChild(templateContent);
    },
    /**
     * @inheritdoc
     */
    renderNoContent: Ext.emptyFn,
    // because we allow users to insert blocks to featured-feed only with "pin"-option.
    adjustContaining: Ext.emptyFn
});