import 'app/view/course/view/Editor';
import 'app/view/phone/course/view/section/list/List';

/**
 * Defines a component that is used to show users a course on phones.
 */
Ext.define('CJ.view.phone.course.view.Editor', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.course.view.Editor',
    /**
     * @property {String} alias
     */
    alias: 'widget.view-phone-course-view-editor',
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Ext.Component} tableOfContents
         */
        tableOfContents: null
    },
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.callParent(args);
        this.element.on('tap', this.onHeaderTap, this, { delegate: '.d-course-viewer-header' });
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyTableOfContents(config) {
        if (!config)
            return false;
        return Ext.factory(Ext.apply({
            xtype: 'view-course-view-section-tree-tree',
            editor: this,
            sections: this.getBlock().getSections(),
            renderTo: this.element.dom.querySelector('.d-course-viewer-toc')
        }, config));
    },
    /**
     * @param {Ext.Component} newComponent
     * @param {Ext.Component} oldComponent
     * @return {undefined}
     */
    updateTableOfContents(newComponent, oldComponent) {
        this.element.removeCls('d-toc-opened');
        if (oldComponent)
            oldComponent.destroy();
        if (!newComponent)
            return;
        this.element.addCls('d-toc-opened');
        newComponent.element.addCls('d-showing');
        newComponent.on('destroy', this.onTableOfContentsDestroy, this);
        Ext.defer(() => {
            if (newComponent.isDestroyed)
                return;
            newComponent.element.removeCls('d-showing');
        }, 500, this);
    },
    /**
     * @param {Ext.Component} component
     * @return {undefined}
     */
    onTableOfContentsDestroy(component) {
        this.setTableOfContents(false);
    },
    /**
     * @param {Ext.Evented} e
     */
    onHeaderTap(e) {
        if (e.getTarget('.d-close', 5))
            return;
        const component = this.getTableOfContents();
        if (component && !component.isDestroyed)
            return;
        this.setTableOfContents({});
    },
    /**
     * @return {Object}
     */
    getElementConfig() {
        const tableOfContents = CJ.t('view-phone-course-view-editor-toc'), close = CJ.t('view-phone-course-view-editor-close');
        return {
            reference: 'element',
            classList: ['x-unsized'],
            children: [
                {
                    classList: ['d-course-viewer-header'],
                    html: [
                        `<div class='d-title'>${ tableOfContents }</div>`,
                        `<div class='d-button d-close'>${ close }</div>`
                    ].join('')
                },
                {
                    reference: 'innerElement',
                    classList: [
                        'd-course-viewer-inner',
                        'd-scroll'
                    ]
                },
                { classList: ['d-course-viewer-toc'] }
            ]
        };
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applyMenu(config) {
        if (config)
            config = Ext.apply({ renderTo: this.innerElement }, config);
        return this.callParent(args);
    },
    /**
     * @param {Object} config
     * @return {Ext.Component}
     */
    applySectionList(config) {
        if (config)
            config = Ext.apply({ renderTo: this.innerElement }, config);
        return this.callParent(args);
    },
    /**
     * @return {undefined}
     */
    destroy() {
        this.setTableOfContents(false);
        this.callParent(args);
    }
});