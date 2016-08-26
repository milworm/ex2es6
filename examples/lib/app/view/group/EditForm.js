import 'Ext/Container';
import 'app/view/group/Share';

/**
 * Defines a component that is used to display group's create/edit form.
 */
Ext.define('CJ.view.group.EditForm', {
    extend: 'Ext.Container',
    xtype: 'view-group-edit-form',
    mixins: { formable: 'CJ.view.mixins.Formable' },
    /**
     * @cfg {Boolean} isAutoFocus
     */
    isAutoFocus: true,
    config: {
        cls: 'd-group-form d-scroll',
        scrollable: CJ.Utils.getScrollable(),
        /**
         * @cfg {CJ.core.view.Popup} popup
         */
        popup: null,
        /**
         * @cfg {CJ.view.group.Block} block
         */
        block: null,
        /**
         * @cfg {Array} items
         */
        items: [],
        /**
         * @cfg {Object} values
         */
        values: {}
    },
    /**
     * @param {Array} items
     * @return {Array}
     */
    applyItems(items) {
        const isEdit = !this.getBlock();
        items = [
            {
                xtype: 'container',
                cls: 'd-box d-group-info d1',
                items: [
                    {
                        ref: 'overlay',
                        xtype: 'component',
                        cls: 'd-profile-overlay blur',
                        tpl: '<tpl if=\'url\'>{[ CJ.Utils.getTpl(\'blur\', values) ]}</tpl>',
                        hidden: isEdit
                    },
                    {
                        xtype: 'core-view-form-icon',
                        name: 'iconCfg',
                        allowEmpty: false,
                        hidden: isEdit,
                        listeners: {
                            scope: this,
                            uploadstart: this.denySubmit,
                            uploadsuccess: this.onUploadSuccess,
                            uploadfailure: this.allowSubmit
                        }
                    },
                    {
                        xtype: 'container',
                        ref: 'nameWrapper',
                        cls: 'd-title-wrapper',
                        items: [
                            {
                                xtype: 'textfield',
                                clearIcon: false,
                                cls: 'd-title',
                                maxLength: 100,
                                name: 'name',
                                placeHolder: CJ.app.t('view-group-edit-form-title-placeholder', true),
                                hint: CJ.app.t('view-group-edit-form-title-hint'),
                                listeners: {
                                    input: {
                                        fn: this.onTitleInputHandler,
                                        scope: this,
                                        element: 'element',
                                        delegate: 'input'
                                    }
                                }
                            },
                            {
                                xtype: 'core-view-form-growfield',
                                cls: 'd-growfield d-description',
                                name: 'description',
                                placeHolder: 'view-group-edit-form-description-placeholder',
                                hidden: isEdit,
                                minFieldHeight: 41
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'container',
                cls: 'd-box d-group-options d2',
                items: [
                    {
                        xtype: 'view-light-segmented-button',
                        name: 'isPublic',
                        fieldLabel: CJ.app.t('view-group-edit-form-join-mode-title'),
                        booleanMode: true,
                        pressed: 0,
                        buttons: [
                            {
                                text: CJ.app.t('view-group-edit-form-join-mode-anyone'),
                                value: 1
                            },
                            {
                                text: CJ.app.t('view-group-edit-form-join-mode-closed'),
                                value: 0
                            }
                        ]
                    },
                    {
                        xtype: 'view-light-segmented-button',
                        name: 'postingAllowed',
                        fieldLabel: CJ.app.t('view-group-edit-form-post-mode-title'),
                        booleanMode: true,
                        pressed: 0,
                        buttons: [
                            {
                                text: CJ.app.t('view-group-edit-form-post-mode-all-members'),
                                value: 1
                            },
                            {
                                text: CJ.app.t('view-group-edit-form-post-mode-owner'),
                                value: 0
                            }
                        ]
                    }
                ]
            }
        ];
        return this.callParent(args);
    },
    /**
     * @param {Object|Ext.Component} block
     * @param {Object|Ext.Component} oldBlock
     */
    updateBlock(block, oldBlock) {
        if (!(oldBlock && oldBlock.isBlock))
            return;
        if (!CJ.StreamHelper.byDocId(oldBlock.getDocId()))
            oldBlock.destroy();
    },
    /**
     * @param {CJ.core.view.Popup} popup
     */
    updatePopup(popup) {
        if (popup)
            popup.on('actionbuttontap', this.onActionButtonTap, this);
    },
    /**
     * saves a block
     */
    onActionButtonTap() {
        if (!this.validate())
            return false;
        const block = this.getBlock();
        let values;
        if (!block)
            return;
        this.applyChanges();
        values = this.getValues();
        values.name = Ext.String.trim(values.name);
        values.description = Ext.String.trim(values.description);
        values.icon = values.icon || CJ.Utils.randomHsl();
        block.startBatchUpdate();
        block.setConfig(values);
        block.endBatchUpdate();
        if (!block.isPhantom())
            return block.save();
        this.mask();
        this.denySubmit();
        block.save({
            stash: {
                success: this.onBlockCreateSuccess,
                callback: this.onBlockCreateCallback,
                scope: this
            }
        });
        CJ.StreamHelper.adjustContaining(block);
        return false;
    },
    /**
     * @param {CJ.view.group.Block} block
     */
    onBlockCreateSuccess(block) {
        CJ.app.fireEvent('group.create', block);
        this.getPopup().hide();
    },
    onBlockCreateCallback() {
        this.unmask();
        this.allowSubmit();
    },
    /**
     * @return {undefined}
     */
    denySubmit() {
        this.getPopup().denySubmit();
    },
    /**
     * @return {undefined}
     */
    allowSubmit() {
        this.getPopup().allowSubmit();
    },
    /**
     * @return {undefined}
     */
    focus() {
        Ext.defer(function () {
            this.down('[name=name]').focus();
        }, 500, this);
    },
    /**
     * method will be called when user changed title field
     */
    onTitleInputHandler() {
        // IE emits 2 input-events:
        // 1. field has a placeHolder.
        // 2. field has a placeHolder and we call focus().
        // so on IE we need to skip 2 input events.
        if (Ext.browser.is.IE) {
            this.IE_BUG_COUNT = this.IE_BUG_COUNT || 0;
            if (this.IE_BUG_COUNT < 2)
                return this.IE_BUG_COUNT++;
        }
        this.validate();
    },
    /**
     * validates and disables/enables submit button
     */
    validate() {
        const value = this.down('[name=name]').getValue(), isValid = !Ext.isEmpty(Ext.String.trim(value)), errorComponent = this.down('[ref=nameWrapper]');
        if (isValid)
            errorComponent.removeCls('d-invalid');
        else
            errorComponent.addCls('d-invalid');
        return isValid;
    },
    /**
     * @param {Ext.field.Field} field
     */
    onUploadSuccess(field, response, iconCfg) {
        this.allowSubmit();
        this.refreshOverlay(iconCfg.preview);
    },
    /**
     * updates blurred overlay
     * @return {undefined}
     */
    refreshOverlay(url) {
        if (!url)
            return;
        const overlay = this.down('[ref=overlay]'), overlayEl = overlay.element;
        overlay.setData({
            url,
            svgWidth: 300,
            svgHeight: 300
        });
        if (Ext.browser.is.Chrome)
            Ext.defer(overlayEl.redraw, 500, overlayEl);
    },
    /**
     * @return {undefined}
     */
    updateValues(values) {
        this.refreshOverlay(values.icon);
    },
    /**
     * frees used memory.
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setBlock(null);
        this.setPopup(null);
    }
});