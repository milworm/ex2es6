import 'Ext/Component';

/**
 * Defines a component that is used to add new sections to section tree.
 */
Ext.define('CJ.view.course.edit.section.tree.NewField', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-section-tree-new-field',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} name
         */
        maxLength: 150,
        /**
         * @cfg {String} baseCls
         */
        baseCls: 'd-new-section-field',
        /**
         * @cfg {String} innerCls
         */
        innerCls: 'd-new-section-field-inner',
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<input type=\'text\' class=\'d-new-section d-hidden d-input\' placeholder=\'{placeholder}\' maxlength={maxLength}/>', '<div class=\'d-button\'>', '{button}', '</div>', { compiled: true }),
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} value
         */
        value: null
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onButtonTap, this, { delegate: '.d-button' });
        this.element.on({
            blur: this.onInputBlur,
            keyup: this.onInputKeyUp,
            scope: this,
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
    getButtonNode() {
        return this.element.dom.querySelector('.d-button');
    },
    getInputNode() {
        return this.element.dom.querySelector('.d-input');
    },
    /**
     * @param {Object} data
     */
    updateData(data) {
        let html = '';
        if (data) {
            Ext.apply(data, {
                button: CJ.t('view-course-edit-section-tree-new-field-button'),
                placeholder: CJ.t('view-course-edit-section-tree-new-field-placeholder', true),
                maxLength: this.getMaxLength()
            });
            html = this.getTpl().apply(data);
        }
        this.element.setHtml(html);
    },
    onButtonTap(e) {
        // ios doesn't fire blur-event when user taps on button,
        // because we add focus to input-field in the same handler.
        if (Ext.os.is.iOS)
            this.onInputBlur();
        e.getTarget().classList.add('d-hiding');
        Ext.defer(this.onButtonAnimationHide, 500, this);
    },
    onInputBlur() {
        const input = this.getInputNode(), value = input.value;
        input.classList.add('d-hidden');
        input.value = '';
        if (Ext.isEmpty(Ext.String.trim(value)))
            return;
        this.setValue(value);
        this.fireEvent('change', this, this.getValue());
    },
    onButtonAnimationHide() {
        this.showButton();
        this.showInput();
    },
    showInput() {
        const input = this.getInputNode();
        input.classList.remove('d-hidden');
        input.focus();
    },
    showButton() {
        this.getButtonNode().classList.remove('d-hiding');
    }
});