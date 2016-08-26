import 'Ext/Component';

/**
 * Defines a component that is used to show description of a course in course
 * viewer.
 */
Ext.define('CJ.view.course.view.menu.DescriptionField', {
    /**
     * @property {String} extend
     */
    extend: 'Ext.Component',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-course-view-menu-description-field',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {String} value
         */
        value: null,
        /**
         * @cfg {Boolean} collapsed
         */
        collapsed: true,
        /**
         * @cfg {Object} data
         */
        data: {},
        /**
         * @cfg {String} cls
         */
        cls: 'd-description-field',
        /**
         * @cfg {Ext.Template} tpl
         */
        tpl: Ext.create('Ext.Template', '<div class=\'d-content\'>{value}</div>', '<div class=\'d-button\'>{readMore}</div>', { compiled: true })
    },
    constructor() {
        this.callParent(args);
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        this.setCollapsed(!this.getCollapsed());
    },
    /**
     * @return {undefined}
     */
    updateData() {
        this.element.setHtml(this.getTpl().apply({
            value: this.getValue() || '',
            readMore: CJ.t('view-course-view-menu-description-field-read-more')
        }));
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateCollapsed(state) {
        this.element[state ? 'addCls' : 'removeCls']('d-collapsed');
        if (this.initialized)
            return this.renderReadMoreButton();
        fastdom.write(function () {
            this.renderReadMoreButton(true);
        }, this);
    },
    /**
     * @param {Boolean} initial
     * @return {undefined}
     */
    renderReadMoreButton(initial) {
        const element = this.element, collapsed = this.getCollapsed(), content = element.dom.querySelector('.d-content'), scrollable = content.scrollHeight > content.clientHeight;
        Ext.defer(function () {
            if (this.isDestroyed)
                return;
            element.removeCls('d-has-read-more');
            if (collapsed && scrollable)
                element.addCls('d-has-read-more');
        }, initial ? 0 : 300, this);
    }
});