import 'Ext/app/Controller';

/**
 * Controller is used to manage components that are used in different places.
 */
Ext.define('CJ.controller.Helper', {
    extend: 'Ext.app.Controller',
    config: {
        /**
         * @cfg {Ext.Component} loadingComponent
         */
        loadingComponent: null,
        control: {
            'core-view-form-icon': {
                uploadstart: 'onFileUploadStart',
                uploadsuccess: 'onFileUploadSuccess',
                uploadfailure: 'onFileUploadFailure'
            }
        }
    },
    /**
     * @param {Ext.Component} component
     * @param {Ext.Component} oldComponent
     * @return {undefined}
     */
    updateLoadingComponent(component, oldComponent) {
        if (component)
            component.setLoading(true);
        if (oldComponent)
            oldComponent.setLoading(false);
    },
    /**
     * @param {CJ.core.view.form.Icon} component
     * @return {undefined}
     */
    onFileUploadStart(component) {
        const element = component.element, carousel = element.up('.d-publish-carousel');
        if (!carousel)
            return;
        this.setLoadingComponent(Ext.getCmp(carousel.id));
    },
    /**
     * @param {CJ.core.view.form.Icon} component
     * @return {undefined}
     */
    onFileUploadSuccess(component) {
        this.setLoadingComponent(null);
    },
    /**
     * @param {CJ.core.view.form.Icon} component
     * @return {undefined}
     */
    onFileUploadFailure(component) {
        this.setLoadingComponent(null);
    }
});