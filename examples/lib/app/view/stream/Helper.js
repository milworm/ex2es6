/**
 * Contains methods that helps us to work with Stream, even if it doesn't exist.
 */
Ext.define('CJ.view.stream.Helper', {
    /**
     * @property {String} alternateClassName
     */
    alternateClassName: 'CJ.StreamHelper',
    /**
     * @property {Boolean} singleton
     */
    singleton: true,
    /**
     * @property {Object} config
     */
    config: {
        /**
         * @cfg {Object} group
         */
        group: null
    },
    /**
     * discovers type of stream's list that will be rendered based on #key-param (which comes from router).
     * @param {String} key a, c, g
     * @return {String} Document, Course, Group, Skill
     */
    getListTypeFromRouteKey(key) {
        switch (key) {
        case 'a':
            return 'Document';
        case 'g':
            return 'Group';
        case 'c':
            return 'Course';
        case 's':
            return 'Skill';
        case 'f':
            return 'Featured';
        }
    },
    /**
     * discovers which model should be loaded to display in a header based on passed tags.
     * @param {String} tags
     * @return {String} model
     */
    getHeaderModelFromTags(tags) {
        const type = CJ.Utils.getTagType(tags);
        switch (type) {
        case 'user':
            return 'PortalUser';
        case 'group':
            return 'Group';
        case 'category':
            return 'Category';
        case 'tag':
            return 'Key';
        case 'portal':
            return 'Portal';
        }
        return null;
    },
    /**
     * @param {Object} group
     * @return {undefined}
     */
    updateGroup(group) {
        if (!group)
            return;
        Ext.Viewport.getSearchBar().updateGroupTag(group);
    },
    /**
     * @param {CJ.core.view.Block} block
     * @return {undefined}
     */
    adjustContaining(block) {
        try {
            CJ.Stream.getList().adjustContaining(block);
        } catch (e) {
        }
    },
    /**
     * @param {Number} docId
     * @return {CJ.view.block.BaseBlock}
     */
    byDocId(docId) {
        try {
            return CJ.Stream.getList().getItemByDocId(docId);
        } catch (e) {
        }
    },
    /**
     * @return {CJ.view.stream.header.Base}
     */
    getHeader() {
        try {
            return CJ.Stream.getHeader();
        } catch (e) {
        }
    },
    /**
     * @return {Boolean}
     */
    isPortalAdminOfStream() {
        try {
            return CJ.User.isPortalAdmin(CJ.User.getPortalName(this.getHeader().getUser()));
        } catch (e) {
        }
    },
    /**
     * removes block from stream by docId
     * @param {Number} docId
     */
    removeBlockById(docId) {
        try {
            CJ.Stream.getList().removeListItemByDocId(docId);
        } catch (e) {
        }
    },
    /**
     * Resets saved-scroll state of a stream. It is used when user makes forward-history step, so he will always see
     * the top of the stream, otherwise he will see stream at saved position.
     * @return {undefined}
     */
    resetState() {
        const states = CJ.view.stream.Container.states;
        if (!states)
            return;
        delete states[CJ.History.getLastActionUrl()];
    },
    /**
     * @param {Object} param
     * @return {undefined}
     */
    isMyPortalStream() {
        // we don't have tags when user opens challengeu via modal-block url.
        try {
            const portalTag = Ext.Viewport.getSearchBar().getTags().split(' ')[0], portalName = portalTag.replace('@', '');
            return CJ.User.isPortalAdmin(portalName);
        } catch (e) {
        }
        return false;
    },
    /**
     * @param {CJ.view.block.BaseBlock} block
     * @return {undefined}
     */
    // addBlock: function(block) {
    //     if(! CJ.Stream || ! block.hasPageTags())
    //         return ;
    //     var list = CJ.Stream.getList();
    //     if(list.isStreamList)
    //         list.addBlock(block);
    // },
    /**
     * @return {String}
     */
    getRouteTab() {
        const tabIndex = CJ.app.getActiveRoute().getMeta('tabIndex');
        return CJ.History.getActiveAction().getArgs()[tabIndex];
    }
});