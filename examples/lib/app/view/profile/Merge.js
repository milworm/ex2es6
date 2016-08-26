import 'app/core/view/form/Panel';

Ext.define('CJ.view.profile.Merge', {
    extend: 'CJ.core.view.form.Panel',
    xtype: 'view-profile-merge',
    statics: {
        popup() {
            Ext.factory({
                xtype: 'core-view-popup',
                title: 'page-merge-page-title',
                description: 'page-merge-page-title-label',
                content: { xtype: 'view-profile-merge' },
                actionButton: { text: 'page-merge-form-submit-button' },
                isHistoryMember: true
            });
        }
    },
    config: {
        cls: 'd-profile-merge',
        popup: null,
        submitButton: false,
        items: [
            {
                xtype: 'textfield',
                name: 'username',
                placeHolder: 'page-merge-form-placeholder-username',
                validations: [{
                        type: 'present',
                        message: 'page-merge-form-validation-username-present'
                    }]
            },
            {
                xtype: 'passwordfield',
                name: 'password',
                placeHolder: 'page-merge-form-placeholder-password',
                validations: [{
                        type: 'present',
                        message: 'page-merge-form-validation-password-present'
                    }]
            }
        ],
        listeners: { dosubmit: 'onDoSubmit' }
    },
    initialize() {
        this.callParent(args);
        this.getPopup().on({
            actionbuttontap: this.onActionButtonTap,
            scope: this
        });
    },
    onActionButtonTap() {
        this.onFormSubmit();
        return false;
    },
    onDoSubmit() {
        CJ.confirm('page-merge-confirmation-title', 'page-merge-confirmation-text', this.doMerge, this);
    },
    doMerge(confirm) {
        this.mask();
        if (confirm == 'yes') {
            CJ.request({
                url: CJ.constant.request.merge,
                params: this.getValues(),
                success: this.onMergeSuccess,
                failure: this.onMergeFailure,
                scope: this
            });
        }
    },
    onMergeSuccess() {
        CJ.User.logout();
    },
    onMergeFailure(response) {
        this.unmask();
        this.setErrorMsg(`page-merge-form-error-${ response.errorcode }`);
    }
});