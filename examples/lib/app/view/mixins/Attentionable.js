/**
 * defiens a mixin that can be attached to the lists
 * in order to pays user's attention to some element
 */
Ext.define('CJ.view.mixins.Attentionable', {
    /**
     * pays user's attention to a dom node
     * @param {HTMLElement} node
     * @return {undefined}
     */
    payAttention(node) {
        CJ.Utils.scrollIntoViewIfNeeded(node);
        const el = CJ.fly(node);
        CJ.Animation.animate({
            el,
            cls: 'attention',
            scope: this,
            after() {
                el.removeCls('attention');
                CJ.unFly(el);
            }
        });
    }
});