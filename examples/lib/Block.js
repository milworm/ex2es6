import 'app/view/map/edit/Container';
import 'app/view/map/view/Container';
import 'app/view/map/Options';
import 'app/view/map/Scoreboard';

Ext.define('CJ.view.map.Block', {
    extend: 'CJ.view.block.ContentBlock',
    xtype: 'view-map-block',
    isMapBlock: true,
    statics: {
        toViewState(id) {
            const block = CJ.byDocId(id);
            if (block)
                return block.setState('view');
            CJ.LoadBar.run();
            CJ.Block.load(id, {
                success(responce) {
                    const block = Ext.factory(responce.ret);
                    if (block.isMapBlock)
                        return block.setState('view');
                    CJ.app.redirectTo(block.getLocalUrl(), true);
                    block.popup();
                },
                callback() {
                    CJ.LoadBar.finish();
                }
            });
        }
    },
    config: {
        cls: 'd-cover-block d-map-block',
        iconCfg: null,
        icon: null,
        title: null,
        defaultTitle: 'view-map-block-default-title',
        description: null,
        image: null,
        nodes: [],
        nodeColor: '',
        defaultNodeColor: '#f0f0f0',
        edgeColor: '',
        defaultEdgeColor: '#f1e8ca',
        state: null,
        stateContainer: null,
        data: {},
        tpl: Ext.create('Ext.XTemplate', '<div class="d-cover {[ CJ.Utils.getBackgroundCls(values) ]}" data-map>', '<div class="d-block-type-icon"></div>', '<div class="d-title">', '<span>{title}</span>', '</div>', '<tpl if="description">', '<div class="d-info-button">', '<span>{[ CJ.t("more-info") ]}</span>', '</div>', '</tpl>', '<tpl if="showCompleteness">', '<div class="d-completeness-container">', '{[ CJ.Utils.completeness(values.completeness) ]}', '</div>', '</tpl>', '</div>')
    },
    initialize() {
        this.callParent(arguments);
        this.tapListeners = Ext.clone(this.tapListeners);
        this.tapListeners['.d-cover'] = 'onCoverTap';
    },
    applyTags(tags) {
        if (Ext.isString(tags))
            tags = tags.split(' ');
        return tags;
    },
    updateData() {
        if (this.isDestroyed)
            return;
        const el = this.innerElement, icon = this.getIcon(), cover = icon || this.getImage();
        el.setHtml(this.getTpl().apply({
            cover,
            title: this.getTitle() || CJ.t(this.getDefaultTitle(), true),
            description: this.getDescription(),
            completeness: this.getCompleteness(),
            showCompleteness: this.getShowCompleteness() && CJ.User.isFGA()
        }));
        this.renderCoverImage(cover);
    },
    applyNodeColor(color) {
        return color || this.getDefaultNodeColor();
    },
    applyEdgeColor(color) {
        return color || this.getDefaultEdgeColor();
    },
    updateEditor(editor) {
        if (editor && editor.getBlock() != this)
            editor.setBlock(this);
    },
    updateState(state, current) {
        const stateContainer = this.getStateContainer();
        if (current && stateContainer)
            stateContainer.hide();
        if (!state)
            return this.setStateContainer(null);
        const stateHandlerName = CJ.tpl('to{0}State', CJ.capitalize(state)), stateHandler = this[stateHandlerName];
        Ext.callback(stateHandler, this);
    },
    updateStateContainer(container) {
        if (!container)
            return;
        const state = this.getState(), handlerName = CJ.tpl('from{0}State', CJ.capitalize(state)), handler = this[handlerName];
        if (!Ext.isFunction(handler))
            return;
        container.on({
            hide: handler,
            scope: this,
            single: true
        });
    },
    toEditState() {
        if (this.getEditor())
            return;
        CJ.DeferredScriptLoader.loadScript({
            scriptName: 'vis',
            success: this.onVisLoaded,
            scope: this,
            args: ['edit']
        });
    },
    fromEditState() {
        if (this.getState() == 'edit')
            this.setState(null);
    },
    toViewState() {
        CJ.DeferredScriptLoader.loadScript({
            scriptName: 'vis',
            success: this.onVisLoaded,
            scope: this,
            args: ['view']
        });
    },
    onVisLoaded(state) {
        this.setStateContainer(CJ.view.map[state].Container.popup({ block: this }));
    },
    fromViewState() {
        if (this.getState() == 'view')
            this.setState(null);
        CJ.fire('block.completeness.change', this);
    },
    publish(options) {
        Ext.apply(options, {
            type: 'map',
            tags: this.getTags(),
            staticTags: [CJ.User.get('user')],
            licensingOptions: this.getLicensingOptions()
        });
        return this.callParent(arguments);
    },
    doPublish(values, component) {
        const docVisibility = values.docVisibility;
        delete values.docVisibility;
        this.setCategories(values.categories);
        this.setTags(values.tags);
        this.saveWithVisibility(docVisibility);
    },
    save() {
        this.applyChanges();
        this.setState(null);
        this.setSaving(true);
        CJ.StreamHelper.adjustContaining(this);
        CJ.request({
            rpc: {
                model: 'Document',
                method: 'save_documents'
            },
            params: { data: [this.serialize()] },
            scope: this,
            success: this.onSaveSuccess,
            callback: this.onSaveCallback
        });
    },
    serialize(mode = 'server') {
        const data = {
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
        if (mode == 'server')
            return data;
        Ext.apply(data, {
            comments: this.getComments(),
            reuseInfo: this.getReuseInfo(),
            reusedCount: this.getReuseCount()
        });
        return data;
    },
    applyChanges() {
        const editor = this.getEditor();
        if (editor)
            editor.applyChanges();
    },
    onBlockCreated() {
        this.callParent(arguments);
        if (this.hasPageTags())
            return CJ.feedback(CJ.t('activity-created'));
        const tags = CJ.Utils.tagsToPath(this.getTags());
        CJ.feedback({
            message: CJ.t('activity-created-with-check-out'),
            duration: 5000,
            tap(e) {
                if (e.getTarget('.d-button'))
                    CJ.app.redirectTo(tags);
            }
        });
    },
    getLocalUrl() {
        return CJ.tpl('!mp/{0}', this.getDocId());
    },
    showOptions() {
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