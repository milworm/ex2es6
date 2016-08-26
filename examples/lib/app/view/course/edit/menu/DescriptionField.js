import 'app/core/view/form/GrowField';

Ext.define('CJ.view.course.edit.menu.DescriptionField', {
    extend: 'CJ.core.view.form.GrowField',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-edit-menu-description-field',
    config: {
        /**
         * @cfg {String} placeHolder
         */
        placeHolder: 'view-course-edit-menu-menu-description-placeholder',
        /**
         * @cfg {Number} minFieldHeight
         */
        minFieldHeight: 150,
        /**
         * @cfg {Number} maxFieldHeight
         */
        maxFieldHeight: 360,
        /**
         * @cfg {String} cls
         */
        cls: [
            'd-description-field',
            'd-initial'
        ],
        /**
         * @cfg {Boolean} editing
         */
        editing: null,
        /**
         * @cfg {Number} maxLength
         */
        maxLength: 330
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.callParent(args);
        const element = this.element;
        element[config.value ? 'removeCls' : 'addCls']('d-initial');
        element.on('tap', this.onElementTap, this);
        element.set({ 'data-placeholder': CJ.t('view-course-edit-menu-menu-add-description', true) });
    },
    /**
     * @param {Boolean} state
     * @return {Boolean}
     */
    applyEditing(state) {
        if (state)
            Ext.Viewport.onInputTap(this.element.dom);
        return state;
    },
    /**
     * @param {Boolean} newState
     * @param {Boolean} oldState
     */
    updateEditing(newState, oldState) {
        this.getRenderTo();
        this[newState ? 'un' : 'on']('focus', this.onFocus, this);
        this[newState ? 'on' : 'un']('blur', this.onBlur, this);
        if (newState)
            this.toEditState();
        else
            this.toViewState();
    },
    /**
     * @return {undefined}
     */
    toEditState() {
        this.element.replaceCls('d-view', 'd-edit');
        this.element.removeCls('d-scrollable');
        this.focus();
    },
    /**
     * @return {undefined}
     */
    toViewState() {
        this.element.replaceCls('d-edit', 'd-view');
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onBlur() {
        this.setEditing(false);
        this.fireEvent('change', this);
    },
    /**
     * @param {Ext.Evented} e
     * @return {undefined}
     */
    onElementTap() {
        if (this.element.hasCls('d-initial'))
            return this.fromInitialState();
        this.setEditing(true);
    },
    /**
     * @return {undefined}
     */
    onFocus() {
        this.onElementTap();
    },
    /**
     * @return {undefined}
     */
    fromInitialState() {
        if (Ext.os.is.iOS)
            this.setEditing(true);
        this.element.addCls('d-to-editing');    // can't use CJ.Animation.animate here, as we have inner-animation for 
                                                // ::before pseudo element.
        // can't use CJ.Animation.animate here, as we have inner-animation for 
        // ::before pseudo element.
        Ext.defer(function () {
            this.element.removeCls('d-to-editing d-initial');
            this.setEditing(true);
        }, 1000, this);
    },
    /**
     * @return {undefined}
     */
    select() {
        this.content.dom.select();
    }
});