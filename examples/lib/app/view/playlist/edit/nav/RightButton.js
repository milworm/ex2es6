import 'app/view/playlist/edit/nav/Button';

Ext.define('CJ.view.playlist.edit.nav.RightButton', {
    extend: 'CJ.view.playlist.edit.nav.Button',
    xtype: 'view-playlist-edit-nav-right-button',
    isRightButton: true,
    config: {
        cls: 'd-nav-button to-right',
        addTooltip: {
            text: 'String another activity along to make a playlist',
            position: {
                x: 'left',
                y: 'middle'
            },
            group: 'editor-nav',
            autoShow: false,
            width: 200
        },
        nextTooltip: {
            text: 'Go forward to the next activity.',
            position: {
                x: 'left',
                y: 'middle'
            },
            group: 'editor-nav',
            width: 200
        },
        removeTooltip: {
            text: 'Remove current activity and go to the next.',
            position: {
                x: 'left',
                y: 'top',
                inside: true
            },
            group: 'editor-nav',
            autoShow: false,
            width: 200
        }
    },
    applyAction(action) {
        const displayAction = action == 'remove' ? 'next' : action;
        this.removeCls([
            'add',
            'next',
            'remove'
        ]);
        this.addCls(displayAction);
        this.setText(CJ.app.t(`playlist-editor-nav-button-${ displayAction }`));
        return this.callParent(args);
    },
    configureInitialState(config) {
        this.setAction('add');
        this.setLocked(config.isEmpty);
    },
    configureDefaultBlockState(config) {
        this.setAction('add');
        this.setLocked(config.isEmpty);
    },
    configurePlaylistNewBlockState(config) {
        this.setAction('add');
        this.setLocked(config.isEmpty);
    },
    configurePlaylistReusedBlockState(config) {
        this.setAction(config.isLast ? 'add' : 'next');
        this.setLocked(false);
    },
    configurePlaylistSimpleBlockState(config) {
        const isLast = config.isLast, isEmpty = config.isEmpty;
        this.setAction(isLast ? 'add' : isEmpty ? 'remove' : 'next');
        this.setLocked(isLast && isEmpty);
    }
});