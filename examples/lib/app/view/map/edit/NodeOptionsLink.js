import 'Ext/Container';

/**
 * The class provides form for editing node settings.
 */
Ext.define('CJ.view.map.edit.NodeOptionsLink', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Container',
    /**
     * @inheritdoc
     */
    xtype: 'view-map-edit-node-options-link',
    /**
     * @inheritdoc
     */
    mixins: { formable: 'CJ.view.mixins.Formable' },
    /**
     * @inheritdoc
     */
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-node-options-link',
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
         * @cfg {Object} values
         */
        values: null,
        /**
         * @cfg {String} currentDocId
         */
        currentDocId: null,
        items: []
    },
    /**
     * @inheritdoc
     */
    initialize() {
        this.callParent(args);
        this.getPopup().on({
            actionbuttontap: this.onActionButtonTap,
            scope: this
        });
    },
    /**
     * @inheritdoc
     */
    applyItems(items) {
        items = items.concat([{
                xtype: 'textfield',
                name: 'docId',
                placeHolder: CJ.t('view-map-edit-node-options-link-doc-id-placeholder', true),
                clearIcon: false
            }]);
        return this.callParent(args);
    },
    /**
     * Handler of the event 'actionbuttontap' of the popup.
     * Validates and loads block data.
     */
    onActionButtonTap() {
        if (!this.isValid())
            return false;
        const confirmTitle = CJ.t('view-map-edit-node-options-link-override-title'), confirmMessage = CJ.t('view-map-edit-node-options-link-override-message');
        if (this.getCurrentDocId()) {
            CJ.confirm(confirmTitle, confirmMessage, function (result) {
                if (result != 'yes')
                    return;
                CJ.LoadBar.run({ renderTo: Ext.Viewport.element });
                const values = this.getValues();
                CJ.Block.load(values.docId, {
                    success: this.onLoadBlockSuccess,
                    failure: this.onLoadBlockFailure,
                    callback: this.onLoadBlockCallback,
                    scope: this
                });
            }, this);
        } else {
            CJ.LoadBar.run({ renderTo: Ext.Viewport.element });
            const values = this.getValues();
            CJ.Block.load(values.docId, {
                success: this.onLoadBlockSuccess,
                failure: this.onLoadBlockFailure,
                callback: this.onLoadBlockCallback,
                scope: this
            });
        }
        return false;
    },
    /**
     * Success handler of the load block data.
     * Checks for a block is allowed for using and currently doesn't use.
     * @param {Object} response
     */
    onLoadBlockSuccess(response) {
        let values = this.getValues();
        const nodes = this.getNodes();
        const docIdField = this.down('[name=docId]');
        const nodeCls = response.ret.nodeCls;
        const passingGrade = response.ret.passingGrade;
        let isAlreadyUsed = false;
        if (!(nodeCls == 'Document' || nodeCls == 'Playlist'))
            return this.showError(docIdField, 'view-map-edit-node-options-link-cant-use-activity-error', true);
        nodes.forEach(nodeData => {
            if (nodeData.docId == values.docId && nodeData.id != values.id)
                isAlreadyUsed = true;
        });
        if (isAlreadyUsed)
            return this.showError(docIdField, 'view-map-edit-node-options-link-doc-id-already-used', true);
        if (passingGrade > 0)
            values = Ext.apply(values, { completionRate: passingGrade * 100 });
        this.fireEvent('linkadded', response.ret, values);
        this.getPopup().hide();
    },
    /**
     * Failure handler of the load block data.
     * Shows an error that a block has not found by docId.
     */
    onLoadBlockFailure() {
        const docIdField = this.down('[name=docId]');
        this.showError(docIdField, 'view-map-edit-node-options-link-activity-404-error', true);
    },
    /**
     * Callback handler of the load block data.
     * Hides the load bar.
     */
    onLoadBlockCallback() {
        CJ.LoadBar.finish();
    },
    /**
     * Return true in case if fields are valid,
     * shows an error message otherwise.
     * @returns {Boolean}
     */
    isValid() {
        let docIdField;
        this.applyChanges();
        docIdField = this.down('[name=docId]');
        this.clearError();
        docIdField.setValue(CJ.Utils.getIdFromUrl(docIdField.getValue()));
        this.applyChanges();
        if (!this.validateField(docIdField))
            return this.showError(docIdField, 'view-map-edit-node-options-link-doc-id-invalid');
        return true;
    },
    /**
     * Validates and returns a valid state of field.
     * @param {Ext.field.Text} field
     * @param {Boolean} onlyNumbers
     * @returns {Boolean}
     */
    validateField(field, onlyNumbers) {
        const value = field.getValue();
        let isValid = true;
        if (onlyNumbers)
            isValid = Ext.isNumeric(value);
        if (isValid)
            field.un('keyup', this.isValid, this);
        else
            field.on('keyup', this.isValid, this);
        return isValid;
    },
    /**
     * Shows an error message.
     * @param {Ext.field.Text} field
     * @param {String} message
     * @param {Boolean} single
     */
    showError(field, message, single) {
        this.getPopup().denySubmit(CJ.t(message));
        field.addCls('d-invalid');
        if (!single)
            return;
        field.on({
            keyup: this.clearError,
            scope: this,
            single: true
        });
    },
    /**
     * Clear an error message.
     */
    clearError() {
        this.getPopup().allowSubmit();
        this.down('[name=docId]').removeCls('d-invalid');
    }
});