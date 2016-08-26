/**
 * Defines a class that contains common logic for both edit and view 
 * editors on tablets.
 */
Ext.define('CJ.view.tablet.course.base.Editor', {
    /**
     * @param {Object} values
     * @return {undefined}
     */
    updateValues(values) {
        const courseTitleNode = this.element.dom.querySelector('.d-course-title');
        courseTitleNode.innerHTML = values.title || '';
    },
    /**
     * @param {Ext.Evented} e
     */
    onElementTap(e) {
        if (e.getTarget('.d-close'))
            this.onCloseButtonTap();
        else if (e.getTarget('.d-open-menu-button'))
            this.onOpenMenuButtonTap();
        else if (e.getTarget('.d-mask'))
            this.onMaskTap();
        else
            this.callParent(args);
    },
    /**
     * @return {undefined}
     */
    onOpenMenuButtonTap() {
        this.addCls('d-expanded');
    },
    /**
     * @return {undefined}
     */
    onMaskTap() {
        this.hideMask();
    },
    /**
     * @param {Function} callback
     * @param {Object} scope
     */
    hideMask(callback, scope) {
        // https://redmine.iqria.com/issues/8789
        if (document.activeElement)
            document.activeElement.blur();
        this.replaceCls('d-expanded', 'd-collapsed');
        Ext.defer(function () {
            this.removeCls('d-collapsed');
            if (callback)
                callback.call(scope);
        }, 505, this);
    }
});