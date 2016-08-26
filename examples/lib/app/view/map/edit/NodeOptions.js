import 'Ext/Component';
import 'app/view/map/edit/NodeOptionsLink';

/* @TODO
    1. make sure edited block won't be added a second time to the stream
    2. make sure created block won't be added to the author user
*/
Ext.define('CJ.view.map.edit.NodeOptions', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Component',
    /**
     * @inheritdoc
     */
    xtype: 'view-map-edit-node-options',
    /**
     * @inheritdoc
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-node-options',
        /**
         * @cfg {CJ.core.view.Popup}
         */
        popup: null,
        /**
         * @cfg {vis.DataSet} nodes
         * Data set of nodes.
         */
        nodes: null,
        /**
         * @cfg {Number} editingId
         */
        editingId: null,
        /**
         * @cfg {Object} values
         */
        values: null,
        /**
         * @cfg {Object} nodeLinkedBlock
         */
        nodeLinkedBlock: null,
        /**
         * @cfg {Boolean} isNewNode
         */
        isNewNode: false,
        tpl: Ext.create('Ext.XTemplate', '<div class="d-options d-hbox d-flex-row">', '<tpl if="isEmpty">', '<div class="d-add-block-button">{addBlockLabel}</div>', '<div class="d-link-button"></div>', '<tpl else>', '<tpl if="userCreatedThisBlock">', '<div class="d-modify-block-button">{modifyBlockLabel}</div>', '</tpl>', '<div class="d-delete-button">{deleteLabel}</div>', '<div class="d-link-button"></div>', '</tpl>', '</div>'),
        data: {}
    },
    initialize() {
        this.callParent(args);
        this.setValues(this.getNodes().get(this.getEditingId()));
        CJ.Block.load(this.getValues().docId, {
            success: this.onBlockLoaded,
            scope: this
        });
        this.getPopup().on({
            actionbuttontap: this.onActionButtonTap,
            scope: this
        });
        this.element.on({
            tap: this.onTap,
            scope: this
        });
    },
    onTap(evt) {
        if (evt.getTarget('.d-link-button'))
            return this.onLinkBlockTap();
        if (evt.getTarget('.d-add-block-button'))
            return this.createNewBlock();
        if (evt.getTarget('.d-modify-block-button'))
            return this.editCreatedBlock();
        if (evt.getTarget('.d-delete-button'))
            return this.onDeleteButtonTap();
    },
    updateValues(newValues) {
        this.setData(true);
    },
    updateNodeLinkedBlock() {
        this.setData(true);
    },
    applyData(config) {
        const values = this.getValues();
        const block = this.getNodeLinkedBlock();
        let isMine;
        if (block)
            isMine = CJ.User.isMine(block);
        config = Ext.apply({
            userCreatedThisBlock: isMine,
            isEmpty: values.docId ? false : true,
            addBlockLabel: CJ.t('view-map-edit-node-options-add-button'),
            modifyBlockLabel: CJ.t('view-map-edit-node-options-modify-button'),
            deleteLabel: CJ.t('view-map-edit-node-options-delete-button')
        }, config);
        return config;
    },
    createNewBlock() {
        Ext.factory({
            xtype: 'view-block-edit-defaults-popup',
            block: {
                listeners: {
                    saved: this.onBlockCreated,
                    aftersave: this.onBlockCreated,
                    scope: this
                }
            }
        });
    },
    onBlockCreated(block) {
        let values = this.getValues(), passingGrade;
        if (block.getPassingGrade)
            passingGrade = block.getPassingGrade() * 100;
        values = Ext.apply(values, {
            docId: block.getDocId(),
            completionRate: passingGrade
        });
        this.setNodeLinkedBlock(block);
        this.setValues(values);
    },
    editCreatedBlock() {
        const values = this.getValues();
        this.getPopup().setLoading(true);
        CJ.Block.load(values.docId, {
            success: this.onEditCreatedBlockLoaded,
            callback: this.onEditCreatedBlockCallback,
            scope: this
        });
    },
    onEditCreatedBlockLoaded(response) {
        const block = Ext.factory(Ext.apply(response.ret, {
            listeners: {
                saved: this.onBlockCreated,
                aftersave: this.onBlockCreated,
                scope: this
            }
        }));
        let state = 'edit';
        if (block.isPlaylist)
            state = 'review';
        if (block.setState)
            block.setState(state);
        else {
            block.setEditing(true);
        }
    },
    onEditCreatedBlockCallback() {
        this.getPopup().setLoading(false);
    },
    onDeleteButtonTap() {
        const confirmTitle = CJ.t('view-map-edit-node-options-remove-node-confirm-title'), confirmMessage = CJ.t('view-map-edit-node-options-remove-node-confirm-message');
        CJ.confirm(confirmTitle, confirmMessage, function (result) {
            if (result != 'yes')
                return;
            const values = this.getValues();
            values.docId = null;
            this.setValues(values);
            this.setNodeLinkedBlock(null);
        }, this);
    },
    onLinkBlockTap() {
        const nodes = this.getNodes(), editingId = this.getEditingId(), values = this.getValues();
        Ext.factory({
            xtype: 'core-view-popup',
            cls: 'd-node-setting-popup',
            title: 'view-map-edit-node-options-link-popup-title',
            content: {
                xtype: 'view-map-edit-node-options-link',
                nodes,
                values: { docId: values.docId },
                currentDocId: values.docId,
                editingId,
                listeners: {
                    linkadded: this.onLinkAdded,
                    scope: this
                }
            },
            actionButton: { text: 'view-map-edit-node-options-link-popup-action-button-text' }
        });
    },
    onLinkAdded(block, values) {
        this.setNodeLinkedBlock(block);
        this.setValues(Ext.apply(this.getValues(), values));
    },
    onBlockLoaded(response) {
        this.setNodeLinkedBlock(response.ret);
    },
    onActionButtonTap() {
        this.applyChanges();
        return true;
    },
    applyChanges() {
        const values = this.getValues(), nodes = this.getNodes(), editingId = this.getEditingId();
        if (!values.docId) {
            nodes.remove(editingId);
            return;
        }
        nodes.update(values);
    }
});