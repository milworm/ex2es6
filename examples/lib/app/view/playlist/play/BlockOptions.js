import 'app/view/block/options/Default';

Ext.define('CJ.view.playlist.play.BlockOptions', {
    extend: 'CJ.view.block.options.Default',
    xtype: 'view-playlist-play-block-options',
    onEditButtonTapped() {
        const block = this.getBlock(), playlist = block.getPlaylist(), index = block.getParent().indexOf(block);
        playlist.getStateContainer().setIsHistoryMember(false);
        CJ.History.preventAction = true;
        CJ.History.back();
        playlist.setPendingIndex(index);
        playlist.setState('edit');
    }
});