import 'Ext/app/Profile';

/**
 */
Ext.define('CJ.profile.Base', {
    extend: 'Ext.app.Profile',
    isActive() {
        return false;
    },
    launch() {
        // profiles extending this base should always callParent
        // before running their own launch code
        CJ.app.currentProfile = this.getName();
    }
});