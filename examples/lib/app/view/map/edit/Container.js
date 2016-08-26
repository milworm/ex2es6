import 'Ext/Component';
import 'app/view/map/edit/Map';
import 'app/view/map/edit/NodeOptions';

/**
 * The class provides a component for editing map blocks
 */
Ext.define('CJ.view.map.edit.Container', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Component',
    /**
     * @inheritdoc
     */
    xtype: 'view-map-edit-container',
    /**
     * @inheritdoc
     */
    statics: {
        /**
         * Shows edit map popup.
         * @param {Object} config
         * @returns {CJ.core.view.Popup}
         */
        popup(config) {
            config = Ext.applyIf(config || {}, { xtype: 'view-map-edit-container' });
            return Ext.factory({
                xtype: 'core-view-popup',
                closeConfirm: {
                    title: 'nav-popup-block-close-title',
                    message: 'nav-popup-block-close-message'
                },
                fitMode: true,
                titleBar: false,
                content: config
            });
        },
        newMap(config) {
            CJ.DeferredScriptLoader.loadScript({
                scriptName: 'vis',
                success: this.popup,
                scope: this,
                args: [config]
            });
        }
    },
    /**
     * @inheritdoc
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-map-edit-container',
        /**
         * @cfg {CJ.core.Popup}
         */
        popup: null,
        /**
         * cfg {CJ.map.Block} block
         */
        block: {},
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {CJ.core.view.form.Icon}
         */
        iconField: {},
        /**
         * @cfg {CJ.core.view.form.GrowField} titleField
         */
        titleField: {},
        /**
         * @cfg {CJ.core.view.form.GrowField} descriptionField
         */
        descriptionField: {},
        /**
         * @cfg {CJ.view.map.edit.Map} map
         */
        map: {},
        /**
         * @cfg {CJ.FileUploader} imageUploader
         */
        imageUploader: {},
        /**
         * @cfg {Boolean} addNodeMode
         */
        addNodeMode: false,
        /**
         * @cfg {Boolean} addEdgeMode
         */
        addEdgeMode: false,
        /**
         * @cfg {Number} edgeFrom
         */
        edgeFrom: null,
        /**
         * @cfg {Boolean} allowPublish
         */
        allowPublish: null,
        /**
         * @cfg {Number} popoverMenuYOffset
         */
        popoverMenuYOffset: -10,
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', [
            '<div class="d-tool-sidebar">',
            '<div class="d-icon-placeholder"></div>',
            '<div class="d-title-placeholder"></div>',
            '<div class="d-description-placeholder"></div>',
            '<div class="d-controls">',
            '<div class="d-button image">',
            '{[CJ.t("view-map-edit-container-change-image-button-text")]}',
            '<input type="file" class="invisible-stretch" />',
            '</div>',
            '<div class="d-split-button">',
            '<div class="d-button node d-disabled">',
            '{[CJ.t("view-map-edit-container-add-node-button-text")]}',
            '</div>',
            '<div class="d-options node"></div>',
            '</div>',
            '<div class="d-split-button">',
            '<div class="d-button edge d-disabled">',
            '{[CJ.t("view-map-edit-container-add-edge-button-text")]}',
            '</div>',
            '<div class="d-options edge"></div>',
            '</div>',
            '</div>',
            '<div class="d-bottom">',
            '<div class="d-button submit">',
            '{[CJ.t("view-map-edit-container-publish-button-text")]}',
            '</div>',
            '<div class="d-button close">',
            '{[CJ.t("view-map-edit-container-close-button-text")]}',
            '</div>',
            '</div>',
            '</div>',
            { compiled: true }
        ]),
        /**
         * @cfg {Object} tapListeners
         */
        tapListeners: {
            '.d-controls .d-button.node': 'onNodeButtonTap',
            '.d-controls .d-options.node': 'onNodeOptionsTap',
            '.d-controls .d-button.edge': 'onEdgeButtonTap',
            '.d-controls .d-options.edge': 'onEdgeOptionsTap',
            '.d-bottom .d-button.submit': 'onSubmitButtonTap',
            '.d-bottom .d-button.close': 'onCloseButtonTap'
        }
    },
    /**
     * Initializes the component
     */
    initialize() {
        this.callParent(args);
        this.on('change', this.onImageSelect, this, {
            element: 'element',
            delegate: '.d-controls .d-button.image input'
        });
    },
    /**
     * Destroys the component
     */
    destroy() {
        this.callParent(args);
        const block = this.getBlock();
        if (block)
            block.setEditor(null);
        this.getMap().destroy();
    },
    /**
     * Updates data, renders tpl.
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * Applies block.
     * @param {CJ.map.Block} block
     * @returns {CJ.map.Block}
     */
    applyBlock(block) {
        if (block.isMapBlock)
            return block;
        return Ext.factory(Ext.apply({
            xtype: 'view-map-block',
            editor: this,
            state: 'edit',
            stateContainer: this.getPopup()
        }, CJ.Block.getInitialTagsAndCategories()));
    },
    /**
     * Updates block.
     * @param {CJ.map.Block} block
     */
    updateBlock(block) {
        if (block && block.getEditor() != this)
            block.setEditor(this);
    },
    /**
     * Updates allow publish.
     * Disables/enables publish button.
     * @param {Boolean} state
     */
    updateAllowPublish(state) {
        this.element.dom.querySelector('.d-bottom .d-button.submit').classList[state ? 'remove' : 'add']('d-disabled');
    },
    /**
     * Applies icon field.
     * @param {Object} config
     * @returns {CJ.core.veiw.from.Icon}
     */
    applyIconField(config) {
        const block = this.getBlock();
        Ext.applyIf(config, {
            xtype: 'core-view-form-icon',
            cls: 'd-icon',
            value: block && block.getIconCfg(),
            labelText: false,
            renderTo: this.element.dom.querySelector('.d-icon-placeholder')
        });
        return Ext.factory(config);
    },
    /**
     * Applies title field.
     * @param {Object} config
     * @returns {CJ.core.view.form.GrowField}
     */
    applyTitleField(config) {
        const block = this.getBlock();
        Ext.applyIf(config, {
            xtype: 'core-view-form-growfield',
            placeHolder: CJ.t('view-map-edit-container-title-placeholder', true),
            newRow: false,
            maxLength: 150,
            value: block && block.getTitle(),
            renderTo: this.element.dom.querySelector('.d-title-placeholder')
        });
        return Ext.factory(config);
    },
    /**
     * Applies description field.
     * @param {Object} config
     * @returns {CJ.core.view.form.GrowField}
     */
    applyDescriptionField(config) {
        const block = this.getBlock();
        Ext.applyIf(config, {
            xtype: 'core-view-form-growfield',
            placeHolder: CJ.t('view-map-edit-container-description-placeholder', true),
            value: block && block.getDescription(),
            renderTo: this.element.dom.querySelector('.d-description-placeholder'),
            maxLength: 330,
            listeners: {
                focus: this.onDescriptionFieldFocus,
                blur: this.onDescriptionFieldBlur,
                scope: this
            }
        });
        return Ext.factory(config);
    },
    /**
     * Activates/deactivates add node mode.
     * @param {Boolean} state
     */
    updateAddNodeMode(state) {
        if (!this.initialized)
            return;
        const buttonEl = this.element.dom.querySelector('.d-button.node'), map = this.getMap();
        if (state) {
            buttonEl.classList.add('cancel');
            buttonEl.innerHTML = CJ.t('view-map-edit-container-cancel-button-text');
            map.on('select', this.addNode, this);
            CJ.Msg.feedback({
                message: CJ.t('view-map-edit-container-add-node-help-message', true),
                duration: 3000
            });
        } else {
            buttonEl.classList.remove('cancel');
            buttonEl.innerHTML = CJ.t('view-map-edit-container-add-node-button-text');
            map.un('select', this.addNode, this);
        }
    },
    /**
     * Activates/deactivates add edge mode.
     * @param {Boolean} state
     */
    updateAddEdgeMode(state) {
        if (!this.initialized)
            return;
        const buttonEl = this.element.dom.querySelector('.d-button.edge'), map = this.getMap();
        map.unselectAll();
        if (state) {
            buttonEl.classList.add('cancel');
            buttonEl.innerHTML = CJ.t('view-map-edit-container-cancel-button-text');
            map.on('select', this.addEdge, this);
            CJ.Msg.feedback({
                message: CJ.t('view-map-edit-container-add-edge-help-message', true),
                duration: 3000
            });
        } else {
            buttonEl.classList.remove('cancel');
            buttonEl.innerHTML = CJ.t('view-map-edit-container-add-edge-button-text');
            map.un('select', this.addEdge, this);
        }
        this.setEdgeFrom(null);
    },
    /**
     * Applies map.
     * @param {Object} config
     * @returns {CJ.view.map.Map}
     */
    applyMap(config) {
        const block = this.getBlock();
        let allowPublish = false;
        if (block && block.getNodes().length)
            allowPublish = true;
        this.setAllowPublish(allowPublish);
        Ext.applyIf(config, {
            xtype: 'view-map-edit-map',
            image: block && block.getImage(),
            nodes: block && Ext.clone(block.getNodes()) || [],
            nodeColor: block.getNodeColor(),
            edgeColor: block.getEdgeColor(),
            renderTo: this.element,
            listeners: {
                networkinited: this.onNetworkInited,
                select: this.onMapSelect,
                nodeadd: this.onNodeChange,
                noderemove: this.onNodeChange,
                edgeremove: this.onEdgeRemove,
                scope: this
            }
        });
        return Ext.factory(config);
    },
    /**
     * Handler of the event 'networkinited' of the map.
     * Enables control buttons.
     */
    onNetworkInited() {
        const dom = this.element.dom;
        dom.querySelector('.d-controls .d-button.node').classList.remove('d-disabled');
        dom.querySelector('.d-controls .d-button.edge').classList.remove('d-disabled');
    },
    /**
     * Handler of the event 'select' of the map.
     * Enables/disables remove button.
     * @param {CJ.view.map.Map} map
     * @param {Object} selected
     * @param {Array} selected.nodes Array of the id selected nodes
     * @param {Array} selected.edges Array of the id selected edges
     */
    onMapSelect(map, selected) {
        if (this.getAddNodeMode() || this.getAddEdgeMode())
            return;
        const nodes = map.getNodes();
        const processed = {
            x: 0,
            y: 0
        };
        const choices = [{
                text: 'view-map-edit-container-remove-selected-button-text',
                value: 'remove'
            }];
        let edges;
        let nodeA;
        let nodeB;
        let edge;
        let showMenu;
        let stash;
        if (selected.nodes.length == 1 && !this.getAddEdgeMode()) {
            stash = selected.nodes[0];
            nodeA = nodes.get(stash);
            processed.x = nodeA.x;
            processed.y = nodeA.y + this.getPopoverMenuYOffset();
            choices.unshift({
                text: 'view-map-edit-container-edit-button-text',
                value: 'edit'
            });
            showMenu = true;
        } else if (selected.edges.length == 1) {
            edges = map.getEdges();
            edge = edges.get(selected.edges[0]);
            nodeA = nodes.get(edge.from);
            nodeB = nodes.get(edge.to);
            processed.x = (nodeA.x + nodeB.x) / 2;
            processed.y = (nodeA.y + nodeB.y) / 2 + this.getPopoverMenuYOffset();
            showMenu = true;
        }
        if (showMenu)
            CJ.view.popovers.PopoverMenu.showTo({
                target: map.element.dom,
                position: {
                    x: 'middle',
                    y: 'top'
                },
                offset: processed,
                innerComponent: {
                    data: { choices },
                    stash,
                    callbackScope: this,
                    callbackFn: this.onMenuCommand
                }
            });
    },
    onMenuCommand(value, nodeId) {
        switch (value) {
        case 'remove':
            const confirmTitle = CJ.t('view-map-edit-node-options-remove-node-confirm-title'), confirmMessage = CJ.t('view-map-edit-node-options-remove-node-confirm-message'), me = this;
            CJ.confirm(confirmTitle, confirmMessage, result => {
                if (result != 'yes')
                    return;
                me.getMap().removeSelected();
            });
            break;
        case 'edit':
            this.showNodeSettings(nodeId);
            break;
        }
        ;
    },
    /**
     * Handler of the event 'tab' of the add node button.
     * Activates/deactivates add node mode.
     * @param {Ext.dom.Event} e
     */
    onNodeButtonTap(e) {
        if (e.target.classList.contains('d-disabled'))
            return;
        this.setAddNodeMode(!this.getAddNodeMode());
        this.setAddEdgeMode(false);
    },
    /**
     *  Handler of the event 'tab' of the node options button.
     *  Shows node color picker.
     */
    onNodeOptionsTap() {
        CJ.ColorPicker.showTo({
            value: this.getMap().getNodeColor(),
            determineMobile: true,
            hasOpacity: true,
            target: this.element.dom.querySelector('.d-controls .d-options.node'),
            listeners: {
                setcolor: this.onNodeColorSelect,
                scope: this
            }
        });
    },
    /**
     * Callback of node color selecting.
     * Sets the default node color if nothing selected.
     * @param {String} color
     */
    onNodeColorSelect(color) {
        const block = this.getBlock();
        color = color || block.getDefaultNodeColor();
        block.setNodeColor(color);
        this.getMap().setNodeColor(color);
    },
    /**
     * Handler of the event 'tab' of the add edge button.
     * Activates/deactivates add edge mode.
     * @param {Ext.dom.Event} e
     */
    onEdgeButtonTap(e) {
        if (e.target.classList.contains('d-disabled'))
            return;
        this.setAddEdgeMode(!this.getAddEdgeMode());
        this.setAddNodeMode(false);
    },
    /**
     *  Handler of the event 'tab' of the edge options button.
     *  Shows edge color picker.
     */
    onEdgeOptionsTap() {
        CJ.ColorPicker.showTo({
            value: this.getMap().getEdgeColor(),
            determineMobile: true,
            hasOpacity: true,
            target: this.element.dom.querySelector('.d-controls .d-options.edge'),
            listeners: {
                setcolor: this.onEdgeColorSelect,
                scope: this
            }
        });
    },
    /**
     * Callback of edge color selecting.
     * Sets the default edge color if nothing selected.
     * @param {String} color
     */
    onEdgeColorSelect(color) {
        const block = this.getBlock();
        color = color || block.getDefaultEdgeColor();
        block.setEdgeColor(color);
        this.getMap().setEdgeColor(color);
    },
    /**
     * Adds a node by last tapped coordinates.
     */
    addNode(map, networkClickEvent) {
        const map = this.getMap();
        const network = map.getNetwork();
        let pos;
        let id;
        if (networkClickEvent.nodes.length > 0 && networkClickEvent.edges.length > 0)
            return;
        pos = networkClickEvent.pointer.canvas;
        id = map.addNode({
            x: pos.x,
            y: pos.y
        });
        this.setAddNodeMode(false);
        this.showNodeSettings(id, true);
    },
    /**
     * Adds an edge before previous selected node
     * and current selected node if it's possible.
     */
    addEdge() {
        const map = this.getMap(), nodes = map.getNodes(), network = map.getNetwork(), edgeFrom = this.getEdgeFrom(), selected = network.getSelectedNodes()[0], selectedNodeData = nodes.get(selected);
        if (!selected)
            return this.setEdgeFrom(null);
        if (!edgeFrom)
            return this.setEdgeFrom(selected);
        if (edgeFrom == selected)
            return;
        if (!this.canLink(edgeFrom, selected)) {
            map.unselectAll();
            CJ.Msg.feedback({
                message: CJ.t('view-map-edit-container-nodes-connected-message', true),
                duration: '3000'
            });
            return;
        }
        if (selectedNodeData.parentId) {
            map.unselectAll();
            CJ.Msg.feedback({
                message: CJ.t('view-map-edit-container-one-incoming-path-message', true),
                duration: '3000'
            });
            return;
        }
        map.addEdge({
            from: edgeFrom,
            to: selected
        });
        this.setAddEdgeMode(false);
    },
    /**
     * Handler of events 'nodeadd' and 'noderemove' of the map.
     * Sets the allow publishing to true
     * in case when the map has at least one node.
     * @param {CJ.view.map.Map} map
     */
    onNodeChange(map) {
        this.setAllowPublish(!!map.getNodes().length);
    },
    /**
     * Handler on the event 'edgeremove' of the map.
     * Resets the parentId property of the destination node.
     * @param {CJ.view.map.Map} map
     * @param {Array} edges
     */
    onEdgeRemove(map, edges) {
        Ext.each(edges, edgeData => {
            map.updateNode({
                id: edgeData.to,
                parentId: null
            });
        });
    },
    /**
     * Returns true in case when nodes are not connected.
     * @param {Number} form
     * @param {Number} to
     * @returns {Boolean}
     */
    canLink(form, to) {
        const map = this.getMap();
        const network = map.getNetwork();
        const nodes = network.body.nodes;
        const checkedEdges = [];
        let founded = false;
        (function fn(node) {
            const edges = node.edges;
            let target;
            for (let i = 0, edge; edge = edges[i]; i++) {
                target = edge.from == node ? edge.to : edge.from;
                if (target.id == to)
                    return founded = true;
                else if (checkedEdges.indexOf(edge) == -1) {
                    checkedEdges.push(edge);
                    fn(target);
                }
            }
        }(nodes[form]));
        return !founded;
    },
    /**
     * Show node settings popup.
     * @param {Number} id
     * @param {Boolean} isNewNode
     */
    showNodeSettings(id, isNewNode) {
        const nodes = this.getMap().getNodes();
        Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-node-setting-popup',
            title: 'view-map-edit-node-options-popup-title',
            content: {
                xtype: 'view-map-edit-node-options',
                nodes,
                editingId: id,
                values: nodes.get(id),
                isNewNode
            },
            actionButton: { text: 'view-map-edit-node-options-popup-action-button-text' },
            listeners: {
                close: this.onNodeSettingsClose,
                scope: this
            }
        });
    },
    /**
     * Handler of the event 'close' of the node settings popup.
     * Removes a node if it's new node (just created).
     * @param {CJ.core.Popup} popup
     */
    onNodeSettingsClose(popup) {
        const settings = popup.getContent();
        if (settings.getIsNewNode())
            this.getMap().getNodes().remove(settings.getEditingId());
    },
    /**
     * Handler on the event 'focus' of the description field.
     * Expands the field.
     */
    onDescriptionFieldFocus() {
        const field = this.getDescriptionField();
        field.content.setStyle({ 'min-height': `${ field.getMinFieldHeight() * 2 }px` });
    },
    /**
     * Handler on the event 'blur' of the description field.
     * Collapses the field.
     */
    onDescriptionFieldBlur() {
        const field = this.getDescriptionField();
        if (!field.getValue())
            field.content.setStyle({ 'min-height': `${ field.getMinFieldHeight() }px` });
    },
    /**
     * Handler of the event 'change' of the image field.
     * Runs uploading.
     * @param {Ext.event.Event} e
     */
    onImageSelect(e) {
        const imageUploader = CJ.FileUploader.upload(e.target, {
            scope: this,
            success: this.onUploadImageSuccess
        });
        this.setImageUploader(imageUploader);
        CJ.LoadBar.run({ renderTo: this.element });
    },
    /**
     * Success callback of the image uploading.
     * @param {Object} response
     */
    onUploadImageSuccess(response) {
        const url = CJ.Utils.getImageUrl(response);
        this.getMap().setImage(url);
    },
    /**
     * Handler of the event 'tap' of the publish button.
     * @param {Ext.event.Event} e
     */
    onSubmitButtonTap(e) {
        if (e.target.classList.contains('d-disabled'))
            return;
        this.getBlock().publish();
    },
    /**
     * Handler of the event 'tap' of the close button.
     */
    onCloseButtonTap() {
        this.getPopup().close();
    },
    /**
     * Applies changes to the block.
     */
    applyChanges() {
        const block = this.getBlock(), map = this.getMap(), iconCfg = this.getIconField().getValue(), nodes = [];
        map.storePositions();
        map.getNodes().forEach(node => {
            nodes.push({
                x: node.originalX,
                y: node.originalY,
                id: node.id,
                docId: node.docId,
                parentId: node.parentId || null,
                completionRate: node.completionRate || 100
            });
        });
        block.setNodes(nodes);
        block.setImage(map.getImage());
        block.setIconCfg(iconCfg);
        block.setTitle(this.getTitleField().getValue());
        block.setDescription(this.getDescriptionField().getValue());
        if (iconCfg)
            block.setIcon(iconCfg.original);
    }
});