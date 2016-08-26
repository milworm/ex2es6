import 'Ext/Container';

/**
 * The class provides component for adding a block to new playlist.
 */
Ext.define('CJ.view.playlist.add.ToNew', {
    /**
     * @inheritdoc
     */
    extend: 'Ext.Container',
    /**
     * @inheritdoc
     */
    xtype: 'view-playlist-add-to-new',
    config: {
        /**
         * @inheritdoc
         */
        cls: 'd-add-to-new-playlist d-scroll',
        /**
         * @inheritdoc
         */
        scrollable: CJ.Utils.getScrollable(),
        /**
         * @cfg {CJ.view.playlist.add.Popup} popup
         * The wrapper component.
         */
        popup: null,
        /**
         * @cfg {CJ.view.block.DefaultBlock} block
         * The block that will be added to playlists.
         */
        block: null,
        /**
         * @cfg {Boolean/Object/Ext.Button}
         *  The component or config for it,
         *  that provides button for the switching adding method.
         */
        backButton: true,
        /**
         * @cfg {Boolean/Object/Ext.Container} form
         * The component or config for it,
         * that provides the form for new playlist.
         */
        form: true,
        /**
         * @cfg {Boolean} isIconUploading
         * Uploading state of the icon field.
         */
        isIconUploading: false
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
     * Applies and initializes the button for switching adding method.
     * @param {Boolean/Object} config
     * @returns {Boolean/Ext.Button}
     */
    applyBackButton(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            cls: 'back-button',
            text: 'add-to-playlist-new-switching-method-button-text',
            listeners: {
                tap: this.onBackButtonTap,
                scope: this
            }
        });
        return Ext.factory(config);
    },
    /**
     * Updates the button.
     */
    updateBackButton: CJ.Utils.updateComponent,
    /**
     * Handler of the event 'tap' of the button that switches adding method.
     * Switches adding method to the 'Add to existing playlists'.
     */
    onBackButtonTap() {
        this.getPopup().setAddToExisting(true);
    },
    /**
     * Applies and initializes the form for new playlist.
     * @param {Boolean/Object} config
     * @returns {Boolean/Ext.Container}
     */
    applyForm(config) {
        if (!config)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'container',
            cls: 'd-form',
            items: [
                {
                    xtype: 'core-view-form-icon',
                    name: 'iconCfg',
                    listeners: {
                        uploadstart: this.onIconUploadStart,
                        fileuploaddone: this.onIconUploadDone,
                        scope: this
                    }
                },
                {
                    clearIcon: false,
                    xtype: 'textfield',
                    cls: 'd-title',
                    maxLength: 60,
                    name: 'title',
                    placeHolder: CJ.t('view-playlist-add-to-new-title-placeholder', true),
                    hint: CJ.t('view-playlist-add-to-new-title-hint'),
                    listeners: {
                        focus: this.onTitleFocus,
                        blur: this.onTitleBlur,
                        input: {
                            delegate: 'input',
                            element: 'element',
                            fn: this.onTitleFieldInput,
                            scope: this
                        },
                        tap: {
                            delegate: '.x-innerhtml',
                            element: 'element',
                            fn: this.onTitleErrorTap,
                            scope: this
                        }
                    }
                },
                {
                    xtype: 'component',
                    cls: 'hr'
                },
                {
                    xtype: 'core-view-form-growfield',
                    cls: 'd-growfield d-description',
                    maxFieldHeight: 110,
                    maxLength: 140,
                    name: 'description',
                    placeHolder: CJ.t('view-playlist-add-to-new-description-placeholder', true),
                    hint: CJ.t('view-playlist-add-to-new-description-hint', true)
                }
            ],
            listeners: {
                painted(element) {
                    Ext.defer(() => {
                        element.down('.d-form > .x-inner').redraw();
                    }, 250);
                }
            }
        });
        return Ext.factory(config);
    },
    /**
     * Updates the form.
     */
    updateForm: CJ.Utils.updateComponent,
    updateIsIconUploading(state) {
        const popup = this.getPopup(), handler = state ? 'denySubmit' : 'allowSubmit';
        popup[handler].call(popup);
    },
    /**
     * Fix for IE10 that don't support pointer-event
     */
    onTitleErrorTap() {
        if (Ext.browser.is.IE10)
            this.down('[name=title]').focus();
    },
    onTitleFocus(title) {
        const el = title.element;
        if (el.hasCls('error')) {
            el.down('.x-innerhtml').hide();
        }
    },
    onTitleBlur(title) {
        const el = title.element;
        if (el.hasCls('error'))
            el.down('.x-innerhtml').show();
    },
    onIconUploadStart() {
        this.setIsIconUploading(true);
    },
    onIconUploadDone() {
        this.setIsIconUploading(false);
    },
    /**
     * Handler of the event 'tap' of the action button of the popup.
     * Creates new playlist with block.
     * Returns false for prevent closing popup.
     * @returns {Boolean}
     */
    onActionButtonTap() {
        if (this.validate()) {
            const block = this.getBlock();
            let tags;
            if (CJ.User.isMine(block))
                tags = block.getTags();
            if (Ext.isEmpty(tags))
                tags = [CJ.User.get('user')];
            const data = {
                playlist: [this.getBlock().serialize()],
                userInfo: CJ.User.getInfo(),
                tags,
                docVisibility: CJ.User.getDefaultDocVisibility(),
                badge: { name: '' },
                listeners: {
                    aftersave: this.onPlaylistAfterSave,
                    scope: this
                }
            };
            this.mask();
            Ext.each(this.query('[name]'), field => {
                data[field.getName()] = field.getValue && field.getValue();
            }, this);
            Ext.create('CJ.view.playlist.Block', data).save();
        }
        return false;
    },
    onTitleFieldInput() {
        // IE emits an input-event when you focus an input with a placeHolder.
        if (Ext.browser.is.IE && !this.IE_INPUT_BUG)
            return this.IE_INPUT_BUG = true;
        this.validate();
    },
    /**
     * Validates the form and disables/enables popup's action button.
     * Form will be valid if at least title is provided by a user.
     * @return {undefined}
     */
    validate() {
        const title = this.down('[name=title]'), popup = this.getPopup();
        if (Ext.isEmpty(title.getValue())) {
            popup.denySubmit();
            title.setHtml(CJ.t('view-playlist-add-to-new-title-error'));
            title.addCls('error');
            return false;
        }
        if (!this.getIsIconUploading())
            popup.allowSubmit();
        title.setHtml('');
        title.removeCls('error');
        return true;
    },
    /**
     * Handler of event 'aftersave' of new playlist.
     * Shows the message about success saving.
     * If user tap on the 'check it out' button of the message,
     * leads to the review state.
     * @param {Ext.view.playlist.Block} block
     */
    onPlaylistAfterSave(block) {
        CJ.feedback({
            message: CJ.t('add-to-playlist-new-saving-message'),
            duration: 5000,
            tap(e) {
                if (e.getTarget('.d-button'))
                    block.setState('review');
            }
        });
        this.unmask();
        this.getPopup().hide();
    }
});