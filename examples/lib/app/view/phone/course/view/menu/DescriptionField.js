import 'app/view/course/view/menu/DescriptionField';

// @TODO description field doesn't use layout boundary, and it should!
/**
 * Defines a component that is used to show description of a course in course
 * viewer.
 */
Ext.define('CJ.view.phone.course.view.menu.DescriptionField', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.view.menu.DescriptionField',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-phone-course-view-menu-description-field',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Number} contentScrollHeight
         */
        contentScrollHeight: 0,
        /**
         * @cfg {Number} contentClientHeight
         */
        contentClientHeight: 0
    },
    constructor() {
        this.callParent(args);
        fastdom.write(this.onComponentPaint, this);
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        return {
            reference: 'element',
            children: [{
                    reference: 'contentEl',
                    className: 'd-content'
                }]
        };
    },
    /**
     * method will be called only once, right after painting.
     * @return {undefined}
     */
    onComponentPaint() {
        const contentEl = this.contentEl;
        this.setContentScrollHeight(contentEl.dom.scrollHeight);
        this.setContentClientHeight(contentEl.dom.clientHeight);
        this.updateCollapsed(this.getCollapsed());
        this.element.on('tap', this.onElementTap, this);
    },
    /**
     * @return {undefined}
     */
    updateData() {
        this.contentEl.setHtml(this.getValue() || '');
    },
    /**
     * @param {Boolean} state
     * @return {undefined}
     */
    updateCollapsed(state) {
        if (!this.initialized)
            return;
        const scrollHeight = this.getContentScrollHeight(), clientHeight = this.getContentClientHeight();
        if (scrollHeight == clientHeight)
            return;
        this.contentEl.setMaxHeight(state ? null : scrollHeight);
        this.element[state ? 'addCls' : 'removeCls']('d-collapsed');
    }
});