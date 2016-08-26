import 'Ext/Component';

Ext.define('CJ.core.view.SelectableText', {
    extend: 'Ext.Component',
    xtype: 'core-view-selectable-text',
    statics: {
        popup(config) {
            Ext.factory({
                xtype: 'core-view-popup',
                title: config.title,
                content: {
                    xtype: 'core-view-selectable-text',
                    text: config.text
                }
            });
        }
    },
    config: {
        cls: 'd-selectable-text',
        text: null
    },
    initialize() {
        this.callParent(args);
        this.element.on({
            tap: 'select',
            scope: this
        });
    },
    updateText(text) {
        this.setHtml(text);
    },
    getElementConfig() {
        const config = this.callParent(args);
        if (Ext.os.is.iOS)
            config.contentEditable = true;
        return config;
    },
    select(evt) {
        // a textNode is required to set a selection on mobile safari
        // nodeType values:  https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
        if (evt.target.firstChild.nodeType !== 3) {
            console.log('Unable to select text, firstChild is not a textNode.');
            return;
        }
        const el = evt.target;    // current selection
        // current selection
        const sel = window.getSelection();    // create a range:  
                                              // https://developer.mozilla.org/en-US/docs/Web/API/document.createRange
        // create a range:  
        // https://developer.mozilla.org/en-US/docs/Web/API/document.createRange
        const range = document.createRange();    // use firstChild as range expects a textNode, not an elementNode
        // use firstChild as range expects a textNode, not an elementNode
        range.setStart(el.firstChild, 0);
        range.setEnd(el.firstChild, el.innerHTML.length);
        sel.removeAllRanges();
        sel.addRange(range);    //deny the propagation
        //deny the propagation
        evt.stopPropagation();
        evt.stopEvent();
    }
});