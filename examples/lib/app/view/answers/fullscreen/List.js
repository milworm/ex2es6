import 'app/view/answers/List';

Ext.define('CJ.view.answers.fullscreen.List', {
    /**
     * @property {String} extend
     */
    extend: 'CJ.view.answers.List',
    /**
     * @cfg {String} alias
     */
    alias: 'widget.view-answers-fullscreen-list',
    /**
     * hides/shows all components inside of this list that are static ones
     * like toolbars or some others that shouldn't be connected to displaying
     * items in the list.
     * @param {String} method valid values are: [show, hide]
     */
    changeStaticItemsDisplay(method) {
        const filterElement = this.getFilterRenderTo() || this.filterElement;
        filterElement[method]();
    },
    /**
     * @return {Ext.Element}
     */
    getScrollEl() {
        if (Ext.os.is.Tablet)
            return this.getRenderTo();
        return this.callParent(args);
    }
});