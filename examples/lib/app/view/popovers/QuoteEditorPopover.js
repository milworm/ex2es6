import 'app/core/view/Popover';

Ext.define('CJ.view.popovers.QuoteEditorPopover', {
    extend: 'CJ.core.view.Popover',
    config: {
        cls: 'd-quote-editor-popover',
        growField: null
    },
    statics: {
        showTo(config) {
            let quoteEditor;
            if (config.renderTo.isComponent)
                config.renderTo = config.renderTo.element;
            config.growField = Ext.factory({
                xtype: 'core-view-form-growfield',
                placeHolder: CJ.t('view-tool-quote-tool-editing-input-placeholder'),
                modern: false,
                maxFieldHeight: 400,
                value: config.values.quoteText
            });
            config.tpl = [
                config.growField.element.dom.innerHTML,
                '<div class="d-button"></div'
            ];
            quoteEditor = Ext.create('CJ.view.popovers.QuoteEditorPopover', config);
            return quoteEditor;
        }
    }
});