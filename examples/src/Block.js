/**
 * @TODO clean this mess up
 * #loadVis , find better solutions and better placement for it,
 * also check for internals if we have something that does the loading in Sencha
 */

/**
 * The class provides map block component.
 */
Ext.define('CJ.view.map.Block', {
    extend: 'CJ.view.block.ContentBlock',

    xtype: 'view-map-block',

    requires: [
        'CJ.view.map.edit.Container',
        'CJ.view.map.view.Container',
        'CJ.view.map.Options',
        'CJ.view.map.Scoreboard'
    ],

    /**
     * @property {Boolean} isMapBlock
     */
    isMapBlock: true,

    statics: {

        /**
         * Loads and shows the map by id.
         * @param {Number} id
         */
        toViewState: function(id) {
            var block = CJ.byDocId(id);

            if (block)
                return block.setState('view');

            CJ.LoadBar.run();
            CJ.Block.load(id, {
                success: function(responce) {
                    var block = Ext.factory(responce.ret);

                    if (block.isMapBlock)
                        return block.setState("view");

                    // can be a private block
                    CJ.app.redirectTo(block.getLocalUrl(), true);
                    block.popup();
                },
                callback: function() {
                    CJ.LoadBar.finish();
                }
            });
        }
    },

    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-cover-block d-map-block',

        /**
         * @cfg {String} icon
         */
        iconCfg: null,

        /**
         * @cfg {String} icon
         */
        icon: null,

        /**
         * @cfg {String} title
         */
        title: null,

        /**
         * @cfg {String} defaultTitle
         * Will be shown on the cover in case if a title is not set.
         */
        defaultTitle: 'view-map-block-default-title',

        /**
         * @cfg {String} description
         */
        description: null,

        /**
         * @cfg {String} image
         */
        image: null,

        /**
         * @cfg {Array} nodes
         * Array of nodes config.
         */
        nodes: [],

        /**
         * @cfg {String} nodeColor
         */
        nodeColor: '',

        /**
         * @cfg {String} defaultNodeColor
         */
        defaultNodeColor: '#f0f0f0',

        /**
         * @cfg {String} edgeColor
         */
        edgeColor: '',

        /**
         * @cfg {String} defaultEdgeColor
         */
        defaultEdgeColor: '#f1e8ca',

        /**
         * @cfg {String} state
         * The map state, could be view or edit.
         */
        state: null,

        /**
         * @cfg {Ext.Component} stateContainer
         * A component for representation a state.
         */
        stateContainer: null,

        /**
         * @cfg {Object} data
         */
        data: {},

        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate',
            '<div class="d-cover {[ CJ.Utils.getBackgroundCls(values) ]}" data-map>',
                '<div class="d-block-type-icon"></div>',
                '<div class="d-title">',
                    '<span>{title}</span>',
                '</div>',
                '<tpl if="description">',
                    '<div class="d-info-button">',
                        '<span>{[ CJ.t("more-info") ]}</span>',
                    '</div>',
                '</tpl>',
                '<tpl if="showCompleteness">',
                    '<div class="d-completeness-container">',
                        '{[ CJ.Utils.completeness(values.completeness) ]}',
                    '</div>',
                '</tpl>',
            '</div>'
        )
    },

    /**
     * Initializes component.
     */
    initialize: function() {
        this.callParent(arguments);

        this.tapListeners = Ext.clone(this.tapListeners);
        this.tapListeners[".d-cover"] = "onCoverTap";
    },

    /**
     * Applies tags.
     * @param {String/Array} tags
     * @returns {Array}
     */
    applyTags: function(tags) {
        if (Ext.isString(tags))
            tags = tags.split(' ');

        return tags;
    },

    /**
     * Renders the tpl, preloads the cover image.
     */
    updateData: function() {
        if (this.isDestroyed)
            return ;

        var el = this.innerElement,
            icon = this.getIcon(),
            cover = icon || this.getImage();

        el.setHtml(
            this.getTpl().apply({
                cover: cover,
                title: this.getTitle() || CJ.t(this.getDefaultTitle(), true),
                description: this.getDescription(),
                completeness: this.getCompleteness(),
                showCompleteness: this.getShowCompleteness() && CJ.User.isFGA()
            })
        );

        this.renderCoverImage(cover);
    },

    /**
     * Applies nodes color.
     * @param {String} color
     * @returns {String}
     */
    applyNodeColor: function(color) {
        return color || this.getDefaultNodeColor();
    },

    /**
     * Applies edges color.
     * @param {String} color
     * @returns {String}
     */
    applyEdgeColor: function(color) {
        return color || this.getDefaultEdgeColor();
    },

    /**
     * Updates an editor.
     * @param {CJ.view.map.edit.Container} editor
     */
    updateEditor: function(editor) {
        if (editor && editor.getBlock() != this)
            editor.setBlock(this);
    },

    /**
     * Updates a state.
     * @param {String} state
     * @param {String} current
     */
    updateState: function(state, current) {
        var stateContainer = this.getStateContainer();

        if (current && stateContainer)
            stateContainer.hide();

        if (!state)
            return this.setStateContainer(null);

        var stateHandlerName = CJ.tpl('to{0}State', CJ.capitalize(state)),
            stateHandler = this[stateHandlerName];

        Ext.callback(stateHandler, this);
    },

    /**
     * Updates a state container.
     * @param {Ext.Component} container
     */
    updateStateContainer: function(container) {
        if (!container)
            return ;

        var state = this.getState(),
            handlerName = CJ.tpl('from{0}State', CJ.capitalize(state)),
            handler = this[handlerName];

        if (!Ext.isFunction(handler))
            return ;

        container.on({
            hide: handler,
            scope: this,
            single: true
        });
    },

    /**
     * Shows the edit state container.
     */
    toEditState: function() {
        if (this.getEditor())
            return ;

        CJ.DeferredScriptLoader.loadScript({
            scriptName: 'vis',
            success: this.onVisLoaded,
            scope: this,
            args: ['edit']
        });
    },

    /**
     * Callback that will be called after hiding of the edit state container.
     */
    fromEditState: function() {
        if (this.getState() == 'edit')
            this.setState(null);
    },

    /**
     * Shows the view state container.
     */
    toViewState: function() {
        CJ.DeferredScriptLoader.loadScript({
            scriptName: 'vis',
            success: this.onVisLoaded,
            scope: this,
            args: ['view']
        });
    },


    onVisLoaded: function (state) {
        this.setStateContainer(
            CJ.view.map[state].Container.popup({
                block: this
            })
        );
    },

    /**
     * Callback that will be called after hiding of the view state container.
     */
    fromViewState: function() {
        if (this.getState() == 'view')
            this.setState(null);

        CJ.fire("block.completeness.change", this);
    },

    /**
     * @param {Object} options
     * @return {undefined}
     */
    publish: function(options) {
        Ext.apply(options, {
            type: "map",
            tags: this.getTags(),
            staticTags: [CJ.User.get("user")],
            licensingOptions: this.getLicensingOptions()
        });

        return this.callParent(arguments);
    },


    /**
     * Callback that will be called after updating of settings.
     * @param {Object} values
     * @param {CJ.view.publish.Carousel} component
     */
    doPublish: function(values, component) {
        var docVisibility = values.docVisibility;
        delete values.docVisibility;

        this.setCategories(values.categories);
        this.setTags(values.tags);
        this.saveWithVisibility(docVisibility);
    },

    /**
     * Saves the map block.
     */
    save: function() {
        this.applyChanges();
        this.setState(null);
        this.setSaving(true);
        CJ.StreamHelper.adjustContaining(this);

        CJ.request({
            rpc: {
                model: "Document",
                method: "save_documents"
            },
            params: {
                data: [this.serialize()]
            },
            scope: this,
            success: this.onSaveSuccess,
            callback: this.onSaveCallback
        });
    },

    /**
     * Serializes the map block.
     * @returns {Object}
     */
    serialize: function(mode) {
        mode = mode || "server";

        var data = {
            xtype: 'view-map-block',
            docId: this.getDocId() || CJ.Guid.generatePhantomId(),
            docVisibility: this.getDocVisibility(),
            tags: this.getTags(),
            groups: this.getGroups(),
            categories: this.getCategories(),

            nodeCls: 'Map',
            appVer: CJ.constant.appVer,
            userInfo: this.getUserInfo(),
            createdDate: this.getCreatedDate(),

            iconCfg: this.getIconCfg(),
            title: this.getTitle(),
            description: this.getDescription(),
            image: this.getImage(),
            nodes: this.getNodes(),
            nodeColor: this.getNodeColor(),
            edgeColor: this.getEdgeColor(),
            licensingOptions: this.getLicensingOptions(),
            licenseInfo: this.getLicenseInfo()
        };

        if (mode == "server")
            return data;

        Ext.apply(data, {
            comments: this.getComments(),
            reuseInfo: this.getReuseInfo(),
            reusedCount: this.getReuseCount()
        });

        return data;
    },

    /**
     * Applies changes.
     */
    applyChanges: function() {
        var editor = this.getEditor();

        if (editor)
            editor.applyChanges();
    },

    /**
     * Will be called when new map block is saved.
     */
    onBlockCreated: function() {
        this.callParent(arguments);

        if(this.hasPageTags())
            return CJ.feedback(CJ.t("activity-created"));

        var tags = CJ.Utils.tagsToPath(this.getTags());

        CJ.feedback({
            message: CJ.t("activity-created-with-check-out"),
            duration: 5000,
            tap: function(e) {
                if (e.getTarget('.d-button'))
                    CJ.app.redirectTo(tags);
            }
        });
    },

    /**
     * @return {String}
     */
    getLocalUrl: function() {
        return CJ.tpl("!mp/{0}", this.getDocId());
    },

    /**
     * Shows the map options.
     */
    showOptions: function() {
        Ext.factory({
            xtype: 'core-view-popup',
            title: 'block-popup-options-title',
            cls: 'd-menu-popup',
            layout: 'light',
            content: {
                xtype: 'view-map-options',
                block: this
            }
        });
    }
});
