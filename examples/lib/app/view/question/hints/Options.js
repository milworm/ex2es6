import 'app/view/question/OptionItem';
import 'app/view/block/edit/defaults/HintsPopup';

Ext.define('CJ.view.question.hints.Options', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.question.OptionItem',
    /**
     * @property {Boolean} isHintsOptions
     */
    isHintsOptions: true,
    /**
     * @property {String} alias
     */
    alias: 'widget.view-question-hints-options',
    /**
     * @property {config} config
     */
    config: {
        /**
         * @cfg {Object} hint
         */
        hint: null,
        /**
         * @cfg {String} cls
         */
        cls: 'd-hints-options',
        /**
         * @cfg {Ext.XTemplate} tpl
         */
        tpl: Ext.create('Ext.XTemplate', '<div class=\'d-header\'>{title}</div>', '<div class=\'d-option d-hbox d-vcenter {[ values.hint.docId ? \'\' : \'d-empty\' ]}\' data-type=\'hint\'>', '<div class=\'d-button d-add\' data-action=\'add\'>{add}</div>', '<div class=\'d-edit-buttons\'>', '<div class=\'d-button d-edit {[ this.canEdit(values.hint.user) ? \'\' : \'d-disabled\']}\' data-action=\'edit\'>{edit}</div>', '<div class=\'d-button d-remove\' data-action=\'remove\'>{remove}</div>', '</div>', '<div class=\'d-link-icon\'></div>', '</div>', {
            canEdit(user) {
                return CJ.User.isMineTags(user || '');
            }
        }),
        /**
         * @cfg {Object} idPopupTitles
         */
        idPopupTitles: {
            title: 'view-question-hints-id-popup',
            button: 'view-question-hints-id-popup-submit'
        },
        /**
         * @cfg {Object} editorTitles
         */
        editorTitles: {
            title: 'view-question-hints-options-editor-title',
            button: 'view-question-hints-options-editor-button'
        },
        /**
         * @cfg {Object} removeTitles
         */
        removeTitles: {
            title: 'view-question-hints-options-remove-title',
            message: 'view-question-hints-options-remove-message'
        }
    },
    /**
     * @return {Object}
     */
    applyData() {
        const key = 'view-question-hints-options', hint = this.getHint();
        return {
            title: CJ.t(`${ key }-title`),
            add: CJ.t(`${ key }-add`),
            edit: CJ.t(`${ key }-edit`),
            remove: CJ.t(`${ key }-remove`),
            hint: hint || {}
        };
    },
    /**
     * @param {Object} config
     * @return {undefined}
     */
    updateHint(config) {
        if (!this.initialized)
            return;
        this.updateOptionState('hint', !!config);
    },
    /**
     * @param {String} type correct, wrong, completed.
     * @return {undefined}
     */
    addBlock() {
        const titles = this.getEditorTitles();
        Ext.factory({
            xtype: 'view-block-edit-defaults-hints-popup',
            title: titles.title,
            createButtonText: titles.button,
            block: {
                userInfo: CJ.User.getInfo(),
                listeners: this.getBlockListeners()
            }
        });
        this.onBlockEditorOpen();
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    onBlockSave(block) {
        this.setOptionValue(this.getActiveType(), {
            docId: block.getDocId(),
            user: CJ.User.get('user')
        });
    },
    /**
     * Loads a block and opens an editor to start editing a block.
     */
    editBlock() {
        const type = this.getActiveType(), id = this[`get${ CJ.capitalize(type) }`]().docId;
        CJ.LoadBar.run();
        CJ.Block.load(id, {
            scope: this,
            success: this.onBlockLoad,
            callback() {
                CJ.LoadBar.finish();
            }
        });
    },
    /**
     * @param {Object} response
     */
    onBlockLoad(response) {
        let block = Ext.apply(response.ret, { listeners: this.getBlockListeners() });
        block = Ext.factory(block);
        if (block.isPlaylist)
            block.setState('review');
        else
            block.setEditing(true);
        this.onBlockEditorOpen();
    },
    /**
     * Default publich-functionality is to show publish-carousel. Since user creates a hint which doesn't have any
     * tags, categories we just need to save a block.
     * @param {CJ.view.block.BaseBlock} block
     */
    onBlockBeforePublish(block) {
        if (block.isPlaylist) {
            block.resetBadge();    // @TODO we can't save playlist block with badge:null, discuss with Ivo.
            // @TODO we can't save playlist block with badge:null, discuss with Ivo.
            block.save();
            block.setState(null);
        } else {
            block.closeEditor();
            block.save();
        }
        return false;
    },
    /**
     * listeners configuration for blocks and playlist, that will be used for both add and edit block actions.
     * @return {Object}
     */
    getBlockListeners() {
        return {
            scope: this,
            beforepublish: this.onBlockBeforePublish,
            saved: this.onBlockSave,
            aftersave: this.onBlockSave    // @TODO remove aftersave and use saved always for all types of blocks.
        };
    },
    /**
     * @return {Object}
     */
    getValues() {
        return this.getHint();
    },
    /**
     * @return {Object}
     */
    onBlockEditorOpen() {
        let editor = Ext.ComponentQuery.query('[isEditor]');
        editor = editor[editor.length - 1];    // last editor
        // last editor
        editor.getPopup().addCls('d-hints-editor-popup');
    }
});