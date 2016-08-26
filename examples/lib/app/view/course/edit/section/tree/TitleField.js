Ext.define('CJ.view.course.edit.section.tree.TitleField', {
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-tree-title-field',
    /**
     * @property {Object} mixins
     */
    mixins: { observable: 'Ext.mixin.Observable' },
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Ext.Element} element
         */
        element: null,
        /**
         * @cfg {HTMLElement} inputNode
         */
        inputNode: true,
        /**
         * @cfg {Object} section
         */
        section: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.initConfig(config);
        this.callParent(args);
    },
    /**
     * @param {Object} config
     * @return {HTMLElement}
     */
    applyInputNode(config) {
        if (!config)
            return false;
        const node = document.createElement('input'), title = this.getSection().title;
        node.className = 'd-input';
        node.maxLength = 150;
        node.placeholder = CJ.t('view-course-edit-section-tree-title-field-placeholder', true);
        if (title != node.placeholder)
            node.value = title;
        return node;
    },
    /**
     * @param {HTMLElement} newNode
     * @param {HTMLElement} oldNode
     */
    updateInputNode(newNode, oldNode) {
        if (oldNode)
            Ext.removeNode(oldNode);
        if (newNode) {
            this.getElement().appendChild(newNode);
            newNode.focus();
        }
    },
    /**
     * @param {Ext.Element} newElement
     * @param {Ext.Element} oldElement
     * @return {undefined}
     */
    updateElement(newElement, oldElement) {
        if (oldElement)
            oldElement.removeCls('d-editable');
        if (!newElement)
            return;
        newElement.addCls('d-editable');
        newElement.on({
            scope: this,
            blur: this.onBlur,
            keyup: this.onInputKeyUp,
            delegate: '.d-input'
        });
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onInputKeyUp(e) {
        if (e.event.keyCode != 13)
            return;
        e.stopEvent();
        e.target.blur();
    },
    /**
     * @return {undefined}
     */
    onBlur() {
        const input = this.getInputNode(), section = this.getSection(), newTitle = Ext.String.trim(input.value);
        if (newTitle == section.title || Ext.isEmpty(newTitle))
            return this.destroy();
        this.fireEvent('change', this, section.docId, newTitle);
        this.destroy();
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.callParent(args);
        this.setElement(null);
        this.setInputNode(null);
    }
});