import 'app/view/playlist/edit/nav/Button';

Ext.define('CJ.view.playlist.edit.nav.LeftButton', {
    extend: 'CJ.view.playlist.edit.nav.Button',
    xtype: 'view-playlist-edit-nav-left-button',
    isLeftButton: true,
    config: {
        cls: 'd-nav-button to-left back',
        text: 'playlist-editor-nav-button-back',
        removeTooltip: {
            text: 'Remove current activity and go to the previous.',
            position: {
                x: 'right',
                y: 'middle'
            },
            group: 'editor-nav',
            autoShow: false,
            width: 200
        },
        backTooltip: {
            text: 'Go back to the previous activity.',
            position: {
                x: 'right',
                y: 'middle'
            },
            group: 'editor-nav',
            autoShow: false,
            width: 200
        }
    },
    applyText(text) {
        return CJ.t(text);
    },
    configureInitialState(config) {
        this.setAction('remove');
        this.setLocked(true);
    },
    configureDefaultBlockState(config) {
        this.setAction('remove');
        this.setLocked(true);
    },
    configurePlaylistNewBlockState(config) {
        this.setAction(config.isEmpty ? 'remove' : 'back');
        this.setLocked(false);
    },
    configurePlaylistReusedBlockState(config) {
        this.setAction('back');
        this.setLocked(config.isFirst);
    },
    configurePlaylistSimpleBlockState(config) {
        const isFirst = config.isFirst;
        this.setAction(isFirst ? 'back' : config.isEmpty ? 'remove' : 'back');
        this.setLocked(isFirst);
    }
});