import 'app/core/view/Popup';
import 'app/view/block/edit/defaults/Toolbar';
import 'app/view/block/edit/defaults/Editor';
import 'app/view/playlist/edit/nav/Button';
import 'app/view/playlist/edit/nav/LeftButton';
import 'app/view/playlist/edit/nav/RightButton';

Ext.define('CJ.view.block.edit.defaults.Popup', {
    extend: 'CJ.core.view.Popup',
    xtype: 'view-block-edit-defaults-popup',
    config: {
        /**
         * @cfg {String} cls
         */
        cls: 'd-editor-popup',
        /**
         * @cfg {Boolean} fitMode
         */
        fitMode: true,
        /**
         * @cfg {String} createButtonText
         */
        createButtonText: 'popup-playlist-editor-submit-create-block',
        title: 'popup-playlist-editor-title-create',
        layout: 'light',
        content: {
            xtype: 'view-block-edit-defaults-editor',
            activityTitle: {},
            list: {
                xtype: 'core-view-list-editor',
                items: { xtype: 'view-tool-text' }
            },
            question: {},
            editing: true
        },
        actionButton: false,
        actionContainer: true,
        /**
         * @cfg {CJ.view.block.BaseBlock} block
         */
        block: null,
        activeItemIndex: null,
        leftButton: {
            action: 'remove',
            locked: true
        },
        rightButton: {
            action: 'add',
            locked: true
        },
        hideTipsButton: true,
        /**
         * @cfg {Boolean|Object} closeConfirm
         */
        closeConfirm: {
            title: 'nav-popup-block-close-title',
            message: 'nav-popup-block-close-message'
        }
    },
    isActionAccessible() {
        return !(this.down('[isToolLoader]') || !this.getContent().validate());
    },
    /**
     * @override
     */
    onCloseConfirmHandler(result) {
        if (result == 'no')
            return;
        const block = this.getBlock();    // this.hideAllTooltips(true);
        // this.hideAllTooltips(true);
        if (block.isBlock)
            block.resetChanges();    // because playlist-block uses states and it will manage everything by itself.
        // because playlist-block uses states and it will manage everything by itself.
        if (block.isPlaylist)
            return;
        this.hide();    // if user made forward direction and clicked "yes" on this confirm
                        // we need to process all other popups behind this if needed.
        // if user made forward direction and clicked "yes" on this confirm
        // we need to process all other popups behind this if needed.
        if (this.hideReason == 'history' && CJ.app.getHistory().isHashUpdated())
            CJ.PopupManager.onForwardHistoryStep();
    },
    applyContent(config) {
        this.getBlock();
        Ext.apply(config, {
            listeners: {
                change: this.onEditorChange,
                scope: this
            }
        });
        return this.callParent(args);
    },
    updateContent(newContent, oldContent) {
        this.callParent(args);
        this.onEditorChange();
        if (newContent)
            Ext.defer(this.showEditorTooltips, oldContent ? 0 : 750, this);
    },
    onSearchBarOpen() {
        CJ.TooltipManager.hideGroup([
            'editor-nav',
            'editor-fields'
        ]);
    },
    onSearchBarClose() {
        CJ.TooltipManager.showGroup([
            'editor-nav',
            'editor-fields'
        ]);
    },
    onEditorChange() {
        if (this.getContent())
            this.configureButtons(this.getActiveItemIndex());
    },
    applyActionContainer(config) {
        this.getContent();
        if (!config)
            return false;
        config = Ext.apply({
            xtype: 'container',
            cls: 'action-container',
            items: [{
                    xtype: 'button',
                    text: CJ.t(this.getCreateButtonText()),
                    isCreateButton: true,
                    handler: this.onCreateTap,
                    scope: this
                }]
        }, config);
        return Ext.factory(config);
    },
    updateActionContainer: Ext.Component.processUpdateComponent,
    applyLeftButton(config, button) {
        if (!config)
            return false;
        const defaults = {
            xtype: 'view-playlist-edit-nav-left-button',
            popup: this,
            handler: this.onButtonTap,
            scope: this
        };
        if (!Ext.isObject(config))
            config = defaults;
        else if (!button)
            Ext.applyIf(config, defaults);
        return Ext.factory(config, null, button);
    },
    updateLeftButton(button, current) {
        if (!Ext.os.is.Phone)
            return Ext.Component.processUpdateComponent.apply(this, arguments);
        if (current)
            current.destroy();
        if (button)
            this.getActionContainer().insert(0, button);
    },
    applyRightButton(config, button) {
        if (!config)
            return false;
        const defaults = {
            xtype: 'view-playlist-edit-nav-right-button',
            popup: this,
            handler: this.onButtonTap,
            scope: this
        };
        if (!Ext.isObject(config))
            config = defaults;
        else if (!button)
            Ext.applyIf(config, defaults);
        return Ext.factory(config, null, button);
    },
    updateRightButton(button, current) {
        if (!Ext.os.is.Phone)
            return Ext.Component.processUpdateComponent.apply(this, arguments);
        if (current)
            current.destroy();
        if (button)
            this.getActionContainer().add(button);
    },
    applyHideTipsButton(config) {
        if (!config)
            return false;
        if (!CJ.TooltipManager.getAllowTooltips())
            return false;
        if (!Ext.os.is.Desktop)
            return false;
        const hiddenTips = CJ.User.get('hiddenTips');
        if (hiddenTips.indexOf('editor-nav') != -1 && hiddenTips.indexOf('editor-fields') != -1)
            return false;
        if (!Ext.isObject(config))
            config = {};
        Ext.applyIf(config, {
            xtype: 'button',
            cls: 'action-button hide-tips',
            text: 'Hide all tip text',
            handler: this.onHideTipsButtonTap,
            scope: this
        });
        return Ext.factory(config);
    },
    updateHideTipsButton: CJ.Utils.updateComponent,
    applyActiveItemIndex(index) {
        const block = this.getBlock(), isNumber = Ext.isNumber(index), editor = this.getContent(), editorHandler = isNumber ? editor.applyItemData : editor.cleanup, args = isNumber ? [index] : [];
        Ext.TaskQueue.requestWrite(() => {
            editorHandler.apply(editor, args);
            if (index === 0 && block.isPlaylist && block.isPhantom() && block.getLength() == 1)
                this.revertToInitial();
            this.configureButtons(index);
            this.refreshTitle(index);
        });
        return index;
    },
    configureButtons(index) {
        this.getLeftButton().configureState(index);
        this.getRightButton().configureState(index);
    },
    updateBlock(newBlock, oldBlock) {
        /*
         * @NOTE on editing with listeners attached , this ensures listeners are transfered
         */
        if (oldBlock && oldBlock.initialConfig) {
            const listeners = oldBlock.initialConfig.listeners;
            if (newBlock.isInstance) {
                // adding listeners from old block to new one in the initial config in case of changing again
                if (!newBlock.initialConfig.listeners)
                    newBlock.initialConfig.listeners = listeners;    // attaching all the listeners
                // attaching all the listeners
                newBlock.on(listeners);
            } else {
                newBlock.listeners = listeners;
            }
        }
        this.refreshLabels();
    },
    refreshTitle(index) {
        const block = this.getBlock();
        let title = CJ.app.t(this.getTitle());
        let currentNumber;
        if (block.isPlaylist) {
            if (Ext.isNumber(index))
                currentNumber = index;
            else
                currentNumber = block.getLength();
            title = Ext.String.format(`${ title } ( {0} )`, ++currentNumber);
        }
        this.updateTitle(title);
    },
    refreshLabels() {
        const block = this.getBlock();
        const entity = block.isPlaylist ? 'playlist' : 'activity';
        const isPhantom = !block.isComponent || block.isPhantom();
        const action = isPhantom ? 'create' : 'update';
        let titleText = CJ.tpl('playlist-editor-title-{0}', action);
        let buttonText = CJ.tpl('playlist-editor-submit-{0}-{1}', action, entity);
        titleText = CJ.t(titleText);
        buttonText = CJ.t(buttonText);
        this.setTitle(titleText);
        this.getActionContainer().down('[isCreateButton]').setText(buttonText);
    },
    animateSlide(hideCallback, reverse) {
        const el = this.element;
        let wrapperEl = el.down('.d-editor-editor > .x-inner.d-body');
        const offset = (el.getWidth() - wrapperEl.getWidth()) / 2;
        const hideOffset = offset + wrapperEl.getWidth();
        const factor = reverse ? 1 : -1;
        wrapperEl.addCls('trans');
        wrapperEl.setLeft(hideOffset * factor);
        Ext.defer(function () {
            if (Ext.isFunction(hideCallback)) {
                hideCallback.call(this);
            }    // it happens when we creates a playlist from a default block
            // it happens when we creates a playlist from a default block
            if (wrapperEl.isDestroyed)
                wrapperEl = el.down('.d-editor-editor > .x-inner.d-body');
            wrapperEl.removeCls('trans');
            wrapperEl.setLeft(hideOffset * factor * -1);
            Ext.defer(() => {
                wrapperEl.addCls('trans');
                wrapperEl.setLeft(0);
            }, 50, this);
        }, 550, this);
    },
    createPlaylistBlock() {
        let block = originalBlock = this.getBlock();
        let editor = this.getContent();
        const isDefaultBlock = block.isDefaultBlock;
        if (isDefaultBlock) {
            const data = block.serialize();
            block.setEditing(false);
            this.setContent({
                xtype: 'view-block-edit-defaults-editor',
                editing: true,
                activityTitle: {},
                list: {
                    xtype: 'core-view-list-editor',
                    items: { xtype: 'view-tool-text' }
                },
                question: {}
            });
            block = {
                categories: [],
                tags: data.tags,
                userInfo: data.userInfo,
                playlist: [data],
                originalBlockDocId: originalBlock.getDocId()
            };
            editor = this.getContent();
        }
        Ext.apply(block, {
            xtype: 'view-playlist-block',
            editor,
            state: 'edit',
            stateContainer: this
        });
        block = Ext.factory(block);
        if (!isDefaultBlock)
            block.insertItem();
        this.setBlock(block);
        return block;
    },
    revertToInitial() {
        const block = this.getBlock(), editor = this.getContent(), itemData = block.getItemData(0);
        if (CJ.Block.isPhantom(itemData.docId)) {
            const defaultBlock = CJ.byDocId(itemData.docId);
            if (defaultBlock) {
                block.setEditor(null);
                block.destroy();
                defaultBlock._editing = true;
                defaultBlock.setEditor(editor);
                editor.setBlock(defaultBlock);
                return this.setBlock(defaultBlock);
            }
        }
        this.setBlock({
            tags: block.getTags(),
            categories: block.getCategories(),
            userInfo: block.getUserInfo()
        });
        block.setEditor(null);
        block.destroy();
    },
    onButtonTap(button) {
        const action = button.getAction(), handlerName = CJ.tpl('on{0}Tap', CJ.capitalize(action));
        Ext.callback(this[handlerName], this, [button]);
    },
    /**
     * @param {Ext.Button} button
     * @return {undefined}
     */
    onAddTap(button) {
        if (!this.isActionAccessible())
            return;
        button.disable();
        this.hideFieldsTooltips(true, true);
        this.animateSlide(function () {
            let block = this.getBlock();
            const itemIndex = this.getActiveItemIndex();
            if (!block.isPlaylist) {
                block = this.createPlaylistBlock();
            } else {
                if (Ext.isNumber(itemIndex))
                    block.applyItemChanges(itemIndex);
                else
                    block.insertItem();
            }
            this.setActiveItemIndex(false);
            Ext.defer(function () {
                button.enable();
                this.onAnimateSlideEnd();
            }, 600, this);
        });
    },
    onRemoveTap(button) {
        const isForwardDirection = button.isRightButton;
        button.disable();
        this.hideFieldsTooltips(true, true);
        this.animateSlide(function () {
            const block = this.getBlock();
            let activeItemIndex = this.getActiveItemIndex();
            const lastIndex = block.getLength() - 1;
            const isNew = activeItemIndex === false;
            const isFirst = !isNew && activeItemIndex == 0;
            const isLast = !isNew && activeItemIndex == lastIndex;
            if (!isNew)
                block.removeItem(activeItemIndex);
            if (isForwardDirection) {
                if (isLast)
                    activeItemIndex = false;
            } else {
                switch (true) {
                case isNew:
                    activeItemIndex = lastIndex;
                    break;
                case isFirst:
                    activeItemIndex = false;
                    break;
                default:
                    activeItemIndex--;
                }
            }
            this.setActiveItemIndex(activeItemIndex);
            Ext.defer(function () {
                button.enable();
                this.onAnimateSlideEnd();
            }, 600, this);
        }, !isForwardDirection);
    },
    onNextTap(button) {
        if (!this.isActionAccessible())
            return;
        button.disable();
        this.hideFieldsTooltips(true, true);
        this.animateSlide(function () {
            const block = this.getBlock();
            let activeItemIndex = this.getActiveItemIndex();
            let index;
            block.applyItemChanges(activeItemIndex);
            if (activeItemIndex == block.getLength() - 1) {
                index = false;
            } else {
                index = ++activeItemIndex;
            }
            this.setActiveItemIndex(index);
            Ext.defer(function () {
                button.enable();
                this.onAnimateSlideEnd();
            }, 600, this);
        });
    },
    onBackTap(button) {
        const editor = this.getContent();
        if (!this.isActionAccessible())
            return;
        button.disable();
        this.hideFieldsTooltips(true, true);
        this.animateSlide(function () {
            const block = this.getBlock();
            const length = block.getLength();
            const activeItemIndex = this.getActiveItemIndex();
            let index;
            editor.applyItemChanges(activeItemIndex);
            if (activeItemIndex) {
                index = activeItemIndex - 1;
            } else {
                index = length - 1;
            }
            this.setActiveItemIndex(index);
            Ext.defer(function () {
                button.enable();
                this.onAnimateSlideEnd();
            }, 600, this);
        }, true);
    },
    /**
     * method will be called when popup changes it's editor.
     */
    onAnimateSlideEnd() {
        this.showFieldsTooltips();
    },
    onHideTipsButtonTap(button) {
        this.hideAllTooltips(true);
        button.destroy();
    },
    onCreateTap(button) {
        if (!this.isActionAccessible())
            return;
        let block = this.getBlock();
        if (block.isPlaylist) {
            this.getContent().applyItemChanges(this.getActiveItemIndex());
            button.setDisabled(true);
            block.setState('review');
        } else {
            if (!block.isInstance)
                block = Ext.factory(Ext.apply({
                    xtype: 'view-block-default-block',
                    editor: this.getContent(),
                    editing: true
                }, block));
            block.publish();
        }
    },
    /**
     * @return {undefined}
     */
    hide() {
        this.hideAllTooltips(true);
        this.callParent(args);
    },
    showEditorTooltips() {
        this.showFieldsTooltips();
        CJ.TooltipManager.showGroup('editor-nav');
    },
    showFieldsTooltips() {
        this.initFieldsTooltips();
        CJ.TooltipManager.showGroup('editor-fields');
    },
    initFieldsTooltips() {
        const editor = this.getContent(), question = editor.getQuestion();
        CJ.TooltipManager.initTooltip({
            text: 'Teach engaging lessons!',
            position: {
                x: 'right',
                y: 'top',
                inside: true
            },
            group: 'editor-fields',
            autoShow: false
        }, editor.getList());
        CJ.TooltipManager.initTooltip({
            text: 'Create challenging activities!',
            position: {
                x: 'right',
                y: 'top',
                inside: true
            },
            group: 'editor-fields',
            offset: { y: 2 },
            autoShow: false
        }, question);
        CJ.TooltipManager.initTooltip({
            text: 'Choose the type of response you want.',
            position: {
                x: 'right',
                y: 'bottom',
                inside: true
            },
            group: 'editor-fields',
            width: 180,
            autoShow: false
        }, question);    // if (tagSelect) {
                         //     CJ.TooltipManager.initTooltip({
                         //         text: 'Set tags to categorize content and quick fetching.',
                         //         position: 'left topstart',
                         //         offset: {
                         //             y: 2
                         //         },
                         //         group: 'editor-fields',
                         //         autoShow: false
                         //     }, tagSelect);
                         //     CJ.TooltipManager.initTooltip({
                         //         text: 'Selected tags appear here.',
                         //         position: 'right topstart',
                         //         offset: {
                         //             y: 56
                         //         },
                         //         group: 'editor-fields',
                         //         autoShow: false
                         //     }, tagSelect);
                         // }
    },
    hideFieldsTooltips() {
        CJ.TooltipManager.hideGroup('editor-fields');
    },
    hideAllTooltips(forever) {
        CJ.TooltipManager.hideGroup([
            'editor-nav',
            'editor-fields'
        ], forever);
    },
    destroy() {
        this.callParent(args);
        this.setActionContainer(false);
    }
});