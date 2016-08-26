import 'Ext/Component';
import 'app/core/view/IdPopup';

Ext.define('CJ.view.question.OptionItem', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-question-option-item',
    /**
     * @property {Boolean} isOptionItem
     */
    isOptionItem: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} activeType
         */
        activeType: null,
        /**
         * @cfg {String} cls
         */
        baseCls: 'd-option-item',
        /**
         * @cfg {Object} idPopupTitles
         */
        idPopupTitles: {},
        /**
         * @cfg {Object} removeTitles
         */
        removeTitles: {}
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        this.element.setHtml(this.getTpl().apply(data));
    },
    /**
     * @param {String} type
     * @param {String} state
     */
    updateOptionState(type, state) {
        this.getOptionNodeByType(type).classList[state ? 'remove' : 'add']('d-empty');
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap(e) {
        const type = e.getTarget('[data-type]', 5);
        if (!type)
            return;
        this.setActiveType(CJ.getNodeData(type, 'type'));
        if (e.getTarget('.d-disabled', 5))
            return;
        if (e.getTarget('.d-link-icon', 5))
            return this.showIdPopup();
        if (e.getTarget('[data-action]', 5)) {
            let action = e.getTarget('[data-action]', 5);
            action = CJ.getNodeData(action, 'action');
            this[`${ action }Block`]();
        }
    },
    /**
     * @param {String} type
     * @return {undefined}
     */
    addBlock(type) {
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    onAddBlockSuccess(block) {
        this.setOptionValue(this.getActiveType(), {
            docId: block.getDocId(),
            user: CJ.User.get('user')
        });
    },
    /**
     * @return {undefined}
     */
    editBlock() {
    },
    /**
     * @return {undefined}
     */
    removeBlock() {
        const titles = this.getRemoveTitles();
        CJ.confirm(titles.title, titles.message, function (result) {
            if (result != 'yes')
                return;
            this.setOptionValue(this.getActiveType(), null);
        }, this);
    },
    /**
     * @return {undefined}
     */
    showIdPopup() {
        const type = this.getActiveType();
        const config = this[`get${ CJ.capitalize(type) }`]();
        let docId = null;
        let user = null;
        if (config) {
            docId = config.docId;
            user = config.user;
        }
        const titles = this.getIdPopupTitles();
        CJ.IdPopup.show({
            title: CJ.t(titles.title),
            button: CJ.t(titles.button),
            blockId: docId,
            blockUser: user,
            listeners: {
                scope: this,
                actionbuttontap: this.onIdPopupSubmit
            }
        });
    },
    /**
     * @param {CJ.core.view.Popup} popup
     * @return {undefined}
     */
    onIdPopupSubmit(popup) {
        const config = popup.getValues(), type = this.getActiveType();
        this.setOptionValue(type, config);
    },
    /**
     * @param {String} type
     * @param {String} value
     * @return {undefined}
     */
    setOptionValue(type, value) {
        this[`set${ CJ.capitalize(type) }`](value);
        const editButton = this.getOptionNodeByType(type).querySelector('.d-edit');
        if (value)
            editButton.classList[CJ.User.isMineTags(value.user) ? 'remove' : 'add']('d-disabled');
    },
    /**
     * @param {String} type
     * @return {HTMLElement}
     */
    getOptionNodeByType(type) {
        return this.element.dom.querySelector(CJ.tpl('[data-type=\'{0}\']', type));
    },
    /**
     * @return {Object}
     */
    getValues() {
        return {};
    }
});